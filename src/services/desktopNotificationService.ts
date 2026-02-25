import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';

declare global {
  interface Window {
    __TAURI__?: any;
  }
}

class DesktopNotificationService {
  private permissionGranted = false;

  private isTauri(): boolean {
    return typeof window !== 'undefined' && !!window.__TAURI__;
  }

  async initialize() {
    if (!this.isTauri()) {
      return;
    }

    this.permissionGranted = await isPermissionGranted();
    
    if (!this.permissionGranted) {
      const permission = await requestPermission();
      this.permissionGranted = permission === 'granted';
    }
  }

  async sendPrayerNotification(prayerName: string, minutesUntil: number) {
    if (!this.permissionGranted || !this.isTauri()) return;

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
  }

  async sendIqamahNotification(prayerName: string, minutesUntil: number) {
    if (!this.permissionGranted || !this.isTauri()) return;

    const title = `🕌 Iqamah ${prayerName}`;
    const body = `Iqamah dalam ${minutesUntil} menit`;

    await sendNotification({
      title,
      body,
    });
  }

  async sendCountdownNotification(message: string) {
    if (!this.permissionGranted || !this.isTauri()) return;

    await sendNotification({
      title: '🕌 Jam Shalat',
      body: message,
    });
  }
}

export const desktopNotificationService = new DesktopNotificationService();
