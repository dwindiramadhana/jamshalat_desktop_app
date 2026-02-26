import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

class MobileNotificationService {
  private isInitialized = false;
  private notificationId = 1;

  async initialize() {
    console.log('[Mobile Notifications] Initializing...');
    
    if (!Capacitor.isNativePlatform()) {
      console.log('[Mobile Notifications] Not native platform, skipping');
      return;
    }

    console.log('[Mobile Notifications] Native platform detected');

    try {
      // Always request permission immediately on first run
      const result = await LocalNotifications.requestPermissions();
      console.log('[Mobile Notifications] Permission result:', result);
      this.isInitialized = result.display === 'granted';
      console.log('[Mobile Notifications] Initialized:', this.isInitialized);

      if (this.isInitialized) {
        await LocalNotifications.createChannel({
          id: 'prayer_times',
          name: 'Prayer Times',
          description: 'Notifications for prayer times and countdowns',
          importance: 5,
          visibility: 1,
        });
        console.log('[Mobile Notifications] Created prayer_times channel');

        await LocalNotifications.createChannel({
          id: 'countdown',
          name: 'Prayer Countdown',
          description: 'Ongoing countdown to next prayer',
          importance: 3,
          visibility: 1,
        });
        console.log('[Mobile Notifications] Created countdown channel');
      }
    } catch (error) {
      console.error('[Mobile Notifications] Failed to initialize:', error);
    }
  }

  async updateCountdownNotification(prayerName: string, timeRemaining: string) {
    console.log('[Mobile Notifications] updateCountdownNotification called:', { prayerName, timeRemaining, isInitialized: this.isInitialized });
    
    if (!this.isInitialized) {
      console.log('[Mobile Notifications] Not initialized, skipping countdown update');
      return;
    }

    try {
      console.log('[Mobile Notifications] Scheduling countdown notification...');
      await LocalNotifications.schedule({
        notifications: [{
          id: 999,
          title: '🕌 Jam Shalat',
          body: `${prayerName} dalam ${timeRemaining}`,
          channelId: 'countdown',
          ongoing: true,
          autoCancel: false,
          silent: true,
        }]
      });
      console.log('[Mobile Notifications] Countdown notification scheduled successfully');
    } catch (error) {
      console.error('[Mobile Notifications] Failed to update countdown notification:', error);
    }
  }

  async sendPrayerNotification(prayerName: string, isAdzan: boolean) {
    if (!this.isInitialized) return;

    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: this.notificationId++,
          title: isAdzan ? `⏰ Waktu ${prayerName}!` : `🕌 Iqamah ${prayerName}`,
          body: isAdzan ? `Saatnya shalat ${prayerName}` : `Iqamah akan segera dimulai`,
          channelId: 'prayer_times',
          sound: undefined,
          smallIcon: 'ic_stat_prayer',
        }]
      });
    } catch (error) {
      console.error('Failed to send prayer notification:', error);
    }
  }

  async clearCountdownNotification() {
    if (!this.isInitialized) return;

    try {
      await LocalNotifications.cancel({ notifications: [{ id: 999 }] });
    } catch (error) {
      console.error('Failed to clear countdown notification:', error);
    }
  }

  async scheduleUpcomingPrayers(prayers: { name: string; time: Date }[]) {
    if (!this.isInitialized) return;

    try {
      const notifications = prayers.map((prayer, index) => ({
        id: 100 + index,
        title: `🕌 ${prayer.name}`,
        body: `Waktu shalat ${prayer.name}`,
        schedule: { at: prayer.time },
        channelId: 'prayer_times',
      }));

      await LocalNotifications.schedule({ notifications });
    } catch (error) {
      console.error('Failed to schedule upcoming prayers:', error);
    }
  }
}

export const mobileNotificationService = new MobileNotificationService();
