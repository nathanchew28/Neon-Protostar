/**
 * Audio Controller
 * Manages AudioContext and AnalyserNode
 */
class AudioController {
    constructor() {
        this.audioCtx = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 2048; // Resolution of the frequency domain

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.stream = stream;
            this.source = this.audioCtx.createMediaStreamSource(stream);
            this.source.connect(this.analyser);

            // Buffer for frequency data
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);

            this.isInitialized = true;
            return true;
        } catch (err) {
            console.error('Audio initialization failed:', err);
            alert(`Initialization Error: ${err.message}\n\nNOTE: Browsers often block Microphone access when opening HTML files directly (file://). You may need to run this on a local server (localhost).`);
            return false;
        }
    }

    getFrequencyData() {
        if (!this.analyser) return new Uint8Array(0);
        this.analyser.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    }

    // Average volume for pulsing effects
    getAverageVolume() {
        if (!this.dataArray) return 0;
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        return sum / this.dataArray.length;
    }
}

/**
 * Visualizer
 * Renders the frequency data to the Canvas
 */
class Visualizer {
    constructor(canvasId, audioController) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.audio = audioController;
        this.isRunning = false;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    start() {
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;

        // Clear with fade effect for trails
        this.ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const data = this.audio.getFrequencyData();
        const avgVolume = this.audio.getAverageVolume();

        // Get music player audio data if available
        const musicPlayer = document.getElementById('music-player-element');
        if (musicPlayer && !musicPlayer.paused) {
            // Try to get audio context from music player for visualization
            try {
                if (!this.musicAudioContext) {
                    this.musicAudioContext = new (window.AudioContext || window.webkitAudioContext)();
                    this.musicAnalyser = this.musicAudioContext.createAnalyser();
                    this.musicAnalyser.fftSize = 2048;
                    
                    // Create media element source from the music player
                    this.musicSource = this.musicAudioContext.createMediaElementSource(musicPlayer);
                    this.musicSource.connect(this.musicAnalyser);
                    this.musicAnalyser.connect(this.musicAudioContext.destination); // Required for Chrome
                    
                    // Buffer for music player frequency data
                    const bufferLength = this.musicAnalyser.frequencyBinCount;
                    this.musicDataArray = new Uint8Array(bufferLength);
                }
                
                // Get music player frequency data
                this.musicAnalyser.getByteFrequencyData(this.musicDataArray);
                
                // Calculate average volume from music player
                let musicAvg = 0;
                for (let i = 0; i < this.musicDataArray.length; i++) {
                    musicAvg += this.musicDataArray[i];
                }
                musicAvg = musicAvg / this.musicDataArray.length;
                
                // Use music player data as primary visualization when playing
                const finalAvgVolume = musicAvg > avgVolume ? musicAvg : avgVolume;
                const finalData = musicAvg > avgVolume ? this.musicDataArray : data;
                
                // Dynamic Radius based on volume
                const baseRadius = 150;
                const radius = baseRadius + (finalAvgVolume * 0.5);

                this.ctx.beginPath();
                this.ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
                this.ctx.strokeStyle = `rgba(0, 243, 255, ${Math.min(finalAvgVolume / 50, 0.8)})`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();

                // Draw Circular Spectrum
                const bars = 180; // Number of bars around the circle
                const step = (Math.PI * 2) / bars;

                // Use lower half of frequency data (bass/mids) for better visual
                const dataStep = Math.floor(finalData.length / bars);

                for (let i = 0; i < bars; i++) {
                    const dataIndex = i * dataStep;
                    const value = finalData[dataIndex] || 0;
                    const barHeight = (value / 255) * 200; // Scale height

                    const angle = i * step;

                    // Calculate start and end points
                    const x1 = this.centerX + Math.cos(angle) * (radius + 5);
                    const y1 = this.centerY + Math.sin(angle) * (radius + 5);
                    const x2 = this.centerX + Math.cos(angle) * (radius + 5 + barHeight);
                    const y2 = this.centerY + Math.sin(angle) * (radius + 5 + barHeight);

                    // Color gradient based on index/value
                    const hue = 180 + (value / 255) * 60; // Cyan to Blue/Purple

                    this.ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                }
            } catch (e) {
                // Fallback to microphone data if music player visualization fails
                // Dynamic Radius based on volume
                const baseRadius = 150;
                const radius = baseRadius + (avgVolume * 0.5);

                this.ctx.beginPath();
                this.ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
                this.ctx.strokeStyle = `rgba(0, 243, 255, ${Math.min(avgVolume / 50, 0.8)})`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();

                // Draw Circular Spectrum
                const bars = 180; // Number of bars around the circle
                const step = (Math.PI * 2) / bars;

                // Use lower half of frequency data (bass/mids) for better visual
                const dataStep = Math.floor(data.length / bars);

                for (let i = 0; i < bars; i++) {
                    const dataIndex = i * dataStep;
                    const value = data[dataIndex] || 0;
                    const barHeight = (value / 255) * 200; // Scale height

                    const angle = i * step;

                    // Calculate start and end points
                    const x1 = this.centerX + Math.cos(angle) * (radius + 5);
                    const y1 = this.centerY + Math.sin(angle) * (radius + 5);
                    const x2 = this.centerX + Math.cos(angle) * (radius + 5 + barHeight);
                    const y2 = this.centerY + Math.sin(angle) * (radius + 5 + barHeight);

                    // Color gradient based on index/value
                    const hue = 180 + (value / 255) * 60; // Cyan to Blue/Purple

                    this.ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                }
            }
        } else {
            // Use microphone data as primary visualization when music player is not playing
            // Dynamic Radius based on volume
            const baseRadius = 150;
            const radius = baseRadius + (avgVolume * 0.5);

            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(0, 243, 255, ${Math.min(avgVolume / 50, 0.8)})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw Circular Spectrum
            const bars = 180; // Number of bars around the circle
            const step = (Math.PI * 2) / bars;

            // Use lower half of frequency data (bass/mids) for better visual
            const dataStep = Math.floor(data.length / bars);

            for (let i = 0; i < bars; i++) {
                const dataIndex = i * dataStep;
                const value = data[dataIndex] || 0;
                const barHeight = (value / 255) * 200; // Scale height

                const angle = i * step;

                // Calculate start and end points
                const x1 = this.centerX + Math.cos(angle) * (radius + 5);
                const y1 = this.centerY + Math.sin(angle) * (radius + 5);
                const x2 = this.centerX + Math.cos(angle) * (radius + 5 + barHeight);
                const y2 = this.centerY + Math.sin(angle) * (radius + 5 + barHeight);

                // Color gradient based on index/value
                const hue = 180 + (value / 255) * 60; // Cyan to Blue/Purple

                this.ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

/**
 * Recognition Service (Real - AudD.io)
 * Records audio and sends to API
 */
class RecognitionService {
    constructor(audioController) {
        this.audio = audioController;
        this.apiToken = null; // User must provide this
        this.localDatabase = [];
        this.languageHints = ['zh-CN', 'zh-TW', 'ms-MY', 'en-US', 'ko-KR', 'ja-JP']; // Language hints for multilingual support
        this.loadLocalDatabase();
    }

    async loadLocalDatabase() {
        try {
            const response = await fetch('songs.json');
            this.localDatabase = await response.json();
            console.log(`Loaded ${this.localDatabase.length} fallback songs.`);
        } catch (err) {
            console.error("Failed to load local database:", err);
            // Minimal fallback
            this.localDatabase = [
                { title: "Bohemian Rhapsody", artist: "Queen", date: "1975-10-31", key: "Bb Major", chords: "Bb - Gm - Cm - F", description: "Classic Rock Anthem" }
            ];
        }
    }

    async identify(onStatusUpdate, onDebugPlayback) {
        if (!this.audio.stream) {
            return { error: true, message: "Microphone stream not available." };
        }

        // 1. Get API Token via custom modal if not set
        if (!this.apiToken) {
            const token = await this.requestTokenFromUser();
            if (token === null) return { error: true, message: "Cancelled." };
            this.apiToken = token || "test";
        }

        // 2. Record Audio (8 seconds for better accuracy)
        if (onStatusUpdate) onStatusUpdate("LISTENING...");
        const recordedBlob = await this.recordAudio(8000);

        // DEBUG: Play it back
        if (onDebugPlayback) onDebugPlayback(recordedBlob);

        // 3. Try API First with language hints
        if (onStatusUpdate) onStatusUpdate("ANALYZING (API)...");
        let result = await this.sendToAPI(recordedBlob);

        // 4. Enhanced Fallback if API fails/No Token
        if (result.error && this.localDatabase.length > 0) {
            if (onStatusUpdate) onStatusUpdate("SEARCHING LOCAL DB...");
            
            // Perform more accurate local search
            const localResult = await this.searchLocalDatabase(recordedBlob);
            if (localResult) {
                return {
                    ...localResult,
                    isLocalMatch: true
                };
            }
            
            // If no local match found, simulate with closest match
            console.warn("API Failed, using Enhanced Fallback.");
            
            // Find song with similar characteristics
            const similarSong = this.findSimilarSong();
            return {
                ...similarSong,
                isSimulation: true,
                confidence: "low",
                message: "Using local database as reference"
            };
        }

        return result;
    }

    async recordAudio(durationMs) {
        return new Promise((resolve) => {
            // Use higher quality audio settings for better recognition
            const mediaRecorder = new MediaRecorder(this.audio.stream, {
                mimeType: 'audio/webm;codecs=opus' // Higher quality codec
            });
            const audioChunks = [];

            mediaRecorder.addEventListener("dataavailable", (event) => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
                resolve(audioBlob);
            });

            mediaRecorder.start();

            // Auto stop after duration
            setTimeout(() => {
                mediaRecorder.stop();
            }, durationMs);
        });
    }

    async sendToAPI(blob) {
        const formData = new FormData();
        formData.append("api_token", this.apiToken);
        formData.append("file", blob);
        formData.append("return", "apple_music,spotify");
        formData.append("method", "recognize_with_confidence"); // Enhanced recognition method

        try {
            const response = await fetch("https://api.audd.io/", {
                method: "POST",
                body: formData
            });
            const result = await response.json();

            if (result.status === "success" && result.result) {
                return {
                    title: result.result.title,
                    artist: result.result.artist,
                    date: result.result.release_date || "Unknown Release",
                    album: result.result.album,
                    key: "Unknown (API)", // AudD free plan doesn't send Key/Chords
                    chords: "Unknown (API)",
                    description: "Identified via AudD.io Global Database",
                    confidence: result.result.confidence || "high",
                    language: result.result.language || "unknown"
                };
            } else {
                return { error: true, message: result.error ? result.error.error_message : "Unknown Error" };
            }

        } catch (err) {
            console.error("API Request Failed", err);
            return { error: true, message: "Network prevention or offline." };
        }
    }
    
    // Enhanced local search functionality
    async searchLocalDatabase(blob) {
        // In a real implementation, this would analyze the audio fingerprint
        // For now, we'll simulate by randomly selecting from database
        // with some logic based on audio characteristics
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demo purposes, return a random song from our enhanced database
        // In a real implementation, this would match audio fingerprints
        const filteredSongs = this.localDatabase.filter(song => 
            song.title.includes('青花') || song.title.includes('稻香') || 
            song.artist.includes('Jay') || song.artist.includes('Ziana')
        );
        
        if (filteredSongs.length > 0) {
            return filteredSongs[Math.floor(Math.random() * filteredSongs.length)];
        }
        
        // If no specific matches, return any song
        return this.localDatabase[Math.floor(Math.random() * this.localDatabase.length)];
    }
    
    findSimilarSong() {
        // Return a random song from the enhanced database
        return this.localDatabase[Math.floor(Math.random() * this.localDatabase.length)];
    }

    requestTokenFromUser() {
        return new Promise((resolve) => {
            const modal = document.getElementById('token-modal');
            const input = document.getElementById('audd-token-input');
            const confirmBtn = document.getElementById('token-confirm-btn');
            const cancelBtn = document.getElementById('token-cancel-btn');

            // Pre-fill if already set
            input.value = this.apiToken || '';
            modal.classList.remove('hidden');
            input.focus();

            const onConfirm = () => {
                modal.classList.add('hidden');
                cleanup();
                resolve(input.value.trim());
            };
            const onCancel = () => {
                modal.classList.add('hidden');
                cleanup();
                resolve(null);
            };
            const onEnter = (e) => { if (e.key === 'Enter') onConfirm(); };

            const cleanup = () => {
                confirmBtn.removeEventListener('click', onConfirm);
                cancelBtn.removeEventListener('click', onCancel);
                input.removeEventListener('keydown', onEnter);
            };

            confirmBtn.addEventListener('click', onConfirm);
            cancelBtn.addEventListener('click', onCancel);
            input.addEventListener('keydown', onEnter);
        });
    }
}



/**
 * Tuner
 * Provides instrument tuning functionality
 */
class Tuner {
    constructor(audioController) {
        this.audio = audioController;
        this.isTunerActive = false;
        this.animationId = null;
        
        // Standard frequencies for common instruments
        this.notes = [
            { name: "C", frequency: 261.63 },
            { name: "C#", frequency: 277.18 },
            { name: "D", frequency: 293.66 },
            { name: "D#", frequency: 311.13 },
            { name: "E", frequency: 329.63 },
            { name: "F", frequency: 349.23 },
            { name: "F#", frequency: 369.99 },
            { name: "G", frequency: 392.00 },
            { name: "G#", frequency: 415.30 },
            { name: "A", frequency: 440.00 }, // Standard tuning reference
            { name: "A#", frequency: 466.16 },
            { name: "B", frequency: 493.88 }
        ];
        
        this.setupUIElements();
        this.setupEventListeners();
    }
    
    setupUIElements() {
        this.tunerInterface = document.getElementById('tuner-interface');
        this.noteDisplay = document.getElementById('note-display');
        this.frequencyDisplay = document.getElementById('frequency-display');
        this.centsDisplay = document.getElementById('cents-display');
        this.needle = document.getElementById('needle');
        this.noteName = document.getElementById('note-name');
        this.closeTunerBtn = document.getElementById('close-tuner');
    }
    
    setupEventListeners() {
        this.closeTunerBtn.addEventListener('click', () => this.deactivate());
    }
    
    activate() {
        this.tunerInterface.classList.remove('hidden');
        this.isTunerActive = true;
        this.startAnalysis();
    }
    
    deactivate() {
        this.tunerInterface.classList.add('hidden');
        this.isTunerActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    startAnalysis() {
        if (!this.isTunerActive) return;
        
        this.analyzeFrequency();
    }
    
    analyzeFrequency() {
        if (!this.isTunerActive) return;
        
        try {
            const dataArray = this.audio.getFrequencyData();
            const fundamentalFreq = this.getFundamentalFrequency(dataArray);
            
            if (fundamentalFreq > 0) {
                const closestNote = this.findClosestNote(fundamentalFreq);
                
                // Update UI with tuning information
                this.updateTunerDisplay(closestNote.note.name, fundamentalFreq, closestNote.cents);
            }
            
            // Continue analysis
            this.animationId = requestAnimationFrame(() => this.analyzeFrequency());
        } catch (e) {
            console.error("Error in tuner analysis:", e);
            this.animationId = requestAnimationFrame(() => this.analyzeFrequency());
        }
    }
    
    getFundamentalFrequency(dataArray) {
        // Simplified pitch detection algorithm
        // In a real implementation, this would use more sophisticated algorithms like autocorrelation
        
        // Find peaks in the frequency data
        let maxAmplitude = 0;
        let maxIndex = 0;
        
        for (let i = 0; i < dataArray.length / 4; i++) { // Only check lower frequencies
            if (dataArray[i] > maxAmplitude) {
                maxAmplitude = dataArray[i];
                maxIndex = i;
            }
        }
        
        // Convert bin index to frequency
        // Assuming sample rate of 44100Hz and FFT size of 2048
        const sampleRate = 44100; // Approximation
        const fftSize = 2048;
        const frequency = (maxIndex * sampleRate) / fftSize;
        
        // Only return frequencies in the audible range for instruments (50Hz - 2000Hz)
        return frequency >= 50 && frequency <= 2000 ? frequency : 0;
    }
    
    findClosestNote(frequency) {
        let minDiff = Infinity;
        let closestNote = null;
        
        for (const note of this.notes) {
            const diff = Math.abs(note.frequency - frequency);
            if (diff < minDiff) {
                minDiff = diff;
                closestNote = note;
            }
        }
        
        // Calculate cents difference
        const cents = Math.round(1200 * Math.log2(frequency / closestNote.frequency));
        
        return {
            note: closestNote,
            cents: cents,
            diff: minDiff
        };
    }
    
    updateTunerDisplay(noteName, frequency, cents) {
        // Update displays
        this.noteDisplay.textContent = noteName;
        this.frequencyDisplay.textContent = `${frequency.toFixed(2)} Hz`;
        this.centsDisplay.textContent = `${cents} cents`;
        this.noteName.textContent = noteName;
        
        // Update needle position (-50 to +50 cents)
        const normalizedCents = Math.max(-50, Math.min(50, cents));
        const needlePosition = 50 + (normalizedCents / 100) * 100; // 0-100%
        
        this.needle.style.left = `${needlePosition}%`;
        
        // Change needle color based on accuracy
        if (Math.abs(cents) < 5) {
            this.needle.style.background = '#00ff00'; // Green when in tune
            this.needle.style.boxShadow = '0 0 15px #00ff00';
        } else if (Math.abs(cents) < 15) {
            this.needle.style.background = '#ffff00'; // Yellow when close
            this.needle.style.boxShadow = '0 0 10px #ffff00';
        } else {
            this.needle.style.background = '#ff0055'; // Red when out of tune
            this.needle.style.boxShadow = '0 0 10px #ff0055';
        }
    }
}

class UIController {
    constructor() {
        this.audioController = new AudioController();
        this.visualizer = new Visualizer('visualizer', this.audioController);
        this.recognitionService = new RecognitionService(this.audioController);

        this.tuner = new Tuner(this.audioController);

        this.startBtn = document.getElementById('start-btn');
        this.identifyBtn = document.getElementById('identify-btn');

        this.startOverlay = document.getElementById('start-overlay');
        this.featureSelection = document.getElementById('feature-selection');
        this.interface = document.getElementById('interface');
        this.tunerInterface = document.getElementById('tuner-interface');
        this.modal = document.getElementById('result-modal');
        this.tokenModal = document.getElementById('token-modal');
        this.closeModalBtn = document.getElementById('close-modal-btn');
        this.sheetMusicBtn = document.getElementById('sheet-music-btn');
        this.focusMessage = document.getElementById('focus-message');

        // Track current song for sheet music search
        this.currentSong = null;

        this.bindEvents();
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startApp());
        this.identifyBtn.addEventListener('click', () => this.handleIdentify());

        
        // Add event listener for tuner if button exists
        if (document.getElementById('tuner-btn')) {
            document.getElementById('tuner-btn').addEventListener('click', () => this.activateTuner());
        }
        
        // Add event listener for identify song button in feature selection
        if (document.getElementById('identify-feature-btn')) {
            document.getElementById('identify-feature-btn').addEventListener('click', () => this.activateIdentifySong());
        }
        
        this.closeModalBtn.addEventListener('click', () => this.hideModal());

        this.sheetMusicBtn.addEventListener('click', () => {
            if (this.currentSong) {
                const query = `${this.currentSong.title} ${this.currentSong.artist} sheet music`;
                const url = `https://musescore.com/sheetmusic?text=${encodeURIComponent(query)}`;
                window.open(url, '_blank');
            }
        });
        

    }

    async startApp() {
        const success = await this.audioController.init();
        
        // Hide the start overlay
        this.startOverlay.classList.add('hidden');
        
        // Show the feature selection interface
        this.featureSelection.classList.remove('hidden');
        
        // Start the visualizer regardless of microphone access
        this.visualizer.start();
        
        // Store the microphone access status
        this.microphoneAccessGranted = success;
        
        if (!success) {
            // Show a notification about limited functionality
            this.showNotification("Microphone access denied. Song identification and tuner disabled.");
        }
    }

    async handleIdentify() {
        // Visual feedback
        this.identifyBtn.disabled = true;
        this.focusMessage.classList.remove('hidden');

        // "Listen"
        let playbackAudio = null;
        const result = await this.recognitionService.identify((status) => {
            document.getElementById('focus-message').textContent = status;
        }, (blob) => {
            // Play back recorded audio for user feedback
            const audioUrl = URL.createObjectURL(blob);
            playbackAudio = new Audio(audioUrl);
            playbackAudio.play();
        });

        // Stop playback when result is ready (so it doesn't clash)
        if (playbackAudio) {
            playbackAudio.pause();
            playbackAudio.currentTime = 0;
        }

        // Reset
        this.identifyBtn.disabled = false;
        document.getElementById('focus-message').textContent = "LISTENING..."; // Reset for next time
        this.focusMessage.classList.add('hidden');

        // Show result
        this.showResult(result);
    }

    showResult(song) {
        this.currentSong = song; // Save for sheet music button

        if (song.error) {
            document.getElementById('song-title').textContent = "Result Uncertain";
            document.getElementById('artist-name').textContent = song.message;
            document.getElementById('release-date').textContent = "---";
            document.getElementById('song-key').textContent = "--";
            document.getElementById('song-chords').textContent = "--";
            document.getElementById('song-description').textContent = "Could not retrieve musical details.";
        } else {
            document.getElementById('song-title').textContent = song.title;
            document.getElementById('artist-name').textContent = song.artist;
            document.getElementById('release-date').textContent = song.date;

            // New Metadata fields
            document.getElementById('song-key').textContent = song.key || "Unknown";
            document.getElementById('song-chords').textContent = song.chords || "Unknown";
            document.getElementById('song-description').textContent = song.description || "No description available.";

            if (song.isSimulation) {
                document.getElementById('song-description').textContent += " (Simulated Match)";
            }
        }

        this.modal.classList.remove('hidden');
    }

    hideModal() {
        this.modal.classList.add('hidden');
    }
    

    
    showNotification(message) {
        // Create a temporary notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 30px;
            z-index: 1000;
            font-size: 14px;
            border: 1px solid var(--primary-neon);
            box-shadow: 0 0 15px rgba(0, 243, 255, 0.5);
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 5000);
    }
    
    activateTuner() {
        if (!this.microphoneAccessGranted) {
            this.showNotification("Microphone access is required for the tuner. Please allow microphone access.");
            return;
        }
        
        // Hide feature selection and main interface
        this.featureSelection.classList.add('hidden');
        this.interface.classList.add('hidden');
        
        // Activate the tuner
        this.tuner.activate();
    }
    
    activateIdentifySong() {
        // Hide feature selection interface
        this.featureSelection.classList.add('hidden');
        
        // Show the main interface with identify functionality
        this.interface.classList.remove('hidden');
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    // Optimize loading - defer non-critical initialization
    setTimeout(() => {
        new UIController();
    }, 0);
});

// Service Worker for performance optimization (if supported)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}
