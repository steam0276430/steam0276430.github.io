const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

let particles = [];
let animationId;

const isMobile = window.innerWidth < 768;

const config = {
  particleCount: isMobile ? 40 : 120,
  maxDistance: isMobile ? 80 : 140,
  speed: isMobile ? 0.4 : 0.7
};

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.scale(dpr, dpr);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.vx = (Math.random() - 0.5) * config.speed;
    this.vy = (Math.random() - 0.5) * config.speed;
    this.radius = 1.5;
  }

  move() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
    if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#60a5fa";
    ctx.fill();
  }
}

function createParticles() {
  particles = [];
  for (let i = 0; i < config.particleCount; i++) {
    particles.push(new Particle());
  }
}

function connectParticles() {
  for (let a = 0; a < particles.length; a++) {
    for (let b = a; b < particles.length; b++) {

      const dx = particles[a].x - particles[b].x;
      const dy = particles[a].y - particles[b].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < config.maxDistance) {
        ctx.strokeStyle = "rgba(99,102,241," + (1 - distance / config.maxDistance) + ")";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let p of particles) {
    p.move();
    p.draw();
  }

  connectParticles();
  animationId = requestAnimationFrame(animate);
}

createParticles();
animate();
