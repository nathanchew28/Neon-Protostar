/**
 * Audio Controller
 * Manages AudioContext and AnalyserNode
 * OPTIMIZED FOR SHARPER LISTENING (Raw Audio)
 */
export class AudioController {
    constructor() {
        this.audioCtx = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return true;

        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 48000, // High fidelity sample rate
                latencyHint: 'interactive'
            });
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 4096; // Higher resolution for sharper frequency detection
            this.analyser.smoothingTimeConstant = 0.85;

            // Request raw audio for better music recognition (bypassing speech filters)
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    channelCount: 2
                }
            });

            this.stream = stream;
            this.source = this.audioCtx.createMediaStreamSource(stream);
            this.source.connect(this.analyser);

            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);

            this.isInitialized = true;
            return true;
        } catch (err) {
            console.error('Audio initialization failed:', err);
            return false;
        }
    }

    getFrequencyData() {
        if (!this.analyser) return new Uint8Array(0);
        this.analyser.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    }

    getAverageVolume() {
        if (!this.dataArray) return 0;
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        return sum / this.dataArray.length;
    }
}
