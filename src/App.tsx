import { useState, useEffect, useRef, useCallback } from 'react';
import SettingsModal from './components/SettingsModal';
import { fetchLocations, fetchPrayerTimes } from './api';
import type { LocationData, PrayerTime } from './types';
import type { Settings, UnsplashImage } from './types/settings';
import { DEFAULT_SETTINGS } from './types/settings';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { 
  autoDetectLocation, 
  shouldAttemptLocationDetection, 
  saveLocationDetectionResult,
  type LocationDetectionResult 
} from './services/locationService';

// Platform detection for Android-specific styling
const isAndroid = () => {
  if (typeof window !== 'undefined') {
    return /Android/i.test(window.navigator.userAgent) || 
           (window as any).__TAURI_METADATA__?.currentPlatform === 'android';
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
  const [prayerTimesLoading, setPrayerTimesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [locationDetection, setLocationDetection] = useState<{
    isDetecting: boolean;
    result: LocationDetectionResult | null;
  }>({
    isDetecting: false,
    result: null
  });

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

  // Auto-detect location function - silently applies detected location
  const attemptLocationDetection = useCallback(async (availableLocations: FormattedLocation[]) => {
    if (!shouldAttemptLocationDetection()) {
      console.log('Skipping location detection based on user preferences or recent detection');
      return false;
    }

    setLocationDetection(prev => ({ ...prev, isDetecting: true }));
    
    try {
      const result = await autoDetectLocation(availableLocations);
      setLocationDetection(prev => ({ 
        ...prev, 
        isDetecting: false, 
        result
      }));

      if (result.success && result.closestCity) {
        saveLocationDetectionResult(result);
        console.log(`Location detected and applied: ${result.closestCity.name} via ${result.method}`);
        // Silently apply the detected location
        setSelectedLocation(result.closestCity);
        return result.closestCity;
      } else {
        console.log('Location detection failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Location detection error:', error);
      setLocationDetection(prev => ({ 
        ...prev, 
        isDetecting: false, 
        result: { success: false, error: 'Location detection failed' }
      }));
      return false;
    }
  }, []);


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
        
        // Check if we have a saved location
        const savedLocationId = localStorage.getItem('selectedLocationId');
        let locationToSelect: FormattedLocation | null = null;
        
        if (savedLocationId) {
          locationToSelect = formattedLocations.find(loc => loc.id === savedLocationId) || null;
        }

        // If no saved location, attempt auto-detection
        if (!locationToSelect) {
          console.log('No saved location found, attempting auto-detection...');
          const detectedLocation = await attemptLocationDetection(formattedLocations);
          
          if (detectedLocation) {
            locationToSelect = detectedLocation;
          } else {
            // Fallback to first location if detection fails
            locationToSelect = formattedLocations[0] || null;
          }
        }
          
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
  }, [attemptLocationDetection]);

  // Load prayer times function
  const loadPrayerTimes = useCallback(async (date: Date = selectedDate) => {
    if (!selectedLocation) return;
    
    try {
      setPrayerTimesLoading(true);
      setError(null);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
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
      setPrayerTimesLoading(false);
      localStorage.setItem('selectedLocationId', selectedLocation.id);
    } catch (err) {
      console.error('Error loading prayer times:', err);
      setError(err instanceof Error ? err.message : 'Failed to load prayer times');
      setPrayerTimesLoading(false);
    }
  }, [selectedDate, selectedLocation]);

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

  // Handle date selection
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    loadPrayerTimes(date);
  }, [loadPrayerTimes]);

  // Generate date array around selected date (responsive: 5 mobile, 7 desktop)
  const getDateSliderDates = useCallback((centerDate: Date, isMobile: boolean = false) => {
    const dates = [];
    const range = isMobile ? 2 : 3; // -2 to +2 for mobile (5 dates), -3 to +3 for desktop (7 dates)
    for (let i = -range; i <= range; i++) {
      const date = new Date(centerDate);
      date.setDate(centerDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  // Get month name in Indonesian
  const getMonthName = useCallback((date: Date) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[date.getMonth()];
  }, []);

  // Get display month for slider (shows month of selected date)
  const getSliderDisplayMonth = useCallback((selectedDate: Date) => {
    return `${getMonthName(selectedDate)} ${selectedDate.getFullYear()}`;
  }, [getMonthName]);


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

        {/* Enhanced Location Detection Status */}
        {locationDetection.isDetecting && (
          <div className={`fixed ${isAndroid() ? 'top-16' : 'top-4'} left-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300`}>
            <div className={`p-4 rounded-xl shadow-xl border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-indigo-600"></div>
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    Mendeteksi Lokasi
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Mencari kota terdekat...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        
        {/* Main Content */}
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="w-full max-w-md">
            {loading ? (
              <div className={`p-8 rounded-2xl shadow-xl backdrop-blur-sm text-center ${
                isDarkMode ? 'bg-gray-800/70' : 'bg-white/70'
              }`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className={isDarkMode ? 'text-gray-200' : 'text-gray-600'}>
                  {locationDetection.isDetecting ? 'Mendeteksi lokasi dan memuat jadwal shalat...' : 'Memuat jadwal shalat...'}
                </p>
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
              <div className="space-y-4">
                {/* Header Card */}
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

                  {/* Time Display Only */}
                  <div className="p-0 bg-white/30 rounded-xl text-center">
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
                  </div>
                </div>

                {/* Date Slider Card */}
                <div className={`p-4 rounded-2xl shadow-xl backdrop-blur-md relative ${
                  isDarkMode ? 'bg-gray-800 bg-opacity-75' : 'bg-white bg-opacity-75'
                }`}>
                  {/* Today shortcut button - Absolute positioned */}
                  {selectedDate.toDateString() !== new Date().toDateString() && (
                    <button
                      onClick={() => handleDateSelect(new Date())}
                      className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded border transition-colors ${
                        settings.themeColor === 'gray' ? 'border-gray-600 text-gray-600 hover:bg-gray-50' :
                        settings.themeColor === 'red' ? 'border-red-600 text-red-600 hover:bg-red-50' :
                        settings.themeColor === 'yellow' ? 'border-yellow-600 text-yellow-600 hover:bg-yellow-50' :
                        settings.themeColor === 'green' ? 'border-green-600 text-green-600 hover:bg-green-50' :
                        settings.themeColor === 'blue' ? 'border-blue-600 text-blue-600 hover:bg-blue-50' :
                        settings.themeColor === 'purple' ? 'border-purple-600 text-purple-600 hover:bg-purple-50' :
                        settings.themeColor === 'pink' ? 'border-pink-600 text-pink-600 hover:bg-pink-50' :
                        'border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                      } ${isDarkMode ? 'hover:bg-gray-700/50' : ''}`}
                    >
                      Hari Ini
                    </button>
                  )}
                  {/* Month Display with Custom Date Picker */}
                  <div className="text-center mb-4">
                    <button
                      onClick={() => setShowDatePicker(true)}
                      className={`text-lg font-semibold hover:opacity-75 transition-opacity ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}
                    >
                      {getSliderDisplayMonth(selectedDate)}
                    </button>
                  </div>

                  {/* Hijri Date */}
                  <div className="text-center mb-4">
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : themeColors.text
                    }`}>
                      {new Intl.DateTimeFormat('id-u-ca-islamic', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        calendar: 'islamic-umalqura',
                        numberingSystem: 'latn'
                      }).format(selectedDate)}
                    </div>
                  </div>

                  {/* Responsive Date Slider */}
                  <div className="flex justify-center space-x-1 xs:space-x-2">
                    {/* Extra small screens: 5 dates */}
                    <div className="flex space-x-1 xs:space-x-2 xs:hidden">
                      {getDateSliderDates(selectedDate, true).map((date, index) => {
                        const isActive = date.toDateString() === selectedDate.toDateString();
                        const distance = Math.abs(index - 2); // Center is index 2 for mobile
                        
                        let opacity = '100';
                        if (distance === 1) opacity = '75';
                        if (distance === 2) opacity = '50';

                        return (
                          <button
                            key={date.toISOString()}
                            onClick={() => handleDateSelect(date)}
                            className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-sm ${
                              isActive
                                ? `${themeColors.bg} text-white shadow-lg`
                                : `${
                                    isDarkMode 
                                      ? `bg-gray-700 text-gray-300 hover:bg-gray-600` 
                                      : `bg-gray-100 text-gray-700 hover:bg-gray-200`
                                  } opacity-${opacity}`
                            }`}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* XS+ screens: 7 dates */}
                    <div className="hidden xs:flex space-x-2">
                      {getDateSliderDates(selectedDate, false).map((date, index) => {
                        const isActive = date.toDateString() === selectedDate.toDateString();
                        const distance = Math.abs(index - 3); // Center is index 3 for desktop
                        
                        let opacity = '100';
                        if (distance === 1) opacity = '75';
                        if (distance === 2) opacity = '50';
                        if (distance === 3) opacity = '25';

                        return (
                          <button
                            key={date.toISOString()}
                            onClick={() => handleDateSelect(date)}
                            className={`w-12 h-12 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
                              isActive
                                ? `${themeColors.bg} text-white shadow-lg`
                                : `${
                                    isDarkMode 
                                      ? `bg-gray-700 text-gray-300 hover:bg-gray-600` 
                                      : `bg-gray-100 text-gray-700 hover:bg-gray-200`
                                  } opacity-${opacity}`
                            }`}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Prayer Times Card */}
                <div className={`p-6 rounded-2xl shadow-xl backdrop-blur-md ${
                  isDarkMode ? 'bg-gray-800 bg-opacity-75' : 'bg-white bg-opacity-75'
                }`}>

                {selectedLocation && (
                  <>
                    {/* Location and Schedule Label Row */}
                    <div className={`px-3 py-2 mb-4 flex flex-col xs:flex-row xs:items-center xs:justify-between rounded-lg transition-colors ${
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

                    {prayerTimesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
                        <p className={isDarkMode ? 'text-gray-200' : 'text-gray-600'}>
                          Memuat jadwal shalat...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0">
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
                    )}
                  </>
                )}
                </div>
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

      {/* Custom Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`p-6 rounded-2xl shadow-xl max-w-sm w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Pilih Tanggal
            </h3>
            
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                handleDateSelect(newDate);
                setShowDatePicker(false);
              }}
              className={`w-full p-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-800'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setShowDatePicker(false)}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

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
