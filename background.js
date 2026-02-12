const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "-1";

camera.position.z = 6;

const particlesCount = 1200;
const positions = [];
const particlesGeometry = new THREE.BufferGeometry();

for (let i = 0; i < particlesCount; i++) {
    const x = (Math.random() - 0.5) * 15;
    const y = (Math.random() - 0.5) * 15;
    const z = (Math.random() - 0.5) * 15;
    positions.push(x, y, z);
}

particlesGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
    color: 0x00ccff,
    size: 0.03
});

const particlesMesh = new THREE.Points(
    particlesGeometry,
    particlesMaterial
);

scene.add(particlesMesh);

// Lignes connectées
const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0077ff,
    transparent: true,
    opacity: 0.2
});

const linesGeometry = new THREE.BufferGeometry();
const linesPositions = [];

for (let i = 0; i < positions.length; i += 9) {
    linesPositions.push(
        positions[i], positions[i+1], positions[i+2],
        positions[i+3], positions[i+4], positions[i+5]
    );
}

linesGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linesPositions, 3)
);

const linesMesh = new THREE.LineSegments(linesGeometry, lineMaterial);
scene.add(linesMesh);

// Interaction souris
let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", (event) => {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.00005;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.00005;
});

// Animation
function animate() {
    requestAnimationFrame(animate);

    particlesMesh.rotation.y += 0.0008;
    particlesMesh.rotation.x += 0.0003;

    linesMesh.rotation.y += 0.0008;
    linesMesh.rotation.x += 0.0003;

    camera.position.x += (mouseX - camera.position.x) * 0.02;
    camera.position.y += (-mouseY - camera.position.y) * 0.02;

    renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
