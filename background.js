/* =====================================================
   PITOJO Company - Advanced Particle Galaxy System
   Explosion on Hover - Ultra Smooth - 60FPS Stable
===================================================== */

const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

/* =============================
   GLOBAL VARIABLES
============================= */

let particles = [];
let sparks = [];
let mouse = { x: null, y: null, active: false };

const isMobile = window.innerWidth < 768;

/* =============================
   CONFIGURATION
============================= */

const CONFIG = {
  baseParticles: isMobile ? 40 : 120,
  maxDistance: isMobile ? 70 : 140,
  baseSpeed: isMobile ? 0.3 : 0.7,
  explosionParticles: 12,
  sparkLife: 40,
  maxFPS: 60
};

/* =============================
   CANVAS RESIZE
============================= */

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* =============================
   MOUSE EVENTS
============================= */

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});

window.addEventListener("mouseleave", () => {
  mouse.active = false;
});

/* =============================
   PARTICLE CLASS
============================= */

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.vx = (Math.random() - 0.5) * CONFIG.baseSpeed;
    this.vy = (Math.random() - 0.5) * CONFIG.baseSpeed;
    this.radius = Math.random() * 1.5 + 1;
    this.colorHue = 200 + Math.random() * 80; // bleu → violet
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x <= 0 || this.x >= window.innerWidth) this.vx *= -1;
    if (this.y <= 0 || this.y >= window.innerHeight) this.vy *= -1;

    // Explosion trigger
    if (mouse.active) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 20) {
        this.explode();
        this.reset();
      }
    }
  }

  explode() {
    for (let i = 0; i < CONFIG.explosionParticles; i++) {
      sparks.push(new Spark(this.x, this.y));
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${this.colorHue}, 90%, 65%)`;
    ctx.fill();
  }
}

/* =============================
   SPARK CLASS (Explosion)
============================= */

class Spark {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 3 + 1;
    this.life = CONFIG.sparkLife;
    this.radius = Math.random() * 2 + 0.5;
    this.hue = 180 + Math.random() * 120; // cyan → violet
  }

  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.life--;
    this.radius *= 0.96;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, ${this.life / CONFIG.sparkLife})`;
    ctx.fill();
  }
}

/* =============================
   PARTICLE CREATION
============================= */

function initParticles() {
  particles = [];
  for (let i = 0; i < CONFIG.baseParticles; i++) {
    particles.push(new Particle());
  }
}

initParticles();

/* =============================
   CONNECTION LINES
============================= */

function connectParticles() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONFIG.maxDistance) {
        ctx.strokeStyle = `hsla(230, 100%, 70%, ${1 - dist / CONFIG.maxDistance})`;
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

/* =============================
   MAIN ANIMATION LOOP
============================= */

let lastFrameTime = 0;
const frameInterval = 1000 / CONFIG.maxFPS;

function animate(timestamp) {

  if (timestamp - lastFrameTime < frameInterval) {
    requestAnimationFrame(animate);
    return;
  }

  lastFrameTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw base particles
  particles.forEach(p => {
    p.update();
    p.draw();
  });

  // Draw connections
  connectParticles();

  // Update sparks
  for (let i = sparks.length - 1; i >= 0; i--) {
    sparks[i].update();
    sparks[i].draw();

    if (sparks[i].life <= 0) {
      sparks.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
