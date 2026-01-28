document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);


    const animatedElements = document.querySelectorAll('.scroll-fade-in');
    animatedElements.forEach(el => observer.observe(el));

    // Header Scroll Effect
    const header = document.querySelector('.header');
    const scrollThreshold = 50;

    function handleScroll() {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on load to set initial state
    handleScroll();



    // Hero Video Expansion Effect
    const heroSection = document.querySelector('.inertia-hero');
    const heroVideoContainer = document.querySelector('.hero-video-container');

    function handleHeroScroll() {
        if (!heroSection || !heroVideoContainer) return;

        const scrollY = window.scrollY;
        const sectionHeight = heroSection.offsetHeight;
        const viewportHeight = window.innerHeight;

        // Calculate scroll progress for the expansion
        const scrollDistance = sectionHeight - viewportHeight;
        let progress = Math.min(Math.max(scrollY / scrollDistance, 0), 1);

        // Easing for smooth effect
        let ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

        // Calculate Scale to Fill Screen
        // Base size is defined in CSS (35vw width).
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const baseWidth = vw * 0.35;
        const baseHeight = baseWidth * (9 / 16);

        // Scale needed to cover width and height
        const scaleX = vw / baseWidth;
        const scaleY = vh / baseHeight;

        // To Cover, we need the MAX of these scales so no whitespace is left
        const maxScale = Math.max(scaleX, scaleY);

        // Interpolate Scale
        const currentScale = 1 + ((maxScale - 1) * ease);

        // Apply Transform
        // Apply Transform to Video
        heroVideoContainer.style.transform = `scale(${currentScale})`;

        // IMPORTANT: Reset explicit width/height styles from previous logic so CSS takes over base size
        heroVideoContainer.style.width = '';
        heroVideoContainer.style.height = '';
        heroVideoContainer.style.borderRadius = '0';

        // Hero Text Parallax (Sideways)
        const heroTextLeft = document.querySelector('.hero-text-left');
        const heroTextRight = document.querySelector('.hero-text-right');

        if (heroTextLeft && heroTextRight) {
            const parallaxOffset = scrollY * 0.5; // Speed factor

            // Preserve Y-offsets from CSS:
            // Left: translateY(calc(-50% - 200px))
            // Right: translateY(calc(-50% + 200px))

            heroTextLeft.style.transform = `translateX(-${parallaxOffset}px) translateY(calc(-50% - 200px))`;
            heroTextRight.style.transform = `translateX(${parallaxOffset}px) translateY(calc(-50% + 200px))`;
        }
    }

    if (heroSection) {
        window.addEventListener('scroll', handleHeroScroll, { passive: true });
        // Trigger once
        handleHeroScroll();
    }

});
