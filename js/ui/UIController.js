import { AudioController } from '../services/AudioController.js';
import { Visualizer } from './Visualizer.js';
import { RecognitionService } from '../services/RecognitionService.js';
import { TunerService } from '../services/TunerService.js';

/**
 * UI Controller
 */
export class UIController {
    constructor() {
        this.audioController = new AudioController();
        this.visualizer = new Visualizer('visualizer', this.audioController);
        this.recognitionService = new RecognitionService(this.audioController);
        this.tunerService = new TunerService(this.audioController);

        this.startBtn = document.getElementById('start-btn');
        this.identifyBtn = document.getElementById('identify-btn');
        this.tunerToggleBtn = document.getElementById('tuner-toggle-btn');
        this.syncBtn = document.getElementById('sync-lattice-btn');
        this.syncText = document.getElementById('sync-status-text');
        this.startOverlay = document.getElementById('start-overlay');
        this.launchOptions = document.getElementById('launch-options');
        this.interface = document.getElementById('interface');
        this.modal = document.getElementById('result-modal');
        this.closeModalBtn = document.getElementById('close-modal-btn');
        this.sheetMusicBtn = document.getElementById('sheet-music-btn');
        this.focusMessage = document.getElementById('focus-message');

        // Launchpad Buttons
        this.launchIdentifyBtn = document.getElementById('launch-identify');
        this.launchTunerBtn = document.getElementById('launch-tuner');
        this.launchExploreBtn = document.getElementById('launch-explore');

        // Tuner UI elements
        this.tunerOverlay = document.getElementById('tuner-overlay');
        this.tunerNote = document.getElementById('tuner-note');
        this.tunerNeedle = document.getElementById('tuner-needle');
        this.tunerFreq = document.getElementById('tuner-freq');
        this.tunerCents = document.getElementById('tuner-cents');
        this.testToneBtn = document.getElementById('test-tone-btn');
        this.isTunerActive = false;

        this.currentSong = null;
        this.bindEvents();
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.activateLaunchpad());

        this.launchIdentifyBtn.addEventListener('click', () => this.enterMainInterface('identify'));
        this.launchTunerBtn.addEventListener('click', () => this.enterMainInterface('tuner'));
        this.launchExploreBtn.addEventListener('click', () => this.enterMainInterface('explore'));

        this.identifyBtn.addEventListener('click', () => this.handleIdentify());
        this.tunerToggleBtn.addEventListener('click', () => this.toggleTuner());
        this.closeModalBtn.addEventListener('click', () => this.hideModal());
        this.syncBtn.addEventListener('click', () => this.handleManualSync());

        // Test Tone Listener
        if (this.testToneBtn) {
            this.testToneBtn.addEventListener('mousedown', () => this.tunerService.playTestTone());
            this.testToneBtn.addEventListener('mouseup', () => this.tunerService.stopTestTone());
            this.testToneBtn.addEventListener('mouseleave', () => this.tunerService.stopTestTone());
            this.testToneBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.tunerService.playTestTone(); });
            this.testToneBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.tunerService.stopTestTone(); });
        }

        this.sheetMusicBtn.addEventListener('click', () => {
            if (this.currentSong) {
                const query = `${this.currentSong.title} ${this.currentSong.artist} sheet music`;
                window.open(`https://musescore.com/sheetmusic?text=${encodeURIComponent(query)}`, '_blank');
            }
        });

        // PWA Install logic
        this.installBtn = document.getElementById('install-btn');
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.installBtn.classList.remove('hidden');
        });
        this.installBtn.addEventListener('click', async () => {
            if (this.deferredPrompt) {
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                if (outcome === 'accepted') this.installBtn.classList.add('hidden');
                this.deferredPrompt = null;
            }
        });

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./service-worker.js');
            });
        }
    }

    activateLaunchpad() {
        this.startBtn.classList.add('hidden');
        this.launchOptions.classList.remove('hidden');
    }

    async enterMainInterface(mode) {
        // Mode-specific Audio Init
        if (mode === 'identify' || mode === 'tuner') {
            await this.audioController.init().catch(() => { });
        }

        this.startOverlay.classList.add('hidden');
        this.interface.classList.remove('hidden');

        if (this.audioController.isInitialized) {
            this.visualizer.start();
        }

        if (this.recognitionService.checkSyncExpiry()) this.handleManualSync();

        // Auto-trigger feature based on mode
        if (mode === 'identify' && this.audioController.isInitialized) {
            this.handleIdentify();
        } else if (mode === 'tuner' && this.audioController.isInitialized) {
            this.toggleTuner();
        }
    }

    async toggleTuner() {
        if (!this.audioController.isInitialized) {
            const success = await this.audioController.init();
            if (!success) {
                alert("Microphone access is required for the tuner. Please enable it in your browser settings.");
                return;
            }
            this.visualizer.start();
        }

        if (this.isTunerActive) {
            this.tunerService.stop();
            this.tunerOverlay.classList.add('hidden');
            this.tunerToggleBtn.classList.remove('active');
            this.isTunerActive = false;
        } else {
            // Close modal if open
            this.hideModal();
            this.tunerOverlay.classList.remove('hidden');
            this.tunerToggleBtn.classList.add('active');
            this.isTunerActive = true;

            this.tunerService.start((data) => {
                this.tunerNote.textContent = data.note;
                this.tunerFreq.textContent = `${data.freq} Hz`;
                this.tunerCents.textContent = `${data.cents} cents`;

                // Needle rotation: -50 to +50 cents = -90deg to +90deg
                const rotation = (data.cents / 50) * 90;
                this.tunerNeedle.style.transform = `translateX(-50%) rotate(${rotation}deg)`;

                if (Math.abs(data.cents) < 5) {
                    this.tunerOverlay.classList.add('in-tune');
                } else {
                    this.tunerOverlay.classList.remove('in-tune');
                }
            });
        }
    }

    async startApp() {
        // Decoupled startup - try to init audio but proceed regardless
        await this.audioController.init().catch(() => { });

        this.startOverlay.classList.add('hidden');
        this.interface.classList.remove('hidden');

        // Visualizer only starts if audio is actually ready
        if (this.audioController.isInitialized) {
            this.visualizer.start();
        }

        if (this.recognitionService.checkSyncExpiry()) this.handleManualSync();
    }

    async handleManualSync() {
        this.syncBtn.classList.add('syncing');
        this.syncText.textContent = "Updating...";
        await this.recognitionService.syncLattice((msg) => this.syncText.textContent = msg);
        this.syncBtn.classList.remove('syncing');
        const lastSync = localStorage.getItem('lattice-last-sync');
        if (lastSync) this.syncText.textContent = `Sync: ${new Date(parseInt(lastSync)).toLocaleDateString()}`;
    }

    async handleIdentify() {
        if (!this.audioController.isInitialized) {
            const success = await this.audioController.init();
            if (!success) {
                this.focusMessage.textContent = "MICROPHONE CHECK FAILED";
                this.focusMessage.classList.remove('hidden');
                setTimeout(() => this.focusMessage.classList.add('hidden'), 3000);
                return;
            }
            this.visualizer.start();
        }

        if (this.isTunerActive) this.toggleTuner();
        this.identifyBtn.disabled = true;
        this.focusMessage.classList.remove('hidden');
        const result = await this.recognitionService.identify((status) => {
            this.focusMessage.textContent = status;
        });
        this.identifyBtn.disabled = false;
        this.focusMessage.classList.add('hidden');
        this.showResult(result);
    }

    showResult(song) {
        this.currentSong = song;
        document.getElementById('song-title').textContent = song.title;
        document.getElementById('artist-name').textContent = song.artist;
        document.getElementById('release-date').textContent = song.date;
        document.getElementById('song-key').textContent = song.key;
        document.getElementById('song-chords').textContent = song.chords;
        document.getElementById('song-description').textContent = song.description || "";

        const suggestions = this.recognitionService.getSuggestions(song);
        const suggestionList = document.getElementById('suggestions-list');
        const suggestionContainer = document.getElementById('suggestions-container');
        suggestionList.innerHTML = '';
        if (suggestions.length > 0) {
            suggestions.forEach(s => {
                const card = document.createElement('div');
                card.className = 'suggestion-card';
                card.innerHTML = `<div class="suggestion-title">${s.title}</div><div class="suggestion-artist">${s.artist}</div>`;
                card.onclick = () => this.showResult(s);
                suggestionList.appendChild(card);
            });
            suggestionContainer.classList.remove('hidden');
        } else {
            suggestionContainer.classList.add('hidden');
        }
        this.modal.classList.remove('hidden');
    }

    hideModal() { this.modal.classList.add('hidden'); }
}
