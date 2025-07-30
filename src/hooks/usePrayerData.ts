import { useState, useEffect, useCallback } from 'react';
import { fetchLocations, fetchPrayerTimes } from '../api';
import type { LocationData, PrayerTime } from '../types';

export interface FormattedLocation extends LocationData {
  name: string;
  region?: string;
  country?: string;
}

export interface FormattedPrayerTime extends PrayerTime {
  isNext: boolean;
  timeInMinutes: number;
}

export const usePrayerData = () => {
  const [locations, setLocations] = useState<FormattedLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<FormattedLocation | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<FormattedPrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load locations on mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true);
        const data = await fetchLocations();
        const formattedLocations = data.map(loc => ({
          ...loc,
          name: loc.lokasi || loc.name || 'Unknown Location'
        }));
        setLocations(formattedLocations);
        
        // Try to load saved location or use first location
        const savedLocationId = localStorage.getItem('selectedLocationId');
        const locationToSelect = savedLocationId 
          ? formattedLocations.find(loc => loc.id === savedLocationId) || formattedLocations[0]
          : formattedLocations[0];
          
        if (locationToSelect) {
          setSelectedLocation(locationToSelect);
        }
      } catch (err) {
        setError('Gagal memuat daftar lokasi. Silakan coba lagi.');
        console.error('Error loading locations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  // Load prayer times function
  const loadPrayerTimes = useCallback(async (location: FormattedLocation) => {
    if (!location) return;
    
    try {
      setLoading(true);
      setError(null);
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      
      const prayerData = await fetchPrayerTimes(location.id, new Date(`${year}-${month}-${day}`));
      
      if (!prayerData.status || !prayerData.data?.jadwal) {
        throw new Error('Invalid prayer times data received');
      }
      
      const { jadwal } = prayerData.data;
      
      // Format prayer times with next prayer highlighting
      const currentTime = new Date();
      const currentHours = currentTime.getHours();
      const currentMinutes = currentTime.getMinutes();
      const currentTotalMinutes = currentHours * 60 + currentMinutes;
      
      const prayerTimesList = [
        { name: 'Subuh', time: jadwal.subuh },
        { name: 'Terbit', time: jadwal.terbit },
        { name: 'Dhuha', time: jadwal.dhuha },
        { name: 'Dzuhur', time: jadwal.dzuhur },
        { name: 'Ashar', time: jadwal.ashar },
        { name: 'Maghrib', time: jadwal.maghrib },
        { name: 'Isya', time: jadwal.isya },
      ];
      
      // Find the next prayer time
      let nextPrayerIndex = -1;
      let earliestNextDayIndex = -1;
      
      const formattedTimes = prayerTimesList.map((prayer, index) => {
        const [hours, minutes] = prayer.time.split(':').map(Number);
        const prayerTotalMinutes = hours * 60 + minutes;
        
        if (prayerTotalMinutes > currentTotalMinutes && nextPrayerIndex === -1) {
          nextPrayerIndex = index;
        }
        
        if (earliestNextDayIndex === -1 || 
            prayerTotalMinutes < prayerTimesList[earliestNextDayIndex].time.split(':').map(Number).reduce((h, m) => h * 60 + m, 0)) {
          earliestNextDayIndex = index;
        }
        
        return {
          ...prayer,
          isNext: false,
          timeInMinutes: prayerTotalMinutes,
        };
      });
      
      const nextIndex = nextPrayerIndex !== -1 ? nextPrayerIndex : earliestNextDayIndex;
      if (nextIndex !== -1) {
        formattedTimes[nextIndex].isNext = true;
      }
      
      setPrayerTimes(formattedTimes);
      localStorage.setItem('selectedLocationId', location.id);
    } catch (err) {
      setError('Gagal memuat jadwal shalat. Silakan coba lagi.');
      console.error('Error loading prayer times:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load prayer times when location changes
  useEffect(() => {
    if (!selectedLocation) return;
    loadPrayerTimes(selectedLocation);
  }, [selectedLocation, loadPrayerTimes]);

  const handleLocationChange = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      setSelectedLocation(location);
    }
  };

  return {
    locations,
    selectedLocation,
    prayerTimes,
    loading,
    error,
    handleLocationChange,
    loadPrayerTimes,
    setPrayerTimes
  };
};