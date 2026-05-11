/**
 * Liquid Blob Simulation - Matching TheFunf.com Smoothness
 * Key: Low friction + Low elasticity = Long, elegant oscillations
 */

class Blob {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.points = [];
        this.numPoints = 32; // Match thefunf.com exactly
        this.baseRadius = 300;

        // Position
        this.centerX = window.innerWidth / 2;
        this.centerY = window.innerHeight / 2;

        // Mouse tracking
        this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.prevMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.mouseVelocity = { x: 0, y: 0 };

        // Physics constants (matching thefunf.com)
        this.elasticity = 0.001;  // Very low = smooth, slow return to circle
        this.friction = 0.0085;   // Very low = long, elegant oscillations

        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        this.points = [];
        const slice = (Math.PI * 2) / this.numPoints;

        for (let i = 0; i < this.numPoints; i++) {
            const angle = slice * i;
            const x = this.centerX + Math.cos(angle) * this.baseRadius;
            const y = this.centerY + Math.sin(angle) * this.baseRadius;

            this.points.push({
                x: x,
                y: y,
                originX: x,
                originY: y,
                vx: 0,  // velocity x
                vy: 0,  // velocity y
                ax: 0,  // acceleration x
                ay: 0   // acceleration y
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.prevMouse.x = this.mouse.x;
            this.prevMouse.y = this.mouse.y;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;

            // Calculate mouse velocity
            this.mouseVelocity.x = this.mouse.x - this.prevMouse.x;
            this.mouseVelocity.y = this.mouse.y - this.prevMouse.y;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;

        // Update origin points to new center
        const slice = (Math.PI * 2) / this.numPoints;
        for (let i = 0; i < this.numPoints; i++) {
            const angle = slice * i;
            this.points[i].originX = this.centerX + Math.cos(angle) * this.baseRadius;
            this.points[i].originY = this.centerY + Math.sin(angle) * this.baseRadius;
        }
    }

    // Check if mouse is over blob
    isMouseOverBlob() {
        const dx = this.mouse.x - this.centerX;
        const dy = this.mouse.y - this.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < (this.baseRadius + 100);
    }

    update() {
        const isHovering = this.isMouseOverBlob();

        // Calculate mouse speed (magnitude of velocity)
        const mouseSpeed = Math.sqrt(
            this.mouseVelocity.x * this.mouseVelocity.x +
            this.mouseVelocity.y * this.mouseVelocity.y
        );

        for (let i = 0; i < this.numPoints; i++) {
            const p = this.points[i];

            // Reset acceleration
            p.ax = 0;
            p.ay = 0;

            // 1. Spring force back to original position (Hooke's Law)
            const dx = p.originX - p.x;
            const dy = p.originY - p.y;

            p.ax += dx * this.elasticity;
            p.ay += dy * this.elasticity;

            // 2. Mouse interaction when hovering
            if (isHovering) {
                const distToMouse = Math.sqrt(
                    Math.pow(this.mouse.x - p.x, 2) +
                    Math.pow(this.mouse.y - p.y, 2)
                );

                const influenceRadius = 250;

                if (distToMouse < influenceRadius) {
                    const influence = 1 - (distToMouse / influenceRadius);

                    // Direction from point to mouse
                    const angle = Math.atan2(
                        this.mouse.y - p.y,
                        this.mouse.x - p.x
                    );

                    // Force magnitude depends on mouse speed and influence
                    // Faster mouse = stronger deformation
                    const forceMagnitude = influence * mouseSpeed * 0.5;

                    // Apply force in direction of mouse
                    p.ax += Math.cos(angle) * forceMagnitude * 0.01;
                    p.ay += Math.sin(angle) * forceMagnitude * 0.01;
                }
            }

            // 3. Update velocity with acceleration
            p.vx += p.ax;
            p.vy += p.ay;

            // 4. Apply friction (damping)
            p.vx *= (1 - this.friction);
            p.vy *= (1 - this.friction);

            // 5. Update position with velocity
            p.x += p.vx;
            p.y += p.vy;
        }

        // Decay mouse velocity for next frame
        this.mouseVelocity.x *= 0.8;
        this.mouseVelocity.y *= 0.8;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#0000ff';
        this.ctx.beginPath();

        // Smooth quadratic curves through points
        if (this.points.length > 0) {
            const firstPoint = this.points[0];
            const lastPoint = this.points[this.numPoints - 1];

            // Start at midpoint between last and first
            this.ctx.moveTo(
                (lastPoint.x + firstPoint.x) / 2,
                (lastPoint.y + firstPoint.y) / 2
            );

            for (let i = 0; i < this.numPoints; i++) {
                const current = this.points[i];
                const next = this.points[(i + 1) % this.numPoints];
                const midX = (current.x + next.x) / 2;
                const midY = (current.y + next.y) / 2;

                // Quadratic curve to create smooth blob shape
                this.ctx.quadraticCurveTo(current.x, current.y, midX, midY);
            }
        }

        this.ctx.fill();
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('liquid-blob');
    if (canvas) {
        new Blob(canvas);
    }
});
