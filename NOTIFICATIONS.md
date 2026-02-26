# Notification Features

This app now supports desktop and mobile notifications for prayer times!

## Desktop (Tauri)

### Features
- **Native Notifications**: Get alerts 5 minutes and 1 minute before prayer time
- **Prayer Time Alerts**: Instant notification when it's time to pray
- **Iqamah Notifications**: Alerts for iqamah countdown

### Permissions
The app will request notification permissions on first launch.

### Settings
Notifications are controlled by the "Enable Audio" setting in Settings > Audio tab.
When audio is enabled, notifications are also enabled.

## Mobile (Android)

### Features
- **Persistent Countdown**: Ongoing notification showing time until next prayer
- **Live Updates**: Notification updates every minute with current countdown
- **Prayer Alerts**: High-priority notifications when prayer time arrives
- **Iqamah Alerts**: Notifications for iqamah timing

### Notification Channels
- **Prayer Times**: High importance for adzan/iqamah alerts
- **Prayer Countdown**: Default importance for ongoing countdown

### Permissions
Android will request notification permissions on first use. You must grant permission for notifications to work.

### Background Operation
The countdown notification allows the app to update in the background, ensuring accurate prayer time alerts even when the app is not in focus.

## How It Works

### Desktop Notifications
1. **5-Minute Warning**: Get notified 5 minutes before prayer time
2. **1-Minute Warning**: Final reminder 1 minute before prayer
3. **Prayer Time**: Alert when adzan starts
4. **Click to Focus**: Click notification to bring app to front

### Mobile Notifications
1. **Persistent Bar**: Always-visible countdown in notification drawer
2. **Auto-Update**: Updates automatically as time progresses
3. **Smart Alerts**: High-priority when prayer time arrives
4. **Swipe Actions**: Dismiss or open app from notification

## Privacy
All notifications are generated locally on your device. No data is sent to external servers.

## Troubleshooting

### Desktop
- **No notifications**: Check system notification settings for Jam Shalat
- **macOS**: System Preferences > Notifications > Jam Shalat
- **Windows**: Settings > System > Notifications > Jam Shalat
- **Linux**: Depends on desktop environment

### Android
- **No ongoing notification**: Enable notification permission in app settings
- **No alerts**: Check Do Not Disturb settings
- **Battery optimization**: Exclude Jam Shalat from battery optimization for best results

## Future Enhancements
- [ ] System tray icon with countdown (desktop)
- [ ] Custom notification sounds
- [ ] Floating timer widget (Android)
- [ ] Rich notification layouts with custom UI
