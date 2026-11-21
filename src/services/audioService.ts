class AudioService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private announcementQueue: string[] = [];
  private isSpeaking: boolean = false;

  constructor() {
    // Check saved mute / volume preferences
    try {
      const savedMute = localStorage.getItem('cjia_audio_muted');
      if (savedMute !== null) this.isMuted = savedMute === 'true';
      const savedVol = localStorage.getItem('cjia_audio_volume');
      if (savedVol !== null) this.volume = parseFloat(savedVol);
    } catch {
      // Fallback
    }
  }

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('cjia_audio_muted', String(muted));
    } catch {}
    if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('cjia_audio_volume', String(this.volume));
    } catch {}
  }

  /**
   * Plays the iconic dual-tone airport announcement chime (e.g. F4 -> C5)
   */
  public playAirportChime(): Promise<void> {
    if (this.isMuted) return Promise.resolve();
    this.initAudio();
    if (!this.audioCtx) return Promise.resolve();

    return new Promise((resolve) => {
      try {
        const now = this.audioCtx!.currentTime;
        const gainNode = this.audioCtx!.createGain();
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.exponentialRampToValueAtTime(0.3 * this.volume, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        gainNode.connect(this.audioCtx!.destination);

        // Tone 1: F4 (349.23 Hz)
        const osc1 = this.audioCtx!.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(349.23, now);
        osc1.connect(gainNode);
        osc1.start(now);
        osc1.stop(now + 0.45);

        // Tone 2: C5 (523.25 Hz)
        const osc2 = this.audioCtx!.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(523.25, now + 0.35);
        osc2.connect(gainNode);
        osc2.start(now + 0.35);
        osc2.stop(now + 1.2);

        setTimeout(() => {
          resolve();
        }, 1100);
      } catch {
        resolve();
      }
    });
  }

  /**
   * Plays an urgent ATC or Cockpit master caution alert
   */
  public playAlertBeep(isUrgent = false) {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = isUrgent ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(isUrgent ? 880 : 587.33, now);
      if (isUrgent) {
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);
      }

      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  /**
   * Text-to-speech airport public announcement
   */
  public async speakAnnouncement(text: string, withChime: boolean = true) {
    if (this.isMuted) return;

    if (withChime) {
      await this.playAirportChime();
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = this.volume;
    utterance.rate = 0.95; // Slightly deliberate for clear airport announcements
    utterance.pitch = 1.05;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny') || v.name.includes('David')));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      this.isSpeaking = false;
      this.processNextInQueue();
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
      this.processNextInQueue();
    };

    if (this.isSpeaking) {
      this.announcementQueue.push(text);
    } else {
      this.isSpeaking = true;
      window.speechSynthesis.speak(utterance);
    }
  }

  private processNextInQueue() {
    if (this.announcementQueue.length > 0 && !this.isMuted) {
      const nextText = this.announcementQueue.shift();
      if (nextText) {
        this.speakAnnouncement(nextText, true);
      }
    }
  }

  /**
   * ATC Radio transmission effect (slightly higher speed & robotic)
   */
  public speakRadioTransmission(callsign: string, message: string) {
    if (this.isMuted) return;
    this.playAlertBeep(false);

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const fullMsg = `${callsign}, ${message}`;
    const utterance = new SpeechSynthesisUtterance(fullMsg);
    utterance.volume = this.volume * 0.9;
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    window.speechSynthesis.speak(utterance);
  }
}

export const audioService = new AudioService();
