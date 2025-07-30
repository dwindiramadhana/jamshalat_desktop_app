import React from 'react';
import type { Settings as AppSettings } from '../../types/settings';

interface AboutSettingsProps {
  settings: AppSettings;
  isDarkMode: boolean;
}

const AboutSettings: React.FC<AboutSettingsProps> = ({
  settings,
  isDarkMode,
}) => {
  const appVersion = '1.0.2';

  return (
    <div className="space-y-4">
      <div>
        <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          Tentang
        </h4>
        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
          Versi: {appVersion}
        </p>
      </div>
      
      <div className="about-content">
        <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          Sumber Data
        </h4>
        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
          Data yang ditampilkan diambil dari{' '}
          <a 
            href="https://documenter.getpostman.com/view/841292/Tz5p7yHS" 
            className={`font-bold transition-colors ${
              settings.themeColor === 'gray' ? 'text-gray-600 hover:text-gray-800' :
              settings.themeColor === 'red' ? 'text-red-600 hover:text-red-800' :
              settings.themeColor === 'yellow' ? 'text-yellow-600 hover:text-yellow-800' :
              settings.themeColor === 'green' ? 'text-green-600 hover:text-green-800' :
              settings.themeColor === 'blue' ? 'text-blue-600 hover:text-blue-800' :
              settings.themeColor === 'purple' ? 'text-purple-600 hover:text-purple-800' :
              settings.themeColor === 'pink' ? 'text-pink-600 hover:text-pink-800' :
              'text-indigo-600 hover:text-indigo-800'
            }`}
            target="_blank"
            rel="noopener noreferrer"
          >
            API MyQuran
          </a>
          . Keterangan dalam dokumentasinya:
        </p>
        
        <div className="mt-3 space-y-2">
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            Informasi waktu sholat ini, diambil dari situs kemenag bimaislam.
          </p>
          
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            Diambil (scrap) per Feburari 2021. Beberapa kolom disesuaikan, untuk memudahkan penggunaan. 
            Termasuk sistem koordinat lokasi.
          </p>
          
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            Data yang tersedia, dari <span className="underline font-medium">Januari 2021 sampai Desember 2030</span>.
          </p>
          
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            Hanya tersedia untuk kota-kota besar di Indonesia. Kota lainnya, silakan disesuaikan sendiri 
            sesuai plus minus waktu setempat.
          </p>
        </div>
      </div>
      
    </div>
  );
};

export default AboutSettings;