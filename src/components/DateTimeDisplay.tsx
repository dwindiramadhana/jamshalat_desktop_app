import { useState, useEffect } from 'react';
import axios from 'axios';

interface HijriDate {
  date: string;
  format: string;
  day: string;
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
  designation: {
    abbreviated: string;
    expanded: string;
  };
  holidays: string[];
}

interface GregorianDate {
  date: string;
  format: string;
  day: string;
  month: {
    number: number;
    en: string;
  };
  year: string;
  designation: {
    abbreviated: string;
    expanded: string;
  };
}

interface HijriResponse {
  code: number;
  status: string;
  data: {
    hijri: HijriDate;
    gregorian: GregorianDate;
  };
}

const monthsID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const daysID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const hijriMonthsID = [
  'Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir',
  'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Sya\'ban',
  'Ramadhan', 'Syawal', 'Dzulqaidah', 'Dzulhijjah'
];

export const DateTimeDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch Hijri date on component mount
  useEffect(() => {
    const fetchHijriDate = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        
        const response = await axios.get<HijriResponse>(
          `http://api.aladhan.com/v1/gToH/${day}-${month}-${year}`
        );
        
        if (response.data.code === 200) {
          setHijriDate(response.data.data.hijri);
        } else {
          throw new Error('Failed to fetch Hijri date');
        }
      } catch (err) {
        console.error('Error fetching Hijri date:', err);
        setError('Gagal memuat tanggal Hijriah');
      } finally {
        setLoading(false);
      }
    };

    fetchHijriDate();
  }, []);

  // Format time as HH:MM:SS with colon separator
  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Format Gregorian date in Bahasa Indonesia
  const formatGregorianDate = (date: Date) => {
    const dayName = daysID[date.getDay()];
    const day = date.getDate();
    const month = monthsID[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}, ${day} ${month} ${year}`;
  };

  // Format Hijri date in Bahasa Indonesia
  const formatHijriDate = (hijri: HijriDate) => {
    const day = hijri.day; // Keep as string to preserve leading zeros if any
    const monthIndex = parseInt(hijri.month.number.toString()) - 1;
    const month = monthIndex >= 0 && monthIndex < hijriMonthsID.length 
      ? hijriMonthsID[monthIndex] 
      : hijri.month.en; // Fallback to English name if index is out of bounds
    const year = hijri.year;
    
    return `${day} ${month} ${year} H`;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center sm:justify-between w-full text-center sm:text-left">
      {/* Time */}
      <div className="text-5xl font-bold text-indigo-700 mb-2 sm:mb-0">
        {formatTime(currentTime)}
      </div>
      
      {/* Date, Hijri, and Location */}
      <div className="text-center sm:text-right">
        <div className="text-indigo-900 font-medium">
          {formatGregorianDate(currentTime)}
        </div>
        {loading ? (
          <div className="text-indigo-700/80 text-sm">Memuat tanggal Hijriah...</div>
        ) : error ? (
          <div className="text-indigo-700/80 text-sm">{error}</div>
        ) : hijriDate ? (
          <div className="text-indigo-700/90 text-base font-medium">
            {formatHijriDate(hijriDate)}
          </div>
        ) : null}
      </div>
    </div>
  );
};
