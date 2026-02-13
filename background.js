const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

let particles = [];
let scrollOffset = 0;

const isMobile = window.innerWidth < 768;

const config = {
  particleCount: isMobile ? 35 : 110,
  maxDistance: isMobile ? 70 : 130,
  speed: isMobile ? 0.25 : 0.6
};

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

window.addEventListener("scroll", () => {
  scrollOffset = window.scrollY * 0.2;
});

class Particle {
  constructor() {
    this.baseX = Math.random() * window.innerWidth;
    this.baseY = Math.random() * window.innerHeight;
    this.x = this.baseX;
    this.y = this.baseY;
    this.vx = (Math.random() - 0.5) * config.speed;
    this.vy = (Math.random() - 0.5) * config.speed;
    this.radius = isMobile ? 1 : 1.5;
  }

  update() {
    this.baseX += this.vx;
    this.baseY += this.vy;

    if (this.baseX < 0 || this.baseX > window.innerWidth) this.vx *= -1;
    if (this.baseY < 0 || this.baseY > window.innerHeight) this.vy *= -1;

    // Effet scroll subtil
    this.x = this.baseX;
    this.y = this.baseY - scrollOffset;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(96,165,250,0.8)";
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
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < config.maxDistance) {
        ctx.strokeStyle = `rgba(99,102,241,${1 - dist/config.maxDistance})`;
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  connectParticles();

  requestAnimationFrame(animate);
}

createParticles();
animate();
