// Indonesian city coordinates mapping for MyQuran API locations
// This maps location names to their approximate coordinates

export interface CityCoordinate {
  lat: number;
  lon: number;
}

export const INDONESIAN_CITY_COORDINATES: Record<string, CityCoordinate> = {
  // Lampung
  "KAB. LAMPUNG TENGAH": { lat: -4.8357, lon: 105.0928 },
  "KAB. LAMPUNG UTARA": { lat: -4.1426, lon: 104.6167 },
  "KAB. LAMPUNG SELATAN": { lat: -5.4292, lon: 105.2656 },
  "KAB. LAMPUNG BARAT": { lat: -5.0431, lon: 104.2316 },
  "KAB. LAMPUNG TIMUR": { lat: -4.8357, lon: 105.6928 },
  "KOTA BANDAR LAMPUNG": { lat: -5.3971, lon: 105.2668 },
  "KOTA METRO": { lat: -5.1135, lon: 105.3067 },

  // Banten
  "KAB. LEBAK": { lat: -6.5644, lon: 106.2522 },
  "KAB. PANDEGLANG": { lat: -6.3086, lon: 106.1069 },
  "KAB. SERANG": { lat: -6.1200, lon: 106.1500 },
  "KAB. TANGERANG": { lat: -6.1783, lon: 106.6319 },
  "KOTA CILEGON": { lat: -6.0025, lon: 106.0194 },
  "KOTA SERANG": { lat: -6.1200, lon: 106.1500 },
  "KOTA TANGERANG": { lat: -6.1783, lon: 106.6319 },
  "KOTA TANGERANG SELATAN": { lat: -6.2886, lon: 106.7317 },

  // Jawa Barat
  "KAB. BANDUNG": { lat: -7.0051, lon: 107.5619 },
  "KAB. BANDUNG BARAT": { lat: -6.8617, lon: 107.4917 },
  "KAB. BEKASI": { lat: -6.2383, lon: 107.0000 },
  "KAB. BOGOR": { lat: -6.5971, lon: 106.8060 },
  "KAB. CIAMIS": { lat: -7.3257, lon: 108.3534 },
  "KAB. CIANJUR": { lat: -6.8200, lon: 107.1400 },
  "KAB. CIREBON": { lat: -6.7063, lon: 108.5571 },
  "KAB. GARUT": { lat: -7.2253, lon: 107.8986 },
  "KAB. INDRAMAYU": { lat: -6.3264, lon: 108.3200 },
  "KAB. KARAWANG": { lat: -6.3015, lon: 107.3019 },
  "KAB. KUNINGAN": { lat: -6.9756, lon: 108.4831 },
  "KAB. MAJALENGKA": { lat: -6.8364, lon: 108.2275 },
  "KAB. PURWAKARTA": { lat: -6.5569, lon: 107.4431 },
  "KAB. SUBANG": { lat: -6.5697, lon: 107.7636 },
  "KAB. SUKABUMI": { lat: -6.9175, lon: 106.9269 },
  "KAB. SUMEDANG": { lat: -6.8387, lon: 107.9167 },
  "KAB. TASIKMALAYA": { lat: -7.3506, lon: 108.2172 },
  "KOTA BANDUNG": { lat: -6.9175, lon: 107.6191 },
  "KOTA BEKASI": { lat: -6.2383, lon: 107.0000 },
  "KOTA BOGOR": { lat: -6.5971, lon: 106.8060 },
  "KOTA CIMAHI": { lat: -6.8723, lon: 107.5425 },
  "KOTA CIREBON": { lat: -6.7320, lon: 108.5570 },
  "KOTA DEPOK": { lat: -6.4025, lon: 106.7942 },
  "KOTA SUKABUMI": { lat: -6.9175, lon: 106.9269 },
  "KOTA TASIKMALAYA": { lat: -7.3506, lon: 108.2172 },

  // DKI Jakarta
  "KOTA JAKARTA": { lat: -6.2088, lon: 106.8456 },
  "KAB. KEPULAUAN SERIBU": { lat: -5.6108, lon: 106.5247 },

  // Jawa Tengah
  "KAB. BANJARNEGARA": { lat: -7.3553, lon: 109.6853 },
  "KAB. BANYUMAS": { lat: -7.5186, lon: 109.2947 },
  "KAB. BATANG": { lat: -6.9147, lon: 109.7319 },
  "KAB. BLORA": { lat: -6.9697, lon: 111.4175 },
  "KAB. BOYOLALI": { lat: -7.5322, lon: 110.5953 },
  "KAB. BREBES": { lat: -6.8731, lon: 109.0425 },
  "KAB. CILACAP": { lat: -7.7264, lon: 109.0081 },
  "KAB. DEMAK": { lat: -6.8906, lon: 110.6397 },
  "KAB. GROBOGAN": { lat: -7.0586, lon: 110.9175 },
  "KAB. JEPARA": { lat: -6.5889, lon: 110.6686 },
  "KAB. KARANGANYAR": { lat: -7.6281, lon: 111.0375 },
  "KAB. KEBUMEN": { lat: -7.6708, lon: 109.6581 },
  "KAB. KENDAL": { lat: -6.9264, lon: 110.2031 },
  "KAB. KLATEN": { lat: -7.7058, lon: 110.6061 },
  "KAB. KUDUS": { lat: -6.8047, lon: 110.8406 },
  "KAB. MAGELANG": { lat: -7.4697, lon: 110.2175 },
  "KAB. PATI": { lat: -6.7558, lon: 111.0378 },
  "KAB. PEKALONGAN": { lat: -6.8886, lon: 109.6753 },
  "KAB. PEMALANG": { lat: -6.8981, lon: 109.3781 },
  "KAB. PURBALINGGA": { lat: -7.3881, lon: 109.3644 },
  "KAB. PURWOREJO": { lat: -7.7197, lon: 110.0053 },
  "KAB. REMBANG": { lat: -6.7089, lon: 111.3428 },
  "KAB. SEMARANG": { lat: -7.3197, lon: 110.1750 },
  "KAB. SRAGEN": { lat: -7.4197, lon: 111.0053 },
  "KAB. SUKOHARJO": { lat: -7.6797, lon: 110.8353 },
  "KAB. TEGAL": { lat: -6.8697, lon: 109.1353 },
  "KAB. TEMANGGUNG": { lat: -7.3197, lon: 110.1750 },
  "KAB. WONOGIRI": { lat: -7.8197, lon: 110.9353 },
  "KAB. WONOSOBO": { lat: -7.3697, lon: 109.9053 },
  "KOTA MAGELANG": { lat: -7.4697, lon: 110.2175 },
  "KOTA PEKALONGAN": { lat: -6.8886, lon: 109.6753 },
  "KOTA SALATIGA": { lat: -7.3319, lon: 110.4922 },
  "KOTA SEMARANG": { lat: -6.9667, lon: 110.4167 },
  "KOTA SURAKARTA": { lat: -7.5697, lon: 110.8264 },
  "KOTA TEGAL": { lat: -6.8697, lon: 109.1353 },

  // DI Yogyakarta
  "KAB. BANTUL": { lat: -7.8881, lon: 110.3297 },
  "KAB. GUNUNGKIDUL": { lat: -7.9881, lon: 110.5997 },
  "KAB. KULON PROGO": { lat: -7.8281, lon: 110.1597 },
  "KAB. SLEMAN": { lat: -7.7281, lon: 110.3597 },
  "KOTA YOGYAKARTA": { lat: -7.7956, lon: 110.3695 },

  // Jawa Timur
  "KAB. BANGKALAN": { lat: -7.0453, lon: 112.7353 },
  "KAB. BANYUWANGI": { lat: -8.2192, lon: 114.3689 },
  "KAB. BLITAR": { lat: -8.0953, lon: 112.1653 },
  "KAB. BOJONEGORO": { lat: -7.1503, lon: 111.8819 },
  "KAB. BONDOWOSO": { lat: -7.9136, lon: 113.8214 },
  "KAB. GRESIK": { lat: -7.1553, lon: 112.6553 },
  "KAB. JEMBER": { lat: -8.1664, lon: 113.7031 },
  "KAB. JOMBANG": { lat: -7.5453, lon: 112.2353 },
  "KAB. KEDIRI": { lat: -7.8453, lon: 112.0153 },
  "KAB. LAMONGAN": { lat: -7.1153, lon: 112.4153 },
  "KAB. LUMAJANG": { lat: -8.1353, lon: 113.2253 },
  "KAB. MADIUN": { lat: -7.6253, lon: 111.5253 },
  "KAB. MAGETAN": { lat: -7.6453, lon: 111.3453 },
  "KAB. MALANG": { lat: -8.1664, lon: 112.6353 },
  "KAB. MOJOKERTO": { lat: -7.4653, lon: 112.4353 },
  "KAB. NGANJUK": { lat: -7.6053, lon: 111.9053 },
  "KAB. NGAWI": { lat: -7.4053, lon: 111.4453 },
  "KAB. PACITAN": { lat: -8.2053, lon: 111.0953 },
  "KAB. PAMEKASAN": { lat: -7.1553, lon: 113.4753 },
  "KAB. PASURUAN": { lat: -7.6453, lon: 112.9053 },
  "KAB. PONOROGO": { lat: -7.8653, lon: 111.4653 },
  "KAB. PROBOLINGGO": { lat: -7.7553, lon: 113.2153 },
  "KAB. SAMPANG": { lat: -7.1853, lon: 113.2453 },
  "KAB. SIDOARJO": { lat: -7.4453, lon: 112.7153 },
  "KAB. SITUBONDO": { lat: -7.7053, lon: 114.0053 },
  "KAB. SUMENEP": { lat: -7.0153, lon: 113.8653 },
  "KAB. TRENGGALEK": { lat: -8.0553, lon: 111.7153 },
  "KAB. TUBAN": { lat: -6.8953, lon: 111.9653 },
  "KAB. TULUNGAGUNG": { lat: -8.0653, lon: 111.9053 },
  "KOTA BATU": { lat: -7.8697, lon: 112.5264 },
  "KOTA BLITAR": { lat: -8.0953, lon: 112.1653 },
  "KOTA KEDIRI": { lat: -7.8453, lon: 112.0153 },
  "KOTA MADIUN": { lat: -7.6253, lon: 111.5253 },
  "KOTA MALANG": { lat: -7.9797, lon: 112.6304 },
  "KOTA MOJOKERTO": { lat: -7.4653, lon: 112.4353 },
  "KOTA PASURUAN": { lat: -7.6453, lon: 112.9053 },
  "KOTA PROBOLINGGO": { lat: -7.7553, lon: 113.2153 },
  "KOTA SURABAYA": { lat: -7.2575, lon: 112.7521 },

  // Add more major cities as needed...
  // Bali
  "KOTA DENPASAR": { lat: -8.6500, lon: 115.2167 },
  "KAB. BADUNG": { lat: -8.5500, lon: 115.1667 },
  "KAB. GIANYAR": { lat: -8.5167, lon: 115.3333 },
  "KAB. TABANAN": { lat: -8.5333, lon: 115.1167 },
  "KAB. KLUNGKUNG": { lat: -8.5333, lon: 115.4000 },
  "KAB. BANGLI": { lat: -8.3000, lon: 115.3500 },
  "KAB. KARANGASEM": { lat: -8.4500, lon: 115.6167 },
  "KAB. BULELENG": { lat: -8.1167, lon: 115.0833 },
  "KAB. JEMBRANA": { lat: -8.3500, lon: 114.6667 },

  // Sumatra Utara
  "KOTA MEDAN": { lat: 3.5952, lon: 98.6722 },
  "KOTA BINJAI": { lat: 3.6000, lon: 98.4833 },
  "KOTA PEMATANGSIANTAR": { lat: 2.9667, lon: 99.0667 },
  "KOTA SIBOLGA": { lat: 1.7400, lon: 98.7789 },
  "KOTA TANJUNGBALAI": { lat: 2.9667, lon: 99.8000 },
  "KOTA TEBING TINGGI": { lat: 3.3167, lon: 99.1667 },

  // Sumatra Barat
  "KOTA PADANG": { lat: -0.9471, lon: 100.4172 },
  "KOTA BUKITTINGGI": { lat: -0.3049, lon: 100.3691 },
  "KOTA PADANGPANJANG": { lat: -0.4667, lon: 100.4000 },
  "KOTA PARIAMAN": { lat: -0.6167, lon: 100.1167 },
  "KOTA PAYAKUMBUH": { lat: -0.2167, lon: 100.6333 },
  "KOTA SAWAHLUNTO": { lat: -0.6833, lon: 100.7833 },
  "KOTA SOLOK": { lat: -0.7833, lon: 100.6500 },

  // Riau
  "KOTA PEKANBARU": { lat: 0.5333, lon: 101.4500 },
  "KOTA DUMAI": { lat: 1.6667, lon: 101.4500 },

  // Kepulauan Riau
  "KOTA BATAM": { lat: 1.1300, lon: 104.0500 },
  "KOTA TANJUNG PINANG": { lat: 0.9167, lon: 104.4500 },

  // Aceh
  "KOTA BANDA ACEH": { lat: 5.5483, lon: 95.3238 },
  "KOTA LANGSA": { lat: 4.4683, lon: 97.9683 },
  "KOTA LHOKSEUMAWE": { lat: 5.1800, lon: 97.1500 },
  "KOTA SABANG": { lat: 5.8944, lon: 95.3222 },

  // Jambi
  "KOTA JAMBI": { lat: -1.6000, lon: 103.6167 },
  "KOTA SUNGAI PENUH": { lat: -2.0667, lon: 101.3833 },

  // Bengkulu
  "KOTA BENGKULU": { lat: -3.8004, lon: 102.2655 },

  // Sumatra Selatan
  "KOTA PALEMBANG": { lat: -2.9167, lon: 104.7458 },
  "KOTA PRABUMULIH": { lat: -3.4333, lon: 104.2333 },
  "KOTA PAGAR ALAM": { lat: -4.0333, lon: 103.2500 },
  "KOTA LUBUKLINGGAU": { lat: -3.3000, lon: 102.8667 },

  // Bangka Belitung
  "KOTA PANGKAL PINANG": { lat: -2.1167, lon: 106.1167 }
};

/**
 * Get coordinates for a location name
 * Returns null if location is not found in the mapping
 */
export function getCityCoordinates(locationName: string): CityCoordinate | null {
  // Try exact match first
  if (INDONESIAN_CITY_COORDINATES[locationName]) {
    return INDONESIAN_CITY_COORDINATES[locationName];
  }

  // Try partial match (case insensitive)
  const normalizedName = locationName.toUpperCase();
  for (const [key, coords] of Object.entries(INDONESIAN_CITY_COORDINATES)) {
    if (key.toUpperCase().includes(normalizedName) || normalizedName.includes(key.toUpperCase())) {
      return coords;
    }
  }

  return null;
}

/**
 * Get all available cities with coordinates
 */
export function getAllCitiesWithCoordinates(): Array<{ name: string; coordinates: CityCoordinate }> {
  return Object.entries(INDONESIAN_CITY_COORDINATES).map(([name, coordinates]) => ({
    name,
    coordinates
  }));
}
