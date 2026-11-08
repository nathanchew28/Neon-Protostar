/**
 * Visualizer
 */
export class Visualizer {
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

        this.ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const data = this.audio.getFrequencyData();
        const avgVolume = this.audio.getAverageVolume();

        const baseRadius = 150;
        const radius = baseRadius + (avgVolume * 0.5);

        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(0, 243, 255, ${Math.min(avgVolume / 50, 0.8)})`;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        const bars = 180;
        const step = (Math.PI * 2) / bars;
        const dataStep = Math.floor(data.length / bars);

        for (let i = 0; i < bars; i++) {
            const dataIndex = i * dataStep;
            const value = data[dataIndex] || 0;
            const barHeight = (value / 255) * 200;
            const angle = i * step;

            const x1 = this.centerX + Math.cos(angle) * (radius + 5);
            const y1 = this.centerY + Math.sin(angle) * (radius + 5);
            const x2 = this.centerX + Math.cos(angle) * (radius + 5 + barHeight);
            const y2 = this.centerY + Math.sin(angle) * (radius + 5 + barHeight);

            const hue = 180 + (value / 255) * 60;

            this.ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }

        requestAnimationFrame(() => this.animate());
    }
}
