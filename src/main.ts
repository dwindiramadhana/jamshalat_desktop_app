import './styles.css'
import { fetchLocations, fetchPrayerTimes } from './api';
import type { PrayerTime, PrayerTimesResponse } from './types';

// Initialize the app
const app = document.querySelector<HTMLDivElement>('#app')!

// State
const prayerTimes: PrayerTime[] = [];

// Show error message in the UI
function showError(message: string, container?: HTMLElement | null) {
  const errorContainer = document.createElement('div')
  errorContainer.className = 'p-4 bg-red-50 border-l-4 border-red-400 mb-6 rounded-md'
  errorContainer.innerHTML = `
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <p class="text-sm text-red-700">
          ${message}
        </p>
      </div>
    </div>
  `
  
  const targetContainer = container || document.getElementById('app-content') || document.body
  targetContainer.prepend(errorContainer)
  
  // Auto-remove error after 10 seconds
  setTimeout(() => {
    errorContainer.classList.add('opacity-0', 'transition-opacity', 'duration-300')
    setTimeout(() => errorContainer.remove(), 300)
  }, 10000)
  
  return errorContainer
}


// Render location selector
async function renderLocationSelector(): Promise<HTMLDivElement> {
  // Create container
  const container = document.createElement('div')
  container.className = 'mb-8 bg-white rounded-lg shadow overflow-hidden'
  
  // Set initial HTML
  container.innerHTML = `
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-lg font-medium text-gray-900">Pilih Lokasi</h2>
    </div>
    <div class="p-4">
      <div id="location-error" class="hidden mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
        <span class="font-medium">Error!</span> <span id="error-message"></span>
      </div>
      <select id="location-select" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        <option value="">Mengambil daftar lokasi...</option>
      </select>
    </div>
  `
  
  // Get references to elements
  const select = container.querySelector('#location-select') as HTMLSelectElement
  const errorContainer = container.querySelector('#location-error') as HTMLDivElement
  const errorMessage = container.querySelector('#error-message') as HTMLSpanElement
  
  try {
    // Fetch locations
    const locations = await fetchLocations()
    
    if (!locations || locations.length === 0) {
      throw new Error('Tidak ada data lokasi yang tersedia')
    }
    
    // Populate select with locations
    select.innerHTML = '<option value="">Pilih lokasi...</option>'
    locations.forEach(location => {
      const option = document.createElement('option')
      option.value = location.id
      option.textContent = location.lokasi
      select.appendChild(option)
    })
    
    // Hide error message if it was shown before
    errorContainer.classList.add('hidden')
    
    // Set default location (Jakarta Pusat)
    const defaultLocation = locations.find(loc => loc.lokasi === 'Jakarta Pusat')
    if (defaultLocation) {
      select.value = defaultLocation.id
      await loadPrayerTimes(defaultLocation.id)
    }
    
    // Add event listener for location change
    select.addEventListener('change', async (e) => {
      const selectedId = (e.target as HTMLSelectElement).value
      if (selectedId) {
        try {
          await loadPrayerTimes(selectedId)
        } catch (error) {
          console.error('Error handling location select:', error)
        }
      }
    })
    
    return container
    
  } catch (error) {
    console.error('Error in renderLocationSelector:', error)
    
    // Update UI to show error state
    if (select) {
      select.innerHTML = '<option value="">Gagal memuat daftar lokasi</option>'
    }
    
    // Show error message to user
    if (error instanceof Error && errorMessage) {
      errorMessage.textContent = error.message
      errorContainer.classList.remove('hidden')
    }
    
    // Add retry button
    const retryButton = document.createElement('button')
    retryButton.textContent = 'Coba Lagi'
    retryButton.className = 'mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
    
    retryButton.onclick = () => {
      const appContent = document.getElementById('app-content')
      if (appContent) {
        appContent.innerHTML = ''
        initApp().catch(console.error)
      }
    }
    
    const buttonContainer = document.createElement('div')
    buttonContainer.className = 'mt-4 text-center'
    buttonContainer.appendChild(retryButton)
    
    const p4 = container.querySelector('.p-4')
    if (p4) {
      p4.appendChild(buttonContainer)
    }
    
    return container
  }
}

// Load prayer times for the given location
async function loadPrayerTimes(locationId: string) {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const response = await fetchPrayerTimes(locationId, new Date(`${year}-${month}-${day}`)) as PrayerTimesResponse;
    
    if (!response.status || !response.data?.jadwal) {
      throw new Error('Invalid prayer times data received');
    }
    
    const prayerTime = response.data.jadwal;
    
    // Clear the array
    prayerTimes.length = 0;
    
    // Add each prayer time to the array
    prayerTimes.push(
      { name: 'Subuh', time: prayerTime.subuh },
      { name: 'Dzuhur', time: prayerTime.dzuhur },
      { name: 'Ashar', time: prayerTime.ashar },
      { name: 'Maghrib', time: prayerTime.maghrib },
      { name: 'Isya', time: prayerTime.isya }
    );
    
    // Update UI
    renderPrayerTimes();
  } catch (error) {
    console.error('Error loading prayer times:', error)
    showError('Gagal memuat jadwal shalat. Silakan coba lagi nanti.')
  }
}

// Render prayer times
function renderPrayerTimes() {
  const prayerTimesContainer = document.getElementById('prayer-times');
  if (!prayerTimesContainer) return;
  
  // Get current date for display
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'Asia/Jakarta'
  };
  
  const formattedDate = today.toLocaleDateString('id-ID', options);
  
  // Create prayer times HTML
  const prayerTimesHTML = `
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-2xl font-bold mb-4">Jadwal Shalat</h2>
      <p class="text-gray-600 mb-4">${formattedDate}</p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${prayerTimes.map(time => `
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold">${time.name}</h3>
            <p class="text-2xl font-bold">${time.time}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  prayerTimesContainer.innerHTML = prayerTimesHTML;
}

// Initialize the app
async function initApp() {
  try {
    // Clear the app container first
    app.innerHTML = ''
    
    // Create main app structure
    const appContainer = document.createElement('div')
    appContainer.className = 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'
    appContainer.innerHTML = `
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold text-gray-900">Jadwal Shalat</h1>
        </div>
      </header>
      
      <main class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div id="app-content" class="space-y-6">
          <div class="location-selector">
            <!-- Location selector will be inserted here -->
          </div>
          <div id="prayer-times" class="prayer-times">
            <div class="text-center py-12">
              <p class="text-gray-500">Silakan pilih lokasi untuk melihat jadwal shalat</p>
            </div>
          </div>
        </div>
      </main>
    `
    
    // Append to app
    app.appendChild(appContainer)
    
    // Render location selector
    const appContent = document.getElementById('app-content')
    if (appContent) {
      try {
        const locationSelector = await renderLocationSelector()
        const locationContainer = appContent.querySelector('.location-selector')
        if (locationContainer && locationSelector) {
          locationContainer.replaceWith(locationSelector)
        }
      } catch (error) {
        console.error('Error initializing location selector:', error)
        showError(
          'Gagal memuat daftar lokasi. Pastikan Anda terhubung ke internet dan coba muat ulang halaman.',
          appContent
        )
      }
    }
  } catch (error) {
    console.error('Fatal error initializing app:', error)
    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Terjadi Kesalahan</h2>
          <p class="text-gray-700 mb-4">Aplikasi tidak dapat dimuat. Silakan muat ulang halaman.</p>
          <button id="reload-button" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Muat Ulang
          </button>
        </div>
      </div>
    `
    
    // Add event listener for the reload button
    const reloadButton = document.getElementById('reload-button')
    if (reloadButton) {
      reloadButton.addEventListener('click', () => window.location.reload())
    }
  }
}

// Start the app
initApp().catch(console.error)
