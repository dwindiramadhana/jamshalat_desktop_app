export interface UnsplashImage {
  url: string;
  author: string;
  authorUrl: string;
  authorUsername: string;
  imageId: string;
}

export interface BackgroundSettings {
  type: 'static' | 'auto';
  images: UnsplashImage[];
  rotationInterval: number;
  unsplashQuery: string;
  currentImageIndex: number;
  unsplashAuthor?: string;
  unsplashAuthorUrl?: string;
  unsplashAuthorUsername?: string;
}

export type ThemeColor = 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone' | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose';

export interface Settings {
  background: BackgroundSettings;
  locationId: string | null;
  showTerbit: boolean;
  showDhuha: boolean;
  showNextPrayerLabel: boolean;
  themeColor: ThemeColor;
  darkMode: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  background: {
    type: 'auto',
    images: [{
      url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      author: 'Hasan Almasi',
      authorUrl: 'https://unsplash.com/@hasanalmasi',
      authorUsername: 'hasanalmasi',
      imageId: 'default-1',
    }],
    rotationInterval: 5, // 5 minutes
    unsplashQuery: 'masjid',
    currentImageIndex: 0,
    unsplashAuthor: 'Hasan Almasi',
    unsplashAuthorUrl: 'https://unsplash.com/@hasanalmasi',
    unsplashAuthorUsername: 'hasanalmasi',
  },
  locationId: null,
  showTerbit: true,
  showDhuha: true,
  showNextPrayerLabel: true,
  themeColor: 'indigo',
  darkMode: false,
};
