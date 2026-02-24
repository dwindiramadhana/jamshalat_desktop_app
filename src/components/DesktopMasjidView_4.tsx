import React from 'react';
import { Volume2, Settings as SettingsIcon, MapPin } from 'lucide-react';
import type { PrayerTime } from '../types';
import type { CustomSlide } from '../types/settings';
import SlideDisplay from './SlideDisplay';

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
    masjidLogoUrl?: string;
    onOpenSettings: () => void;
    onOpenLocationSettings: () => void;
    isDarkMode: boolean;
    themeColors: ThemeColors;
    secondaryScreen?: boolean;
    nextPrayerCountdown?: string;
    slideMode?: boolean;
    currentSlide?: CustomSlide | null;
    isTransitioning?: boolean;
    adzanEnabled?: boolean;
    onToggleAdzan?: () => void;
};

// Default announcements - no longer used, keeping for reference
// const DEFAULT_ANNOUNCEMENT = 'Mohon Luruskan dan Rapatkan Shaf | Matikan HP Anda saat Shalat Berlangsung';

const formatTime = (value: Date) => {
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

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
    themeColors,
    tickerMessages = [],
    fridayDuty,
    runningTextMode = 'marquee',
    runningTextSpeed = 'normal',
    masjidLogoUrl,
    onOpenLocationSettings,
    secondaryScreen = false,
    nextPrayerCountdown,
    slideMode = false,
    adzanEnabled = true,
    onToggleAdzan,
    currentSlide = null,
    isTransitioning = false,
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

    // --- SLIDE MODE ---
    if (slideMode && currentSlide) {
        return (
            <div className={`flex flex-col h-screen w-full relative overflow-hidden font-['Inter'] transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                <SlideDisplay
                    slide={currentSlide}
                    currentTime={currentTime}
                    nextPrayerText={nextPrayerCountdown}
                    isDarkMode={isDarkMode}
                />
            </div>
        );
    }

    // --- SECONDARY SCREEN MODE ---
    if (secondaryScreen) {
        const nextPrayer = safePrayerTimes.find(p => p.isNext);
        return (
            <div className="flex flex-col h-screen w-full relative overflow-hidden font-['Inter'] rounded-tl-3xl">
                <div className="absolute inset-0 z-0 bg-black/30 rounded-tl-3xl"></div>
                
                {/* Settings Button - Top Right */}
                <button
                    onClick={onOpenSettings}
                    className="absolute top-4 right-4 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 group"
                    aria-label="Open Settings"
                >
                    <SettingsIcon className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
                </button>

                <div className="relative z-10 flex flex-col h-full justify-end">
                    <div className="flex items-end justify-between px-6 pb-4">
                        {/* Bottom Left: Time */}
                        <div className="text-white">
                            <div className="text-6xl font-bold tabular-nums tracking-tighter">
                                {formatTime(currentTime)}:{formatSeconds(currentTime)}
                            </div>
                            <div className="text-sm text-white/50 mt-1">
                                {formatDate(currentTime)}
                            </div>
                        </div>

                        {/* Bottom Right: Next Prayer + Countdown */}
                        {nextPrayer && (
                            <div className="text-right text-white">
                                <div className={`text-sm font-medium uppercase tracking-widest mb-1 ${themeColors.text}`}>
                                    Berikutnya
                                </div>
                                <div className="text-4xl font-bold">
                                    {nextPrayer.name} <span className={themeColors.text}>{nextPrayer.time}</span>
                                </div>
                                {nextPrayerCountdown && (
                                    <div className="text-lg text-white/70 mt-1 tabular-nums">
                                        {nextPrayerCountdown}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full relative overflow-hidden font-['Inter']">
            {/* --- Global Overlay for Contrast --- */}
            <div className={`absolute inset-0 z-0 ${isDarkMode ? 'bg-black/40' : 'bg-black/20'}`}></div>

            {/* --- Main Content Layout --- */}
            <div className="relative z-10 flex flex-col h-full justify-between">

                {/* --- TOP HEADER --- */}
                <div className={`h-40 backdrop-blur-md flex flex-col px-8 shadow-lg shrink-0 ${
                    isDarkMode 
                        ? 'bg-slate-900/90 text-white border-b border-white/10' 
                        : 'bg-white/90 text-gray-900 border-b border-gray-200'
                }`}>
                    {/* Logo row: 3 columns - empty | logo | gear */}
                    <div className="flex items-center justify-between pt-3 pb-2">
                        {/* Left: Empty space */}
                        <div className="w-12"></div>
                        
                        {/* Center: Logo */}
                        <img 
                            src={masjidLogoUrl || (isDarkMode ? "/jamshalatapplogoWhite.png" : "/jamshalatapplogo.png")} 
                            alt="Logo" 
                            className="h-12 w-auto object-contain"
                        />
                        
                        {/* Right: Settings Gear */}
                        <button
                            onClick={onOpenSettings}
                            className={`p-2.5 rounded-full transition-all duration-200 group ${
                                isDarkMode 
                                    ? 'hover:bg-white/10 text-white' 
                                    : 'hover:bg-gray-100 text-gray-700'
                            }`}
                            title="Pengaturan"
                        >
                            <SettingsIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>

                    {/* Info row: Location, Clock, Date */}
                    <div className="flex items-center justify-between flex-1">

                    {/* Left: Location (clickable to open location settings) */}
                    <button
                        onClick={onOpenLocationSettings}
                        className="flex flex-col justify-center min-w-[200px] text-left group cursor-pointer"
                        title="Ubah lokasi"
                    >
                        <div className={`flex items-center gap-2 mb-1 ${themeColors.text}`}>
                            <MapPin className="w-5 h-5" />
                            <span className="font-medium tracking-wide text-sm uppercase opacity-90">Lokasi</span>
                        </div>
                        <h1 className={`text-2xl font-semibold tracking-tight uppercase leading-none transition-colors ${themeColors.hover}`}>
                            {locationName}
                        </h1>
                        {subtitle && (
                            <div className={`text-sm mt-1 font-medium leading-tight max-w-[300px] truncate ${
                                isDarkMode ? 'text-white/70' : 'text-gray-600'
                            }`}>
                                {subtitle}
                            </div>
                        )}
                    </button>

                    {/* Center: Clock */}
                    <div className="flex items-baseline gap-2">
                        <span className={`text-7xl font-bold tracking-tighter tabular-nums leading-none ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                            {formatTime(currentTime)}
                        </span>
                        <span className={`text-3xl font-medium tabular-nums ${themeColors.text}`}>
                            {formatSeconds(currentTime)}
                        </span>
                    </div>

                    {/* Right: Date */}
                    <div className="text-right min-w-[200px]">
                        <div className={`text-lg font-medium ${themeColors.textLight}`}>
                            {formatHijri(currentTime)}
                        </div>
                        <div className={`text-xl font-bold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                            {formatDate(currentTime)}
                        </div>
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
                                    <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${themeColors.text}`}>Khatib</div>
                                    <div className="text-xl font-bold text-white max-w-[200px] truncate">{fridayDuty.khatib || '-'}</div>
                                </div>
                                <div className="w-px h-12 bg-white/10"></div>
                                <div className="text-center min-w-[120px]">
                                    <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${themeColors.text}`}>Imam</div>
                                    <div className="text-xl font-bold text-white max-w-[200px] truncate">{fridayDuty.imam || '-'}</div>
                                </div>
                                <div className="w-px h-12 bg-white/10"></div>
                                <div className="text-center min-w-[120px]">
                                    <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${themeColors.text}`}>Bilal</div>
                                    <div className="text-xl font-bold text-white max-w-[200px] truncate">{fridayDuty.bilal || '-'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Controls / Status top right */}
                    {onToggleAdzan && (
                        <div className="absolute top-6 right-8">
                            <button
                                onClick={onToggleAdzan}
                                className={`backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 border transition-all ${
                                    adzanEnabled
                                        ? 'bg-black/60 text-white border-white/10 hover:bg-white/20'
                                        : 'bg-gray-600/60 text-gray-300 border-gray-500/30 hover:bg-gray-600/80'
                                }`}
                                title={adzanEnabled ? 'Adzan aktif - Klik untuk mematikan' : 'Adzan nonaktif - Klik untuk mengaktifkan'}
                            >
                                <Volume2 className={`w-4 h-4 ${adzanEnabled ? themeColors.text : 'text-gray-400'}`} />
                                <span className="text-sm font-medium">
                                    {adzanEnabled ? 'Adzan Aktif' : 'Adzan Mati'}
                                </span>
                            </button>
                        </div>
                    )}
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
                                    className={`flex-1 relative rounded-t-xl overflow-hidden transition-all duration-300 h-36
                                        ${isActive
                                            ? `${themeColors.bg} shadow-[0_0_50px_${themeColors.bg.replace('bg-', 'rgba(')}] z-20`
                                            : isDarkMode
                                                ? 'bg-slate-900/80 backdrop-blur-md border-t border-white/10'
                                                : 'bg-white/80 backdrop-blur-md border-t border-gray-200'
                                        }
                                    `}
                                >
                                    <div className={`flex flex-col items-center justify-center h-full ${
                                        isActive || isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        <span className={`uppercase tracking-widest text-xs mb-1 font-medium ${
                                            isActive 
                                                ? 'text-white' 
                                                : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                            {prayer.name}
                                        </span>
                                        <span className={`font-bold tabular-nums tracking-tight ${isActive ? 'text-6xl' : 'text-4xl'}`}>
                                            {prayer.time}
                                        </span>
                                        {isActive && iqamahOffsets?.[prayer.name] && (
                                            <div className="mt-1 bg-white/90 px-3 py-1 rounded-full text-xs font-medium border border-white/20 text-gray-900 font-semibold shadow-sm">
                                                -{iqamahOffsets[prayer.name]} Menit ke Iqamah
                                            </div>
                                        )}
                                    </div>

                                    {/* Active Indicator Bar */}
                                    {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/40"></div>}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer - Running Text (Hidden when empty) */}
                    {hasRunningText && (
                        <div className={`h-14 relative overflow-hidden flex items-center shadow-lg z-30 ${themeColors.bg}`}>
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
