import { Fragment, useState, useCallback, useEffect, type ChangeEvent } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PhotoIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import type { Settings as AppSettings, UnsplashImage, CustomSlide } from '../types/settings';
import type { LocationData } from '../types';
import SlideEditorModal from './SlideEditorModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  locations: LocationData[];
  selectedLocationId: string | null;
  onLocationChange: (locationId: string) => void;
  isDarkMode: boolean;
  mode?: 'full' | 'location-only';
  isDesktopLayout?: boolean;
}

type TabType = 'location' | 'appearance' | 'masjid' | 'audio' | 'slides' | 'about';

// Unsplash API response types
interface UnsplashImageResult {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
}

interface UnsplashSearchResponse {
  results: UnsplashImageResult[];
  total: number;
  total_pages: number;
}



const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  locations,
  selectedLocationId,
  onLocationChange,
  isDarkMode,
  mode = 'full',
  isDesktopLayout = true,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('appearance');
  const [localSettings, setLocalSettings] = useState<AppSettings>(() => ({
    ...settings,
    background: {
      type: settings.background?.type || 'auto',
      images: settings.background?.images || [],
      currentImageIndex: settings.background?.currentImageIndex || 0,
      rotationInterval: settings.background?.rotationInterval || 30,
      unsplashQuery: settings.background?.unsplashQuery || 'islamic architecture',
      unsplashAuthor: settings.background?.unsplashAuthor || '',
      unsplashAuthorUrl: settings.background?.unsplashAuthorUrl || '',
      unsplashAuthorUsername: settings.background?.unsplashAuthorUsername || '',
    },
    showTerbit: settings.showTerbit ?? true,
    showDhuha: settings.showDhuha ?? true,
    masjid: {
      name: settings.masjid?.name || '',
      address: settings.masjid?.address || '',
      runningText: settings.masjid?.runningText || [],
      runningTextMode: settings.masjid?.runningTextMode || 'marquee',
      runningTextSpeed: settings.masjid?.runningTextSpeed || 'normal',
      iqamahMode: settings.masjid?.iqamahMode || 'unified',
      iqamahUnified: settings.masjid?.iqamahUnified || 10,
      iqamahDetailed: settings.masjid?.iqamahDetailed || { subuh: 10, dzuhur: 10, ashar: 10, maghrib: 10, isya: 10 },
      fridayDuty: settings.masjid?.fridayDuty || { khatib: '', imam: '', bilal: '' },
    },
    audio: {
      enabled: settings.audio?.enabled ?? true,
      volume: settings.audio?.volume ?? 80,
      adzanCountdownSeconds: settings.audio?.adzanCountdownSeconds ?? 60,
      iqamahCountdownSeconds: settings.audio?.iqamahCountdownSeconds ?? 60,
      playAdzan: settings.audio?.playAdzan ?? true,
      playAdzanSubuh: settings.audio?.playAdzanSubuh ?? true,
    },
    slides: {
      enabled: settings.slides?.enabled ?? false,
      slides: settings.slides?.slides || [],
      mainScreenDuration: settings.slides?.mainScreenDuration ?? 20,
      slideDefaultDuration: settings.slides?.slideDefaultDuration ?? 10,
      mainScreenFrequency: settings.slides?.mainScreenFrequency ?? 2,
      shuffleSlides: settings.slides?.shuffleSlides ?? false,
    }
  }));

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accordionState, setAccordionState] = useState({
    general: true, // Open by default
    tema: false,
    images: false
  });
  const [isSlideEditorOpen, setIsSlideEditorOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CustomSlide | null>(null);
  const appVersion = '1.0.2';
  const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || 'BkgEMpfG_ReNpVwJcbgNx30IZXhoFoWwKgwbrPU0hq4';

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Set correct tab when modal opens based on mode
  useEffect(() => {
    if (isOpen) {
      setActiveTab(mode === 'location-only' ? 'location' : 'appearance');
    }
  }, [isOpen, mode]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleLocationSelect = useCallback((locationId: string) => {
    onLocationChange(locationId);
    // Auto-close modal in location-only mode
    if (mode === 'location-only') {
      setTimeout(() => onClose(), 300);
    }
  }, [onLocationChange, mode, onClose]);

  const handleCreateSlide = useCallback(() => {
    setEditingSlide(null);
    setIsSlideEditorOpen(true);
  }, []);

  const handleEditSlide = useCallback((slide: CustomSlide) => {
    setEditingSlide(slide);
    setIsSlideEditorOpen(true);
  }, []);

  const handleSaveSlide = useCallback((slide: CustomSlide) => {
    setLocalSettings(prev => {
      const existingIndex = prev.slides.slides.findIndex(s => s.id === slide.id);
      
      if (existingIndex >= 0) {
        // Update existing slide
        const updatedSlides = [...prev.slides.slides];
        updatedSlides[existingIndex] = slide;
        return {
          ...prev,
          slides: {
            ...prev.slides,
            slides: updatedSlides
          }
        };
      } else {
        // Add new slide
        return {
          ...prev,
          slides: {
            ...prev.slides,
            slides: [...prev.slides.slides, slide]
          }
        };
      }
    });
  }, []);

  const handleBackgroundTypeChange = useCallback((type: 'auto' | 'static') => {
    setLocalSettings(prev => ({
      ...prev,
      background: {
        ...prev.background,
        type,
        images: [], // Clear images when switching background type
        currentImageIndex: 0,
      },
    }));
  }, []);

  const handleImageUpload = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) return;

    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const newImage: UnsplashImage = {
          url: imageUrl,
          author: 'You',
          authorUrl: '',
          authorUsername: 'you',
          imageId: `custom-${Date.now()}-${Math.random()}`,
        };

        setLocalSettings(prev => ({
          ...prev,
          background: {
            ...prev.background,
            images: [...prev.background.images, newImage],
          },
        }));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleImageUpload(files);
    }
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files) {
      handleImageUpload(files);
    }
  }, [handleImageUpload]);

  const handleRemoveImage = useCallback((index: number) => {
    setLocalSettings(prev => {
      const newImages = prev.background.images.filter((_, i) => i !== index);
      const newCurrentIndex = Math.min(prev.background.currentImageIndex, newImages.length - 1);

      return {
        ...prev,
        background: {
          ...prev.background,
          images: newImages,
          currentImageIndex: Math.max(0, newCurrentIndex),
        },
      };
    });
  }, []);

  // Search Unsplash for images
  const searchUnsplash = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      const response = await axios.get<UnsplashSearchResponse>(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&page=${page}&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
            'Accept-Version': 'v1',
          },
        }
      );

      const images = response.data.results.map(result => ({
        url: result.urls.regular,
        author: result.user.name,
        authorUrl: result.user.links.html,
        authorUsername: result.user.username,
        imageId: result.id,
      }));

      if (images.length > 0) {
        setLocalSettings(prev => ({
          ...prev,
          background: {
            ...prev.background,
            images: page === 1 ? images : [...prev.background.images, ...images],
            currentImageIndex: page === 1 ? 0 : prev.background.currentImageIndex,
            unsplashQuery: query,
            unsplashAuthor: images[0].author,
            unsplashAuthorUrl: images[0].authorUrl,
            unsplashAuthorUsername: images[0].authorUsername,
          },
        }));
      }
    } catch (error) {
      console.error('Error searching Unsplash:', error);
    } finally {
      setIsLoading(false);
    }
  }, [UNSPLASH_ACCESS_KEY]);



  const handleSave = useCallback(() => {
    onSave(localSettings);
    onClose();
  }, [localSettings, onSave, onClose]);

  return (
    <>
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all w-full max-w-md sm:max-w-lg md:max-w-xl my-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                <div className={`px-4 pb-4 pt-5 sm:p-6 sm:pb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-left sm:ml-4 sm:mt-0 w-full">
                      <Dialog.Title as="h3" className={`text-base font-semibold leading-6 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                        Pengaturan
                      </Dialog.Title>

                      {/* Tab Navigation - Hidden in location-only mode */}
                      {mode === 'full' && (
                        <div className="border-b border-gray-200 mb-4">
                          <nav className="-mb-px flex space-x-8">
                            <button
                              onClick={() => handleTabChange('appearance')}
                              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'appearance'
                              ? `${settings.themeColor === 'gray' ? 'border-gray-500 text-gray-600' :
                                settings.themeColor === 'red' ? 'border-red-500 text-red-600' :
                                  settings.themeColor === 'yellow' ? 'border-yellow-500 text-yellow-600' :
                                    settings.themeColor === 'green' ? 'border-green-500 text-green-600' :
                                      settings.themeColor === 'blue' ? 'border-blue-500 text-blue-600' :
                                        settings.themeColor === 'purple' ? 'border-purple-500 text-purple-600' :
                                          settings.themeColor === 'pink' ? 'border-pink-500 text-pink-600' :
                                            'border-indigo-500 text-indigo-600'
                              }`
                              : `border-transparent ${isDarkMode
                                ? 'text-gray-300 hover:text-gray-100 hover:border-gray-500'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              }`
                              }`}
                          >
                            Tampilan
                          </button>
                          <button
                            onClick={() => handleTabChange('masjid')}
                            className={`hidden xl:block py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'masjid'
                              ? `${settings.themeColor === 'gray' ? 'border-gray-500 text-gray-600' :
                                settings.themeColor === 'red' ? 'border-red-500 text-red-600' :
                                  settings.themeColor === 'yellow' ? 'border-yellow-500 text-yellow-600' :
                                    settings.themeColor === 'green' ? 'border-green-500 text-green-600' :
                                      settings.themeColor === 'blue' ? 'border-blue-500 text-blue-600' :
                                        settings.themeColor === 'purple' ? 'border-purple-500 text-purple-600' :
                                          settings.themeColor === 'pink' ? 'border-pink-500 text-pink-600' :
                                            'border-indigo-500 text-indigo-600'
                              }`
                              : `border-transparent ${isDarkMode
                                ? 'text-gray-300 hover:text-gray-100 hover:border-gray-500'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              }`
                              }`}
                          >
                            Masjid
                          </button>
                          <button
                            onClick={() => handleTabChange('audio')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'audio'
                              ? `${settings.themeColor === 'gray' ? 'border-gray-500 text-gray-600' :
                                settings.themeColor === 'red' ? 'border-red-500 text-red-600' :
                                  settings.themeColor === 'yellow' ? 'border-yellow-500 text-yellow-600' :
                                    settings.themeColor === 'green' ? 'border-green-500 text-green-600' :
                                      settings.themeColor === 'blue' ? 'border-blue-500 text-blue-600' :
                                        settings.themeColor === 'purple' ? 'border-purple-500 text-purple-600' :
                                          settings.themeColor === 'pink' ? 'border-pink-500 text-pink-600' :
                                            'border-indigo-500 text-indigo-600'
                              }`
                              : `border-transparent ${isDarkMode
                                ? 'text-gray-300 hover:text-gray-100 hover:border-gray-500'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              }`
                              }`}
                          >
                            Audio
                          </button>
                          {isDesktopLayout && (
                            <button
                              onClick={() => handleTabChange('slides')}
                              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'slides'
                                ? `${settings.themeColor === 'gray' ? 'border-gray-500 text-gray-600' :
                                  settings.themeColor === 'red' ? 'border-red-500 text-red-600' :
                                    settings.themeColor === 'yellow' ? 'border-yellow-500 text-yellow-600' :
                                      settings.themeColor === 'green' ? 'border-green-500 text-green-600' :
                                        settings.themeColor === 'blue' ? 'border-blue-500 text-blue-600' :
                                          settings.themeColor === 'purple' ? 'border-purple-500 text-purple-600' :
                                            settings.themeColor === 'pink' ? 'border-pink-500 text-pink-600' :
                                              'border-indigo-500 text-indigo-600'
                                }`
                                : `border-transparent ${isDarkMode
                                  ? 'text-gray-300 hover:text-gray-100 hover:border-gray-500'
                                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`
                                }`}
                            >
                              Slides
                            </button>
                          )}
                          <button
                            onClick={() => handleTabChange('about')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'about'
                              ? `${settings.themeColor === 'gray' ? 'border-gray-500 text-gray-600' :
                                settings.themeColor === 'red' ? 'border-red-500 text-red-600' :
                                  settings.themeColor === 'yellow' ? 'border-yellow-500 text-yellow-600' :
                                    settings.themeColor === 'green' ? 'border-green-500 text-green-600' :
                                      settings.themeColor === 'blue' ? 'border-blue-500 text-blue-600' :
                                        settings.themeColor === 'purple' ? 'border-purple-500 text-purple-600' :
                                          settings.themeColor === 'pink' ? 'border-pink-500 text-pink-600' :
                                            'border-indigo-500 text-indigo-600'
                              }`
                              : `border-transparent ${isDarkMode
                                ? 'text-gray-300 hover:text-gray-100 hover:border-gray-500'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              }`
                              }`}
                          >
                            Tentang
                          </button>
                        </nav>
                        </div>
                      )}

                      {/* Tab Content */}
                      <div className="mt-4">
                        {activeTab === 'location' && (
                          <div className="space-y-4">
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                Cari Lokasi
                              </label>
                              <input
                                type="text"
                                className={`w-full rounded-md sm:text-sm px-3 py-2 transition duration-300 ease focus:outline-none shadow-sm focus:shadow ${
                                  isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-slate-400 hover:border-gray-500' 
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-slate-400 hover:border-slate-300'
                                }`}
                                placeholder="Masukkan kata kunci..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>

                            {filteredLocations.length > 0 && (
                              <div className={`max-h-60 overflow-y-auto border rounded-md ${
                                isDarkMode ? 'border-gray-600' : 'border-gray-300'
                              }`}>
                                <ul className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                                  {filteredLocations.map((location) => (
                                    <li key={location.id}>
                                      <button
                                        type="button"
                                        className={`w-full text-left px-4 py-2 text-sm ${selectedLocationId === location.id
                                          ? `${settings.themeColor === 'gray' ? 'bg-gray-100 text-gray-700' :
                                            settings.themeColor === 'red' ? 'bg-red-100 text-red-700' :
                                              settings.themeColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                                settings.themeColor === 'green' ? 'bg-green-100 text-green-700' :
                                                  settings.themeColor === 'blue' ? 'bg-blue-100 text-blue-700' :
                                                    settings.themeColor === 'purple' ? 'bg-purple-100 text-purple-700' :
                                                      settings.themeColor === 'pink' ? 'bg-pink-100 text-pink-700' :
                                                        'bg-indigo-100 text-indigo-700'
                                          }`
                                          : `${isDarkMode
                                            ? 'text-gray-300 hover:bg-gray-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                          }`
                                          }`}
                                        onClick={() => handleLocationSelect(location.id)}
                                      >
                                        {location.name}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab === 'appearance' && (
                          <div className="space-y-4">
                            {/* Accordion Group 1: General Settings */}
                            <div className={`border rounded-lg ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                              <button
                                type="button"
                                className={`w-full px-4 py-3 text-left flex items-center justify-between focus:outline-none transition-colors ${
                                  accordionState.general ? 'rounded-t-lg' : 'rounded-lg'
                                } ${
                                  isDarkMode 
                                    ? 'bg-gray-700 hover:bg-gray-600' 
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                                onClick={() => setAccordionState({ general: !accordionState.general, tema: false, images: false })}
                              >
                                <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Umum</span>
                                {accordionState.general ? (
                                  <ChevronUpIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                ) : (
                                  <ChevronDownIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                )}
                              </button>
                              {accordionState.general && (
                                <div className={`px-4 py-3 space-y-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                  {/* Show Prayer Times */}
                                  <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                      Tampilkan Waktu Lainnya
                                    </label>
                                    <div className="space-y-2">
                                      <div className="flex items-center">
                                        <input
                                          id="show-terbit"
                                          name="show-terbit"
                                          type="checkbox"
                                          className={`h-4 w-4 border-gray-300 rounded ${settings.themeColor === 'gray' ? 'text-gray-600 focus:ring-gray-500' :
                                            settings.themeColor === 'red' ? 'text-red-600 focus:ring-red-500' :
                                              settings.themeColor === 'yellow' ? 'text-yellow-600 focus:ring-yellow-500' :
                                                settings.themeColor === 'green' ? 'text-green-600 focus:ring-green-500' :
                                                  settings.themeColor === 'blue' ? 'text-blue-600 focus:ring-blue-500' :
                                                    settings.themeColor === 'purple' ? 'text-purple-600 focus:ring-purple-500' :
                                                      settings.themeColor === 'pink' ? 'text-pink-600 focus:ring-pink-500' :
                                                        'text-indigo-600 focus:ring-indigo-500'
                                            }`}
                                          checked={localSettings.showTerbit}
                                          onChange={(e) => {
                                            setLocalSettings(prev => ({
                                              ...prev,
                                              showTerbit: e.target.checked,
                                            }));
                                          }}
                                        />
                                        <label htmlFor="show-terbit" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                          Terbit (Sunrise)
                                        </label>
                                      </div>
                                      <div className="flex items-center">
                                        <input
                                          id="show-dhuha"
                                          name="show-dhuha"
                                          type="checkbox"
                                          className={`h-4 w-4 border-gray-300 rounded ${settings.themeColor === 'gray' ? 'text-gray-600 focus:ring-gray-500' :
                                            settings.themeColor === 'red' ? 'text-red-600 focus:ring-red-500' :
                                              settings.themeColor === 'yellow' ? 'text-yellow-600 focus:ring-yellow-500' :
                                                settings.themeColor === 'green' ? 'text-green-600 focus:ring-green-500' :
                                                  settings.themeColor === 'blue' ? 'text-blue-600 focus:ring-blue-500' :
                                                    settings.themeColor === 'purple' ? 'text-purple-600 focus:ring-purple-500' :
                                                      settings.themeColor === 'pink' ? 'text-pink-600 focus:ring-pink-500' :
                                                        'text-indigo-600 focus:ring-indigo-500'
                                            }`}
                                          checked={localSettings.showDhuha}
                                          onChange={(e) => {
                                            setLocalSettings(prev => ({
                                              ...prev,
                                              showDhuha: e.target.checked,
                                            }));
                                          }}
                                        />
                                        <label htmlFor="show-dhuha" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                          Dhuha
                                        </label>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Background Type */}
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                      Tipe Latar Belakang
                                    </label>
                                    <div className="space-y-2">
                                      <div className="flex items-center">
                                        <input
                                          id="background-auto"
                                          name="background-type"
                                          type="radio"
                                          className={`h-4 w-4 ${settings.themeColor === 'gray' ? 'text-gray-600 focus:ring-gray-500' :
                                            settings.themeColor === 'red' ? 'text-red-600 focus:ring-red-500' :
                                              settings.themeColor === 'yellow' ? 'text-yellow-600 focus:ring-yellow-500' :
                                                settings.themeColor === 'green' ? 'text-green-600 focus:ring-green-500' :
                                                  settings.themeColor === 'blue' ? 'text-blue-600 focus:ring-blue-500' :
                                                    settings.themeColor === 'purple' ? 'text-purple-600 focus:ring-purple-500' :
                                                      settings.themeColor === 'pink' ? 'text-pink-600 focus:ring-pink-500' :
                                                        'text-indigo-600 focus:ring-indigo-500'
                                            }`}
                                          checked={localSettings.background.type === 'auto'}
                                          onChange={() => handleBackgroundTypeChange('auto')}
                                        />
                                        <label htmlFor="background-auto" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                          Otomatis
                                        </label>
                                      </div>
                                      <div className="flex items-center">
                                        <input
                                          id="background-static"
                                          name="background-type"
                                          type="radio"
                                          className={`h-4 w-4 ${settings.themeColor === 'gray' ? 'text-gray-600 focus:ring-gray-500' :
                                            settings.themeColor === 'red' ? 'text-red-600 focus:ring-red-500' :
                                              settings.themeColor === 'yellow' ? 'text-yellow-600 focus:ring-yellow-500' :
                                                settings.themeColor === 'green' ? 'text-green-600 focus:ring-green-500' :
                                                  settings.themeColor === 'blue' ? 'text-blue-600 focus:ring-blue-500' :
                                                    settings.themeColor === 'purple' ? 'text-purple-600 focus:ring-purple-500' :
                                                      settings.themeColor === 'pink' ? 'text-pink-600 focus:ring-pink-500' :
                                                        'text-indigo-600 focus:ring-indigo-500'
                                            }`}
                                          checked={localSettings.background.type === 'static'}
                                          onChange={() => handleBackgroundTypeChange('static')}
                                        />
                                        <label htmlFor="background-static" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                          Local
                                        </label>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Background Rotation Interval */}
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                      Interval Rotasi Latar Belakang (menit)
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      max="1440"
                                      className={`w-full rounded-md sm:text-sm px-3 py-2 transition duration-300 ease focus:outline-none shadow-sm focus:shadow ${
                                        isDarkMode 
                                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-slate-400 hover:border-gray-500' 
                                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-slate-400 hover:border-slate-300'
                                      }`}
                                      value={localSettings.background.rotationInterval}
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value) || 30;
                                        setLocalSettings(prev => ({
                                          ...prev,
                                          background: {
                                            ...prev.background,
                                            rotationInterval: Math.max(1, Math.min(1440, value))
                                          }
                                        }));
                                      }}
                                    />
                                    <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                      Berapa seringnya untuk mengubah gambar latar belakang (1-1440 menit)
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Accordion Group 2: Theme Settings */}
                            <div className={`border rounded-lg ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                              <button
                                type="button"
                                className={`w-full px-4 py-3 text-left flex items-center justify-between focus:outline-none transition-colors ${
                                  accordionState.tema ? 'rounded-t-lg' : 'rounded-lg'
                                } ${
                                  isDarkMode 
                                    ? 'bg-gray-700 hover:bg-gray-600' 
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                                onClick={() => setAccordionState({ general: false, tema: !accordionState.tema, images: false })}
                              >
                                <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Tema</span>
                                {accordionState.tema ? (
                                  <ChevronUpIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                ) : (
                                  <ChevronDownIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                )}
                              </button>
                              {accordionState.tema && (
                                <div className={`px-4 py-3 space-y-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                  {/* Theme Color Selection */}
                                  <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                      Warna Tema
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                      {[
                                        { value: 'gray', label: 'Gray', color: 'bg-gray-500' },
                                        { value: 'red', label: 'Red', color: 'bg-red-500' },
                                        { value: 'yellow', label: 'Yellow', color: 'bg-yellow-500' },
                                        { value: 'green', label: 'Green', color: 'bg-green-500' },
                                        { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
                                        { value: 'indigo', label: 'Indigo', color: 'bg-indigo-500' },
                                        { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
                                        { value: 'pink', label: 'Pink', color: 'bg-pink-500' },
                                      ].map(color => (
                                        <button
                                          key={color.value}
                                          type="button"
                                          className={`flex items-center p-2 rounded-md border transition-all text-xs ${(localSettings.themeColor || 'indigo') === color.value
                                            ? isDarkMode
                                              ? 'border-gray-500 bg-gray-700 ring-1 ring-gray-500'
                                              : 'border-gray-400 bg-gray-50 ring-1 ring-gray-300'
                                            : isDarkMode
                                              ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                          onClick={() => {
                                            setLocalSettings(prev => ({
                                              ...prev,
                                              themeColor: color.value as any
                                            }));
                                          }}
                                        >
                                          <div className={`w-4 h-4 rounded-full ${color.color} mr-2 flex-shrink-0`}></div>
                                          <span className={`truncate ${
                                            isDarkMode 
                                              ? color.value === 'gray' ? 'text-gray-300' :
                                                color.value === 'red' ? 'text-red-400' :
                                                color.value === 'yellow' ? 'text-yellow-400' :
                                                color.value === 'green' ? 'text-green-400' :
                                                color.value === 'blue' ? 'text-blue-400' :
                                                color.value === 'indigo' ? 'text-indigo-400' :
                                                color.value === 'purple' ? 'text-purple-400' :
                                                'text-pink-400'
                                              : color.value === 'gray' ? 'text-gray-700' :
                                                color.value === 'red' ? 'text-red-700' :
                                                color.value === 'yellow' ? 'text-yellow-700' :
                                                color.value === 'green' ? 'text-green-700' :
                                                color.value === 'blue' ? 'text-blue-700' :
                                                color.value === 'indigo' ? 'text-indigo-700' :
                                                color.value === 'purple' ? 'text-purple-700' :
                                                'text-pink-700'
                                          }`}>{color.label}</span>
                                        </button>
                                      ))}
                                    </div>
                                    <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                      Pilih warna tema untuk aplikasi
                                    </p>
                                  </div>

                                  {/* Dark Mode Toggle */}
                                  <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                      Mode Tampilan
                                    </label>
                                    <div className="flex items-center">
                                      <input
                                        id="dark-mode"
                                        name="dark-mode"
                                        type="checkbox"
                                        className={`h-4 w-4 border-gray-300 rounded ${settings.themeColor === 'gray' ? 'text-gray-600 focus:ring-gray-500' :
                                          settings.themeColor === 'red' ? 'text-red-600 focus:ring-red-500' :
                                            settings.themeColor === 'yellow' ? 'text-yellow-600 focus:ring-yellow-500' :
                                              settings.themeColor === 'green' ? 'text-green-600 focus:ring-green-500' :
                                                settings.themeColor === 'blue' ? 'text-blue-600 focus:ring-blue-500' :
                                                  settings.themeColor === 'purple' ? 'text-purple-600 focus:ring-purple-500' :
                                                    settings.themeColor === 'pink' ? 'text-pink-600 focus:ring-pink-500' :
                                                      'text-indigo-600 focus:ring-indigo-500'
                                          }`}
                                        checked={localSettings.darkMode || false}
                                        onChange={(e) => {
                                          setLocalSettings(prev => ({
                                            ...prev,
                                            darkMode: e.target.checked,
                                          }));
                                        }}
                                      />
                                      <label htmlFor="dark-mode" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Mode Gelap
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Accordion Group 3: Image Options */}
                            <div className={`border rounded-lg ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                              <button
                                type="button"
                                className={`w-full px-4 py-3 text-left flex items-center justify-between focus:outline-none transition-colors ${
                                  accordionState.images ? 'rounded-t-lg' : 'rounded-lg'
                                } ${
                                  isDarkMode 
                                    ? 'bg-gray-700 hover:bg-gray-600' 
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                                onClick={() => setAccordionState({ general: false, tema: false, images: !accordionState.images })}
                              >
                                <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Pilihan Gambar</span>
                                {accordionState.images ? (
                                  <ChevronUpIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                ) : (
                                  <ChevronDownIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                )}
                              </button>
                              {accordionState.images && (
                                <div className={`px-4 py-3 space-y-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                  {/* Unsplash Image Search and Grid */}
                                  {localSettings.background.type === 'auto' && (
                                    <div>
                                      <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                          Cari Gambar di Unsplash
                                        </label>
                                        <div className="flex space-x-2">
                                          <input
                                            type="text"
                                            className={`flex-1 rounded-md sm:text-sm px-3 py-2 transition duration-300 ease focus:outline-none shadow-sm focus:shadow ${
                                              isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-slate-400 hover:border-gray-500' 
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-slate-400 hover:border-slate-300'
                                            }`}
                                            placeholder="Cari gambar..."
                                            value={localSettings.background.unsplashQuery || ''}
                                            onChange={(e) => {
                                              setLocalSettings(prev => ({
                                                ...prev,
                                                background: {
                                                  ...prev.background,
                                                  unsplashQuery: e.target.value,
                                                },
                                              }));
                                            }}
                                          />
                                          <button
                                            type="button"
                                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white disabled:opacity-50 ${settings.themeColor === 'gray' ? 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500' :
                                              settings.themeColor === 'red' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' :
                                                settings.themeColor === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' :
                                                  settings.themeColor === 'green' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' :
                                                    settings.themeColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' :
                                                      settings.themeColor === 'purple' ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' :
                                                        settings.themeColor === 'pink' ? 'bg-pink-600 hover:bg-pink-700 focus:ring-pink-500' :
                                                          'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                                              } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                                            onClick={() => {
                                              if (localSettings.background.unsplashQuery) {
                                                searchUnsplash(localSettings.background.unsplashQuery);
                                              }
                                            }}
                                            disabled={isLoading || !localSettings.background.unsplashQuery}
                                          >
                                            {isLoading ? 'Mencari...' : 'Cari'}
                                          </button>
                                        </div>
                                      </div>

                                      {/* Scrollable Images Grid */}
                                      {localSettings.background.images.length > 0 && (
                                        <div className="mt-4">
                                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Gambar Pilihan
                                          </label>
                                          <div className={`max-h-48 overflow-y-auto border rounded-md p-2 ${
                                            isDarkMode ? 'border-gray-600' : 'border-gray-300'
                                          }`}>
                                            <div className="grid grid-cols-3 gap-3">
                                              {localSettings.background.images.map((image, index) => (
                                                <div
                                                  key={`unsplash-${image.imageId || index}`}
                                                  className="relative group cursor-move"
                                                  draggable={true}
                                                  onDragStart={(e) => {
                                                    e.dataTransfer.setData('text/plain', index.toString());
                                                    e.currentTarget.classList.add('opacity-50');
                                                  }}
                                                  onDragEnd={(e) => {
                                                    e.currentTarget.classList.remove('opacity-50');
                                                  }}
                                                  onDragOver={(e) => {
                                                    e.preventDefault();
                                                    e.currentTarget.classList.add('ring-2', 'ring-blue-400');
                                                  }}
                                                  onDragLeave={(e) => {
                                                    e.currentTarget.classList.remove('ring-2', 'ring-blue-400');
                                                  }}
                                                  onDrop={(e) => {
                                                    e.preventDefault();
                                                    e.currentTarget.classList.remove('ring-2', 'ring-blue-400');
                                                    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                                    const targetIndex = index;

                                                    if (draggedIndex !== targetIndex) {
                                                      const newImages = [...localSettings.background.images];
                                                      const draggedImage = newImages[draggedIndex];
                                                      newImages.splice(draggedIndex, 1);
                                                      newImages.splice(targetIndex, 0, draggedImage);

                                                      setLocalSettings(prev => ({
                                                        ...prev,
                                                        background: {
                                                          ...prev.background,
                                                          images: newImages
                                                        }
                                                      }));
                                                    }
                                                  }}
                                                >
                                                  <div className="relative w-full h-24 rounded-md overflow-hidden border-2 border-gray-200 group-hover:border-gray-300 transition-colors">
                                                    <img
                                                      src={image.url}
                                                      alt={`Background ${index + 1}`}
                                                      className="w-full h-full object-cover"
                                                      referrerPolicy="no-referrer"
                                                    />
                                                    {/* Drag handle indicator */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                                                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                        </svg>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <button
                                                    type="button"
                                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleRemoveImage(index);
                                                    }}
                                                  >
                                                    <TrashIcon className="h-3 w-3" />
                                                  </button>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                          <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Drag & Drop untuk mengubah urutan gambar. Gambar akan berputar secara otomatis dalam urutan ini. Gunakan ikon hapus untuk menghapus gambar dari rotasi.
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Static Image Upload */}
                                  {localSettings.background.type === 'static' && (
                                    <div>
                                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                        Upload Gambar
                                      </label>
                                      <div
                                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors"
                                        onDragOver={handleDragOver}
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                      >
                                        <div className="space-y-1 text-center">
                                          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                          <div className="flex text-sm text-gray-600">
                                            <label
                                              htmlFor="file-upload"
                                              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                                            >
                                              <span>Select photos</span>
                                              <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                className="sr-only"
                                                accept="image/*"
                                                onChange={handleFileInputChange}
                                                multiple
                                              />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                          </div>
                                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                        </div>
                                      </div>
                                      {/* Scrollable Custom Images Grid */}
                                      {localSettings.background.images.length > 0 && (
                                        <div className="mt-4">
                                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Gambar Latar Belakang
                                          </label>
                                          <div className={`max-h-48 overflow-y-auto border rounded-md p-2 ${
                                            isDarkMode ? 'border-gray-600' : 'border-gray-300'
                                          }`}>
                                            <div className="grid grid-cols-3 gap-3">
                                              {localSettings.background.images.map((image, index) => (
                                                <div
                                                  key={`custom-${image.imageId || index}`}
                                                  className="relative group cursor-move"
                                                  draggable={true}
                                                  onDragStart={(e) => {
                                                    e.dataTransfer.setData('text/plain', index.toString());
                                                    e.currentTarget.classList.add('opacity-50');
                                                  }}
                                                  onDragEnd={(e) => {
                                                    e.currentTarget.classList.remove('opacity-50');
                                                  }}
                                                  onDragOver={(e) => {
                                                    e.preventDefault();
                                                    e.currentTarget.classList.add('ring-2', 'ring-blue-400');
                                                  }}
                                                  onDragLeave={(e) => {
                                                    e.currentTarget.classList.remove('ring-2', 'ring-blue-400');
                                                  }}
                                                  onDrop={(e) => {
                                                    e.preventDefault();
                                                    e.currentTarget.classList.remove('ring-2', 'ring-blue-400');
                                                    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                                    const targetIndex = index;

                                                    if (draggedIndex !== targetIndex) {
                                                      const newImages = [...localSettings.background.images];
                                                      const draggedImage = newImages[draggedIndex];
                                                      newImages.splice(draggedIndex, 1);
                                                      newImages.splice(targetIndex, 0, draggedImage);

                                                      setLocalSettings(prev => ({
                                                        ...prev,
                                                        background: {
                                                          ...prev.background,
                                                          images: newImages
                                                        }
                                                      }));
                                                    }
                                                  }}
                                                >
                                                  <div className="relative w-full h-24 rounded-md overflow-hidden border-2 border-gray-200 group-hover:border-gray-300 transition-colors">
                                                    <img
                                                      src={image.url}
                                                      alt={`Custom background ${index + 1}`}
                                                      className="w-full h-full object-cover"
                                                    />
                                                    {/* Drag handle indicator */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                                                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                        </svg>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <button
                                                    type="button"
                                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleRemoveImage(index);
                                                    }}
                                                  >
                                                    <TrashIcon className="h-3 w-3" />
                                                  </button>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                          <p className="mt-2 text-xs text-gray-500">
                                            Klik gambar untuk mengubah gambar latar belakang. Gunakan ikon hapus untuk menghapus gambar.
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {activeTab === 'masjid' && (
                          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                            {/* Mosque Identity */}
                            <div className="border border-gray-200 rounded-lg p-4">
                              <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Identitas Masjid</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Nama Masjid
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full rounded-md border-gray-300 sm:text-sm px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Contoh: Masjid Agung"
                                    value={localSettings.masjid?.name || ''}
                                    onChange={(e) => {
                                      setLocalSettings(prev => ({
                                        ...prev,
                                        masjid: { ...prev.masjid!, name: e.target.value }
                                      }));
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Alamat Masjid
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full rounded-md border-gray-300 sm:text-sm px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Contoh: Jl. Merdeka No. 1"
                                    value={localSettings.masjid?.address || ''}
                                    onChange={(e) => {
                                      setLocalSettings(prev => ({
                                        ...prev,
                                        masjid: { ...prev.masjid!, address: e.target.value }
                                      }));
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Running Text Repeater */}
                            <div className="border border-gray-200 rounded-lg p-4">
                              <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Teks Berjalan (Running Text)</h4>
                              <div className="space-y-2">
                                {(localSettings.masjid?.runningText || []).map((text, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      className="flex-1 rounded-md border-gray-300 sm:text-sm px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                      placeholder={`Teks berjalan ${index + 1}`}
                                      value={text}
                                      onChange={(e) => {
                                        const newRunningText = [...(localSettings.masjid?.runningText || [])];
                                        newRunningText[index] = e.target.value;
                                        setLocalSettings(prev => ({
                                          ...prev,
                                          masjid: { ...prev.masjid!, runningText: newRunningText }
                                        }));
                                      }}
                                    />
                                    <button
                                      type="button"
                                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                      onClick={() => {
                                        const newRunningText = (localSettings.masjid?.runningText || []).filter((_, i) => i !== index);
                                        setLocalSettings(prev => ({
                                          ...prev,
                                          masjid: { ...prev.masjid!, runningText: newRunningText }
                                        }));
                                      }}
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  className={`w-full py-2 px-3 border border-dashed border-gray-300 rounded-md text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors`}
                                  onClick={() => {
                                    const newRunningText = [...(localSettings.masjid?.runningText || []), ''];
                                    setLocalSettings(prev => ({
                                      ...prev,
                                      masjid: { ...prev.masjid!, runningText: newRunningText }
                                    }));
                                  }}
                                >
                                  + Tambah Teks Berjalan
                                </button>
                              </div>

                              {/* Animation Mode & Speed */}
                              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                                {/* Animation Mode */}
                                <div>
                                  <label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Mode Animasi
                                  </label>
                                  <div className="space-y-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="runningTextMode"
                                        className="h-4 w-4 text-indigo-600"
                                        checked={localSettings.masjid?.runningTextMode === 'marquee'}
                                        onChange={() => {
                                          setLocalSettings(prev => ({
                                            ...prev,
                                            masjid: { ...prev.masjid!, runningTextMode: 'marquee' }
                                          }));
                                        }}
                                      />
                                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Marquee (Scroll)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="runningTextMode"
                                        className="h-4 w-4 text-indigo-600"
                                        checked={localSettings.masjid?.runningTextMode === 'fade'}
                                        onChange={() => {
                                          setLocalSettings(prev => ({
                                            ...prev,
                                            masjid: { ...prev.masjid!, runningTextMode: 'fade' }
                                          }));
                                        }}
                                      />
                                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fade In/Out</span>
                                    </label>
                                  </div>
                                </div>

                                {/* Speed Control */}
                                <div>
                                  <label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Kecepatan
                                  </label>
                                  <select
                                    className="w-full rounded-md border-gray-300 sm:text-sm px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    value={localSettings.masjid?.runningTextSpeed || 'normal'}
                                    onChange={(e) => {
                                      setLocalSettings(prev => ({
                                        ...prev,
                                        masjid: { ...prev.masjid!, runningTextSpeed: e.target.value as 'slow' | 'normal' | 'fast' }
                                      }));
                                    }}
                                  >
                                    <option value="slow">Lambat</option>
                                    <option value="normal">Normal</option>
                                    <option value="fast">Cepat</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Iqamah Settings */}
                            <div className="border border-gray-200 rounded-lg p-4">
                              <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Pengaturan Iqamah (menit setelah adzan)</h4>
                              <div className="space-y-3">
                                {/* Mode Toggle */}
                                <div className="flex items-center gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="iqamahMode"
                                      className="h-4 w-4 text-indigo-600"
                                      checked={localSettings.masjid?.iqamahMode === 'unified'}
                                      onChange={() => {
                                        setLocalSettings(prev => ({
                                          ...prev,
                                          masjid: { ...prev.masjid!, iqamahMode: 'unified' }
                                        }));
                                      }}
                                    />
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sama Semua</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="iqamahMode"
                                      className="h-4 w-4 text-indigo-600"
                                      checked={localSettings.masjid?.iqamahMode === 'detailed'}
                                      onChange={() => {
                                        setLocalSettings(prev => ({
                                          ...prev,
                                          masjid: { ...prev.masjid!, iqamahMode: 'detailed' }
                                        }));
                                      }}
                                    />
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Per Waktu Sholat</span>
                                  </label>
                                </div>

                                {/* Unified Input */}
                                {localSettings.masjid?.iqamahMode === 'unified' && (
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                      Waktu Iqamah (semua waktu sholat)
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      max="60"
                                      className="w-24 rounded-md border-gray-300 sm:text-sm px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                      value={localSettings.masjid?.iqamahUnified || 10}
                                      onChange={(e) => {
                                        setLocalSettings(prev => ({
                                          ...prev,
                                          masjid: { ...prev.masjid!, iqamahUnified: parseInt(e.target.value) || 10 }
                                        }));
                                      }}
                                    />
                                    <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>menit</span>
                                  </div>
                                )}

                                {/* Detailed Inputs */}
                                {localSettings.masjid?.iqamahMode === 'detailed' && (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {[
                                      { key: 'subuh', label: 'Subuh' },
                                      { key: 'dzuhur', label: 'Dzuhur' },
                                      { key: 'ashar', label: 'Ashar' },
                                      { key: 'maghrib', label: 'Maghrib' },
                                      { key: 'isya', label: 'Isya' },
                                    ].map(prayer => (
                                      <div key={prayer.key}>
                                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                          {prayer.label}
                                        </label>
                                        <div className="flex items-center">
                                          <input
                                            type="number"
                                            min="1"
                                            max="60"
                                            className="w-16 rounded-md border-gray-300 sm:text-sm px-2 py-1 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                            value={localSettings.masjid?.iqamahDetailed?.[prayer.key as keyof typeof localSettings.masjid.iqamahDetailed] || 10}
                                            onChange={(e) => {
                                              setLocalSettings(prev => ({
                                                ...prev,
                                                masjid: {
                                                  ...prev.masjid!,
                                                  iqamahDetailed: {
                                                    ...prev.masjid!.iqamahDetailed,
                                                    [prayer.key]: parseInt(e.target.value) || 10
                                                  }
                                                }
                                              }));
                                            }}
                                          />
                                          <span className={`ml-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>min</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Friday Duty */}
                            <div className="border border-gray-200 rounded-lg p-4">
                              <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Petugas Jumat</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Khatib
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full rounded-md border-gray-300 sm:text-sm px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Nama Khatib"
                                    value={localSettings.masjid?.fridayDuty?.khatib || ''}
                                    onChange={(e) => {
                                      setLocalSettings(prev => ({
                                        ...prev,
                                        masjid: {
                                          ...prev.masjid!,
                                          fridayDuty: { ...prev.masjid!.fridayDuty, khatib: e.target.value }
                                        }
                                      }));
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Imam
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full rounded-md border-gray-300 sm:text-sm px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Nama Imam"
                                    value={localSettings.masjid?.fridayDuty?.imam || ''}
                                    onChange={(e) => {
                                      setLocalSettings(prev => ({
                                        ...prev,
                                        masjid: {
                                          ...prev.masjid!,
                                          fridayDuty: { ...prev.masjid!.fridayDuty, imam: e.target.value }
                                        }
                                      }));
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Bilal
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full rounded-md border-gray-300 sm:text-sm px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Nama Bilal"
                                    value={localSettings.masjid?.fridayDuty?.bilal || ''}
                                    onChange={(e) => {
                                      setLocalSettings(prev => ({
                                        ...prev,
                                        masjid: {
                                          ...prev.masjid!,
                                          fridayDuty: { ...prev.masjid!.fridayDuty, bilal: e.target.value }
                                        }
                                      }));
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === 'audio' && (
                          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                            {/* Master Toggle */}
                            <div className="border border-gray-200 rounded-lg p-4">
                              <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Audio & Countdown</h4>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <label htmlFor="audio-enabled" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Aktifkan Audio & Countdown
                                  </label>
                                  <input
                                    id="audio-enabled"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    checked={localSettings.audio?.enabled ?? true}
                                    onChange={(e) => {
                                      setLocalSettings(prev => ({
                                        ...prev,
                                        audio: { ...prev.audio!, enabled: e.target.checked }
                                      }));
                                    }}
                                  />
                                </div>

                                {/* Volume */}
                                <div>
                                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Volume ({localSettings.audio?.volume ?? 80}%)
                                  </label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    className="w-full accent-indigo-600"
                                    value={localSettings.audio?.volume ?? 80}
                                    onChange={(e) => {
                                      setLocalSettings(prev => ({
                                        ...prev,
                                        audio: { ...prev.audio!, volume: parseInt(e.target.value) }
                                      }));
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Countdown Timing */}
                            <div className="border border-gray-200 rounded-lg p-4">
                              <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Pengaturan Waktu Countdown</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Countdown sebelum Adzan (detik)
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min="10"
                                      max="300"
                                      className="w-24 rounded-md border-gray-300 sm:text-sm px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                      value={localSettings.audio?.adzanCountdownSeconds ?? 60}
                                      onChange={(e) => {
                                        setLocalSettings(prev => ({
                                          ...prev,
                                          audio: { ...prev.audio!, adzanCountdownSeconds: Math.max(10, Math.min(300, parseInt(e.target.value) || 60)) }
                                        }));
                                      }}
                                    />
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>detik</span>
                                  </div>
                                  <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Tampilkan countdown XX detik sebelum waktu adzan. Audio &quot;3-2-1&quot; diputar 3 detik sebelum adzan.
                                  </p>
                                </div>

                                <div>
                                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Countdown sebelum Iqamah (detik)
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min="10"
                                      max="300"
                                      className="w-24 rounded-md border-gray-300 sm:text-sm px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                      value={localSettings.audio?.iqamahCountdownSeconds ?? 60}
                                      onChange={(e) => {
                                        setLocalSettings(prev => ({
                                          ...prev,
                                          audio: { ...prev.audio!, iqamahCountdownSeconds: Math.max(10, Math.min(300, parseInt(e.target.value) || 60)) }
                                        }));
                                      }}
                                    />
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>detik</span>
                                  </div>
                                  <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Audio &quot;3-2-1&quot; diputar 3 detik sebelum iqamah. Beep diputar setiap 1 menit selama jeda.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Adzan Audio */}
                            <div className="border border-gray-200 rounded-lg p-4">
                              <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Audio Adzan</h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <label htmlFor="play-adzan" className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Putar audio adzan saat waktu tiba
                                  </label>
                                  <input
                                    id="play-adzan"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    checked={localSettings.audio?.playAdzan ?? true}
                                    onChange={(e) => {
                                      setLocalSettings(prev => ({
                                        ...prev,
                                        audio: { ...prev.audio!, playAdzan: e.target.checked }
                                      }));
                                    }}
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <label htmlFor="play-adzan-subuh" className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Gunakan adzan Subuh khusus
                                  </label>
                                  <input
                                    id="play-adzan-subuh"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    checked={localSettings.audio?.playAdzanSubuh ?? true}
                                    onChange={(e) => {
                                      setLocalSettings(prev => ({
                                        ...prev,
                                        audio: { ...prev.audio!, playAdzanSubuh: e.target.checked }
                                      }));
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Audio Files Info */}
                            <div className="border border-gray-200 rounded-lg p-4">
                              <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>File Audio</h4>
                              <div className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <p>• <code>3-detik-countdown.mp3</code> — Audio &quot;3-2-1-TIME&quot;</p>
                                <p>• <code>adzan.mp3</code> — Audio adzan reguler</p>
                                <p>• <code>adzan-subuh.mp3</code> — Audio adzan Subuh</p>
                                <p>• <code>beep.mp3</code> — Beep setiap 1 menit jeda adzan-iqamah</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === 'slides' && (
                          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                            {/* Master Toggle */}
                            <div className="border border-gray-200 rounded-lg p-4">
                              <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Slide Rotation System</h4>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <label htmlFor="slides-enabled" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Aktifkan Rotasi Slide
                                  </label>
                                  <input
                                    id="slides-enabled"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    checked={localSettings.slides?.enabled ?? false}
                                    onChange={(e) => {
                                      setLocalSettings(prev => ({
                                        ...prev,
                                        slides: { ...prev.slides!, enabled: e.target.checked }
                                      }));
                                    }}
                                  />
                                </div>

                                <div className={`p-3 rounded ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                                  <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                                    <strong>Cara Kerja:</strong> Layar akan berotasi antara jadwal shalat utama dan slide kustom (poster, pengumuman, dll). Frekuensi rotasi dapat diatur di bawah.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Rotation Settings */}
                            <div className="border border-gray-200 rounded-lg p-4">
                              <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Pengaturan Rotasi</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Durasi Layar Utama: {localSettings.slides?.mainScreenDuration ?? 20} detik
                                  </label>
                                  <input
                                    type="range"
                                    min="10"
                                    max="60"
                                    className="w-full accent-indigo-600"
                                    value={localSettings.slides?.mainScreenDuration ?? 20}
                                    onChange={(e) => {
                                      setLocalSettings(prev => ({
                                        ...prev,
                                        slides: { ...prev.slides!, mainScreenDuration: parseInt(e.target.value) }
                                      }));
                                    }}
                                  />
                                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Berapa lama jadwal shalat lengkap ditampilkan
                                  </p>
                                </div>

                                <div>
                                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Durasi Slide Default: {localSettings.slides?.slideDefaultDuration ?? 10} detik
                                  </label>
                                  <input
                                    type="range"
                                    min="5"
                                    max="30"
                                    className="w-full accent-indigo-600"
                                    value={localSettings.slides?.slideDefaultDuration ?? 10}
                                    onChange={(e) => {
                                      setLocalSettings(prev => ({
                                        ...prev,
                                        slides: { ...prev.slides!, slideDefaultDuration: parseInt(e.target.value) }
                                      }));
                                    }}
                                  />
                                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Berapa lama slide kustom ditampilkan (dapat diubah per slide)
                                  </p>
                                </div>

                                <div>
                                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Frekuensi Kembali ke Layar Utama
                                  </label>
                                  <select
                                    className="w-full rounded-md border-gray-300 sm:text-sm px-3 py-2"
                                    value={localSettings.slides?.mainScreenFrequency ?? 2}
                                    onChange={(e) => {
                                      setLocalSettings(prev => ({
                                        ...prev,
                                        slides: { ...prev.slides!, mainScreenFrequency: parseInt(e.target.value) }
                                      }));
                                    }}
                                  >
                                    <option value="1">Setiap 1 slide (Utama → Slide → Utama)</option>
                                    <option value="2">Setiap 2 slide (Utama → Slide → Slide → Utama)</option>
                                    <option value="3">Setiap 3 slide (Utama → Slide → Slide → Slide → Utama)</option>
                                    <option value="4">Setiap 4 slide</option>
                                    <option value="5">Setiap 5 slide</option>
                                  </select>
                                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Pola: Utama → X slide kustom → Utama → [loop]
                                  </p>
                                </div>

                                <div className="flex items-center justify-between">
                                  <label htmlFor="shuffle-slides" className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Acak urutan slide
                                  </label>
                                  <input
                                    id="shuffle-slides"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    checked={localSettings.slides?.shuffleSlides ?? false}
                                    onChange={(e) => {
                                      setLocalSettings(prev => ({
                                        ...prev,
                                        slides: { ...prev.slides!, shuffleSlides: e.target.checked }
                                      }));
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Slide Library */}
                            <div className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                  Slide Library ({localSettings.slides?.slides.length || 0} slide)
                                </h4>
                                <button
                                  type="button"
                                  className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                  onClick={handleCreateSlide}
                                >
                                  + Tambah Slide
                                </button>
                              </div>

                              {(!localSettings.slides?.slides || localSettings.slides.slides.length === 0) ? (
                                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <p className="text-sm">Belum ada slide.</p>
                                  <p className="text-xs mt-1">Klik &quot;Tambah Slide&quot; untuk membuat slide kustom pertama Anda.</p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {localSettings.slides.slides.map((slide, idx) => (
                                    <div
                                      key={slide.id}
                                      className={`p-3 rounded border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                              {slide.title || `Slide ${idx + 1}`}
                                            </span>
                                            {!slide.enabled && (
                                              <span className="text-xs px-2 py-0.5 bg-gray-500 text-white rounded">Nonaktif</span>
                                            )}
                                            <span className={`text-xs px-2 py-0.5 rounded ${
                                              slide.priority === 'high' ? 'bg-red-100 text-red-800' :
                                              slide.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                                              'bg-gray-100 text-gray-800'
                                            }`}>
                                              {slide.priority === 'high' ? 'Tinggi' : slide.priority === 'normal' ? 'Normal' : 'Rendah'}
                                            </span>
                                          </div>
                                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {slide.type} • {slide.duration}s • {slide.backgroundType}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            className="text-xs text-indigo-600 hover:text-indigo-800"
                                            onClick={() => handleEditSlide(slide)}
                                          >
                                            Edit
                                          </button>
                                          <button
                                            type="button"
                                            className="text-xs text-red-600 hover:text-red-800"
                                            onClick={() => {
                                              if (confirm('Hapus slide ini?')) {
                                                setLocalSettings(prev => ({
                                                  ...prev,
                                                  slides: {
                                                    ...prev.slides!,
                                                    slides: prev.slides!.slides.filter((_, i) => i !== idx)
                                                  }
                                                }));
                                              }
                                            }}
                                          >
                                            Hapus
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                              <h5 className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                💡 Petunjuk Penggunaan
                              </h5>
                              <ul className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                <li>• Slide kustom muncul di antara tampilan jadwal shalat utama</li>
                                <li>• Prioritas &quot;Tinggi&quot; membuat slide muncul lebih sering</li>
                                <li>• Gunakan slide untuk: poster acara, fundraising, pengumuman, dll</li>
                                <li>• Slide dapat dijadwalkan per hari/jam (fitur akan datang)</li>
                              </ul>
                            </div>
                          </div>
                        )}

                        {activeTab === 'about' && (
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-700">Tentang</h4>
                              <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Versi: {appVersion}</p>
                            </div>
                            <div className="elementor-widget-container">
                              <h4 className="text-sm font-medium text-gray-700">Sumber Data</h4>
                              <p className="mt-1 text-sm text-gray-500">
                                Data yang ditampilkan diambil dari <a href="https://documenter.getpostman.com/view/841292/Tz5p7yHS" className={`font-bold ${settings.themeColor === 'gray' ? 'text-gray-600 hover:text-gray-800' :
                                  settings.themeColor === 'red' ? 'text-red-600 hover:text-red-800' :
                                    settings.themeColor === 'yellow' ? 'text-yellow-600 hover:text-yellow-800' :
                                      settings.themeColor === 'green' ? 'text-green-600 hover:text-green-800' :
                                        settings.themeColor === 'blue' ? 'text-blue-600 hover:text-blue-800' :
                                          settings.themeColor === 'purple' ? 'text-purple-600 hover:text-purple-800' :
                                            settings.themeColor === 'pink' ? 'text-pink-600 hover:text-pink-800' :
                                              'text-indigo-600 hover:text-indigo-800'
                                  }`}>API MyQuran</a>. Keterangan dalam dokumentasinya:
                              </p>
                              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Informasi waktu sholat ini, diambil dari situs kemenag bimaislam.
                              </p>
                              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Diambil (scrap) per Feburari 2021. Beberapa kolom disesuaikan, untuk memudahkan penggunaan. Termasuk sistem koordinat lokasi.
                              </p>
                              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Data yang tersedia, dari <span className="underline">Januari 2021 sampai Desember 2030</span>.
                              </p>
                              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Hanya tersedia untuk kota-kota besar di Indonesia. Kota lainnya, silakan disesuaikan sendiri sesuai plus minus waktu setempat.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Footer buttons - Hidden in location-only mode */}
                {mode === 'full' && (
                  <div className={`px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                    }`}>
                    <button
                      type="button"
                      className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${settings.themeColor === 'gray' ? 'bg-gray-600 hover:bg-gray-500' :
                        settings.themeColor === 'red' ? 'bg-red-600 hover:bg-red-500' :
                          settings.themeColor === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-500' :
                            settings.themeColor === 'green' ? 'bg-green-600 hover:bg-green-500' :
                              settings.themeColor === 'blue' ? 'bg-blue-600 hover:bg-blue-500' :
                                settings.themeColor === 'purple' ? 'bg-purple-600 hover:bg-purple-500' :
                                  settings.themeColor === 'pink' ? 'bg-pink-600 hover:bg-pink-500' :
                                    'bg-indigo-600 hover:bg-indigo-500'
                        }`}
                      onClick={handleSave}
                    >
                      Simpan Pengaturan
                    </button>
                    <button
                      type="button"
                      className={`mt-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset sm:mt-0 sm:w-auto ${isDarkMode
                        ? 'bg-gray-600 text-gray-200 ring-gray-500 hover:bg-gray-500'
                        : 'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50'
                        }`}
                      onClick={onClose}
                    >
                      Tutup
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>

    {/* Slide Editor Modal */}
    <SlideEditorModal
      isOpen={isSlideEditorOpen}
      onClose={() => {
        setIsSlideEditorOpen(false);
        setEditingSlide(null);
      }}
      onSave={handleSaveSlide}
      existingSlide={editingSlide}
      isDarkMode={isDarkMode}
    />
    </>
  );
};

export default SettingsModal;
