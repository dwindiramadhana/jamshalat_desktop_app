import type { FormattedLocation, FormattedPrayerTime } from '../hooks/usePrayerData';

interface LocationHeaderProps {
  selectedLocation: FormattedLocation;
  prayerTimes: FormattedPrayerTime[];
  currentTime: Date;
  isDarkMode: boolean;
  themeColors: {
    text: string;
  };
}

const LocationHeader: React.FC<LocationHeaderProps> = ({
  selectedLocation,
  prayerTimes,
  currentTime,
  isDarkMode,
  themeColors,
}) => {
  return (
    <div
      className={`px-3 py-2 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg transition-colors ${
        isDarkMode
          ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-100'
          : 'bg-white/50 hover:bg-white/70 text-gray-800'
      } backdrop-blur-sm`}
    >
      <div className="flex items-center">
        <span
          className={`font-medium ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}
        >
          {selectedLocation.name}
        </span>
      </div>
      <span
        className={`font-semibold text-sm ${
          isDarkMode ? 'text-gray-200' : themeColors.text
        }`}
      >
        {(() => {
          const currentTotalMinutes =
            currentTime.getHours() * 60 + currentTime.getMinutes();
          const allPrayersPassed = prayerTimes.every(prayer => {
            return prayer.timeInMinutes <= currentTotalMinutes;
          });
          return allPrayersPassed ? 'Jadwal Besok:' : 'Jadwal hari ini:';
        })()}
      </span>
    </div>
  );
};

export default LocationHeader;