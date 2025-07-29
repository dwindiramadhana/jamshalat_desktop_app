import { useState, useEffect, useCallback } from 'react';
import SettingsModal from './components/SettingsModal';
import { fetchPrayerTimes } from './api';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import MainContent from './components/MainContent';
import { useAppSettings, type AppSettings } from './hooks/useAppSettings';
import { usePrayerData } from './hooks/usePrayerData';
import { useDynamicBackground } from './hooks/useDynamicBackground';
import { useClock } from './hooks/useClock';

function App() {
  const { settings, saveSettings } = useAppSettings();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    locations,
    selectedLocation,
    prayerTimes,
    loading,
    error,
    handleLocationChange,
    loadPrayerTimes,
    setPrayerTimes
  } = usePrayerData();
  const currentTime = useClock();
  const { currentImage } = useDynamicBackground(settings, saveSettings);

  // Auto-advance prayer highlight and fetch tomorrow's schedule when needed
  useEffect(() => {
    if (prayerTimes.length === 0 || !selectedLocation) return;

    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    // Find which prayer should be highlighted now
    let nextPrayerIndex = -1;
    let allPrayersPassed = true;

    for (let i = 0; i < prayerTimes.length; i++) {
      const prayer = prayerTimes[i];
      if (prayer.timeInMinutes > currentTotalMinutes) {
        nextPrayerIndex = i;
        allPrayersPassed = false;
        break;
      }
    }

    // Check if the current highlight is correct
    const currentHighlightIndex = prayerTimes.findIndex(p => p.isNext);
    const shouldHighlightIndex = allPrayersPassed ? 0 : nextPrayerIndex;

    // If highlight needs to change
    if (currentHighlightIndex !== shouldHighlightIndex) {
      const updatedTimes = prayerTimes.map((prayer, index) => ({
        ...prayer,
        isNext: index === shouldHighlightIndex
      }));
      setPrayerTimes(updatedTimes);

      // If all prayers have passed, fetch tomorrow's schedule
      if (allPrayersPassed && currentHighlightIndex !== -1) {
        fetchTomorrowSchedule();
      }
    }
  }, [currentTime, prayerTimes, selectedLocation, setPrayerTimes]);

  // Function to fetch tomorrow's prayer schedule
  const fetchTomorrowSchedule = async () => {
    if (!selectedLocation) return;

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(tomorrow.getDate()).padStart(2, '0');
      
      const prayerData = await fetchPrayerTimes(selectedLocation.id, new Date(`${year}-${month}-${day}`));
      
      if (!prayerData.status || !prayerData.data?.jadwal) {
        throw new Error('Invalid prayer times data received');
      }
      
      const { jadwal } = prayerData.data;
      
      const prayerTimesList = [
        { name: 'Subuh', time: jadwal.subuh },
        { name: 'Terbit', time: jadwal.terbit },
        { name: 'Dhuha', time: jadwal.dhuha },
        { name: 'Dzuhur', time: jadwal.dzuhur },
        { name: 'Ashar', time: jadwal.ashar },
        { name: 'Maghrib', time: jadwal.maghrib },
        { name: 'Isya', time: jadwal.isya },
      ];
      
      const formattedTimes = prayerTimesList.map((prayer, index) => {
        const [hours, minutes] = prayer.time.split(':').map(Number);
        const prayerTotalMinutes = hours * 60 + minutes;
        
        return {
          ...prayer,
          isNext: index === 0, // Highlight first prayer (Subuh) for tomorrow
          timeInMinutes: prayerTotalMinutes,
        };
      });
      
      setPrayerTimes(formattedTimes);
    } catch (err) {
      console.error('Error loading tomorrow prayer times:', err);
    }
  };

  // Handle settings save
  const handleSaveSettings = useCallback((newSettings: AppSettings) => {
    saveSettings(newSettings);
  }, [saveSettings]);

  // Get theme color classes
  const getThemeColorClasses = (themeColor: string = 'indigo') => {
    const colorMap: Record<string, { bg: string; text: string; textLight: string; hover: string }> = {
      gray: { bg: 'bg-gray-600', text: 'text-gray-700', textLight: 'text-gray-600', hover: 'hover:bg-gray-50' },
      red: { bg: 'bg-red-600', text: 'text-red-700', textLight: 'text-red-600', hover: 'hover:bg-red-50' },
      yellow: { bg: 'bg-yellow-600', text: 'text-yellow-700', textLight: 'text-yellow-600', hover: 'hover:bg-yellow-50' },
      green: { bg: 'bg-green-600', text: 'text-green-700', textLight: 'text-green-600', hover: 'hover:bg-green-50' },
      blue: { bg: 'bg-blue-600', text: 'text-blue-700', textLight: 'text-blue-600', hover: 'hover:bg-blue-50' },
      indigo: { bg: 'bg-indigo-600', text: 'text-indigo-700', textLight: 'text-indigo-600', hover: 'hover:bg-indigo-50' },
      purple: { bg: 'bg-purple-600', text: 'text-purple-700', textLight: 'text-purple-600', hover: 'hover:bg-purple-50' },
      pink: { bg: 'bg-pink-600', text: 'text-pink-700', textLight: 'text-pink-600', hover: 'hover:bg-pink-50' },
    };
    return colorMap[themeColor] || colorMap.indigo;
  };

  const themeColors = getThemeColorClasses(settings.themeColor);
  const isDarkMode = settings.darkMode;

  return (
    <>
      <div className={`min-h-screen relative ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: settings.background.type === 'auto' && currentImage
              ? `url(${currentImage.url})`
              : settings.background.type === 'static' && settings.background.images.length > 0 && settings.background.currentImageIndex !== undefined
              ? `url(${settings.background.images[settings.background.currentImageIndex]?.url})`
              : 'none'
          }}
        />
        
        {/* Overlay */}
        <div className={`absolute inset-0 ${
          isDarkMode ? 'bg-black bg-opacity-60' : 'bg-black bg-opacity-40'
        }`} />
        
        {/* Settings Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`fixed top-4 right-4 p-2 rounded-full shadow-lg z-50 transition-all backdrop-blur-sm ${
            isDarkMode 
              ? 'bg-gray-800 bg-opacity-75 hover:bg-gray-700/90 text-gray-200' 
              : `bg-white bg-opacity-75 hover:bg-white/90 ${themeColors.text}`
          }`}
          title="Pengaturan"
        >
          <Cog6ToothIcon className="h-6 w-6" />
        </button>
        
        {/* Main Content */}
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="w-full max-w-md">
            <MainContent
              loading={loading}
              error={error}
              selectedLocation={selectedLocation}
              prayerTimes={prayerTimes}
              settings={settings}
              isDarkMode={isDarkMode}
              themeColors={themeColors}
              loadPrayerTimes={loadPrayerTimes}
            />
          </div>
        </div>
      </div>
      
      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        locations={locations.map(loc => ({
          id: loc.id,
          name: loc.name,
          lokasi: loc.name,
          koordinat: {
            lat: '0',
            lon: '0'
          }
        }))}
        selectedLocationId={selectedLocation?.id || null}
        onLocationChange={handleLocationChange}
        isDarkMode={isDarkMode}
      />

      {/* Photo Credit - Only show for Unsplash images */}
      {currentImage?.author && settings.background.type === 'auto' && (
        <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white text-xs p-2 flex justify-center items-center z-20">
          <span>Photo by </span>
          <a 
            href={currentImage.authorUrl || `https://unsplash.com/@${currentImage.authorUsername}?utm_source=JamShalatApp&utm_medium=referral`}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-blue-100 mx-1"
          >
            {currentImage.author}
          </a>
          <span> on </span>
          <a 
            href="https://unsplash.com?utm_source=JamShalatApp&utm_medium=referral" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-blue-100 ml-1"
          >
            Unsplash
          </a>
        </div>
      )}
    </>
  );
}

export default App;
