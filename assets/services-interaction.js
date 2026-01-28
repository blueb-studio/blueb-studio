document.addEventListener('DOMContentLoaded', () => {
    const serviceItems = document.querySelectorAll('.service-item');
    const videoWrapper = document.querySelector('.services-video-wrapper');
    const video1 = document.getElementById('service-video-1');
    const video2 = document.getElementById('service-video-2');

    let activeVideo = video1; // The video element currently showing or about to show
    let inactiveVideo = video2; // The video element currently hidden or fading out
    let currentVideoSrc = ''; // Track current video to avoid re-triggering

    // Function to swap active/inactive references
    function swapVideoRefs() {
        const temp = activeVideo;
        activeVideo = inactiveVideo;
        inactiveVideo = temp;
    }

    serviceItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const videoSrc = item.getAttribute('data-video');

            // If already playing this video, do nothing
            if (currentVideoSrc === videoSrc) return;

            currentVideoSrc = videoSrc;

            // Prepare the "next" video (currently inactive)
            // We swap refs first so 'activeVideo' becomes the one we want to show
            swapVideoRefs();

            // activeVideo is now the hidden one we want to prep and show
            activeVideo.src = videoSrc;
            activeVideo.load();

            // Play new video
            const playPromise = activeVideo.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // Once playing, fade it in
                    activeVideo.classList.add('active');
                    // Fade out the old one
                    inactiveVideo.classList.remove('active');

                    // Show wrapper if hidden
                    videoWrapper.classList.add('active');
                }).catch(error => {
                    console.log("Video play interrupted or failed:", error);
                });
            }
        });
    });

    const servicesList = document.querySelector('.services-list');
    servicesList.addEventListener('mouseleave', () => {
        // Optional: clear video on leave, or keep last one. 
        // User said: "Video can fade out or return to the default placeholder."
        // Let's fade out the wrapper to be clean.
        videoWrapper.classList.remove('active');

        // Reset current tracker so hovering same item again triggers play
        currentVideoSrc = '';

        // Remove active class from videos after delay to reset state cleanly
        setTimeout(() => {
            video1.classList.remove('active');
            video2.classList.remove('active');
            video1.pause();
            video2.pause();
        }, 500); // match transition duration
    });
});
