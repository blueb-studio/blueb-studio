/**
 * Custom Cursor Ball - Safari Optimized
 * Uses hardware-accelerated transforms for smooth 60fps animation
 */

class CursorBall {
    constructor() {
        // Don't initialize on mobile/touch devices
        if (this.isMobileDevice()) {
            return;
        }

        this.ball = document.createElement('div');
        this.ball.className = 'custom-cursor';
        document.body.appendChild(this.ball);

        this.mouseX = 0;
        this.mouseY = 0;
        this.ballX = 0;
        this.ballY = 0;

        // Detect Safari for optimizations
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        // Adjust speed for Safari (slightly faster to feel more responsive)
        this.speed = this.isSafari ? 0.2 : 0.15; // Lower = smoother lag

        this.isHovering = false;
        this.isClicking = false;
        this.animationFrame = null;

        this.init();
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || window.matchMedia('(max-width: 768px)').matches;
    }

    init() {
        // Track mouse position with passive listener for better performance
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        }, { passive: true });

        // Click animation
        document.addEventListener('mousedown', () => {
            this.isClicking = true;
            this.ball.classList.add('clicking');
        });

        document.addEventListener('mouseup', () => {
            this.isClicking = false;
            this.ball.classList.remove('clicking');
        });

        // Hover detection for interactive elements
        this.addHoverListeners();

        // Start animation loop
        this.animate();
    }

    addHoverListeners() {
        const interactiveElements = 'a, button, .nav-link, .btn-hire, .challenge-btn, .view-work-btn, #theme-toggle, .btn-studio';

        document.querySelectorAll(interactiveElements).forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.isHovering = true;
                this.ball.classList.add('hovering');
            }, { passive: true });

            el.addEventListener('mouseleave', () => {
                this.isHovering = false;
                this.ball.classList.remove('hovering');
            }, { passive: true });
        });
    }

    animate() {
        // Smooth elastic following with lag
        this.ballX += (this.mouseX - this.ballX) * this.speed;
        this.ballY += (this.mouseY - this.ballY) * this.speed;

        // Use transform3d for hardware acceleration (much better for Safari)
        // This triggers GPU rendering and is smoother than left/top
        this.ball.style.transform = `translate3d(${this.ballX}px, ${this.ballY}px, 0) translate(-50%, -50%)${this.isHovering ? ' scale(1.5)' : ''}`;

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    // Cleanup method
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.ball && this.ball.parentNode) {
            this.ball.parentNode.removeChild(this.ball);
        }
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    new CursorBall();
});

