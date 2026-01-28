/**
 * Premium Loading Screen
 * Inspired by clouarchitects.com - rapid text cycling with smooth progress
 */

class LoadingScreen {
    constructor() {
        this.roles = [
            "graphic designers",
            "ui/ux designers",
            "developers",
            "animators",
            "creators",
            "blueberry"
        ];

        this.currentRoleIndex = 0;
        this.progress = 0;
        this.loadDuration = 2500;

        // DOM Elements
        this.loaderScreen = document.getElementById('loader-screen');
        this.loaderText = document.getElementById('loader-text'); // The dynamic text element
        this.loaderHighlight = document.getElementById('loader-highlight');
        this.progressBar = document.getElementById('loader-progress-bar');
        this.loaderPercentage = document.getElementById('loader-percentage');

        if (this.loaderScreen) {
            this.init();
        }
    }

    init() {
        // Set initial state
        this.loaderText.textContent = this.roles[0];

        // Minor delay to allow layout to settle before calculating width
        requestAnimationFrame(() => {
            this.updateHighlightWidth();
        });

        // Start animation loop
        this.animateTextLoop();
        this.startProgress();
    }

    updateHighlightWidth() {
        // Get width of current text
        const width = this.loaderText.offsetWidth;
        // Update highlight width (with padding)
        this.loaderHighlight.style.width = this.loaderText.offsetWidth + "px";
    }

    animateTextLoop() {
        if (this.progress >= 100) return;

        this.textTimeout = setTimeout(() => {
            this.cycleText();
        }, 500);
    }

    cycleText() {
        if (this.progress >= 95) return;

        // 1. Animate Out
        this.loaderText.classList.add('exit-up');

        setTimeout(() => {
            // 2. Change Text
            this.currentRoleIndex = (this.currentRoleIndex + 1) % this.roles.length;
            this.loaderText.textContent = this.roles[this.currentRoleIndex];

            // 3. Update Highlight Width
            this.updateHighlightWidth();

            // 4. Reset Position
            this.loaderText.classList.remove('exit-up');
            this.loaderText.classList.add('enter-down');

            // Force reflow
            void this.loaderText.offsetWidth;

            // 5. Animate In
            this.loaderText.classList.remove('enter-down');

            this.animateTextLoop();
        }, 300);
    }

    startProgress() {
        const startTime = Date.now();

        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            this.progress = Math.min((elapsed / this.loadDuration) * 100, 100);

            this.progressBar.style.width = `${this.progress}%`;
            this.loaderPercentage.textContent = `Loading (${Math.floor(this.progress)}%)`;
            this.loaderPercentage.style.left = `${this.progress}%`;

            if (this.progress < 100) {
                requestAnimationFrame(updateProgress);
            } else {
                this.complete();
            }
        };

        requestAnimationFrame(updateProgress);
    }

    complete() {
        clearTimeout(this.textTimeout);

        // Ensure final text
        this.loaderText.textContent = "blueberry";
        this.loaderText.classList.remove('exit-up', 'enter-down');
        this.updateHighlightWidth();

        setTimeout(() => {
            this.slideUp();
        }, 600);
    }

    slideUp() {
        this.loaderScreen.classList.add('slide-up');
        setTimeout(() => {
            this.loaderScreen.remove();
            document.body.classList.add('loaded');
        }, 800);
    }
}

// Initialize loader when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LoadingScreen();
    });
} else {
    new LoadingScreen();
}
