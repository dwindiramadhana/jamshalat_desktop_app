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

export interface MasjidSettings {
  name: string;
  address: string;
  runningText: string[];
  runningTextMode: 'marquee' | 'fade';
  runningTextSpeed: 'slow' | 'normal' | 'fast';
  iqamahMode: 'unified' | 'detailed';
  iqamahUnified: number;
  iqamahDetailed: {
    subuh: number;
    dzuhur: number;
    ashar: number;
    maghrib: number;
    isya: number;
  };
  fridayDuty: {
    khatib: string;
    imam: string;
    bilal: string;
  };
}

export interface AudioSettings {
  enabled: boolean;
  volume: number;
  adzanCountdownSeconds: number;
  iqamahCountdownSeconds: number;
  playAdzan: boolean;
  playAdzanSubuh: boolean;
}

export type SlideType = 'image' | 'poster' | 'text' | 'minimalist';
export type BackgroundType = 'image' | 'color' | 'gradient';
export type OverlayPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
export type SlidePriority = 'low' | 'normal' | 'high';

export interface SlideSchedule {
  startDate?: string;
  endDate?: string;
  daysOfWeek?: number[];
  timeRange?: { start: string; end: string; };
}

export interface SlideOverlayContent {
  showTime?: boolean;
  showNextPrayer?: boolean;
  customText?: string;
  showLogo?: boolean;
}

export interface CustomSlide {
  id: string;
  type: SlideType;
  title: string;
  backgroundType: BackgroundType;
  backgroundImage?: string;
  backgroundColor?: string;
  backgroundGradient?: { from: string; to: string; };
  showOverlay: boolean;
  overlayPosition: OverlayPosition;
  overlayContent: SlideOverlayContent;
  duration: number;
  enabled: boolean;
  schedule?: SlideSchedule;
  priority: SlidePriority;
  createdAt: string;
  updatedAt: string;
}

export interface SlideSettings {
  enabled: boolean;
  slides: CustomSlide[];
  mainScreenDuration: number;
  slideDefaultDuration: number;
  mainScreenFrequency: number;
  shuffleSlides: boolean;
}

export interface Settings {
  background: BackgroundSettings;
  locationId: string | null;
  showTerbit: boolean;
  showDhuha: boolean;
  showNextPrayerLabel: boolean;
  themeColor: ThemeColor;
  darkMode: boolean;
  masjid: MasjidSettings;
  audio: AudioSettings;
  slides: SlideSettings;
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
  masjid: {
    name: '',
    address: '',
    runningText: [],
    runningTextMode: 'marquee',
    runningTextSpeed: 'normal',
    iqamahMode: 'unified',
    iqamahUnified: 10,
    iqamahDetailed: {
      subuh: 10,
      dzuhur: 10,
      ashar: 10,
      maghrib: 10,
      isya: 10,
    },
    fridayDuty: {
      khatib: '',
      imam: '',
      bilal: '',
    },
  },
  audio: {
    enabled: true,
    volume: 80,
    adzanCountdownSeconds: 60,
    iqamahCountdownSeconds: 60,
    playAdzan: true,
    playAdzanSubuh: true,
  },
  slides: {
    enabled: false,
    slides: [],
    mainScreenDuration: 20,
    slideDefaultDuration: 10,
    mainScreenFrequency: 2,
    shuffleSlides: false,
  },
};
