const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.zIndex = "-1";

let w, h;
function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

const isMobile = window.innerWidth < 768;
const PARTICLES = isMobile ? 70 : 140;
const MAX_DIST = isMobile ? 130 : 170;

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
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = (Math.random() - 0.5) * 0.8;
    this.size = Math.random() * 2 + 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > w) this.vx *= -1;
    if (this.y < 0 || this.y > h) this.vy *= -1;

    // attraction légère vers la souris
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    this.x += dx * 0.0002;
    this.y += dy * 0.0002;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

    ctx.fillStyle = "rgba(56,189,248,0.9)";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(56,189,248,0.8)";
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

const particles = [];
for (let i = 0; i < PARTICLES; i++) particles.push(new Particle());

let pulse = 0;

function drawBackgroundGlow() {
  const gradient = ctx.createRadialGradient(
    w / 2,
    h / 2,
    100,
    w / 2,
    h / 2,
    w
  );

  gradient.addColorStop(0, "rgba(0,200,255,0.08)");
  gradient.addColorStop(0.5, "rgba(0,50,120,0.04)");
  gradient.addColorStop(1, "rgba(0,0,0,0.95)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

function connectParticles() {
  for (let a = 0; a < particles.length; a++) {
    for (let b = a + 1; b < particles.length; b++) {
      const dx = particles[a].x - particles[b].x;
      const dy = particles[a].y - particles[b].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MAX_DIST) {
        const opacity = (1 - dist / MAX_DIST) * 0.3;

        ctx.strokeStyle = `rgba(0,204,255,${opacity})`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}

function drawScanLines() {
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#00ccff";

  for (let y = 0; y < h; y += 5) {
    ctx.fillRect(0, y, w, 1);
  }
  ctx.globalAlpha = 1;
}

function animate() {
  requestAnimationFrame(animate);

  pulse += 0.02;

  ctx.clearRect(0, 0, w, h);

  drawBackgroundGlow();

  particles.forEach((p) => {
    p.update();
    p.draw();
  });

  connectParticles();

  // core pulse
  const coreSize = 80 + Math.sin(pulse) * 15;
  const core = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, coreSize);

  core.addColorStop(0, "rgba(0,204,255,0.22)");
  core.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, coreSize, 0, Math.PI * 2);
  ctx.fill();

  drawScanLines();
}

animate();
