// Parallax Scroll Effect for Video Section
document.addEventListener('DOMContentLoaded', () => {
    const videoSection = document.querySelector('.video-portfolio-section');
    const video = document.querySelector('.portfolio-video');

    if (!videoSection || !video) return;

    let ticking = false;

    function updateParallax() {
        const rect = videoSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Check if section is in view
        if (rect.top < viewportHeight && rect.bottom > 0) {
            // Calculate relative scroll position (0 to 1)
            // 0 when top of section is at bottom of viewport
            // 1 when bottom of section is at top of viewport
            const totalDistance = viewportHeight + rect.height;
            const distanceTravelled = viewportHeight - rect.top;
            const progress = distanceTravelled / totalDistance;

            // Parallax factor (adjust for speed)
            // Movement range: +/- 7.5% to utilize the 115% height (15% buffer)
            const movementRange = 15;
            const offset = (progress - 0.5) * movementRange;

            // Apply transform
            // Base transform is translate(-50%, -50%) to center
            // We add the vertical offset to that
            video.style.transform = `translate3d(-50%, calc(-50% + ${offset}%), 0)`;
        }

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });

    // Initial update
    updateParallax();
});
