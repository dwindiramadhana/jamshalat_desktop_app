import { useState, useEffect, useRef } from 'react';
import type { UnsplashImage } from '../types/settings';
import type { AppSettings } from './useAppSettings';

export const useDynamicBackground = (
  settings: AppSettings,
  saveSettings: (settings: Partial<AppSettings>) => void
) => {
  const [currentImage, setCurrentImage] = useState<UnsplashImage | null>(null);
  const backgroundTimer = useRef<NodeJS.Timeout | null>(null);

  const clearBackgroundRotation = () => {
    if (backgroundTimer.current) {
      clearInterval(backgroundTimer.current);
      backgroundTimer.current = null;
    }
  };

  const startBackgroundRotation = (
    images: UnsplashImage[],
    intervalMinutes: number
  ) => {
    clearBackgroundRotation();

    const intervalMs = intervalMinutes * 60 * 1000;

    if (images.length === 0) return;

    if (settings.background.type === 'auto') {
      let currentIndex = 0;
      setCurrentImage(images[0]);

      if (images.length > 1) {
        backgroundTimer.current = setInterval(() => {
          currentIndex = (currentIndex + 1) % images.length;
          setCurrentImage(images[currentIndex]);
        }, intervalMs);
      }
    } else if (settings.background.type === 'static') {
      let currentIndex = settings.background.currentImageIndex || 0;

      if (images.length > 1) {
        backgroundTimer.current = setInterval(() => {
          currentIndex = (currentIndex + 1) % images.length;
          saveSettings({
            background: {
              ...settings.background,
              currentImageIndex: currentIndex,
            },
          });
        }, intervalMs);
      }
    }
  };

  useEffect(() => {
    if (settings.background.images.length > 1) {
      if (
        settings.background.type === 'auto' ||
        settings.background.type === 'static'
      ) {
        startBackgroundRotation(
          settings.background.images,
          settings.background.rotationInterval
        );
      }
    } else {
      setCurrentImage(null);
      clearBackgroundRotation();
    }

    return () => {
      clearBackgroundRotation();
    };
  }, [settings.background]);

  return { currentImage };
};