const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

let width, height;
const mouse = { x: null, y: null };
const particles = [];

const CONFIG = {
  COUNT: 260,
  LINK_DIST: 160,
  MOUSE_RADIUS: 260,
  ATTRACTION: 0.025,
  REPULSION: 0.04,
  FRICTION: 0.985
};

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

window.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("mouseleave", () => {
  mouse.x = null;
  mouse.y = null;
});

class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.6;
    this.size = Math.random() * 2.2 + 0.8;
    this.energy = Math.random();
  }

  update() {
    if (mouse.x !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONFIG.MOUSE_RADIUS) {
        const force = (1 - dist / CONFIG.MOUSE_RADIUS);
        this.vx += dx / dist * force * CONFIG.ATTRACTION;
        this.vy += dy / dist * force * CONFIG.ATTRACTION;
      }
    }

    this.x += this.vx;
    this.y += this.vy;

    this.vx *= CONFIG.FRICTION;
    this.vy *= CONFIG.FRICTION;

    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(147,197,253,0.9)";
    ctx.fill();
  }
}

for (let i = 0; i < CONFIG.COUNT; i++) {
  particles.push(new Particle());
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONFIG.LINK_DIST) {
        ctx.strokeStyle = `rgba(129,140,248,${1 - dist / CONFIG.LINK_DIST})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  drawConnections();
  requestAnimationFrame(animate);
}

animate();
