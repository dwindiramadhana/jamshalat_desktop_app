import { useState, useCallback } from 'react';
import type { LocationData } from '../../types';

interface LocationSettingsProps {
  locations: LocationData[];
  selectedLocationId: string | null;
  onLocationChange: (locationId: string) => void;
  isDarkMode: boolean;
  themeColor: string;
}

const LocationSettings: React.FC<LocationSettingsProps> = ({
  locations,
  selectedLocationId,
  onLocationChange,
  isDarkMode,
  themeColor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocationSelect = useCallback((locationId: string) => {
    onLocationChange(locationId);
  }, [onLocationChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          Cari Lokasi
        </label>
        <input
          type="text"
          className="w-full rounded-md border-gray-300 sm:text-sm px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
          placeholder="Masukkan kata kunci..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {filteredLocations.length > 0 && (
        <div className="max-h-60 overflow-y-auto border rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredLocations.map((location) => (
              <li key={location.id}>
                <button
                  type="button"
                  className={`w-full text-left px-4 py-2 text-sm ${
                    selectedLocationId === location.id
                      ? `${
                          themeColor === 'gray' ? 'bg-gray-100 text-gray-700' :
                          themeColor === 'red' ? 'bg-red-100 text-red-700' :
                          themeColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                          themeColor === 'green' ? 'bg-green-100 text-green-700' :
                          themeColor === 'blue' ? 'bg-blue-100 text-blue-700' :
                          themeColor === 'purple' ? 'bg-purple-100 text-purple-700' :
                          themeColor === 'pink' ? 'bg-pink-100 text-pink-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`
                      : `${
                          isDarkMode 
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
  );
};

export default LocationSettings;