import * as THREE from "three";

/* =========================================
   PITOJO - AI HOLOGRAPHIC NETWORK SYSTEM PRO
   ========================================= */

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050810, 0.07);

/* CAMERA */
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.z = 14;

/* RENDERER */
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
  powerPreference: "high-performance",
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "-1";
document.body.appendChild(renderer.domElement);

/* =========================================
   CONFIG
   ========================================= */

const isMobile = window.innerWidth < 768;
const PARTICLE_COUNT = isMobile ? 500 : 1200;
const WORLD_SIZE = 18;
const MAX_DISTANCE = 1.6;
const SPEED = 0.003;

/* =========================================
   PARTICLES
   ========================================= */

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLE_COUNT * 3);
const velocities = new Float32Array(PARTICLE_COUNT * 3);

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const i3 = i * 3;

  positions[i3] = (Math.random() - 0.5) * WORLD_SIZE;
  positions[i3 + 1] = (Math.random() - 0.5) * WORLD_SIZE;
  positions[i3 + 2] = (Math.random() - 0.5) * WORLD_SIZE;

  velocities[i3] = (Math.random() - 0.5) * SPEED;
  velocities[i3 + 1] = (Math.random() - 0.5) * SPEED;
  velocities[i3 + 2] = (Math.random() - 0.5) * SPEED;
}

geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

/* PARTICLE MATERIAL */
const particleMaterial = new THREE.PointsMaterial({
  size: isMobile ? 0.06 : 0.04,
  color: 0x38bdf8,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const particles = new THREE.Points(geometry, particleMaterial);
scene.add(particles);

/* =========================================
   CENTRAL CORE GLOW (entreprise tech vibe)
   ========================================= */

const coreGeometry = new THREE.SphereGeometry(0.6, 32, 32);
const coreMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ccff,
  transparent: true,
  opacity: 0.35,
});

const core = new THREE.Mesh(coreGeometry, coreMaterial);
scene.add(core);

/* =========================================
   CONNECTION LINES
   ========================================= */

const lineMaterial = new THREE.LineBasicMaterial({
  color: 0x00ccff,
  transparent: true,
  opacity: 0.12,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const lineGeometry = new THREE.BufferGeometry();
const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(lines);

/* =========================================
   MOUSE PARALLAX
   ========================================= */

let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", (event) => {
  mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
});

/* =========================================
   PERFORMANCE OPTIMIZATION
   (limit max connections)
   ========================================= */

const MAX_CONNECTIONS = isMobile ? 1200 : 3000;

/* =========================================
   ANIMATION LOOP
   ========================================= */

let pulse = 0;

function animate() {
  requestAnimationFrame(animate);

  pulse += 0.02;

  const posArray = geometry.attributes.position.array;

  /* MOVE PARTICLES */
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;

    posArray[i3] += velocities[i3];
    posArray[i3 + 1] += velocities[i3 + 1];
    posArray[i3 + 2] += velocities[i3 + 2];

    // bounce inside cube
    if (posArray[i3] > WORLD_SIZE / 2 || posArray[i3] < -WORLD_SIZE / 2)
      velocities[i3] *= -1;
    if (posArray[i3 + 1] > WORLD_SIZE / 2 || posArray[i3 + 1] < -WORLD_SIZE / 2)
      velocities[i3 + 1] *= -1;
    if (posArray[i3 + 2] > WORLD_SIZE / 2 || posArray[i3 + 2] < -WORLD_SIZE / 2)
      velocities[i3 + 2] *= -1;
  }

  /* CONNECTIONS */
  const linePositions = [];
  let connections = 0;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    for (let j = i + 1; j < PARTICLE_COUNT; j++) {
      if (connections > MAX_CONNECTIONS) break;

      const ax = posArray[i * 3];
      const ay = posArray[i * 3 + 1];
      const az = posArray[i * 3 + 2];

      const bx = posArray[j * 3];
      const by = posArray[j * 3 + 1];
      const bz = posArray[j * 3 + 2];

      const dx = ax - bx;
      const dy = ay - by;
      const dz = az - bz;

      const dist = dx * dx + dy * dy + dz * dz;

      if (dist < MAX_DISTANCE * MAX_DISTANCE) {
        linePositions.push(ax, ay, az, bx, by, bz);
        connections++;
      }
    }
  }

  lineGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linePositions, 3)
  );

  geometry.attributes.position.needsUpdate = true;

  /* HOLOGRAPHIC PULSE EFFECT */
  const glow = 0.75 + Math.sin(pulse) * 0.25;
  particleMaterial.opacity = glow;

  lineMaterial.opacity = 0.08 + Math.sin(pulse * 0.7) * 0.05;

  coreMaterial.opacity = 0.2 + Math.sin(pulse * 1.5) * 0.15;
  core.scale.setScalar(1 + Math.sin(pulse * 1.2) * 0.08);

  /* ROTATION */
  particles.rotation.y += 0.00035;
  particles.rotation.x += 0.00018;
  lines.rotation.copy(particles.rotation);

  /* PARALLAX */
  camera.position.x += (mouseX * 2.2 - camera.position.x) * 0.02;
  camera.position.y += (-mouseY * 2.2 - camera.position.y) * 0.02;

  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}

animate();

/* =========================================
   RESIZE
   ========================================= */

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
