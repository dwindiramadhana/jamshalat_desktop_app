import { useState, useEffect, useRef, useCallback } from 'react';
import { audioService } from '../services/audioService';
import type { AudioSettings } from '../types/settings';

export type CountdownPhase =
  | 'idle'
  | 'adzan_countdown'
  | 'adzan'
  | 'iqamah_countdown'
  | 'iqamah';

export interface PrayerTimeEntry {
  name: string;
  time: string;
  timeInMinutes: number;
  isNext: boolean;
}

export interface CountdownState {
  phase: CountdownPhase;
  prayerName: string;
  secondsRemaining: number;
  totalSeconds: number;
  progress: number;
}

const PRAYER_NAMES_WITH_IQAMAH = ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];

function getIqamahMinutes(
  prayerName: string,
  iqamahMode: 'unified' | 'detailed',
  iqamahUnified: number,
  iqamahDetailed: Record<string, number>
): number {
  if (iqamahMode === 'unified') return iqamahUnified;
  const key = prayerName.toLowerCase();
  return iqamahDetailed[key] || iqamahUnified;
}

export function usePrayerCountdown(
  currentTime: Date,
  prayerTimes: PrayerTimeEntry[],
  audioSettings: AudioSettings,
  iqamahMode: 'unified' | 'detailed',
  iqamahUnified: number,
  iqamahDetailed: Record<string, number>
): CountdownState {
  const [state, setState] = useState<CountdownState>({
    phase: 'idle',
    prayerName: '',
    secondsRemaining: 0,
    totalSeconds: 0,
    progress: 0,
  });

  const phaseRef = useRef<CountdownPhase>('idle');
  const countdownAudioPlayedRef = useRef(false);
  const adzanStartedRef = useRef(false);
  const beepMinuteRef = useRef(-1);
  const iqamahCountdownAudioPlayedRef = useRef(false);
  const lastPrayerRef = useRef('');

  const resetRefs = useCallback(() => {
    countdownAudioPlayedRef.current = false;
    adzanStartedRef.current = false;
    beepMinuteRef.current = -1;
    iqamahCountdownAudioPlayedRef.current = false;
  }, []);

  useEffect(() => {
    if (!audioSettings.enabled) return;
    audioService.volume = audioSettings.volume / 100;
    audioService.preloadAll();
  }, [audioSettings.enabled, audioSettings.volume]);

  useEffect(() => {
    const nowTotalSeconds =
      currentTime.getHours() * 3600 +
      currentTime.getMinutes() * 60 +
      currentTime.getSeconds();

    // Find the prayer we should be tracking for countdown
    // This could be:
    // 1. The next upcoming prayer (for adzan countdown)
    // 2. OR a just-passed prayer (for iqamah countdown during the gap)
    let targetPrayer: PrayerTimeEntry | undefined;
    let secondsToAdzan = Infinity;
    let secondsToIqamah = Infinity;
    let iqamahGapMinutes = 0;

    // Check all prayers with iqamah
    for (const prayer of prayerTimes) {
      if (!PRAYER_NAMES_WITH_IQAMAH.includes(prayer.name)) continue;
      
      const prayerTimeSeconds = prayer.timeInMinutes * 60;
      const gapMinutes = getIqamahMinutes(prayer.name, iqamahMode, iqamahUnified, iqamahDetailed);
      const iqamahTimeSeconds = prayerTimeSeconds + gapMinutes * 60;
      
      const secsToAdzan = prayerTimeSeconds - nowTotalSeconds;
      const secsToIqamah = iqamahTimeSeconds - nowTotalSeconds;
      
      // If we're in the countdown window before this prayer's adzan
      if (secsToAdzan > 0 && secsToAdzan <= audioSettings.adzanCountdownSeconds) {
        targetPrayer = prayer;
        secondsToAdzan = secsToAdzan;
        secondsToIqamah = secsToIqamah;
        iqamahGapMinutes = gapMinutes;
        break;
      }
      
      // If we're between this prayer's adzan and iqamah (the gap period)
      if (secsToAdzan <= 0 && secsToIqamah > 0) {
        targetPrayer = prayer;
        secondsToAdzan = secsToAdzan;
        secondsToIqamah = secsToIqamah;
        iqamahGapMinutes = gapMinutes;
        break;
      }
    }

    // No active countdown period
    if (!targetPrayer) {
      if (phaseRef.current !== 'idle') {
        phaseRef.current = 'idle';
        resetRefs();
        setState(prev => {
          if (prev.phase === 'idle') return prev;
          return { phase: 'idle', prayerName: '', secondsRemaining: 0, totalSeconds: 0, progress: 0 };
        });
      }
      return;
    }

    // Reset refs when prayer changes
    if (lastPrayerRef.current !== targetPrayer.name) {
      lastPrayerRef.current = targetPrayer.name;
      phaseRef.current = 'idle';
      resetRefs();
    }

    const adzanCountdownStart = audioSettings.adzanCountdownSeconds;

    // --- PHASE: ADZAN COUNTDOWN ---
    if (secondsToAdzan > 0 && secondsToAdzan <= adzanCountdownStart) {
      phaseRef.current = 'adzan_countdown';

      // Play 3-second countdown audio
      if (audioSettings.enabled && secondsToAdzan <= 4 && secondsToAdzan > 0 && !countdownAudioPlayedRef.current) {
        countdownAudioPlayedRef.current = true;
        audioService.play('countdown');
      }

      setState(prev => {
        const newState = {
          phase: 'adzan_countdown' as const,
          prayerName: targetPrayer.name,
          secondsRemaining: secondsToAdzan,
          totalSeconds: adzanCountdownStart,
          progress: 1 - secondsToAdzan / adzanCountdownStart,
        };
        if (prev.phase === newState.phase && prev.secondsRemaining === newState.secondsRemaining) return prev;
        return newState;
      });
      return;
    }

    // --- PHASE: ADZAN (at prayer time, T=0 to T+~3min for audio) ---
    if (secondsToAdzan <= 0 && secondsToIqamah > iqamahGapMinutes * 60 - 10) {
      // Just hit prayer time
      if (!adzanStartedRef.current && audioSettings.enabled) {
        adzanStartedRef.current = true;
        const isSubuh = targetPrayer.name === 'Subuh';
        if (audioSettings.playAdzan) {
          if (isSubuh && audioSettings.playAdzanSubuh) {
            audioService.play('adzanSubuh');
          } else {
            audioService.play('adzan');
          }
        }
      }

      phaseRef.current = 'adzan';
      setState(prev => {
        if (prev.phase === 'adzan' && prev.prayerName === targetPrayer.name) return prev;
        return {
          phase: 'adzan',
          prayerName: targetPrayer.name,
          secondsRemaining: 0,
          totalSeconds: 0,
          progress: 1,
        };
      });
      return;
    }

    // --- PHASE: IQAMAH COUNTDOWN ---
    if (secondsToAdzan <= 0 && secondsToIqamah > 0) {
      phaseRef.current = 'iqamah_countdown';

      // Beep every minute during the gap
      if (audioSettings.enabled) {
        const minutesLeft = Math.ceil(secondsToIqamah / 60);
        if (minutesLeft !== beepMinuteRef.current && secondsToIqamah % 60 <= 1 && secondsToIqamah > 4) {
          beepMinuteRef.current = minutesLeft;
          audioService.play('beep');
        }
      }

      // Play 3-second countdown before iqamah
      if (audioSettings.enabled && secondsToIqamah <= 4 && secondsToIqamah > 0 && !iqamahCountdownAudioPlayedRef.current) {
        iqamahCountdownAudioPlayedRef.current = true;
        audioService.play('countdown');
      }

      const totalIqamahGap = iqamahGapMinutes * 60;
      setState(prev => {
        const newState = {
          phase: 'iqamah_countdown' as const,
          prayerName: targetPrayer.name,
          secondsRemaining: secondsToIqamah,
          totalSeconds: totalIqamahGap,
          progress: 1 - secondsToIqamah / totalIqamahGap,
        };
        if (prev.phase === newState.phase && prev.secondsRemaining === newState.secondsRemaining) return prev;
        return newState;
      });
      return;
    }

    // --- PHASE: IQAMAH ---
    if (secondsToIqamah <= 0 && secondsToIqamah > -30) {
      phaseRef.current = 'iqamah';
      setState(prev => {
        if (prev.phase === 'iqamah' && prev.prayerName === targetPrayer.name) return prev;
        return {
          phase: 'iqamah',
          prayerName: targetPrayer.name,
          secondsRemaining: 0,
          totalSeconds: 0,
          progress: 1,
        };
      });
      return;
    }

    // --- PHASE: IDLE ---
    if (phaseRef.current !== 'idle') {
      phaseRef.current = 'idle';
      resetRefs();
    }
    setState(prev => {
      if (prev.phase === 'idle') return prev;
      return { phase: 'idle', prayerName: '', secondsRemaining: 0, totalSeconds: 0, progress: 0 };
    });

  }, [currentTime, prayerTimes, audioSettings, iqamahMode, iqamahUnified, iqamahDetailed, resetRefs]);

  return state;
}
