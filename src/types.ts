export interface PrayerTimeEntry {
  tanggal: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  date: string;
}

export interface PrayerTimesResponse {
  status: boolean;
  data: {
    id: string;
    lokasi: string;
    daerah: string;
    jadwal: PrayerTimeEntry;
  };
}

export type PrayerTimes = PrayerTimeEntry;

export interface PrayerTime {
  name: string;
  time: string;
}

export interface LocationData {
  id: string;
  name: string;
  lokasi: string;
  koordinat: {
    lat: string;
    lon: string;
  };
}

export interface ApiResponse<T> {
  status: boolean;
  data: T;
}
