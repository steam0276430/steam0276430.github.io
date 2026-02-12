/* =========================================
   PITOJO - AI HOLOGRAPHIC NETWORK SYSTEM
   ========================================= */

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050810, 0.08);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.z = 12;

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

/* =========================================
   PARTICLES SYSTEM
   ========================================= */

const isMobile = window.innerWidth < 768;
const PARTICLE_COUNT = isMobile ? 700 : 1600;
const MAX_DISTANCE = 1.7;

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLE_COUNT * 3);
const velocities = [];

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const i3 = i * 3;

  positions[i3] = (Math.random() - 0.5) * 25;
  positions[i3 + 1] = (Math.random() - 0.5) * 25;
  positions[i3 + 2] = (Math.random() - 0.5) * 25;

  velocities.push({
    x: (Math.random() - 0.5) * 0.002,
    y: (Math.random() - 0.5) * 0.002,
    z: (Math.random() - 0.5) * 0.002
  });
}

geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

/* HOLOGRAPHIC PARTICLE MATERIAL */

const particleMaterial = new THREE.PointsMaterial({
  size: isMobile ? 0.05 : 0.035,
  color: 0x38bdf8,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const particles = new THREE.Points(geometry, particleMaterial);
scene.add(particles);

/* =========================================
   CONNECTION LINES
   ========================================= */

const lineMaterial = new THREE.LineBasicMaterial({
  color: 0x00ccff,
  transparent: true,
  opacity: 0.15,
  blending: THREE.AdditiveBlending
});

const lineGeometry = new THREE.BufferGeometry();
const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(lines);

/* =========================================
   MOUSE PARALLAX
   ========================================= */

let mouse = { x: 0, y: 0 };

document.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth - 0.5) * 2;
  mouse.y = (event.clientY / window.innerHeight - 0.5) * 2;
});

/* =========================================
   DATA PULSE SYSTEM
   ========================================= */

let pulse = 0;

/* =========================================
   ANIMATION LOOP
   ========================================= */

function animate() {
  requestAnimationFrame(animate);

  pulse += 0.02;

  const posArray = geometry.attributes.position.array;
  const linePositions = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;

    posArray[i3] += velocities[i].x;
    posArray[i3 + 1] += velocities[i].y;
    posArray[i3 + 2] += velocities[i].z;

    for (let axis = 0; axis < 3; axis++) {
      if (posArray[i3 + axis] > 12 || posArray[i3 + axis] < -12) {
        velocities[i][["x","y","z"][axis]] *= -1;
      }
    }
  }

  /* CONNECTION CALCULATION */
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    for (let j = i + 1; j < PARTICLE_COUNT; j++) {

      const dx = posArray[i*3] - posArray[j*3];
      const dy = posArray[i*3+1] - posArray[j*3+1];
      const dz = posArray[i*3+2] - posArray[j*3+2];

      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

      if (dist < MAX_DISTANCE) {
        const alpha = 1.0 - dist / MAX_DISTANCE;

        linePositions.push(
          posArray[i*3], posArray[i*3+1], posArray[i*3+2],
          posArray[j*3], posArray[j*3+1], posArray[j*3+2]
        );
      }
    }
  }

  lineGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linePositions, 3)
  );

  geometry.attributes.position.needsUpdate = true;

  /* HOLOGRAPHIC PULSE EFFECT */
  const glow = 0.8 + Math.sin(pulse) * 0.2;
  particleMaterial.opacity = glow;
  lineMaterial.opacity = 0.1 + Math.sin(pulse * 0.5) * 0.05;

  /* Subtle rotation */
  particles.rotation.y += 0.0003;
  particles.rotation.x += 0.00015;
  lines.rotation.copy(particles.rotation);

  /* Smooth parallax */
  camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
  camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.02;

  renderer.render(scene, camera);
}

animate();

/* =========================================
   RESIZE
   ========================================= */

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
