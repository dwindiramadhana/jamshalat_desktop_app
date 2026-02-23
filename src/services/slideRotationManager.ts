import type { CustomSlide, SlideSchedule } from '../types/settings';

export type DisplayMode = 'main' | 'slide';

export interface RotationState {
  mode: DisplayMode;
  currentSlide: CustomSlide | null;
  slideIndex: number;
}

export class SlideRotationManager {
  private slides: CustomSlide[] = [];
  private mainScreenFrequency: number = 2;
  private slidesShownSinceMain: number = 0;
  private nextSlideIndex: number = 0;
  private shuffleMode: boolean = false;
  private shuffledOrder: number[] = [];

  constructor(
    slides: CustomSlide[],
    mainScreenFrequency: number,
    shuffleMode: boolean = false
  ) {
    this.slides = slides;
    this.mainScreenFrequency = mainScreenFrequency;
    this.shuffleMode = shuffleMode;
    this.rebuildShuffleOrder();
  }

  private rebuildShuffleOrder(): void {
    const activeSlides = this.getActiveSlides();
    this.shuffledOrder = activeSlides.map((_, idx) => idx);

    if (this.shuffleMode && this.shuffledOrder.length > 1) {
      for (let i = this.shuffledOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.shuffledOrder[i], this.shuffledOrder[j]] = [this.shuffledOrder[j], this.shuffledOrder[i]];
      }
    }
  }

  /**
   * Update slides list and config. Only resets counters if slides actually changed.
   */
  updateConfig(slides: CustomSlide[], mainScreenFrequency: number, shuffleMode: boolean): void {
    const slidesChanged = JSON.stringify(slides.map(s => s.id)) !== JSON.stringify(this.slides.map(s => s.id));
    
    this.slides = slides;
    this.mainScreenFrequency = mainScreenFrequency;
    this.shuffleMode = shuffleMode;

    if (slidesChanged) {
      this.slidesShownSinceMain = 0;
      this.nextSlideIndex = 0;
      this.rebuildShuffleOrder();
    }
  }

  /**
   * Get the next display state. Simple round-robin through active slides.
   * Pattern: Main → [frequency slides] → Main → [frequency slides] → ...
   */
  getNextMode(): RotationState {
    const activeSlides = this.getActiveSlides();

    if (activeSlides.length === 0) {
      return { mode: 'main', currentSlide: null, slideIndex: -1 };
    }

    // After showing N slides, return to main
    if (this.slidesShownSinceMain >= this.mainScreenFrequency) {
      this.slidesShownSinceMain = 0;
      return { mode: 'main', currentSlide: null, slideIndex: -1 };
    }

    // Pick next slide using simple sequential index (no weighted duplicates)
    let slideIdx: number;
    if (this.shuffleMode && this.shuffledOrder.length > 0) {
      slideIdx = this.shuffledOrder[this.nextSlideIndex % this.shuffledOrder.length];
    } else {
      slideIdx = this.nextSlideIndex % activeSlides.length;
    }

    const slide = activeSlides[slideIdx];
    this.nextSlideIndex = (this.nextSlideIndex + 1) % activeSlides.length;
    this.slidesShownSinceMain++;

    // Reshuffle when we've gone through all slides
    if (this.shuffleMode && this.nextSlideIndex === 0) {
      this.rebuildShuffleOrder();
    }

    return {
      mode: 'slide',
      currentSlide: slide,
      slideIndex: slideIdx,
    };
  }

  private getActiveSlides(): CustomSlide[] {
    return this.slides.filter(slide => {
      if (!slide.enabled) return false;
      if (!slide.schedule) return true;
      return this.isScheduledNow(slide.schedule);
    });
  }

  private isScheduledNow(schedule: SlideSchedule): boolean {
    const now = new Date();

    if (schedule.startDate) {
      const startDate = new Date(schedule.startDate);
      if (now < startDate) return false;
    }

    if (schedule.endDate) {
      const endDate = new Date(schedule.endDate);
      if (now > endDate) return false;
    }

    if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
      const currentDay = now.getDay();
      if (!schedule.daysOfWeek.includes(currentDay)) return false;
    }

    if (schedule.timeRange) {
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [startHour, startMin] = schedule.timeRange.start.split(':').map(Number);
      const [endHour, endMin] = schedule.timeRange.end.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      if (currentTime < startTime || currentTime > endTime) return false;
    }

    return true;
  }

  reset(): void {
    this.slidesShownSinceMain = 0;
    this.nextSlideIndex = 0;
    this.rebuildShuffleOrder();
  }

  getActiveSlideCount(): number {
    return this.getActiveSlides().length;
  }
}
