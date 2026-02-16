import React from 'react';
import { Volume2, Settings as SettingsIcon, MapPin } from 'lucide-react';
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
    bilal: string;
};

type DesktopMasjidView4Props = {
    currentTime: Date;
    selectedDate: Date;
    locationName: string;
    subtitle?: string;
    message?: string;
    prayerTimes: PrayerItem[];
    tickerMessages?: string[];
    fridayDuty?: FridayDuty;
    iqamahOffsets?: Record<string, number>;
    runningTextMode?: 'marquee' | 'fade';
    runningTextSpeed?: 'slow' | 'normal' | 'fast';
    onOpenSettings: () => void;
    isDarkMode: boolean;
    themeColors: ThemeColors;
};

// Default announcements - no longer used, keeping for reference
// const DEFAULT_ANNOUNCEMENT = 'Mohon Luruskan dan Rapatkan Shaf | Matikan HP Anda saat Shalat Berlangsung';

const formatTime = (value: Date) =>
    value
        .toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            hourCycle: 'h23',
        })
        .replace(/\./g, ':');

const formatSeconds = (value: Date) =>
    String(value.getSeconds()).padStart(2, '0');

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
        return '14 Shafar 1445 H'; // Fallback
    }
};

const DesktopMasjidView4 = ({
    currentTime,
    locationName,
    subtitle,
    message,
    prayerTimes,
    iqamahOffsets,
    onOpenSettings,
    isDarkMode,
    // themeColors,
    tickerMessages = [],
    fridayDuty,
    runningTextMode = 'marquee',
    runningTextSpeed = 'normal',
}: DesktopMasjidView4Props) => {

    // State for fade mode message cycling
    const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);


    // Helper: Ensure we have data or show placeholder
    const safePrayerTimes = prayerTimes && prayerTimes.length > 0 ? prayerTimes : [
        { name: 'Subuh', time: '04:26', isNext: false },
        { name: 'Dzuhur', time: '12:03', isNext: true },
        { name: 'Ashar', time: '15:03', isNext: false },
        { name: 'Maghrib', time: '17:58', isNext: false },
        { name: 'Isya', time: '18:59', isNext: false },
    ] as PrayerItem[];

    // Combine props message and ticker messages for the marquee
    const allMessages = [message, ...tickerMessages].filter(Boolean) as string[];
    const marqueeContent = allMessages.length > 0 ? allMessages.join('  •  ') : '';
    const hasRunningText = allMessages.length > 0 && allMessages.some(m => m.trim() !== '');

    // Speed mappings
    const speedClass = {
        slow: 'marquee--slow',
        normal: 'marquee--normal',
        fast: 'marquee--fast',
    }[runningTextSpeed];

    const fadeDuration = {
        slow: 8000,
        normal: 5000,
        fast: 3000,
    }[runningTextSpeed];

    // Cycle through messages in fade mode
    React.useEffect(() => {
        if (runningTextMode === 'fade' && allMessages.length > 1) {
            const interval = setInterval(() => {
                setCurrentMessageIndex(prev => (prev + 1) % allMessages.length);
            }, fadeDuration);
            return () => clearInterval(interval);
        }
    }, [runningTextMode, allMessages.length, fadeDuration]);

    return (
        <div className="flex flex-col h-screen w-full relative overflow-hidden font-['Inter']">
            {/* --- Global Overlay for Contrast --- */}
            <div className={`absolute inset-0 z-0 ${isDarkMode ? 'bg-black/40' : 'bg-black/20'}`}></div>

            {/* --- Main Content Layout --- */}
            <div className="relative z-10 flex flex-col h-full justify-between">

                {/* --- TOP HEADER --- */}
                <div className="h-24 bg-slate-900/90 backdrop-blur-md text-white flex items-center justify-between px-8 border-b border-white/10 shadow-lg shrink-0">

                    {/* Left: Location */}
                    <div className="flex flex-col justify-center min-w-[200px]">
                        <div className="flex items-center gap-2 text-orange-400 mb-1">
                            <MapPin className="w-5 h-5" />
                            <span className="font-medium tracking-wide text-sm uppercase opacity-90">Lokasi</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight uppercase leading-none">
                            {locationName}
                        </h1>
                        {subtitle && (
                            <div className="text-sm text-white/70 mt-1 font-medium leading-tight max-w-[300px] truncate">
                                {subtitle}
                            </div>
                        )}
                    </div>

                    {/* Center: Clock */}
                    <div className="flex items-baseline gap-2">
                        <span className="text-7xl font-bold tracking-tighter tabular-nums leading-none">
                            {formatTime(currentTime)}
                        </span>
                        <span className="text-3xl font-medium text-orange-400 tabular-nums">
                            {formatSeconds(currentTime)}
                        </span>
                    </div>

                    {/* Right: Date */}
                    <div className="text-right min-w-[200px]">
                        <div className="text-lg font-medium text-orange-100">
                            {formatHijri(currentTime)}
                        </div>
                        <div className="text-xl font-bold">
                            {formatDate(currentTime)}
                        </div>
                    </div>
                </div>


                {/* --- MIDDLE AREA --- */}
                <div className="flex-grow relative p-8 flex flex-col items-center justify-center">

                    {/* Friday Duty Info (Only show if data exists) */}
                    {fridayDuty && (fridayDuty.khatib || fridayDuty.imam || fridayDuty.bilal) && (
                        <div className="animate-in fade-in zoom-in duration-700">
                            <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex items-center justify-center gap-12 shadow-2xl">
                                <div className="text-center min-w-[120px]">
                                    <div className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2">Khatib</div>
                                    <div className="text-xl font-bold text-white max-w-[200px] truncate">{fridayDuty.khatib || '-'}</div>
                                </div>
                                <div className="w-px h-12 bg-white/10"></div>
                                <div className="text-center min-w-[120px]">
                                    <div className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2">Imam</div>
                                    <div className="text-xl font-bold text-white max-w-[200px] truncate">{fridayDuty.imam || '-'}</div>
                                </div>
                                <div className="w-px h-12 bg-white/10"></div>
                                <div className="text-center min-w-[120px]">
                                    <div className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2">Bilal</div>
                                    <div className="text-xl font-bold text-white max-w-[200px] truncate">{fridayDuty.bilal || '-'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Controls / Status top right */}
                    <div className="absolute top-6 right-8 flex gap-3">
                        <div className="bg-black/60 backdrop-blur text-white px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
                            <Volume2 className="w-4 h-4 text-orange-400" />
                            <span className="text-sm font-medium">Mode Muadzin</span>
                        </div>

                        <button
                            onClick={onOpenSettings}
                            className="bg-black/60 backdrop-blur text-white p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <SettingsIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>


                {/* --- BOTTOM SECTION --- */}
                <div className="flex flex-col shrink-0">

                    {/* Prayer Schedule Row */}
                    <div className="flex items-end px-4 gap-2 mb-4 w-full max-w-[1920px] mx-auto">
                        {safePrayerTimes.map((prayer) => {
                            const isActive = prayer.isNext;

                            return (
                                <div
                                    key={prayer.name}
                                    className={`flex-1 relative rounded-t-xl overflow-hidden transition-all duration-300
                                        ${isActive
                                            ? 'bg-orange-600 shadow-[0_0_50px_rgba(234,88,12,0.5)] z-20'
                                            : 'bg-slate-900/80 backdrop-blur-md border-t border-white/10'
                                        }
                                        h-36
                                    `}
                                >
                                    <div className="flex flex-col items-center justify-center h-full text-white">
                                        <span className={`uppercase tracking-widest text-xs mb-1 font-medium ${isActive ? 'text-orange-100' : 'text-gray-400'}`}>
                                            {prayer.name}
                                        </span>
                                        <span className={`font-bold tabular-nums tracking-tight ${isActive ? 'text-6xl' : 'text-4xl'}`}>
                                            {prayer.time}
                                        </span>
                                        {isActive && iqamahOffsets?.[prayer.name] && (
                                            <div className="mt-1 bg-black/20 px-3 py-1 rounded-full text-xs font-medium text-orange-100 border border-white/10">
                                                -{iqamahOffsets[prayer.name]} Menit ke Iqamah
                                            </div>
                                        )}
                                    </div>

                                    {/* Active Indicator Bar */}
                                    {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer - Running Text (Hidden when empty) */}
                    {hasRunningText && (
                        <div className="h-14 bg-orange-600 relative overflow-hidden flex items-center shadow-lg z-30">
                            {runningTextMode === 'marquee' ? (
                                /* Marquee Mode */
                                <div className={`marquee ${speedClass} w-full`}>
                                    <div className="marquee__inner flex items-center h-full">
                                        <span className="text-white font-bold text-2xl tracking-wide px-4 uppercase">
                                            {marqueeContent}  •  {marqueeContent}  •  {marqueeContent}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                /* Fade Mode */
                                <div className="w-full flex items-center justify-center h-full">
                                    <span
                                        key={currentMessageIndex}
                                        className="text-white font-bold text-2xl tracking-wide px-4 uppercase text-center animate-fade-in-out"
                                    >
                                        {allMessages[currentMessageIndex] || ''}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DesktopMasjidView4;
