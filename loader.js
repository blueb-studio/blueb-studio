/**
 * Smart Loading Screen - Only shows when actually needed
 * Detects fast/cached loads and skips loader entirely
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
        this.loadDuration = 2000; // Reduced from 2500ms for faster perception

        // Smart loading thresholds
        this.showThreshold = 300; // Only show loader if loading takes > 300ms
        this.shouldShowLoader = false;
        this.hasStartedLoading = false;
        this.loadStartTime = performance.now();

        // DOM Elements
        this.loaderScreen = document.getElementById('loader-screen');
        this.loaderText = document.getElementById('loader-text');
        this.loaderHighlight = document.getElementById('loader-highlight');
        this.progressBar = document.getElementById('loader-progress-bar');
        this.loaderPercentage = document.getElementById('loader-percentage');

        if (this.loaderScreen) {
            this.smartInit();
        }
    }

    smartInit() {
        // Check if page is already loaded from cache (back/forward navigation)
        if (document.readyState === 'complete') {
            this.skipLoader();
            return;
        }

        // Monitor actual resource loading
        this.checkInitialLoad();
    }

    checkInitialLoad() {
        const loadCompleteTime = performance.now() - this.loadStartTime;

        // If page loads very quickly (< 300ms), skip loader entirely
        if (loadCompleteTime < this.showThreshold && document.readyState === 'complete') {
            this.skipLoader();
            return;
        }

        // Set timeout to show loader only if loading is taking time
        this.loaderTimeout = setTimeout(() => {
            // Only show if still loading after threshold
            if (document.readyState !== 'complete') {
                this.showAndStartLoader();
            } else {
                this.skipLoader();
            }
        }, this.showThreshold);

        // Listen for actual page load completion
        if (document.readyState !== 'complete') {
            window.addEventListener('load', () => this.handlePageLoad(), { once: true });
        } else {
            this.handlePageLoad();
        }
    }

    showAndStartLoader() {
        if (this.hasStartedLoading) return;

        this.shouldShowLoader = true;
        this.hasStartedLoading = true;

        // Make loader visible
        this.loaderScreen.style.display = 'flex';

        // Set initial state
        this.loaderText.textContent = this.roles[0];

        requestAnimationFrame(() => {
            this.updateHighlightWidth();
        });

        // Start animation loop
        this.animateTextLoop();
        this.startProgress();
    }

    handlePageLoad() {
        clearTimeout(this.loaderTimeout);

        const totalLoadTime = performance.now() - this.loadStartTime;

        // If page loaded quickly and we haven't shown the loader yet, skip it
        if (!this.hasStartedLoading && totalLoadTime < this.showThreshold) {
            this.skipLoader();
        } else if (this.hasStartedLoading) {
            // Loader is showing, complete it naturally
            // Speed up completion if load was fast
            if (totalLoadTime < 1000) {
                this.loadDuration = Math.max(800, totalLoadTime + 200);
            }
        } else {
            this.skipLoader();
        }
    }

    skipLoader() {
        // Instantly hide loader and mark page as loaded
        if (this.loaderScreen) {
            this.loaderScreen.style.display = 'none';
            this.loaderScreen.remove();
        }
        document.body.classList.add('loaded');
        clearTimeout(this.loaderTimeout);
        clearTimeout(this.textTimeout);
    }

    updateHighlightWidth() {
        const width = this.loaderText.offsetWidth;
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
        }, 400); // Reduced from 600ms
    }

    slideUp() {
        this.loaderScreen.classList.add('slide-up');
        setTimeout(() => {
            this.loaderScreen.remove();
            document.body.classList.add('loaded');
        }, 800);
    }
}

// Initialize loader smartly
const initSmartLoader = () => {
    // Check if this is a cached/back-forward navigation
    const perfNavigation = performance.getEntriesByType('navigation')[0];

    if (perfNavigation && perfNavigation.type === 'back_forward') {
        // Skip loader on back/forward navigation (page is cached)
        const loaderScreen = document.getElementById('loader-screen');
        if (loaderScreen) {
            loaderScreen.style.display = 'none';
            loaderScreen.remove();
        }
        document.body.classList.add('loaded');
        return;
    }

    // Initialize smart loader
    new LoadingScreen();
};

// Run initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmartLoader);
} else {
    initSmartLoader();
}

