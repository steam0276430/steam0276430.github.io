/* =========================
   PITOJO - PREMIUM AI NETWORK
   ========================= */

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x050810, 8, 20);

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "-1";
document.body.appendChild(renderer.domElement);

/* =========================
   PARTICLES
   ========================= */

const isMobile = window.innerWidth < 768;
const PARTICLES_COUNT = isMobile ? 800 : 1600;

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLES_COUNT * 3);
const velocities = [];

for (let i = 0; i < PARTICLES_COUNT; i++) {
    const i3 = i * 3;

    positions[i3] = (Math.random() - 0.5) * 25;
    positions[i3 + 1] = (Math.random() - 0.5) * 25;
    positions[i3 + 2] = (Math.random() - 0.5) * 25;

    velocities.push({
        x: (Math.random() - 0.5) * 0.003,
        y: (Math.random() - 0.5) * 0.003,
        z: (Math.random() - 0.5) * 0.003
    });
}

geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
);

/* ===== Custom Glow Shader ===== */

const material = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: isMobile ? 0.03 : 0.025,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

/* =========================
   DYNAMIC CONNECTION LINES
   ========================= */

const MAX_DISTANCE = 1.8;
const linePositions = [];
const lineGeometry = new THREE.BufferGeometry();

const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x1e90ff,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending
});

const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(lines);

/* =========================
   MOUSE PARALLAX
   ========================= */

let mouse = { x: 0, y: 0 };

document.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = (event.clientY / window.innerHeight - 0.5) * 2;
});

/* =========================
   ANIMATION LOOP
   ========================= */

function animate() {
    requestAnimationFrame(animate);

    const positions = geometry.attributes.position.array;
    linePositions.length = 0;

    // Update particles
    for (let i = 0; i < PARTICLES_COUNT; i++) {
        const i3 = i * 3;

        positions[i3] += velocities[i].x;
        positions[i3 + 1] += velocities[i].y;
        positions[i3 + 2] += velocities[i].z;

        // Boundary bounce
        for (let axis = 0; axis < 3; axis++) {
            if (positions[i3 + axis] > 12 || positions[i3 + axis] < -12) {
                velocities[i][["x","y","z"][axis]] *= -1;
            }
        }
    }

    // Dynamic connections (distance based)
    for (let i = 0; i < PARTICLES_COUNT; i++) {
        for (let j = i + 1; j < PARTICLES_COUNT; j++) {

            const dx = positions[i*3] - positions[j*3];
            const dy = positions[i*3+1] - positions[j*3+1];
            const dz = positions[i*3+2] - positions[j*3+2];

            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

            if (dist < MAX_DISTANCE) {
                linePositions.push(
                    positions[i*3], positions[i*3+1], positions[i*3+2],
                    positions[j*3], positions[j*3+1], positions[j*3+2]
                );
            }
        }
    }

    lineGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(linePositions, 3)
    );

    geometry.attributes.position.needsUpdate = true;

    // Subtle rotation
    particles.rotation.y += 0.0004;
    particles.rotation.x += 0.0002;
    lines.rotation.copy(particles.rotation);

    // Smooth camera parallax
    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
    camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.02;

    renderer.render(scene, camera);
}

animate();

/* =========================
   RESIZE
   ========================= */

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
});
