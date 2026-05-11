/**
 * 3D Particle Ring Background
 * miming antigravity.google style with Three.js
 */

class ParticleBackground {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        if (!this.canvas) return;

        this.init();
        this.animate();
        this.resize();
        this.bindEvents();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 25; // Zoomed in a bit (was 30)

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Particle System
        this.createParticles();

        // Mouse interaction
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;
    }

    createParticles() {
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const color1 = new THREE.Color('#0000ff'); // Pure Blue
        const color2 = new THREE.Color('#0000ff'); // Pure Blue

        // Store original positions for spring-back effect
        this.originalPositions = new Float32Array(particleCount * 3);
        this.velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            // Create a ring/orbital distribution
            // Random angle
            const angle = Math.random() * Math.PI * 2;
            // Radius: concentrated in a ring between 15 and 25 units, but with some scatter
            // Use a gaussian-like distribution for the ring thickness
            const radius = 15 + Math.random() * 15;
            const spread = 12; // Height/depth spread - increased for more depth

            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * (radius * 0.8); // Slightly oval
            const z = (Math.random() - 0.5) * spread;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Store original positions
            this.originalPositions[i * 3] = x;
            this.originalPositions[i * 3 + 1] = y;
            this.originalPositions[i * 3 + 2] = z;

            // Colors
            const color = Math.random() > 0.5 ? color1 : color2;
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            // Varied sizes
            sizes[i] = Math.random() * 0.15;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Custom shader for round particles (or dashes if we wanted)
        // Using standard PointsMaterial for performance and simplicity first
        this.material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });

        this.points = new THREE.Points(geometry, this.material);
        this.scene.add(this.points);
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            // Normalize mouse position -1 to 1
            this.targetX = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Listen for dark mode changes
        window.addEventListener('themechange', (e) => {
            this.updateParticleColors(e.detail.isDark);
        });

        // Check initial theme state
        const isDark = document.body.classList.contains('dark-mode');
        this.updateParticleColors(isDark);
    }

    updateParticleColors(isDark) {
        const colors = this.points.geometry.attributes.color.array;
        const lightColor = new THREE.Color('#0000ff'); // Bright blue for light mode
        const darkColor = new THREE.Color('#0000ff'); // Bright blue for dark mode
        const targetColor = isDark ? darkColor : lightColor;

        // Update all particle colors
        for (let i = 0; i < colors.length / 3; i++) {
            colors[i * 3] = targetColor.r;
            colors[i * 3 + 1] = targetColor.g;
            colors[i * 3 + 2] = targetColor.b;
        }

        // Mark colors for update
        this.points.geometry.attributes.color.needsUpdate = true;
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Smooth rotation of the entire ring
        this.points.rotation.z += 0.005;

        // Smooth, organic particle interaction
        const positions = this.points.geometry.attributes.position.array;
        const interactionRadius = 8; // Radius within which particles react
        const repulsionStrength = 0.08; // Gentle repulsion force
        const springStrength = 0.02; // Spring force pulling particles back
        const damping = 0.85; // Velocity damping for smooth motion

        // Convert mouse position to 3D space
        const mouseVector = new THREE.Vector3(
            this.targetX * 15, // Scale to match particle ring size
            this.targetY * 15,
            0
        );

        // Update each particle with spring physics
        for (let i = 0; i < positions.length / 3; i++) {
            const idx = i * 3;

            // Current position
            const px = positions[idx];
            const py = positions[idx + 1];
            const pz = positions[idx + 2];

            // Original position
            const ox = this.originalPositions[idx];
            const oy = this.originalPositions[idx + 1];
            const oz = this.originalPositions[idx + 2];

            // Distance from particle to mouse cursor
            const dx = px - mouseVector.x;
            const dy = py - mouseVector.y;
            const dz = pz - mouseVector.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            // Repulsion force (gentle push away from cursor)
            let forceX = 0;
            let forceY = 0;
            let forceZ = 0;

            if (distance > 0) {
                const influence = Math.min(1, 20 / (distance + 1));
                const force = influence * influence * 0.15;
                forceX = (dx / distance) * force;
                forceY = (dy / distance) * force;
                forceZ = (dz / distance) * force;
            }

            // Spring force (pull back to original position)
            const springX = (ox - px) * springStrength;
            const springY = (oy - py) * springStrength;
            const springZ = (oz - pz) * springStrength;

            // Update velocity
            this.velocities[idx] = (this.velocities[idx] + forceX + springX) * damping;
            this.velocities[idx + 1] = (this.velocities[idx + 1] + forceY + springY) * damping;
            this.velocities[idx + 2] = (this.velocities[idx + 2] + forceZ + springZ) * damping;

            // Update position
            positions[idx] += this.velocities[idx];
            positions[idx + 1] += this.velocities[idx + 1];
            positions[idx + 2] += this.velocities[idx + 2];
        }

        // Update particle positions
        this.points.geometry.attributes.position.needsUpdate = true;

        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    // Check if Three.js is loaded
    if (typeof THREE !== 'undefined') {
        new ParticleBackground();
    } else {
        console.error('Three.js not loaded');
        // Fallback or retry?
        setTimeout(() => {
            if (typeof THREE !== 'undefined') new ParticleBackground();
        }, 500);
    }
});
