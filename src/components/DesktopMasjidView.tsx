import type { PrayerTime } from '../types';

type ThemeColors = {
  bg: string;
  text: string;
  textLight: string;
  hover: string;
};

type PrayerItem = PrayerTime & {
  isNext: boolean;
};

type DesktopMasjidViewProps = {
  currentTime: Date;
  selectedDate: Date;
  locationName: string;
  subtitle?: string;
  message?: string;
  prayerTimes: PrayerItem[];
  themeColors: ThemeColors;
  isDarkMode: boolean;
};

const formatTime = (value: Date) =>
  value
    .toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      hourCycle: 'h23',
    })
    .replace(/\./g, ':');

const formatDate = (value: Date) =>
  value.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const formatHijriDate = (value: Date) => {
  try {
    return new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(value);
  } catch (error) {
    return '';
  }
};

const DesktopMasjidView = ({
  currentTime,
  selectedDate,
  locationName,
  subtitle,
  message,
  prayerTimes,
  themeColors,
  isDarkMode,
}: DesktopMasjidViewProps) => {
  const nextPrayer = prayerTimes.find((prayer) => prayer.isNext) || prayerTimes[0];
  const displaySubtitle = subtitle || 'Alamat masjid belum diatur';
  const tickerMessage = message || 'Selamat datang di Jam Shalat • Jadwal shalat hari ini tersedia untuk seluruh jamaah.';
  const hijriDate = formatHijriDate(selectedDate);

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="text-white drop-shadow-lg">
          <div className="text-xs uppercase tracking-[0.35em] text-white/70">Masjid</div>
          <div className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
            {locationName}
          </div>
          <div className="text-sm sm:text-base text-white/80 mt-1">
            {displaySubtitle}
          </div>
        </div>
        <div className="text-right text-white drop-shadow-lg">
          <div className="text-4xl sm:text-5xl font-bold tracking-tight">{formatTime(currentTime)}</div>
          <div className="text-sm sm:text-base">{formatDate(selectedDate)}</div>
          {hijriDate && (
            <div className="mt-1 text-xs sm:text-sm text-amber-200 font-semibold">
              {hijriDate}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col xl:flex-row gap-8">
        <div className="flex-1 rounded-[2.5rem] bg-white/15 backdrop-blur-xl border border-white/20 p-8 shadow-2xl text-white">
          <div className="flex items-start justify-between mb-6">
            <span className={`${themeColors.bg} px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.3em] text-white`}>
              Waktu Berikutnya
            </span>
            <span className="text-white/70 text-sm uppercase tracking-wide">Menuju Adzan</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-4">
            <div className="text-5xl sm:text-6xl xl:text-7xl font-black">{nextPrayer?.name}</div>
            <div className="text-3xl sm:text-4xl font-light text-white/70">{nextPrayer?.time}</div>
          </div>
          <p className="mt-6 text-base sm:text-lg text-white/70 max-w-3xl leading-relaxed">
            "Apabila panggilan shalat (adzan) dikumandangkan, maka setan akan lari sambil terkentut-kentut hingga tidak mendengar adzan." (HR. Bukhari)
          </p>
        </div>

        <div className="w-full xl:w-80 flex flex-col gap-4">
          <div className="rounded-[1.75rem] bg-emerald-900/40 backdrop-blur-md border border-emerald-400/20 p-6 text-white shadow-xl">
            <div className="text-xs uppercase tracking-[0.3em] text-emerald-200">Petugas Jumat</div>
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-white/50">Khatib</div>
                <div className="text-lg font-semibold">Ust. Ahmad</div>
              </div>
              <div className="h-px bg-white/10" />
              <div>
                <div className="text-xs uppercase tracking-wide text-white/50">Imam</div>
                <div className="text-lg font-semibold">Ust. Ridwan</div>
              </div>
            </div>
          </div>
          <div className="rounded-[1.75rem] bg-black/40 backdrop-blur-md border border-white/15 p-6 text-white shadow-xl">
            <div className="text-xs uppercase tracking-[0.3em] text-white/70">Info</div>
            <div className="mt-3 text-sm leading-relaxed text-white/80">
              Mohon menonaktifkan atau menyenyapkan nada dering handphone selama shalat berjamaah.
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-black/55 backdrop-blur-md px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {prayerTimes.map((prayer) => {
            const isNext = prayer.isNext;
            const cardClasses = isNext
              ? `${themeColors.bg} text-white shadow-black/30 ring-white/60 scale-[1.05]`
              : isDarkMode
                ? 'bg-gray-900/70 text-white'
                : 'bg-white/85 text-gray-900';
            const labelClasses = isNext
              ? 'text-white/80'
              : 'text-white/50';
            const timeClasses = isNext ? 'text-white' : 'text-white';

            return (
              <div
                key={prayer.name}
                className={`relative overflow-hidden rounded-2xl px-3 py-5 text-center shadow-lg ring-1 ring-white/20 backdrop-blur-sm transition-transform ${cardClasses}`}
              >
                <div className={`text-[11px] uppercase tracking-[0.35em] font-semibold ${labelClasses}`}>
                  {prayer.name}
                </div>
                <div className={`mt-3 text-2xl sm:text-3xl font-bold ${timeClasses}`}>{prayer.time}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-12 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 flex items-center overflow-hidden">
        <div className={`${themeColors.bg} px-4 py-2 text-xs uppercase tracking-[0.3em] text-white font-bold`}>
          Info
        </div>
        <div className="flex-1 overflow-hidden px-4">
          <div className="marquee__inner text-sm sm:text-base text-white/90 font-medium tracking-wide">
            {tickerMessage}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopMasjidView;
