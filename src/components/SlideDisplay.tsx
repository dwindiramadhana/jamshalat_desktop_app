import React from 'react';
import type { CustomSlide } from '../types/settings';

interface SlideDisplayProps {
  slide: CustomSlide;
  currentTime: Date;
  nextPrayerText?: string;
  isDarkMode: boolean;
}

const SlideDisplay: React.FC<SlideDisplayProps> = ({
  slide,
  currentTime,
  nextPrayerText,
  isDarkMode,
}) => {
  const getBackgroundStyle = (): React.CSSProperties => {
    switch (slide.backgroundType) {
      case 'image':
        return {
          backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      case 'color':
        return {
          backgroundColor: slide.backgroundColor || '#1e293b',
        };
      case 'gradient':
        return {
          background: slide.backgroundGradient
            ? `linear-gradient(135deg, ${slide.backgroundGradient.from} 0%, ${slide.backgroundGradient.to} 100%)`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        };
      default:
        return {};
    }
  };

  const getOverlayPositionClasses = (): string => {
    switch (slide.overlayPosition) {
      case 'top-left':
        return 'top-8 left-8';
      case 'top-right':
        return 'top-8 right-8';
      case 'bottom-left':
        return 'bottom-8 left-8';
      case 'bottom-right':
        return 'bottom-8 right-8';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'bottom-8 right-8';
    }
  };

  return (
    <div
      className="absolute inset-0 w-full h-full transition-opacity duration-300"
      style={getBackgroundStyle()}
    >
      {/* Dark overlay for better text readability on images */}
      {slide.backgroundType === 'image' && (
        <div className="absolute inset-0 bg-black/20" />
      )}

      {/* Optional overlay content */}
      {slide.showOverlay && (
        <div
          className={`absolute ${getOverlayPositionClasses()} backdrop-blur-md rounded-2xl shadow-2xl p-6 ${
            isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'
          }`}
        >
          <div className="space-y-2">
            {/* Logo */}
            {slide.overlayContent.showLogo && (
              <div className="flex justify-center mb-3">
                <img 
                  src={isDarkMode ? "/jamshalatapplogoWhite.png" : "/jamshalatapplogo.png"} 
                  alt="Jam Shalat Logo" 
                  className="h-12 w-auto" 
                />
              </div>
            )}

            {/* Current Time */}
            {slide.overlayContent.showTime && (
              <div className="text-center">
                <div className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {String(currentTime.getHours()).padStart(2, '0')}:{String(currentTime.getMinutes()).padStart(2, '0')}:{String(currentTime.getSeconds()).padStart(2, '0')}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            )}

            {/* Next Prayer */}
            {slide.overlayContent.showNextPrayer && nextPrayerText && (
              <div className={`text-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {nextPrayerText}
              </div>
            )}

            {/* Custom Text */}
            {slide.overlayContent.customText && (
              <div className={`text-center text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {slide.overlayContent.customText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideDisplay;
