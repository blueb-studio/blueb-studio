document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lenis with weighted parameters
    const lenis = new Lenis({
        duration: 2.5, // Increased from 1.2 for slower, smoother scroll
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Keep exponential out
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    // RAF Loop
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Optional: Log to verify it's running
    console.log('Lenis initialized');
});
