import PrayerSchedule from './PrayerSchedule';
import LocationHeader from './LocationHeader';
import { DateTimeDisplay } from './DateTimeDisplay';
import type { FormattedLocation, FormattedPrayerTime } from '../hooks/usePrayerData';
import type { AppSettings } from '../hooks/useAppSettings';

interface MainContentProps {
  loading: boolean;
  error: string | null;
  selectedLocation: FormattedLocation | null;
  prayerTimes: FormattedPrayerTime[];
  settings: AppSettings;
  isDarkMode: boolean;
  themeColors: {
    bg: string;
    text: string;
    textLight: string;
    hover: string;
  };
  loadPrayerTimes: (location: FormattedLocation) => Promise<void>;
}

const MainContent: React.FC<MainContentProps> = ({
  loading,
  error,
  selectedLocation,
  prayerTimes,
  settings,
  isDarkMode,
  themeColors,
  loadPrayerTimes,
}) => {
  if (loading) {
    return (
      <div
        className={`p-8 rounded-2xl shadow-xl backdrop-blur-sm text-center ${
          isDarkMode ? 'bg-gray-800/70' : 'bg-white/70'
        }`}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className={isDarkMode ? 'text-gray-200' : 'text-gray-600'}>
          Memuat jadwal shalat...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-8 rounded-2xl shadow-xl backdrop-blur-sm text-center ${
          isDarkMode ? 'bg-gray-800/70' : 'bg-white/70'
        }`}
      >
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => selectedLocation && loadPrayerTimes(selectedLocation)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div
      className={`p-6 rounded-2xl shadow-xl backdrop-blur-md ${
        isDarkMode ? 'bg-gray-800 bg-opacity-75' : 'bg-white bg-opacity-75'
      }`}
    >
      <div className="text-center mb-4">
        <img
          src={isDarkMode ? '/jamshalatapplogoWhite.png' : '/jamshalatapplogo.png'}
          alt="Jam Shalat App Logo"
          className="h-12 w-auto mx-auto"
        />
      </div>

      <DateTimeDisplay isDarkMode={isDarkMode} themeColors={themeColors} />

      <div
        className={`border-t mb-6 ${
          isDarkMode ? 'border-gray-600' : 'border-gray-300'
        }`}
      />

      {selectedLocation && (
        <>
          <LocationHeader
            selectedLocation={selectedLocation}
            prayerTimes={prayerTimes}
            currentTime={new Date()}
            isDarkMode={isDarkMode}
            themeColors={themeColors}
          />
          <PrayerSchedule
            prayerTimes={prayerTimes}
            settings={settings}
            themeColors={themeColors}
            isDarkMode={isDarkMode}
          />
        </>
      )}
    </div>
  );
};

export default MainContent;