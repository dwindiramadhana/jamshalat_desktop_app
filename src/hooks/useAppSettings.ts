import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_SETTINGS, type Settings } from '../types/settings';

// Define the full settings type that includes all possible settings
export type AppSettings = Settings & {
  showNextPrayerLabel: boolean;
};

// Default values for settings
const DEFAULT_APP_SETTINGS: AppSettings = {
  ...DEFAULT_SETTINGS,
  showNextPrayerLabel: true,
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Deep merge to ensure nested objects are merged correctly
        return {
          ...DEFAULT_APP_SETTINGS,
          ...parsed,
          background: {
            ...DEFAULT_APP_SETTINGS.background,
            ...parsed.background,
          },
        };
      } catch (e) {
        console.error('Failed to parse saved settings', e);
        return DEFAULT_APP_SETTINGS;
      }
    }
    return DEFAULT_APP_SETTINGS;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const saveSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
      // Ensure background settings are properly merged if they are part of the new settings
      background: {
        ...prevSettings.background,
        ...newSettings.background,
      },
    }));
  }, []);

  return { settings, saveSettings };
};