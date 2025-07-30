import type { FormattedPrayerTime } from '../hooks/usePrayerData';
import type { AppSettings } from '../hooks/useAppSettings';

interface PrayerScheduleProps {
  prayerTimes: FormattedPrayerTime[];
  settings: AppSettings;
  themeColors: {
    bg: string;
    text: string;
    textLight: string;
    hover: string;
  };
  isDarkMode: boolean;
}

const PrayerSchedule: React.FC<PrayerScheduleProps> = ({
  prayerTimes,
  settings,
  themeColors,
  isDarkMode,
}) => {
  return (
    <div className="space-y-3">
      {prayerTimes
        .filter(prayer => {
          if (prayer.name !== 'Terbit' && prayer.name !== 'Dhuha') return true;
          if (prayer.name === 'Terbit') return settings.showTerbit;
          if (prayer.name === 'Dhuha') return settings.showDhuha;
          return true;
        })
        .map(prayer => (
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
              <span
                className={`font-medium ${
                  prayer.isNext
                    ? 'text-white'
                    : isDarkMode
                    ? 'text-gray-100'
                    : 'text-gray-800'
                }`}
              >
                {prayer.name}
              </span>
            </div>
            <span
              className={`font-semibold ${
                prayer.isNext
                  ? 'text-white'
                  : isDarkMode
                  ? 'text-gray-200'
                  : themeColors.text
              }`}
            >
              {prayer.time}
            </span>
          </div>
        ))}
    </div>
  );
};

export default PrayerSchedule;