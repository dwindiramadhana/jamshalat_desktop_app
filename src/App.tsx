import { useState, useEffect, useRef, useCallback } from 'react';
import SettingsModal from './components/SettingsModal';
import { fetchLocations, fetchPrayerTimes } from './api';
import type { LocationData, PrayerTime } from './types';
import type { Settings, UnsplashImage } from './types/settings';
import { DEFAULT_SETTINGS } from './types/settings';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

// Platform detection for Android-specific styling
const isAndroid = () => {
  if (typeof window !== 'undefined') {
    return /Android/i.test(window.navigator.userAgent) || 
           window.__TAURI_METADATA__?.currentPlatform === 'android';
  }
  return false;
};

// Define the full settings type that includes all possible settings
type AppSettings = Settings & {
  showNextPrayerLabel: boolean;
};

// Default values for settings
const DEFAULT_APP_SETTINGS: AppSettings = {
  ...DEFAULT_SETTINGS,
  showNextPrayerLabel: true,
};

interface FormattedLocation extends LocationData {
  name: string;
  region?: string;
  country?: string;
}

interface FormattedPrayerTime extends PrayerTime {
  isNext: boolean;
  timeInMinutes: number;
}

function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_APP_SETTINGS,
          ...parsed,
          background: {
            ...DEFAULT_APP_SETTINGS.background,
            ...parsed.background,
          },
        };
      } catch (e) {
        console.error('Failed to parse saved settings', e);
        return DEFAULT_APP_SETTINGS;
      }
    }
    return DEFAULT_APP_SETTINGS;
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<UnsplashImage | null>(null);
  const backgroundTimer = useRef<NodeJS.Timeout | null>(null);
  const [locations, setLocations] = useState<FormattedLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<FormattedLocation | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<FormattedPrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

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
  }, [currentTime, prayerTimes, selectedLocation]);

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

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Handle background rotation
    if (settings.background.images.length > 1) {
      // Enable rotation for both auto and static types when there are multiple images
      if (settings.background.type === 'auto') {
        startBackgroundRotation(settings.background.images, settings.background.rotationInterval);
      } else if (settings.background.type === 'static') {
        // For static images, start rotation but don't use currentImage state
        startBackgroundRotation(settings.background.images, settings.background.rotationInterval);
        setCurrentImage(null); // Static images don't use currentImage state
      }
    } else {
      setCurrentImage(null);
      clearBackgroundRotation();
    }
    
    return () => {
      clearBackgroundRotation();
    };
  }, [settings]);

  // Background rotation logic
  const startBackgroundRotation = (images: UnsplashImage[], intervalMinutes: number) => {
    clearBackgroundRotation();
    
    const intervalMs = intervalMinutes * 60 * 1000;
    
    if (images.length === 0) return;
    
    if (settings.background.type === 'auto') {
      // For auto images, use currentImage state
      let currentIndex = 0;
      setCurrentImage(images[0]);
      
      if (images.length > 1) {
        backgroundTimer.current = setInterval(() => {
          currentIndex = (currentIndex + 1) % images.length;
          setCurrentImage(images[currentIndex]);
        }, intervalMs);
      }
    } else if (settings.background.type === 'static') {
      // For static images, update currentImageIndex in settings
      let currentIndex = settings.background.currentImageIndex || 0;
      
      if (images.length > 1) {
        backgroundTimer.current = setInterval(() => {
          currentIndex = (currentIndex + 1) % images.length;
          setSettings(prev => ({
            ...prev,
            background: {
              ...prev.background,
              currentImageIndex: currentIndex
            }
          }));
        }, intervalMs);
      }
    }
  };

  const clearBackgroundRotation = () => {
    if (backgroundTimer.current) {
      clearInterval(backgroundTimer.current);
      backgroundTimer.current = null;
    }
  };

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
  const loadPrayerTimes = useCallback(async () => {
    if (!selectedLocation) return;
    
    try {
      setLoading(true);
      setError(null);
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      
      const prayerData = await fetchPrayerTimes(selectedLocation.id, new Date(`${year}-${month}-${day}`));
      
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
      localStorage.setItem('selectedLocationId', selectedLocation.id);
    } catch (err) {
      setError('Gagal memuat jadwal shalat. Silakan coba lagi.');
      console.error('Error loading prayer times:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedLocation]);

  // Load prayer times when location changes
  useEffect(() => {
    if (!selectedLocation) return;
    loadPrayerTimes();
  }, [selectedLocation, loadPrayerTimes]);

  // Handle settings save
  const handleSaveSettings = useCallback((newSettings: AppSettings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
      // Ensure background settings are properly merged
      background: {
        ...prevSettings.background,
        ...newSettings.background,
      },
    }));
  }, []);

  // Handle location change from settings
  const handleLocationChange = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      setSelectedLocation(location);
    }
  };

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
          className={`fixed ${isAndroid() ? 'top-12' : 'top-4'} right-4 p-2 rounded-full shadow-lg z-50 transition-all backdrop-blur-sm ${
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
            {loading ? (
              <div className={`p-8 rounded-2xl shadow-xl backdrop-blur-sm text-center ${
                isDarkMode ? 'bg-gray-800/70' : 'bg-white/70'
              }`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className={isDarkMode ? 'text-gray-200' : 'text-gray-600'}>Memuat jadwal shalat...</p>
              </div>
            ) : error ? (
              <div className={`p-8 rounded-2xl shadow-xl backdrop-blur-sm text-center ${
                isDarkMode ? 'bg-gray-800/70' : 'bg-white/70'
              }`}>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => loadPrayerTimes()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            ) : (
              <div className={`p-6 rounded-2xl shadow-xl backdrop-blur-md ${
                isDarkMode ? 'bg-gray-800 bg-opacity-75' : 'bg-white bg-opacity-75'
              }`}>
                {/* Logo */}
                <div className="text-center mb-4">
                  <img 
                    src={isDarkMode ? "/jamshalatapplogoWhite.png" : "/jamshalatapplogo.png"} 
                    alt="Jam Shalat App Logo" 
                    className="h-12 w-auto mx-auto"
                  />
                </div>

                {/* Date and Time Display */}
                <div className="mb-6 p-4 bg-white/30 rounded-xl">
                  <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className={`text-3xl sm:text-4xl font-bold ${
                      isDarkMode ? themeColors.textLight : themeColors.text
                    }`}>
                      {currentTime.toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit', 
                        hour12: false,
                        hourCycle: 'h23'
                      }).replace(/\./g, ':')}
                    </div>
                    <div className="text-center sm:text-right">
                      <div className={`font-medium ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div className={`text-base font-medium ${
                        isDarkMode ? 'text-gray-300' : themeColors.text
                      }`}>
                        {new Intl.DateTimeFormat('id-u-ca-islamic', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          calendar: 'islamic-umalqura',
                          numberingSystem: 'latn'
                        }).format(new Date())} H
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className={`border-t mb-6 ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                }`} />

                {selectedLocation && (
                  <>
                    {/* Location and Schedule Label Row */}
                    <div className={`px-3 py-2 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg transition-colors ${
                      isDarkMode
                        ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-100'
                        : 'bg-white/50 hover:bg-white/70 text-gray-800'
                    } backdrop-blur-sm`}>
                      <div className="flex items-center">
                        <span className={`font-medium ${
                          isDarkMode ? 'text-gray-100' : 'text-gray-800'
                        }`}>
                          {selectedLocation.name}
                        </span>
                      </div>
                      <span className={`font-semibold text-sm ${
                        isDarkMode ? 'text-gray-200' : themeColors.text
                      }`}>
                        {(() => {
                          const currentTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
                          const allPrayersPassed = prayerTimes.every(prayer => {
                            return prayer.timeInMinutes <= currentTotalMinutes;
                          });
                          return allPrayersPassed ? 'Jadwal Besok:' : 'Jadwal hari ini:';
                        })()} 
                      </span>
                    </div>

                    <div className="space-y-3">
                      {prayerTimes
                        .filter(prayer => {
                          // Always show main prayers
                          if (prayer.name !== 'Terbit' && prayer.name !== 'Dhuha') return true;
                          // Show Terbit and Dhuha based on settings
                          if (prayer.name === 'Terbit') return settings.showTerbit;
                          if (prayer.name === 'Dhuha') return settings.showDhuha;
                          return true;
                        })
                        .map((prayer) => (
                          <div 
                            key={prayer.name}
                            className={`p-3 flex flex-row items-center justify-between rounded-lg transition-colors ${
                              prayer.isNext 
                                ? `${themeColors.bg} text-white` 
                                : isDarkMode
                                ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-100'
                                : 'bg-white/50 hover:bg-white/70 text-gray-800'
                            } backdrop-blur-sm`}
                          >
                            <div className="flex items-center">
                              <span className={`font-medium ${
                                prayer.isNext 
                                  ? 'text-white' 
                                  : isDarkMode
                                  ? 'text-gray-100'
                                  : 'text-gray-800'
                              }`}>
                                {prayer.name}
                              </span>
                            </div>
                            <span className={`font-semibold ${
                              prayer.isNext 
                                ? 'text-white' 
                                : isDarkMode
                                ? 'text-gray-200'
                                : themeColors.text
                            }`}>
                              {prayer.time}
                            </span>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            )}
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
        <div className={`fixed ${isAndroid() ? 'bottom-6' : 'bottom-0'} left-0 right-0 bg-black bg-opacity-80 text-white text-xs p-2 flex justify-center items-center z-20`}>
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
