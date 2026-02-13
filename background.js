/* =====================================================
   PITOJO Company - Premium Galaxy Particle System
   - Smooth 60FPS (adaptive)
   - Hover explosions (ring + sparks + glow)
   - Subtle mouse field (repel/attract)
   - Clean connections + dynamic glow
   - Touch support (tap burst)
===================================================== */

(() => {
  const canvas = document.getElementById("bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });

  /* =============================
     ENV / DEVICE
  ============================= */
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isMobile = window.innerWidth < 768;

  /* =============================
     STATE
  ============================= */
  let W = window.innerWidth;
  let H = window.innerHeight;
  let DPR = 1;

  const mouse = {
    x: W * 0.5,
    y: H * 0.5,
    vx: 0,
    vy: 0,
    active: false,
    down: false,
    lastX: null,
    lastY: null
  };

  let particles = [];
  let sparks = [];
  let rings = [];
  let rafId = null;

  /* =============================
     CONFIG
  ============================= */
  const CONFIG = {
    // density
    baseParticles: isMobile ? 45 : 130,
    maxDistance: isMobile ? 85 : 150,

    // motion
    baseSpeed: isMobile ? 0.28 : 0.75,
    drift: 0.012, // subtle random drift to avoid "grid" look

    // particle look
    minR: 0.9,
    maxR: 2.2,
    glowStrength: 0.8,

    // interaction
    hoverRadius: isMobile ? 18 : 22,
    fieldRadius: isMobile ? 90 : 160,
    fieldForce: isMobile ? 0.015 : 0.028, // push away near mouse
    fieldDamping: 0.92,

    // explosions
    explosionCooldown: 240, // ms per particle, avoids spam
    burstSparks: isMobile ? 10 : 18,
    sparkLife: isMobile ? 34 : 44,
    sparkSpeed: isMobile ? 3.0 : 4.2,
    ringLife: isMobile ? 22 : 28,
    ringMaxR: isMobile ? 28 : 36,

    // performance caps
    maxSparks: isMobile ? 220 : 520,
    maxRings: isMobile ? 26 : 50,

    // FPS & smoothing
    maxFPS: prefersReducedMotion ? 30 : 60,
    backgroundFade: 0.06, // trails: 0 = full clear, ~0.06 = subtle trail
    dprCap: isMobile ? 1.4 : 1.6
  };

  /* =============================
     HELPERS
  ============================= */
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dist2 = (x1, y1, x2, y2) => {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return dx * dx + dy * dy;
  };

  function setCanvasSize() {
    W = window.innerWidth;
    H = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, CONFIG.dprCap);

    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    // Draw using CSS pixels while keeping sharpness
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  /* =============================
     PARTICLE
  ============================= */
  class Particle {
    constructor() {
      this.reset(true);
      this.lastExplode = 0;
    }

    reset(randomPos = false) {
      this.x = randomPos ? Math.random() * W : clamp(this.x, 0, W);
      this.y = randomPos ? Math.random() * H : clamp(this.y, 0, H);

      const ang = Math.random() * Math.PI * 2;
      const sp = rand(0.35, 1.0) * CONFIG.baseSpeed;

      this.vx = Math.cos(ang) * sp;
      this.vy = Math.sin(ang) * sp;

      this.r = rand(CONFIG.minR, CONFIG.maxR);
      this.hue = rand(205, 265); // blue→violet range
      this.alpha = rand(0.65, 0.95);

      // tiny "individuality"
      this.tw = rand(0.6, 1.6); // twinkle speed
      this.t = rand(0, 1000);
    }

    explode(now) {
      if (now - this.lastExplode < CONFIG.explosionCooldown) return;
      this.lastExplode = now;

      // Ring effect
      rings.push(new Ring(this.x, this.y));
      if (rings.length > CONFIG.maxRings) rings.splice(0, rings.length - CONFIG.maxRings);

      // Spark burst
      const n = CONFIG.burstSparks;
      for (let i = 0; i < n; i++) sparks.push(new Spark(this.x, this.y, this.hue));
      if (sparks.length > CONFIG.maxSparks) sparks.splice(0, sparks.length - CONFIG.maxSparks);
    }

    update(now) {
      // twinkle
      this.t += this.tw;
      const twk = 0.14 * Math.sin(this.t * 0.03);
      this._alpha = clamp(this.alpha + twk, 0.35, 1);

      // subtle drift (prevents "straight line" monotony)
      this.vx += (Math.random() - 0.5) * CONFIG.drift;
      this.vy += (Math.random() - 0.5) * CONFIG.drift;

      // mouse field (repel near pointer)
      if (mouse.active) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        const r2 = CONFIG.fieldRadius * CONFIG.fieldRadius;

        if (d2 < r2 && d2 > 0.0001) {
          const d = Math.sqrt(d2);
          const f = (1 - d / CONFIG.fieldRadius) * CONFIG.fieldForce;

          // Repel outward + slight swirl based on mouse velocity
          const nx = dx / d;
          const ny = dy / d;

          this.vx += nx * f + mouse.vx * 0.002;
          this.vy += ny * f + mouse.vy * 0.002;
        }

        // hover explosion
        const h2 = CONFIG.hoverRadius * CONFIG.hoverRadius;
        if (d2 < h2) {
          this.explode(now);
          // small kick so it doesn't instantly re-trigger
          this.vx += (Math.random() - 0.5) * 1.4;
          this.vy += (Math.random() - 0.5) * 1.4;
        }
      }

      // move
      this.x += this.vx;
      this.y += this.vy;

      // damping for stability
      this.vx *= 0.995;
      this.vy *= 0.995;

      // bounce
      if (this.x < 0) { this.x = 0; this.vx *= -1; }
      else if (this.x > W) { this.x = W; this.vx *= -1; }

      if (this.y < 0) { this.y = 0; this.vy *= -1; }
      else if (this.y > H) { this.y = H; this.vy *= -1; }
    }

    draw() {
      // glow
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.shadowBlur = 10 * CONFIG.glowStrength;
      ctx.shadowColor = `hsla(${this.hue}, 95%, 70%, ${this._alpha})`;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 95%, 68%, ${this._alpha})`;
      ctx.fill();

      ctx.restore();
    }
  }

  /* =============================
     SPARK (Explosion)
  ============================= */
  class Spark {
    constructor(x, y, baseHue) {
      this.x = x;
      this.y = y;

      const ang = Math.random() * Math.PI * 2;
      const sp = rand(0.7, 1.0) * CONFIG.sparkSpeed;

      this.vx = Math.cos(ang) * sp;
      this.vy = Math.sin(ang) * sp;

      this.life = CONFIG.sparkLife;
      this.maxLife = CONFIG.sparkLife;

      this.r = rand(0.8, 2.2);
      this.hue = baseHue + rand(-18, 22);
      this.drag = rand(0.90, 0.95);
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      this.vx *= this.drag;
      this.vy *= this.drag;

      this.life--;
      this.r *= 0.965;
    }

    draw() {
      const a = this.life / this.maxLife;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.shadowBlur = 18 * a;
      ctx.shadowColor = `hsla(${this.hue}, 100%, 65%, ${a})`;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 100%, 62%, ${a})`;
      ctx.fill();

      ctx.restore();
    }
  }

  /* =============================
     RING (Explosion Wave)
  ============================= */
  class Ring {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.life = CONFIG.ringLife;
      this.maxLife = CONFIG.ringLife;
      this.r = 2;
      this.maxR = CONFIG.ringMaxR;
      this.hue = rand(210, 265);
      this.thick = rand(1.0, 1.8);
    }

    update() {
      const t = 1 - this.life / this.maxLife;
      // easeOutQuad
      const e = 1 - (1 - t) * (1 - t);

      this.r = 2 + e * this.maxR;
      this.life--;
    }

    draw() {
      const a = this.life / this.maxLife;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = this.thick;
      ctx.shadowBlur = 20 * a;
      ctx.shadowColor = `hsla(${this.hue}, 100%, 70%, ${a})`;
      ctx.strokeStyle = `hsla(${this.hue}, 100%, 70%, ${0.65 * a})`;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }
  }

  /* =============================
     INIT
  ============================= */
  function initParticles() {
    particles = [];
    for (let i = 0; i < CONFIG.baseParticles; i++) particles.push(new Particle());
  }

  /* =============================
     CONNECTIONS
  ============================= */
  function drawConnections() {
    // Lines look nicer with "lighter"
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const d2 = dx * dx + dy * dy;
        const maxD2 = CONFIG.maxDistance * CONFIG.maxDistance;

        if (d2 < maxD2) {
          const d = Math.sqrt(d2);
          const t = 1 - d / CONFIG.maxDistance;

          // Slightly stronger near mouse, makes it feel "alive"
          let boost = 1;
          if (mouse.active) {
            const m = Math.sqrt(dist2((p1.x + p2.x) * 0.5, (p1.y + p2.y) * 0.5, mouse.x, mouse.y));
            boost = 1 + clamp(1 - m / (CONFIG.fieldRadius * 1.1), 0, 1) * 0.7;
          }

          const a = 0.18 * t * boost;
          ctx.lineWidth = 0.6 * t;

          // Gradient line (blue->violet)
          const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          grad.addColorStop(0, `hsla(215, 100%, 70%, ${a})`);
          grad.addColorStop(1, `hsla(250, 100%, 72%, ${a})`);

          ctx.strokeStyle = grad;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  /* =============================
     DRAW BACKDROP FADE (trails)
  ============================= */
  function fadeBackground() {
    // Slight alpha fill = trails
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(5, 6, 13, ${CONFIG.backgroundFade})`;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* =============================
     INPUT
  ============================= */
  function onPointerMove(x, y) {
    if (mouse.lastX == null) mouse.lastX = x;
    if (mouse.lastY == null) mouse.lastY = y;

    mouse.vx = (x - mouse.lastX);
    mouse.vy = (y - mouse.lastY);

    mouse.lastX = x;
    mouse.lastY = y;

    mouse.x = x;
    mouse.y = y;
    mouse.active = true;
  }

  function onPointerLeave() {
    mouse.active = false;
    mouse.vx = 0;
    mouse.vy = 0;
    mouse.lastX = null;
    mouse.lastY = null;
  }

  window.addEventListener("mousemove", (e) => onPointerMove(e.clientX, e.clientY), { passive: true });
  window.addEventListener("mouseleave", onPointerLeave, { passive: true });

  // Touch: burst at tap location
  window.addEventListener("touchstart", (e) => {
    if (!e.touches || !e.touches[0]) return;
    const t = e.touches[0];
    onPointerMove(t.clientX, t.clientY);
    // create a pulse
    burstAt(mouse.x, mouse.y, 1.2);
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (!e.touches || !e.touches[0]) return;
    const t = e.touches[0];
    onPointerMove(t.clientX, t.clientY);
  }, { passive: true });

  window.addEventListener("touchend", () => {
    onPointerLeave();
  }, { passive: true });

  /* =============================
     BURST HELPERS
  ============================= */
  function burstAt(x, y, power = 1) {
    rings.push(new Ring(x, y));
    if (rings.length > CONFIG.maxRings) rings.splice(0, rings.length - CONFIG.maxRings);

    const count = Math.floor(CONFIG.burstSparks * power);
    for (let i = 0; i < count; i++) sparks.push(new Spark(x, y, rand(210, 260)));
    if (sparks.length > CONFIG.maxSparks) sparks.splice(0, sparks.length - CONFIG.maxSparks);
  }

  /* =============================
     ANIMATION LOOP (FPS cap)
  ============================= */
  let last = 0;
  const frameInterval = 1000 / CONFIG.maxFPS;

  function frame(ts) {
    if (prefersReducedMotion) {
      // minimal motion mode
      ctx.clearRect(0, 0, W, H);
    } else {
      // trails
      fadeBackground();
    }

    if (ts - last < frameInterval) {
      rafId = requestAnimationFrame(frame);
      return;
    }
    last = ts;

    // Update particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update(ts);
      particles[i].draw();
    }

    // Connections after particles for clean overlay
    drawConnections();

    // Update rings
    for (let i = rings.length - 1; i >= 0; i--) {
      rings[i].update();
      rings[i].draw();
      if (rings[i].life <= 0) rings.splice(i, 1);
    }

    // Update sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      sparks[i].update();
      sparks[i].draw();
      if (sparks[i].life <= 0 || sparks[i].r < 0.15) sparks.splice(i, 1);
    }

    rafId = requestAnimationFrame(frame);
  }

  /* =============================
     RESIZE / REINIT
  ============================= */
  function onResize() {
    setCanvasSize();
    // recreate particles for new dimensions, keeps density consistent
    initParticles();

    // clear trails buffer
    ctx.clearRect(0, 0, W, H);
    // fill once with transparent black to avoid flash
    ctx.fillStyle = "rgba(5, 6, 13, 1)";
    ctx.fillRect(0, 0, W, H);
  }

  window.addEventListener("resize", () => {
    // debounced resize
    clearTimeout(onResize._t);
    onResize._t = setTimeout(onResize, 120);
  });

  /* =============================
     START
  ============================= */
  setCanvasSize();
  initParticles();

  // Pre-fill background so trails look good instantly
  ctx.fillStyle = "rgba(5, 6, 13, 1)";
  ctx.fillRect(0, 0, W, H);

  rafId = requestAnimationFrame(frame);

  /* =============================
     OPTIONAL: pause when tab hidden
  ============================= */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    } else {
      last = 0;
      rafId = requestAnimationFrame(frame);
    }
  });
})();
