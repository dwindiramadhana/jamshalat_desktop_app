import type { LocationData } from '../types';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationDetectionResult {
  success: boolean;
  coordinates?: GeolocationCoordinates;
  closestCity?: LocationData;
  error?: string;
  method?: 'gps' | 'ip' | 'manual';
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Find the closest city from available locations based on coordinates
 */
export function findClosestCity(
  userCoords: GeolocationCoordinates,
  availableCities: LocationData[]
): LocationData | null {
  if (!availableCities.length) return null;

  let closestCity = availableCities[0];
  let minDistance = calculateDistance(
    userCoords.latitude,
    userCoords.longitude,
    parseFloat(closestCity.koordinat.lat),
    parseFloat(closestCity.koordinat.lon)
  );

  for (let i = 1; i < availableCities.length; i++) {
    const city = availableCities[i];
    const distance = calculateDistance(
      userCoords.latitude,
      userCoords.longitude,
      parseFloat(city.koordinat.lat),
      parseFloat(city.koordinat.lon)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestCity = city;
    }
  }

  // Only return if within reasonable distance (500km for Indonesia)
  return minDistance <= 500 ? closestCity : null;
}

/**
 * Get user location using browser Geolocation API
 */
export function getCurrentPosition(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 300000 // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Unknown location error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      options
    );
  });
}

/**
 * Get approximate location using IP-based geolocation (fallback)
 */
export async function getLocationByIP(): Promise<GeolocationCoordinates> {
  try {
    // Using ipapi.co as it's free and reliable
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('IP location service unavailable');
    }
    
    const data = await response.json();
    
    if (!data.latitude || !data.longitude) {
      throw new Error('Invalid IP location data');
    }
    
    return {
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude)
    };
  } catch (error) {
    console.error('IP location detection failed:', error);
    throw new Error('Failed to detect location via IP');
  }
}

/**
 * Auto-detect user location and find closest city
 * Tries GPS first, then falls back to IP-based location
 */
export async function autoDetectLocation(
  availableCities: LocationData[]
): Promise<LocationDetectionResult> {
  console.log(`🌍 Starting auto-detection with ${availableCities.length} available cities`);
  
  // First try GPS-based location
  try {
    console.log('📍 Attempting GPS location detection...');
    const gpsCoords = await getCurrentPosition();
    console.log(`📍 GPS coordinates: ${gpsCoords.latitude}, ${gpsCoords.longitude}`);
    
    const closestCity = findClosestCity(gpsCoords, availableCities);
    
    if (closestCity) {
      console.log(`✅ GPS location detected successfully: ${closestCity.name}`);
      console.log(`📍 City coordinates: ${closestCity.koordinat.lat}, ${closestCity.koordinat.lon}`);
      return {
        success: true,
        coordinates: gpsCoords,
        closestCity,
        method: 'gps'
      };
    } else {
      console.log('❌ GPS location detected but no nearby city found');
      return {
        success: false,
        coordinates: gpsCoords,
        error: 'No nearby city found within 500km radius',
        method: 'gps'
      };
    }
  } catch (gpsError) {
    console.log('❌ GPS location failed, trying IP-based location...', gpsError);
    
    // Fallback to IP-based location
    try {
      console.log('🌐 Attempting IP-based location detection...');
      const ipCoords = await getLocationByIP();
      console.log(`🌐 IP coordinates: ${ipCoords.latitude}, ${ipCoords.longitude}`);
      
      const closestCity = findClosestCity(ipCoords, availableCities);
      
      if (closestCity) {
        console.log(`✅ IP location detected successfully: ${closestCity.name}`);
        console.log(`📍 City coordinates: ${closestCity.koordinat.lat}, ${closestCity.koordinat.lon}`);
        return {
          success: true,
          coordinates: ipCoords,
          closestCity,
          method: 'ip'
        };
      } else {
        console.log('❌ IP location detected but no nearby city found');
        return {
          success: false,
          coordinates: ipCoords,
          error: 'No nearby city found within 500km radius',
          method: 'ip'
        };
      }
    } catch (ipError) {
      console.error('❌ Both GPS and IP location detection failed:', ipError);
      return {
        success: false,
        error: `Location detection failed: ${gpsError instanceof Error ? gpsError.message : 'Unknown GPS error'}`,
        method: 'manual'
      };
    }
  }
}

/**
 * Check if location detection should be attempted
 * Based on user preferences and previous detection results
 */
export function shouldAttemptLocationDetection(): boolean {
  console.log('🔍 Checking if location detection should be attempted...');
  
  // Check if user has previously disabled auto-detection
  const autoDetectionDisabled = localStorage.getItem('autoLocationDisabled') === 'true';
  if (autoDetectionDisabled) {
    console.log('❌ Auto-detection disabled by user');
    return false;
  }

  // Check if we have a recent successful detection (within 24 hours)
  const lastDetection = localStorage.getItem('lastLocationDetection');
  if (lastDetection) {
    const lastDetectionTime = new Date(lastDetection);
    const now = new Date();
    const hoursSinceLastDetection = (now.getTime() - lastDetectionTime.getTime()) / (1000 * 60 * 60);
    
    console.log(`⏰ Last detection was ${hoursSinceLastDetection.toFixed(1)} hours ago`);
    
    // If last detection was within 24 hours, skip auto-detection
    if (hoursSinceLastDetection < 24) {
      console.log('⏭️ Skipping detection - recent detection found');
      return false;
    }
  }

  console.log('✅ Location detection should be attempted');
  return true;
}

/**
 * Save location detection result to localStorage
 */
export function saveLocationDetectionResult(result: LocationDetectionResult): void {
  if (result.success && result.closestCity) {
    localStorage.setItem('lastLocationDetection', new Date().toISOString());
    localStorage.setItem('lastDetectedCityId', result.closestCity.id);
    localStorage.setItem('lastDetectionMethod', result.method || 'unknown');
  }
}

/**
 * Disable auto location detection (user preference)
 */
export function disableAutoLocationDetection(): void {
  localStorage.setItem('autoLocationDisabled', 'true');
}

/**
 * Enable auto location detection (user preference)
 */
export function enableAutoLocationDetection(): void {
  localStorage.removeItem('autoLocationDisabled');
}
