document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('contact-canvas-container');
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 8); // Slightly closer

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- Texture Generation (@ Symbol) ---
    function createAtSymbolTexture() {
        const canvas = document.createElement('canvas');
        const size = 1024; // High res
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Background (Black for transparency in alphaMap)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, size, size);

        // Text (@)
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF'; // White for visibility in alphaMap
        // Use site font or fallback
        ctx.font = 'bold 600px "Satoshi", "Inter", sans-serif';
        ctx.fillText('@', size / 2, size / 2);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    const atTexture = createAtSymbolTexture();

    // --- Object Creation ---
    const geometry = new THREE.PlaneGeometry(5, 5); // Scale of the plane
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,        // Silver/White base
        metalness: 0.7,         // Metallic
        roughness: 0.2,         // Smooth-ish
        alphaMap: atTexture,    // Use texture as shape cutout
        alphaTest: 0.1,         // Sharp edges
        transparent: true,
        side: THREE.DoubleSide, // Visible from back too
        clearcoat: 1.0,
        opacity: 0.9
    });

    const symbol = new THREE.Mesh(geometry, material);
    scene.add(symbol);

    // Add a subtle ring behind it for depth (Abstract communication circle)
    const ringGeo = new THREE.TorusGeometry(3.5, 0.05, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x55ff00, transparent: true, opacity: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    // scene.add(ring); // Optional: Commented out to keep it minimal as requested, but "Like @" implies simple.

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 5, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x55ff00, 1, 10); // Subtle lime accent
    pointLight.position.set(-2, -2, 2);
    scene.add(pointLight);


    // --- Interaction ---
    let mouseX = 0;
    let mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.0005; // Reduced sensitivity
        mouseY = (event.clientY - windowHalfY) * 0.0005;
    });

    // --- Animation Loop ---
    function animate() {
        requestAnimationFrame(animate);

        // Gentle floating
        const time = Date.now() * 0.001;
        symbol.position.y = Math.sin(time) * 0.2;

        // Mouse follow + Idle rotation
        // Target rotation
        const targetRotX = mouseY * 1.5;
        const targetRotY = mouseX * 1.5;

        // Initial slight tilt for style
        const initialTiltX = 0.1;
        const initialTiltY = -0.1;

        // Interpolation
        symbol.rotation.x += 0.05 * (targetRotX + initialTiltX - symbol.rotation.x);
        symbol.rotation.y += 0.05 * (targetRotY + initialTiltY - symbol.rotation.y);

        renderer.render(scene, camera);
    }

    animate();

    // --- Resize ---
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
});
