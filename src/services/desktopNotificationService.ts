import { requestPermission, sendNotification } from '@tauri-apps/plugin-notification';

declare global {
  interface Window {
    __TAURI__?: any;
  }
}

class DesktopNotificationService {
  private permissionGranted = false;

  async initialize() {
    console.log('[Desktop Notifications] Initializing...');
    
    try {
      // Request permission - will only work in Tauri, silently fail in browser
      const permission = await requestPermission();
      this.permissionGranted = permission === 'granted';
      console.log('[Desktop Notifications] Permission result:', permission);
    } catch (error) {
      console.log('[Desktop Notifications] Not in Tauri environment or permission denied:', error);
    }
  }

  async sendPrayerNotification(prayerName: string, minutesUntil: number) {
    if (!this.permissionGranted) return;

    try {
      const title = minutesUntil === 0 
        ? `⏰ Waktu ${prayerName}!`
        : `🕌 ${prayerName} dalam ${minutesUntil} menit`;

      const body = minutesUntil === 0
        ? `Saatnya shalat ${prayerName}`
        : `Bersiaplah untuk shalat ${prayerName}`;

      await sendNotification({
        title,
        body,
      });
    } catch (error) {
      console.log('[Desktop Notifications] Error sending notification:', error);
    }
  }

  async sendIqamahNotification(prayerName: string, minutesUntil: number) {
    if (!this.permissionGranted) return;

    try {
      const title = `🕌 Iqamah ${prayerName}`;
      const body = `Iqamah dalam ${minutesUntil} menit`;

      await sendNotification({
        title,
        body,
      });
    } catch (error) {
      console.log('[Desktop Notifications] Error sending notification:', error);
    }
  }

  async sendCountdownNotification(message: string) {
    if (!this.permissionGranted) return;

    try {
      await sendNotification({
        title: '🕌 Jam Shalat',
        body: message,
      });
    } catch (error) {
      console.log('[Desktop Notifications] Error sending notification:', error);
    }
  }
}

export const desktopNotificationService = new DesktopNotificationService();
