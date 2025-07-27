import type { LocationData, PrayerTimesResponse } from './types';

const API_BASE_URL = 'https://api.myquran.com/v2/sholat';

// Cache untuk menyimpan daftar lokasi yang sudah diambil
let locationsCache: LocationData[] | null = null;

export async function fetchLocations(): Promise<LocationData[]> {
  // Gunakan cache jika tersedia
  if (locationsCache) {
    return locationsCache;
  }

  const apiUrl = `${API_BASE_URL}/kota/semua`;

  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch locations: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as { data: LocationData[] };
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid data format received from API');
    }
    
    // Simpan ke cache
    locationsCache = data.data;
    return data.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw new Error('Tidak dapat terhubung ke server. Pastikan koneksi internet Anda stabil.');
  }
}

export async function fetchPrayerTimes(cityId: string, date: Date = new Date()): Promise<PrayerTimesResponse> {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const apiUrl = `${API_BASE_URL}/jadwal/${cityId}/${year}/${month}/${day}`;

  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch prayer times: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.data || !data.data.jadwal) {
      throw new Error('Invalid prayer times data format received from API');
    }
    
    // Return the full response data including status and jadwal
    return data as PrayerTimesResponse;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw new Error('Gagal memuat jadwal shalat. Silakan coba beberapa saat lagi.');
  }
}

export function getNextPrayer(prayerTimes: PrayerTimesResponse): { name: string; time: string; timeLeft?: string } | null {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  const prayers = [
    { name: 'Subuh', time: prayerTimes.data.jadwal.subuh },
    { name: 'Terbit', time: prayerTimes.data.jadwal.terbit },
    { name: 'Dzuhur', time: prayerTimes.data.jadwal.dzuhur },
    { name: 'Ashar', time: prayerTimes.data.jadwal.ashar },
    { name: 'Maghrib', time: prayerTimes.data.jadwal.maghrib },
    { name: 'Isya', time: prayerTimes.data.jadwal.isya },
  ];
  
  for (const prayer of prayers) {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    const prayerTime = new Date(today);
    prayerTime.setHours(hours, minutes, 0, 0);
    
    if (now < prayerTime) {
      // Hitung selisih waktu
      const diffMs = prayerTime.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const hoursLeft = Math.floor(diffMins / 60);
      const minsLeft = diffMins % 60;
      
      return {
        ...prayer,
        timeLeft: hoursLeft > 0 
          ? `${hoursLeft} jam ${minsLeft} menit` 
          : `${minsLeft} menit`
      };
    }
  }
  
  // Jika tidak ada shalat berikutnya hari ini, kembalikan shalat pertama besok
  return {
    name: 'Subuh',
    time: prayerTimes.data.jadwal.subuh,
    timeLeft: 'Besok'
  };
}
