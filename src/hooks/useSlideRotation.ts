import { useState, useEffect, useRef } from 'react';
import { SlideRotationManager, type DisplayMode } from '../services/slideRotationManager';
import type { CustomSlide, SlideSettings } from '../types/settings';

export interface SlideRotationHookResult {
  currentMode: DisplayMode;
  currentSlide: CustomSlide | null;
  isTransitioning: boolean;
  activeSlideCount: number;
}

export function useSlideRotation(
  slideSettings: SlideSettings,
  isCountdownActive: boolean,
  enabled: boolean = true
): SlideRotationHookResult {
  const [displayState, setDisplayState] = useState<{
    mode: DisplayMode;
    slide: CustomSlide | null;
    transitioning: boolean;
    tick: number; // incrementing counter to force re-render even if same slide
  }>({ mode: 'main', slide: null, transitioning: false, tick: 0 });

  const [activeSlideCount, setActiveSlideCount] = useState(0);

  const managerRef = useRef<SlideRotationManager | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef(0);
  // Track slide IDs to detect actual changes
  const slideIdsRef = useRef('');

  // Single effect: manages the entire rotation lifecycle
  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    // Disabled or paused: show main, stop timer
    if (!slideSettings.enabled || !enabled || isCountdownActive) {
      clearTimer();
      setDisplayState(prev => 
        prev.mode === 'main' && !prev.slide && !prev.transitioning
          ? prev 
          : { mode: 'main', slide: null, transitioning: false, tick: prev.tick }
      );
      setActiveSlideCount(0);
      return clearTimer;
    }

    // Initialize or update manager
    const currentSlideIds = slideSettings.slides.map(s => s.id).join(',');
    if (!managerRef.current) {
      managerRef.current = new SlideRotationManager(
        slideSettings.slides,
        slideSettings.mainScreenFrequency,
        slideSettings.shuffleSlides
      );
    } else {
      managerRef.current.updateConfig(
        slideSettings.slides,
        slideSettings.mainScreenFrequency,
        slideSettings.shuffleSlides
      );
    }
    slideIdsRef.current = currentSlideIds;

    const count = managerRef.current.getActiveSlideCount();
    setActiveSlideCount(count);

    // No active slides: show main, stop timer
    if (count === 0) {
      clearTimer();
      setDisplayState(prev => 
        prev.mode === 'main' && !prev.slide
          ? prev 
          : { mode: 'main', slide: null, transitioning: false, tick: prev.tick }
      );
      return clearTimer;
    }

    // Core rotation function
    const advance = () => {
      if (!managerRef.current) return;

      // Brief transition fade
      setDisplayState(prev => ({ ...prev, transitioning: true }));

      setTimeout(() => {
        if (!managerRef.current) return;

        const next = managerRef.current.getNextMode();
        tickRef.current++;

        setDisplayState({
          mode: next.mode,
          slide: next.currentSlide,
          transitioning: false,
          tick: tickRef.current,
        });

        // Schedule the NEXT advance based on what we just showed
        const nextDuration = next.mode === 'main'
          ? slideSettings.mainScreenDuration * 1000
          : (next.currentSlide?.duration || slideSettings.slideDefaultDuration) * 1000;

        timerRef.current = setTimeout(advance, nextDuration);
      }, 300);
    };

    // Start the first transition after mainScreenDuration
    clearTimer();
    const initialDuration = slideSettings.mainScreenDuration * 1000;
    timerRef.current = setTimeout(advance, initialDuration);

    return clearTimer;
  }, [
    slideSettings.enabled,
    slideSettings.slides,
    slideSettings.mainScreenFrequency,
    slideSettings.shuffleSlides,
    slideSettings.mainScreenDuration,
    slideSettings.slideDefaultDuration,
    enabled,
    isCountdownActive,
  ]);

  return {
    currentMode: displayState.mode,
    currentSlide: displayState.slide,
    isTransitioning: displayState.transitioning,
    activeSlideCount,
  };
}
