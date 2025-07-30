import { Fragment, useState, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import type { Settings as AppSettings } from '../types/settings';
import type { LocationData } from '../types';
import LocationSettings from './settings/LocationSettings';
import AppearanceSettings from './settings/AppearanceSettings';
import AboutSettings from './settings/AboutSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  locations: LocationData[];
  selectedLocationId: string | null;
  onLocationChange: (locationId: string) => void;
  isDarkMode: boolean;
}

type TabType = 'location' | 'appearance' | 'about';

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  locations,
  selectedLocationId,
  onLocationChange,
  isDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('location');
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
  }));

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
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

  const handleSave = useCallback(() => {
    onSave(localSettings);
    onClose();
  }, [localSettings, onSave, onClose]);

  return (
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
              <Dialog.Panel className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all w-full max-w-md sm:max-w-lg md:max-w-xl my-8 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className={`px-4 pb-4 pt-5 sm:p-6 sm:pb-4 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-left sm:ml-4 sm:mt-0 w-full">
                      <Dialog.Title as="h3" className={`text-base font-semibold leading-6 mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Pengaturan
                      </Dialog.Title>
                      
                      {/* Tab Navigation */}
                      <div className="border-b border-gray-200 mb-4">
                        <nav className="-mb-px flex space-x-8">
                          <button
                            onClick={() => handleTabChange('location')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === 'location'
                                ? `${
                                  settings.themeColor === 'gray' ? 'border-gray-500 text-gray-600' :
                                  settings.themeColor === 'red' ? 'border-red-500 text-red-600' :
                                  settings.themeColor === 'yellow' ? 'border-yellow-500 text-yellow-600' :
                                  settings.themeColor === 'green' ? 'border-green-500 text-green-600' :
                                  settings.themeColor === 'blue' ? 'border-blue-500 text-blue-600' :
                                  settings.themeColor === 'purple' ? 'border-purple-500 text-purple-600' :
                                  settings.themeColor === 'pink' ? 'border-pink-500 text-pink-600' :
                                  'border-indigo-500 text-indigo-600'
                                }`
                                : `border-transparent ${
                                  isDarkMode 
                                    ? 'text-gray-300 hover:text-gray-100 hover:border-gray-500' 
                                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`
                            }`}
                          >
                            Lokasi
                          </button>
                          <button
                            onClick={() => handleTabChange('appearance')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === 'appearance'
                                ? `${
                                  settings.themeColor === 'gray' ? 'border-gray-500 text-gray-600' :
                                  settings.themeColor === 'red' ? 'border-red-500 text-red-600' :
                                  settings.themeColor === 'yellow' ? 'border-yellow-500 text-yellow-600' :
                                  settings.themeColor === 'green' ? 'border-green-500 text-green-600' :
                                  settings.themeColor === 'blue' ? 'border-blue-500 text-blue-600' :
                                  settings.themeColor === 'purple' ? 'border-purple-500 text-purple-600' :
                                  settings.themeColor === 'pink' ? 'border-pink-500 text-pink-600' :
                                  'border-indigo-500 text-indigo-600'
                                }`
                                : `border-transparent ${
                                  isDarkMode 
                                    ? 'text-gray-300 hover:text-gray-100 hover:border-gray-500' 
                                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`
                            }`}
                          >
                            Tampilan
                          </button>
                          <button
                            onClick={() => handleTabChange('about')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === 'about'
                                ? `${
                                  settings.themeColor === 'gray' ? 'border-gray-500 text-gray-600' :
                                  settings.themeColor === 'red' ? 'border-red-500 text-red-600' :
                                  settings.themeColor === 'yellow' ? 'border-yellow-500 text-yellow-600' :
                                  settings.themeColor === 'green' ? 'border-green-500 text-green-600' :
                                  settings.themeColor === 'blue' ? 'border-blue-500 text-blue-600' :
                                  settings.themeColor === 'purple' ? 'border-purple-500 text-purple-600' :
                                  settings.themeColor === 'pink' ? 'border-pink-500 text-pink-600' :
                                  'border-indigo-500 text-indigo-600'
                                }`
                                : `border-transparent ${
                                  isDarkMode 
                                    ? 'text-gray-300 hover:text-gray-100 hover:border-gray-500' 
                                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`
                            }`}
                          >
                            Tentang
                          </button>
                        </nav>
                      </div>

                      {/* Tab Content */}
                      <div className="mt-4">
                        {activeTab === 'location' && (
                          <LocationSettings
                            locations={locations}
                            selectedLocationId={selectedLocationId}
                            onLocationChange={onLocationChange}
                            isDarkMode={isDarkMode}
                            themeColor={settings.themeColor || 'indigo'}
                          />
                        )}

                        {activeTab === 'appearance' && (
                          <AppearanceSettings
                            localSettings={localSettings}
                            setLocalSettings={setLocalSettings}
                            isDarkMode={isDarkMode}
                            handleBackgroundTypeChange={handleBackgroundTypeChange}
                          />
                        )}

                        {activeTab === 'about' && (
                          <AboutSettings
                            settings={settings}
                            isDarkMode={isDarkMode}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <button
                    type="button"
                    className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                      settings.themeColor === 'gray' ? 'bg-gray-600 hover:bg-gray-500' :
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
                    className={`mt-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset sm:mt-0 sm:w-auto ${
                      isDarkMode 
                        ? 'bg-gray-600 text-gray-200 ring-gray-500 hover:bg-gray-500' 
                        : 'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={onClose}
                  >
                    Tutup
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default SettingsModal;
