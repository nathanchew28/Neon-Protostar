/**
 * Tuner Service
 * Real-time pitch detection using pitchfinder and tonal
 */
export class TunerService {
    constructor(audioController) {
        this.audio = audioController;
        this.detectPitch = null;
        this.isTuning = false;
        this.oscillator = null;
    }

    start(onPitch) {
        if (!this.audio.isInitialized) return;

        this.isTuning = true;
        this.detectPitch = new PitchFinder.AMDF({
            sampleRate: this.audio.audioCtx.sampleRate,
            minFrequency: 50,
            maxFrequency: 1200
        });

        this.update(onPitch);
    }

    stop() {
        this.isTuning = false;
        this.stopTestTone();
    }

    update(onPitch) {
        if (!this.isTuning) return;

        const buffer = new Float32Array(this.audio.analyser.fftSize);
        this.audio.analyser.getFloatTimeDomainData(buffer);

        const frequency = this.detectPitch(buffer);

        if (frequency) {
            const noteData = Tonal.Note.fromFreq(frequency);
            const noteName = Tonal.Note.get(noteData).pc;
            const oct = Tonal.Note.get(noteData).oct;
            const expectedFreq = Tonal.Note.freq(noteName + oct);
            const cents = Math.floor(1200 * Math.log2(frequency / expectedFreq));

            onPitch({
                freq: frequency.toFixed(2),
                note: noteName,
                cents: cents
            });
        }

        requestAnimationFrame(() => this.update(onPitch));
    }

    playTestTone() {
        if (this.oscillator) this.stopTestTone();

        this.oscillator = this.audio.audioCtx.createOscillator();
        this.oscillator.type = 'sine';
        this.oscillator.frequency.setValueAtTime(440, this.audio.audioCtx.currentTime); // A4

        const gainNode = this.audio.audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.1, this.audio.audioCtx.currentTime);

        this.oscillator.connect(gainNode);
        gainNode.connect(this.audio.audioCtx.destination);
        this.oscillator.start();
    }

    stopTestTone() {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator.disconnect();
            this.oscillator = null;
        }
    }
}
