/* =========================================
   PITOJO - PREMIUM AI NETWORK BACKGROUND
   Canvas 2D (GitHub Pages Safe)
   ========================================= */

const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

let w, h;
function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

const isMobile = window.innerWidth < 768;

const PARTICLE_COUNT = isMobile ? 60 : 130;
const MAX_DISTANCE = isMobile ? 140 : 190;

const particles = [];
let mouse = { x: w / 2, y: h / 2 };

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

class Particle {
  constructor() {
    this.reset();
    this.x = Math.random() * w;
    this.y = Math.random() * h;
  }

  reset() {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.7;
    this.vy = (Math.random() - 0.5) * 0.7;
    this.size = Math.random() * 1.5 + 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > w) this.vx *= -1;
    if (this.y < 0 || this.y > h) this.vy *= -1;

    // Attraction douce vers la souris
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    this.x += dx * 0.00025;
    this.y += dy * 0.00025;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

    ctx.fillStyle = "rgba(56,189,248,0.95)";
    ctx.shadowBlur = 18;
    ctx.shadowColor = "rgba(56,189,248,0.8)";
    ctx.fill();

    ctx.shadowBlur = 0;
  }
}

/* INIT */
for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push(new Particle());
}

let pulse = 0;

/* BACKGROUND GLOW */
function drawGlowBackground() {
  const gradient = ctx.createRadialGradient(
    w / 2,
    h / 2,
    100,
    w / 2,
    h / 2,
    w
  );

  gradient.addColorStop(0, "rgba(0,200,255,0.09)");
  gradient.addColorStop(0.4, "rgba(0,80,160,0.05)");
  gradient.addColorStop(1, "rgba(0,0,0,0.95)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

/* CONNECTIONS */
function connectParticles() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MAX_DISTANCE) {
        const alpha = (1 - dist / MAX_DISTANCE) * 0.28;

        ctx.strokeStyle = `rgba(0,204,255,${alpha})`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

/* HOLOGRAPHIC SCANLINES */
function drawScanLines() {
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = "#00ccff";

  for (let y = 0; y < h; y += 6) {
    ctx.fillRect(0, y, w, 1);
  }

  ctx.globalAlpha = 1;
}

/* FLOATING NOISE LIGHTS */
function floatingLights() {
  const glowSize = 130 + Math.sin(pulse * 0.8) * 30;

  const core = ctx.createRadialGradient(
    w / 2,
    h / 2,
    0,
    w / 2,
    h / 2,
    glowSize
  );

  core.addColorStop(0, "rgba(0,204,255,0.20)");
  core.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, glowSize, 0, Math.PI * 2);
  ctx.fill();
}

/* MAIN LOOP */
function animate() {
  requestAnimationFrame(animate);

  pulse += 0.02;

  ctx.clearRect(0, 0, w, h);

  drawGlowBackground();

  particles.forEach((p) => {
    p.update();
    p.draw();
  });

  connectParticles();
  floatingLights();
  drawScanLines();
}

animate();
