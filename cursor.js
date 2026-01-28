/**
 * Custom Cursor Ball
 * A smooth cursor-following ball with elastic lag and interactive states
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
        this.speed = 0.15; // Lower = smoother lag

        this.isHovering = false;
        this.isClicking = false;

        this.init();
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || window.matchMedia('(max-width: 768px)').matches;
    }

    init() {
        // Track mouse position
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

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
        const interactiveElements = 'a, button, .nav-link, .btn-hire, .challenge-btn, .view-work-btn, #theme-toggle';

        document.querySelectorAll(interactiveElements).forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.isHovering = true;
                this.ball.classList.add('hovering');
            });

            el.addEventListener('mouseleave', () => {
                this.isHovering = false;
                this.ball.classList.remove('hovering');
            });
        });
    }

    animate() {
        // Smooth elastic following with lag
        this.ballX += (this.mouseX - this.ballX) * this.speed;
        this.ballY += (this.mouseY - this.ballY) * this.speed;

        // Update position
        this.ball.style.left = `${this.ballX}px`;
        this.ball.style.top = `${this.ballY}px`;

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    new CursorBall();
});
