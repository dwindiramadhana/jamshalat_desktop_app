import React from 'react';
import type { CountdownPhase } from '../hooks/usePrayerCountdown';

interface CountdownOverlayProps {
  phase: CountdownPhase;
  prayerName: string;
  secondsRemaining: number;
  totalSeconds: number;
  progress: number;
  isDesktop: boolean;
}

const formatCountdown = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(secs).padStart(2, '0')}`;
};

const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  phase,
  prayerName,
  secondsRemaining,
  progress,
  isDesktop,
}) => {
  if (phase === 'idle') return null;

  // --- ADZAN PHASE: Full-screen announcement ---
  if (phase === 'adzan') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 animate-in fade-in duration-500">
        <div className="text-center text-white">
          <div className="text-2xl md:text-4xl font-medium tracking-widest uppercase text-orange-400 mb-4 animate-pulse">
            Adzan
          </div>
          <div className={`font-bold tracking-tight ${isDesktop ? 'text-8xl' : 'text-6xl'}`}>
            {prayerName}
          </div>
          <div className="mt-6 text-lg md:text-xl text-white/60 font-medium">
            Waktu shalat {prayerName} telah tiba
          </div>
        </div>
      </div>
    );
  }

  // --- IQAMAH PHASE: Full-screen announcement ---
  if (phase === 'iqamah') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-900/95 animate-in fade-in duration-500">
        <div className="text-center text-white">
          <div className="text-2xl md:text-4xl font-medium tracking-widest uppercase text-emerald-300 mb-4 animate-pulse">
            Iqamah
          </div>
          <div className={`font-bold tracking-tight ${isDesktop ? 'text-8xl' : 'text-6xl'}`}>
            {prayerName}
          </div>
          <div className="mt-6 text-lg md:text-xl text-white/60 font-medium">
            Luruskan dan rapatkan shaf
          </div>
        </div>
      </div>
    );
  }

  // --- ADZAN COUNTDOWN ---
  if (phase === 'adzan_countdown') {
    const isUrgent = secondsRemaining <= 10;

    if (isDesktop) {
      return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 animate-in fade-in duration-300">
          <div className="text-center text-white">
            <div className="text-xl font-medium tracking-widest uppercase text-orange-400 mb-2">
              Adzan {prayerName} dalam
            </div>
            <div className={`font-bold tabular-nums tracking-tight transition-all duration-300 ${isUrgent ? 'text-[12rem] text-orange-500 animate-pulse' : 'text-[10rem]'}`}>
              {formatCountdown(secondsRemaining)}
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/10">
            <div
              className="h-full bg-orange-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      );
    }

    // Mobile
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 animate-in fade-in duration-300">
        <div className="text-center text-white px-6">
          <div className="text-sm font-medium tracking-widest uppercase text-orange-400 mb-2">
            Adzan {prayerName} dalam
          </div>
          <div className={`font-bold tabular-nums tracking-tight transition-all duration-300 ${isUrgent ? 'text-7xl text-orange-500 animate-pulse' : 'text-6xl'}`}>
            {formatCountdown(secondsRemaining)}
          </div>

          {/* Circular progress */}
          <div className="mt-8 flex justify-center">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
              <circle
                cx="60" cy="60" r="54" fill="none" stroke="#f97316" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
          </div>
        </div>

        {/* Bottom progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
          <div
            className="h-full bg-orange-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    );
  }

  // --- IQAMAH COUNTDOWN ---
  if (phase === 'iqamah_countdown') {
    const isUrgent = secondsRemaining <= 10;

    if (isDesktop) {
      return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 animate-in fade-in duration-300">
          <div className="text-center text-white">
            <div className="text-xl font-medium tracking-widest uppercase text-emerald-400 mb-2">
              Iqamah {prayerName} dalam
            </div>
            <div className={`font-bold tabular-nums tracking-tight transition-all duration-300 ${isUrgent ? 'text-[12rem] text-emerald-400 animate-pulse' : 'text-[10rem]'}`}>
              {formatCountdown(secondsRemaining)}
            </div>
            <div className="mt-4 text-lg text-white/50">
              Menunggu iqamah...
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/10">
            <div
              className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      );
    }

    // Mobile
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 animate-in fade-in duration-300">
        <div className="text-center text-white px-6">
          <div className="text-sm font-medium tracking-widest uppercase text-emerald-400 mb-2">
            Iqamah {prayerName} dalam
          </div>
          <div className={`font-bold tabular-nums tracking-tight transition-all duration-300 ${isUrgent ? 'text-7xl text-emerald-400 animate-pulse' : 'text-6xl'}`}>
            {formatCountdown(secondsRemaining)}
          </div>

          {/* Circular progress */}
          <div className="mt-8 flex justify-center">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
              <circle
                cx="60" cy="60" r="54" fill="none" stroke="#10b981" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
          </div>

          <div className="mt-4 text-sm text-white/50">
            Menunggu iqamah...
          </div>
        </div>

        {/* Bottom progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
          <div
            className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default CountdownOverlay;
