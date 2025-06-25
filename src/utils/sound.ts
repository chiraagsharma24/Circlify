// Sound effect utilities using Web Audio API
class SoundManager {
  private audioContext: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  playTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.log('Audio not supported or blocked');
    }
  }

  playSuccess(): void {
    // Play a pleasant success chord
    this.playTone(523.25, 0.2); // C5
    setTimeout(() => this.playTone(659.25, 0.2), 100); // E5
    setTimeout(() => this.playTone(783.99, 0.3), 200); // G5
  }

  playPerfect(): void {
    // Play an even more exciting perfect sound
    this.playTone(523.25, 0.15); // C5
    setTimeout(() => this.playTone(659.25, 0.15), 75); // E5
    setTimeout(() => this.playTone(783.99, 0.15), 150); // G5
    setTimeout(() => this.playTone(1046.50, 0.4), 225); // C6
  }

  playNewRecord(): void {
    // Play fanfare for new record
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
    notes.forEach((note, index) => {
      setTimeout(() => this.playTone(note, 0.2), index * 100);
    });
  }
}

export const soundManager = new SoundManager();