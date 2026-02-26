const AUDIO_FILES = {
  countdown: '/audio/3-detik-countdown.mp3',
  adzan: '/audio/adzan.mp3',
  adzanSubuh: '/audio/adzan-subuh.mp3',
  beep: '/audio/beep.mp3',
} as const;

type AudioKey = keyof typeof AUDIO_FILES;

class AudioService {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private currentAudio: HTMLAudioElement | null = null;
  private _volume: number = 0.8;

  get volume(): number {
    return this._volume;
  }

  set volume(value: number) {
    this._volume = Math.max(0, Math.min(1, value));
    if (this.currentAudio) {
      this.currentAudio.volume = this._volume;
    }
  }

  private getAudio(key: AudioKey): HTMLAudioElement {
    const cached = this.audioCache.get(key);
    if (cached) return cached;

    const audio = new Audio(AUDIO_FILES[key]);
    audio.preload = 'auto';
    this.audioCache.set(key, audio);
    return audio;
  }

  preloadAll(): void {
    (Object.keys(AUDIO_FILES) as AudioKey[]).forEach(key => {
      this.getAudio(key);
    });
  }

  async play(key: AudioKey): Promise<void> {
    try {
      this.stopCurrent();
      const audio = this.getAudio(key);
      audio.currentTime = 0;
      audio.volume = this._volume;
      this.currentAudio = audio;
      await audio.play();
    } catch (error) {
      console.warn(`[AudioService] Failed to play ${key}:`, error);
    }
  }

  stopCurrent(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  onEnded(callback: () => void): void {
    if (this.currentAudio) {
      this.currentAudio.onended = callback;
    }
  }
}

export const audioService = new AudioService();
export type { AudioKey };
