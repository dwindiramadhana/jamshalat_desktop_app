import { useEffect, useRef } from 'react';
import { desktopNotificationService } from '../services/desktopNotificationService';
import { mobileNotificationService } from '../services/mobileNotificationService';
import type { CountdownState } from './usePrayerCountdown';

interface UseNotificationsProps {
  countdownState: CountdownState;
  enabled: boolean;
}

export function useNotifications({ countdownState, enabled }: UseNotificationsProps) {
  const lastPhaseRef = useRef<string>('');
  const lastMinuteRef = useRef<number>(-1);
  const notificationTimersRef = useRef<number[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const initServices = async () => {
      await desktopNotificationService.initialize();
      await mobileNotificationService.initialize();
    };

    initServices();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const { phase, prayerName, secondsRemaining } = countdownState;
    const minutesRemaining = Math.ceil(secondsRemaining / 60);
    const phaseKey = `${phase}_${prayerName}`;

    if (phaseKey !== lastPhaseRef.current) {
      lastPhaseRef.current = phaseKey;
      lastMinuteRef.current = -1;

      if (phase === 'adzan') {
        desktopNotificationService.sendPrayerNotification(prayerName, 0);
        mobileNotificationService.sendPrayerNotification(prayerName, true);
      } else if (phase === 'iqamah') {
        mobileNotificationService.sendPrayerNotification(prayerName, false);
      }
    }

    if (phase === 'adzan_countdown') {
      if (minutesRemaining !== lastMinuteRef.current) {
        lastMinuteRef.current = minutesRemaining;
        
        if (minutesRemaining === 5 || minutesRemaining === 1) {
          desktopNotificationService.sendPrayerNotification(prayerName, minutesRemaining);
        }

        const timeStr = secondsRemaining >= 60 
          ? `${minutesRemaining} menit`
          : `${secondsRemaining} detik`;
        
        mobileNotificationService.updateCountdownNotification(prayerName, timeStr);
      }
    } else if (phase === 'iqamah_countdown') {
      if (minutesRemaining !== lastMinuteRef.current && minutesRemaining <= 5) {
        lastMinuteRef.current = minutesRemaining;
        
        const timeStr = secondsRemaining >= 60 
          ? `${minutesRemaining} menit`
          : `${secondsRemaining} detik`;
        
        mobileNotificationService.updateCountdownNotification(
          `Iqamah ${prayerName}`,
          timeStr
        );
      }
    } else if (phase === 'idle') {
      mobileNotificationService.clearCountdownNotification();
    }

    return () => {
      notificationTimersRef.current.forEach(clearTimeout);
      notificationTimersRef.current = [];
    };
  }, [countdownState, enabled]);

  return {
    sendCustomNotification: async (message: string) => {
      if (!enabled) return;
      await desktopNotificationService.sendCountdownNotification(message);
    }
  };
}
