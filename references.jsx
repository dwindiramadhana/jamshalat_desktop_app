import React, { useState, useEffect, useMemo } from 'react';
import { Clock, MapPin, Calendar, Info, Volume2, User, BookOpen } from 'lucide-react';

/**
 * STRUKTUR DATA REKOMENDASI UNTUK CUSTOMIZATION
 * Nantinya data ini bisa diambil dari API atau local storage
 */
const DEFAULT_SETTINGS = {
  masjidName: "MASJID AL-FATAH",
  address: "Jl. Raya Utama No. 123, Jakarta Selatan",
  theme: {
    primary: "bg-emerald-700",
    accent: "bg-amber-500",
    text: "text-white",
    overlay: "bg-black/40"
  },
  iqamahOffsets: {
    Subuh: 15,
    Dzuhur: 10,
    Ashar: 10,
    Maghrib: 7,
    Isya: 10
  },
  tickerMessages: [
    "Luruskan dan rapatkan shaf demi kesempurnaan shalat jamaah.",
    "Mohon menonaktifkan atau menyenyapkan nada dering handphone.",
    "Saldo Kas Masjid per Jumat lalu: Rp 12.500.000,-",
    "Kajian Rutin Selasa Malam: Kitab Riyadhus Shalihin bersama Ust. Ahmad."
  ],
  fridayDuty: {
    khatib: "Dr. KH. Abdullah Gymnastiar",
    imam: "Ust. M. Ridwan"
  }
};

const App = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tickerIndex, setTickerIndex] = useState(0);

  // Simulasi Jadwal Shalat (Hardcoded untuk demo, biasanya dari API)
  const prayerTimes = useMemo(() => [
    { name: 'Imsak', time: '04:15', isNext: false },
    { name: 'Subuh', time: '04:25', isNext: false },
    { name: 'Terbit', time: '05:42', isNext: false },
    { name: 'Dzuhur', time: '12:01', isNext: true }, // Simulasi waktu berikutnya
    { name: 'Ashar', time: '15:20', isNext: false },
    { name: 'Maghrib', time: '18:12', isNext: false },
    { name: 'Isya', time: '19:24', isNext: false },
  ], []);

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Ticker Effect
  useEffect(() => {
    const tickerTimer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % DEFAULT_SETTINGS.tickerMessages.length);
    }, 10000);
    return () => clearInterval(tickerTimer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatHijri = (date) => {
    try {
      return new Intl.DateTimeFormat('id-ID-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    } catch (e) { return "1 Ramadhan 1445 H"; }
  };

  const nextPrayer = prayerTimes.find(p => p.isNext) || prayerTimes[0];

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white font-sans overflow-hidden flex flex-col relative">
      
      {/* Background Image / Video Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542668595-df62671607f2?q=80&w=2070&auto=format&fit=crop')` }}
      />
      <div className={`absolute inset-0 z-1 ${DEFAULT_SETTINGS.theme.overlay} backdrop-blur-[2px]`} />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full flex-1 p-8 lg:p-12">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-12">
          <div className="flex gap-6 items-center">
            <div className={`p-4 rounded-2xl ${DEFAULT_SETTINGS.theme.accent} shadow-xl`}>
              <MapPin size={48} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase">{DEFAULT_SETTINGS.masjidName}</h1>
              <p className="text-lg opacity-80 mt-1 flex items-center gap-2">
                <Info size={18} /> {DEFAULT_SETTINGS.address}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-6xl lg:text-8xl font-mono font-bold tracking-tighter">
              {formatTime(currentTime)}
            </div>
            <div className="text-xl lg:text-2xl mt-2 font-medium flex items-center justify-end gap-3 opacity-90">
              <Calendar size={24} /> {formatDate(currentTime)}
            </div>
            <div className="text-lg lg:text-xl mt-1 text-amber-400 font-semibold italic">
              {formatHijri(currentTime)}
            </div>
          </div>
        </div>

        {/* Middle Section: Info Cards */}
        <div className="flex-1 flex gap-8 items-center">
          
          {/* Next Prayer Highlight */}
          <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[3rem] p-10 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <span className={`px-6 py-2 rounded-full ${DEFAULT_SETTINGS.theme.accent} text-sm font-bold uppercase tracking-widest`}>
                Waktu Berikutnya
              </span>
              <div className="flex items-center gap-2 text-white/60 italic">
                <Clock size={20} />
                Menuju Adzan
              </div>
            </div>
            
            <div className="flex items-baseline gap-4">
              <h2 className="text-7xl lg:text-9xl font-black">{nextPrayer.name}</h2>
              <span className="text-4xl lg:text-6xl font-light text-white/50">{nextPrayer.time}</span>
            </div>
            
            <p className="text-xl mt-6 text-white/70 max-w-2xl leading-relaxed">
              "Apabila panggilan shalat (adzan) dikumandangkan, maka setan akan lari sambil terkentut-kentut hingga tidak mendengar adzan." (HR. Bukhari)
            </p>
          </div>

          {/* Side Info: Friday Duty or Announcements */}
          <div className="w-1/3 flex flex-col gap-6">
            <div className="bg-emerald-900/40 backdrop-blur-md border border-emerald-500/30 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-300">
                  <User size={24} /> Petugas Shalat Jumat
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/50">Khatib</p>
                    <p className="text-xl font-semibold">{DEFAULT_SETTINGS.fridayDuty.khatib}</p>
                  </div>
                  <div className="h-px bg-white/10 w-full" />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/50">Imam</p>
                    <p className="text-xl font-semibold">{DEFAULT_SETTINGS.fridayDuty.imam}</p>
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Prayer Times Grid */}
        <div className="mt-12 grid grid-cols-7 gap-4">
          {prayerTimes.map((prayer) => (
            <div 
              key={prayer.name}
              className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-500 flex flex-col items-center justify-center gap-2
                ${prayer.isNext 
                  ? `${DEFAULT_SETTINGS.theme.accent} scale-110 shadow-2xl z-20 ring-4 ring-white/30` 
                  : 'bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10'}`}
            >
              {prayer.isNext && (
                <div className="absolute top-0 right-0 p-2">
                  <Volume2 size={16} className="animate-pulse" />
                </div>
              )}
              <span className={`text-sm uppercase tracking-[0.3em] font-bold ${prayer.isNext ? 'text-black/60' : 'text-white/40'}`}>
                {prayer.name}
              </span>
              <span className={`text-3xl lg:text-4xl font-mono font-black ${prayer.isNext ? 'text-black' : 'text-white'}`}>
                {prayer.time}
              </span>
              {prayer.isNext && (
                <div className="mt-2 text-[10px] font-bold text-black/50">IQAMAH: +{DEFAULT_SETTINGS.iqamahOffsets[prayer.name] || 10} Menit</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Running Text */}
      <div className="h-16 bg-black/80 backdrop-blur-2xl border-t border-white/10 flex items-center relative overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 z-20 px-6 flex items-center gap-2 font-bold ${DEFAULT_SETTINGS.theme.primary}`}>
          <BookOpen size={20} /> INFO
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="whitespace-nowrap flex items-center h-full px-12 text-xl font-medium tracking-wide animate-marquee">
            {DEFAULT_SETTINGS.tickerMessages[tickerIndex]}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(100%); }
          10% { transform: translateX(0); }
          90% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite;
        }
      `}} />
    </div>
  );
};

export default App;