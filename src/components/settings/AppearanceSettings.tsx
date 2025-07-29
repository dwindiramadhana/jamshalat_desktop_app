import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import type { AppSettings } from '../../hooks/useAppSettings';
import ImageSettings from './ImageSettings';

interface AppearanceSettingsProps {
  localSettings: AppSettings;
  setLocalSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  isDarkMode: boolean;
  handleBackgroundTypeChange: (type: 'auto' | 'static') => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  localSettings,
  setLocalSettings,
  isDarkMode,
  handleBackgroundTypeChange,
}) => {
  const [accordionState, setAccordionState] = useState({
    general: true,
    tema: false,
    images: false,
  });

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg">
        <button
          type="button"
          className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 flex items-center justify-between rounded-t-lg focus:outline-none"
          onClick={() => setAccordionState({ general: !accordionState.general, tema: false, images: false })}
        >
          <span className="font-medium text-gray-900">Umum</span>
          {accordionState.general ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {accordionState.general && (
          <div className="px-4 py-3 space-y-4 border-t border-gray-200">
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
                    className={`h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500`}
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
                    className={`h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500`}
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
                    className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500`}
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
                    className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500`}
                    checked={localSettings.background.type === 'static'}
                    onChange={() => handleBackgroundTypeChange('static')}
                  />
                  <label htmlFor="background-static" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Local
                  </label>
                </div>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Interval Rotasi Latar Belakang (menit)
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                className="w-full rounded-md border-gray-300 sm:text-sm px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
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
      <div className="border border-gray-200 rounded-lg">
        <button
          type="button"
          className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 flex items-center justify-between rounded-t-lg focus:outline-none"
          onClick={() => setAccordionState({ general: false, tema: !accordionState.tema, images: false })}
        >
          <span className="font-medium text-gray-900">Tema</span>
          {accordionState.tema ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {accordionState.tema && (
          <div className="px-4 py-3 space-y-4 border-t border-gray-200">
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
                    className={`flex items-center p-2 rounded-md border transition-all text-xs ${
                      (localSettings.themeColor || 'indigo') === color.value
                        ? 'border-gray-400 bg-gray-50 ring-1 ring-gray-300'
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
                    <span className={`truncate ${isDarkMode ? `text-${color.value}-400` : `text-${color.value}-700`}`}>{color.label}</span>
                  </button>
                ))}
              </div>
              <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Pilih warna tema untuk aplikasi
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Mode Tampilan
              </label>
              <div className="flex items-center">
                <input
                  id="dark-mode"
                  name="dark-mode"
                  type="checkbox"
                  className={`h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500`}
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
      <div className="border border-gray-200 rounded-lg">
        <button
          type="button"
          className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 flex items-center justify-between rounded-t-lg focus:outline-none"
          onClick={() => setAccordionState({ general: false, tema: false, images: !accordionState.images })}
        >
          <span className="font-medium text-gray-900">Pilihan Gambar</span>
          {accordionState.images ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {accordionState.images && (
          <div className="px-4 py-3 border-t border-gray-200">
            <ImageSettings
              localSettings={localSettings}
              setLocalSettings={setLocalSettings}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppearanceSettings;