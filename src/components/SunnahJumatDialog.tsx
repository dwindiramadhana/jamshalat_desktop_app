import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface SunnahJumatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SunnahSlide {
  number: number;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
}

const sunnahSlides: SunnahSlide[] = [
  {
    number: 1,
    title: 'Mandi (Ghusl)',
    description: 'Rasulullah ﷺ bersabda: "Mandi pada hari Jumat adalah wajib bagi setiap orang yang sudah baligh." (HR. Bukhari & Muslim)',
    emoji: '🚿',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    number: 2,
    title: 'Membaca Surah Al-Kahfi',
    description: 'Barangsiapa membaca surah Al-Kahfi pada hari Jumat, maka akan dipancarkan cahaya baginya di antara dua Jumat. (HR. Al-Hakim)',
    emoji: '📖',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    number: 3,
    title: 'Memperbanyak Shalawat',
    description: 'Perbanyaklah bershalawat kepadaku pada hari Jumat dan malam Jumat, karena shalawat kalian akan disampaikan kepadaku. (HR. Al-Baihaqi)',
    emoji: '🤲',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    number: 4,
    title: 'Berdoa di Waktu Mustajab',
    description: 'Ada satu waktu pada hari Jumat, jika seorang muslim berdoa pada waktu itu, maka Allah akan mengabulkan doanya. (HR. Bukhari & Muslim)',
    emoji: '⏰',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    number: 5,
    title: 'Berangkat Pagi ke Masjid',
    description: 'Barangsiapa yang mandi pada hari Jumat, lalu berangkat pada waktu paling awal, maka seolah-olah dia berkorban dengan seekor unta. (HR. Bukhari & Muslim)',
    emoji: '🕌',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    number: 6,
    title: 'Memakai Pakaian Terbaik',
    description: 'Hendaklah salah seorang dari kalian memiliki dua pakaian untuk hari Jumat selain pakaian untuk bekerja sehari-hari. (HR. Abu Dawud)',
    emoji: '👔',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    number: 7,
    title: 'Mendengarkan Khutbah',
    description: 'Barangsiapa yang berkata kepada temannya "Diamlah" ketika imam sedang berkhutbah pada hari Jumat, maka dia telah melakukan perbuatan sia-sia. (HR. Bukhari & Muslim)',
    emoji: '🤫',
    gradient: 'from-yellow-500 to-orange-500',
  },
];

const SunnahJumatDialog: React.FC<SunnahJumatDialogProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sunnahSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sunnahSlides.length) % sunnahSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleClose = () => {
    setCurrentSlide(0);
    onClose();
  };

  const slide = sunnahSlides[currentSlide];

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden rounded-2xl shadow-2xl transition-all">
                {/* Gradient Background */}
                <div className={`bg-gradient-to-br ${slide.gradient} p-8 pb-6`}>
                  {/* Close Button */}
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>

                  {/* Slide Number */}
                  <div className="text-center mb-4">
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm font-semibold">
                      {currentSlide + 1} / {sunnahSlides.length}
                    </span>
                  </div>

                  {/* Emoji */}
                  <div className="text-center mb-6">
                    <span className="text-7xl">{slide.emoji}</span>
                  </div>

                  {/* Title */}
                  <Dialog.Title className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-white">
                      {slide.title}
                    </h3>
                  </Dialog.Title>

                  {/* Description */}
                  <p className="text-white/90 text-center leading-relaxed mb-8 px-2">
                    {slide.description}
                  </p>

                  {/* Navigation Arrows */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={prevSlide}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all disabled:opacity-50"
                    >
                      <ChevronLeftIcon className="h-6 w-6" />
                    </button>

                    {/* Dots */}
                    <div className="flex gap-2">
                      {sunnahSlides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`h-2 rounded-full transition-all ${
                            index === currentSlide
                              ? 'w-8 bg-white'
                              : 'w-2 bg-white/40 hover:bg-white/60'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={nextSlide}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
                    >
                      <ChevronRightIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Swipe hint */}
                  <p className="text-center text-white/60 text-xs">
                    Geser atau klik panah untuk lanjut
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default SunnahJumatDialog;
