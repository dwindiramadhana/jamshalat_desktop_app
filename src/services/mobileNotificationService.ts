import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

class MobileNotificationService {
  private isInitialized = false;
  private notificationId = 1;

  async initialize() {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      const permission = await LocalNotifications.checkPermissions();
      
      if (permission.display !== 'granted') {
        const result = await LocalNotifications.requestPermissions();
        this.isInitialized = result.display === 'granted';
      } else {
        this.isInitialized = true;
      }

      if (this.isInitialized) {
        await LocalNotifications.createChannel({
          id: 'prayer_times',
          name: 'Prayer Times',
          description: 'Notifications for prayer times and countdowns',
          importance: 5,
          visibility: 1,
        });

        await LocalNotifications.createChannel({
          id: 'countdown',
          name: 'Prayer Countdown',
          description: 'Ongoing countdown to next prayer',
          importance: 3,
          visibility: 1,
        });
      }
    } catch (error) {
      console.error('Failed to initialize mobile notifications:', error);
    }
  }

  async updateCountdownNotification(prayerName: string, timeRemaining: string) {
    if (!this.isInitialized) return;

    try {
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
    } catch (error) {
      console.error('Failed to update countdown notification:', error);
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
