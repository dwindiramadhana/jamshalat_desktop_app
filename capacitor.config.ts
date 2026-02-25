import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jamshalat.mobile',
  appName: 'Jam Shalat',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: '../android-release-key.jks',
      keystoreAlias: 'jam-shalat-key',
      keystorePassword: 'jamshalat2024',
      keystoreAliasPassword: 'jamshalat2024',
      releaseType: 'APK'
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e3a5f',
      showSpinner: false
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_prayer',
      iconColor: '#1e3a5f'
    }
  }
};

export default config;
