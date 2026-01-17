import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Calendar, Clock, Info, MapPin, User, Volume2 } from 'lucide-react';
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

type FridayDuty = {
  khatib: string;
  imam: string;
};

type DesktopMasjidView2Props = {
  currentTime: Date;
  selectedDate: Date;
  locationName: string;
  subtitle?: string;
  message?: string;
  prayerTimes: PrayerItem[];
  themeColors: ThemeColors;
  tickerMessages?: string[];
  fridayDuty?: FridayDuty;
  iqamahOffsets?: Record<string, number>;
};

const DEFAULT_TICKER_MESSAGES = [
  'Luruskan dan rapatkan shaf demi kesempurnaan shalat jamaah.',
  'Mohon menonaktifkan atau menyenyapkan nada dering handphone.',
  'Saldo Kas Masjid per Jumat lalu: Rp 12.500.000,-',
  'Kajian Rutin Selasa Malam: Kitab Riyadhus Shalihin bersama Ust. Ahmad.',
];

const DEFAULT_FRIDAY_DUTY: FridayDuty = {
  khatib: 'Dr. KH. Abdullah Gymnastiar',
  imam: 'Ust. M. Ridwan',
};

const DEFAULT_IQAMAH_OFFSETS: Record<string, number> = {
  Subuh: 15,
  Dzuhur: 10,
  Ashar: 10,
  Maghrib: 7,
  Isya: 10,
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
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const formatHijri = (value: Date) => {
  try {
    return new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(value);
  } catch (error) {
    return '1 Ramadhan 1445 H';
  }
};

const DesktopMasjidView2 = ({
  currentTime,
  selectedDate,
  locationName,
  subtitle,
  message,
  prayerTimes,
  themeColors,
  tickerMessages,
  fridayDuty = DEFAULT_FRIDAY_DUTY,
  iqamahOffsets = DEFAULT_IQAMAH_OFFSETS,
}: DesktopMasjidView2Props) => {
  const [tickerIndex, setTickerIndex] = useState(0);
  const nextPrayer = prayerTimes.find((prayer) => prayer.isNext) || prayerTimes[0];
  const displaySubtitle = subtitle || 'Alamat masjid belum diatur';
  const effectiveTickerMessages = useMemo(() => {
    if (tickerMessages && tickerMessages.length > 0) return tickerMessages;
    if (message && message.trim()) return [message.trim()];
    return DEFAULT_TICKER_MESSAGES;
  }, [message, tickerMessages]);

  useEffect(() => {
    if (effectiveTickerMessages.length <= 1) return;
    const tickerTimer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % effectiveTickerMessages.length);
    }, 10000);
    return () => clearInterval(tickerTimer);
  }, [effectiveTickerMessages]);

  const activeTicker = useMemo(
    () => effectiveTickerMessages[tickerIndex] || '',
    [effectiveTickerMessages, tickerIndex]
  );
  const accentClass = 'bg-amber-500';

  return (
    <div className="h-screen w-full bg-slate-950 text-white font-display overflow-hidden flex flex-col relative select-none">
      <div className="relative z-10 flex flex-col h-full p-6 lg:p-10">
        
        {/* Header: Clean & Symmetrical */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-5 items-center">
            <div className={`${accentClass} p-4 rounded-2xl shadow-xl shadow-amber-500/10`}>
              <MapPin size={32} className="text-black" />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-none">
                {locationName}
              </h1>
              <p className="text-base lg:text-lg opacity-60 flex items-center gap-2 font-medium">
                <Info size={16} className="text-amber-500" /> {displaySubtitle}
              </p>
            </div>
          </div>

          <div className="text-right flex items-center gap-8">
            <div className="space-y-0.5">
              <div className="text-2xl lg:text-3xl font-bold text-white/90">
                {formatDate(currentTime)}
              </div>
              <div className="text-lg lg:text-xl text-amber-500 font-bold tracking-wider text-right">
                {formatHijri(currentTime)}
              </div>
            </div>
            <div className="h-16 w-px bg-white/20" />
            <div className="text-7xl lg:text-8xl font-mono-display font-black tracking-tighter leading-none drop-shadow-2xl">
              {formatTime(currentTime)}
            </div>
          </div>
        </div>

        {/* Hero Area: Distributed space */}
        <div className="flex-1 flex flex-col xl:flex-row gap-6 items-stretch min-h-0">
          
          {/* Main Hero: Next Prayer Display */}
          <div className="flex-[2] bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
            {/* Subtle light effect */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px]" />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className={`${accentClass} px-6 py-2 rounded-xl text-xs font-black uppercase tracking-[0.3em] text-black`}>
                  Jadwal Berikutnya
                </span>
                <div className="flex items-center gap-2 text-white/40 font-bold uppercase tracking-widest text-[10px]">
                  <Clock size={14} className="text-amber-500" />
                  Menuju Waktu Shalat
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
               <div className="flex items-baseline gap-6">
              <h2 className="text-9xl lg:text-[11rem] font-black tracking-tighter leading-none text-white drop-shadow-xl">
                {nextPrayer?.name}
              </h2>
              <span className="text-6xl lg:text-7xl font-light text-white/30 tracking-tight">
                {nextPrayer?.time}
              </span>
            </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-4">
                <div className={`${accentClass} h-full w-2/3 shadow-[0_0_15px_rgba(245,158,11,0.5)]`} />
              </div>
            </div>

            <div className="relative">
              <p className="text-xl lg:text-2xl text-white/70 leading-relaxed font-medium italic border-l-4 border-amber-500/50 pl-8 max-w-4xl">
                "Amalan yang paling dicintai oleh Allah adalah Shalat pada waktunya." 
                <span className="block text-sm not-italic mt-2 opacity-50 font-bold uppercase tracking-widest">(HR. Bukhari & Muslim)</span>
              </p>
            </div>
          </div>

          {/* Side Info: Duty/Announcements */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex-1 bg-emerald-900/20 backdrop-blur-2xl border border-emerald-500/20 rounded-[3rem] p-8 flex flex-col justify-center shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-emerald-500/20 p-3 rounded-2xl">
                  <User size={32} className="text-emerald-400" />
                </div>
                <h3 className="text-xl font-black text-emerald-300 uppercase tracking-[0.2em]">
                  Petugas Jumat
                </h3>
              </div>
              
              <div className="space-y-8">
                <div className="group transition-all">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-400/50 font-black mb-1">Khatib Terjadwal</p>
                  <p className="text-3xl lg:text-4xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                    {fridayDuty.khatib}
                  </p>
                </div>
                <div className="h-px bg-white/5 w-full" />
                <div className="group transition-all">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-400/50 font-black mb-1">Imam Rawatib</p>
                  <p className="text-3xl lg:text-4xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                    {fridayDuty.imam}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Prayer Schedule */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {prayerTimes.map((prayer) => {
            const isNext = prayer.isNext;
            const iqamahOffset = iqamahOffsets[prayer.name] || 10;
            return (
              <div
                key={prayer.name}
                className={`relative overflow-hidden rounded-[2rem] p-6 flex flex-col items-center justify-center gap-2 transition-all duration-700 ${
                  isNext
                    ? `${accentClass} scale-105 shadow-[0_20px_50px_rgba(245,158,11,0.2)] ring-2 ring-white/50 z-20`
                    : 'bg-black/40 hover:bg-black/60 border border-white/5'
                }`}
              >
                {isNext && (
                  <div className="absolute top-3 right-3 text-black/40">
                    <Volume2 size={20} className="animate-pulse" />
                  </div>
                )}
                <span className={`text-[10px] uppercase tracking-[0.4em] font-black ${isNext ? 'text-black/50' : 'text-white/30'}`}>
                  {prayer.name}
                </span>
                <span className={`text-4xl lg:text-5xl font-mono-display font-black tracking-tighter ${isNext ? 'text-black' : 'text-white'}`}>
                  {prayer.time}
                </span>
                {isNext && (
                  <div className="mt-1 px-3 py-0.5 bg-black/10 rounded-full text-[9px] font-black text-black/60 uppercase tracking-widest">
                    IQAMAH: +{iqamahOffset}M
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Marquee Footer: Cinematic Ticker */}
      <div className="h-16 bg-black/95 backdrop-blur-3xl border-t border-white/10 flex items-center relative overflow-hidden shrink-0">
        <div className={`absolute left-0 top-0 bottom-0 z-30 px-8 flex items-center gap-3 font-black text-lg tracking-tight shadow-2xl shadow-black ${themeColors.bg}`}>
          <BookOpen size={24} className="text-white/80" /> 
          <span className="hidden lg:inline uppercase tracking-widest text-sm">Warta Masjid</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="whitespace-nowrap flex items-center h-full px-12 text-xl font-bold tracking-wide animate-marquee text-white/90">
            {activeTicker}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(100%); }
          10% { transform: translateX(0); }
          90% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 16s linear infinite;
        }
      `}} />
    </div>
  );
};

export default DesktopMasjidView2;
