/* =========================================================
   The pond at the end of the page.
   Water, light, and a few fish that have nowhere to be.
   ========================================================= */
(function () {
  const wrap = document.getElementById('pond');
  const canvas = document.getElementById('pondCanvas');
  if (!wrap || !canvas) { return; }

  const ctx = canvas.getContext('2d');
  let W = 800, H = 260, DPR = 1;
  let running = false, visible = false, raf = 0, last = 0, time = 0;

  function fit() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = wrap.clientWidth || 800;
    H = wrap.clientHeight || 260;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildFish();
  }

  /* ---------- the cast ---------- */
  const PALETTE = [
    { body: '#ff8a3c', fin: '#ffb877', belly: '#ffd7b0' },
    { body: '#4ea8e0', fin: '#8fd0f2', belly: '#cbe9fb' },
    { body: '#f2c14e', fin: '#ffe08a', belly: '#fff0c2' },
    { body: '#e0576b', fin: '#ff9aa8', belly: '#ffd2d9' },
    { body: '#7b6cf6', fin: '#b3a9ff', belly: '#ddd8ff' }
  ];

  let fish = [];
  let bubbles = [];

  function buildFish() {
    fish = [];
    const n = W < 520 ? 4 : 6;
    for (let i = 0; i < n; i++) {
      const p = PALETTE[i % PALETTE.length];
      const size = 14 + Math.random() * 16;
      fish.push({
        x: Math.random() * W,
        y: H * 0.30 + Math.random() * H * 0.52,
        size: size,
        dir: Math.random() > 0.5 ? 1 : -1,
        speed: 18 + Math.random() * 26,
        wob: Math.random() * 6.283,
        wobAmp: 6 + Math.random() * 10,
        wobSpd: 0.7 + Math.random() * 0.9,
        phase: Math.random() * 6.283,
        body: p.body, fin: p.fin, belly: p.belly,
        depth: 0.5 + Math.random() * 0.5
      });
    }
    bubbles = [];
    for (let i = 0; i < 18; i++) {
      bubbles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 1 + Math.random() * 3,
        v: 10 + Math.random() * 22,
        ph: Math.random() * 6.283
      });
    }
  }

  /* ---------- one fish ---------- */
  function drawFish(f) {
    const s = f.size;
    const wag = Math.sin(time * 5 + f.phase) * 0.42;
    const tilt = Math.sin(time * f.wobSpd + f.wob) * 0.10;

    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.scale(f.dir, 1);
    ctx.rotate(tilt);
    ctx.globalAlpha = 0.55 + f.depth * 0.45;

    // tail
    ctx.fillStyle = f.fin;
    ctx.beginPath();
    ctx.moveTo(-s * 0.95, 0);
    ctx.quadraticCurveTo(-s * 1.5, -s * 0.62 + wag * s, -s * 1.75, wag * s * 1.4);
    ctx.quadraticCurveTo(-s * 1.5, s * 0.62 + wag * s, -s * 0.95, 0);
    ctx.closePath();
    ctx.fill();

    // top fin
    ctx.beginPath();
    ctx.moveTo(-s * 0.25, -s * 0.42);
    ctx.quadraticCurveTo(-s * 0.05, -s * 0.95, s * 0.35, -s * 0.40);
    ctx.closePath();
    ctx.fill();

    // body
    ctx.fillStyle = f.body;
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s * 0.58, 0, 0, 6.283);
    ctx.fill();

    // belly
    ctx.fillStyle = f.belly;
    ctx.globalAlpha *= 0.55;
    ctx.beginPath();
    ctx.ellipse(s * 0.05, s * 0.18, s * 0.72, s * 0.30, 0, 0, 6.283);
    ctx.fill();
    ctx.globalAlpha = 0.55 + f.depth * 0.45;

    // side fin
    ctx.fillStyle = f.fin;
    ctx.beginPath();
    ctx.ellipse(s * 0.05, s * 0.10, s * 0.30, s * 0.16, 0.5, 0, 6.283);
    ctx.fill();

    // eye
    ctx.fillStyle = '#0d1620';
    ctx.beginPath();
    ctx.arc(s * 0.55, -s * 0.12, s * 0.12, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.beginPath();
    ctx.arc(s * 0.59, -s * 0.16, s * 0.045, 0, 6.283);
    ctx.fill();

    ctx.restore();
  }

  /* ---------- the water ---------- */
  function drawWater() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1a6f9c');
    g.addColorStop(0.35, '#12587f');
    g.addColorStop(1, '#072a41');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // light shafts from the surface
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
      const x = (i / 7) * W + Math.sin(time * 0.3 + i) * 40;
      const w = W * 0.06 + Math.sin(time * 0.5 + i * 2) * 12;
      const lg = ctx.createLinearGradient(x, 0, x + w * 0.6, H);
      lg.addColorStop(0, 'rgba(160,230,255,.16)');
      lg.addColorStop(1, 'rgba(160,230,255,0)');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.moveTo(x - w / 2, 0);
      ctx.lineTo(x + w / 2, 0);
      ctx.lineTo(x + w * 1.1, H);
      ctx.lineTo(x - w * 0.4, H);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // caustic ripples near the surface
    ctx.strokeStyle = 'rgba(180,240,255,.10)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 9; i++) {
      const y = (i / 9) * H * 0.5;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 14) {
        const yy = y + Math.sin(x * 0.02 + time * 1.1 + i) * 5;
        if (x === 0) { ctx.moveTo(x, yy); } else { ctx.lineTo(x, yy); }
      }
      ctx.stroke();
    }
  }

  function drawBubbles(dt) {
    bubbles.forEach(function (b) {
      b.y -= b.v * dt;
      b.x += Math.sin(time * 1.6 + b.ph) * 0.35;
      if (b.y < -6) { b.y = H + 6; b.x = Math.random() * W; }
      ctx.strokeStyle = 'rgba(200,240,255,.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, 6.283);
      ctx.stroke();
      ctx.fillStyle = 'rgba(200,240,255,.12)';
      ctx.fill();
    });
  }

  /* ---------- loop ---------- */
  function frame(now) {
    if (!running) { return; }
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    time += dt;

    ctx.clearRect(0, 0, W, H);
    drawWater();

    drawBubbles(dt);

    // deeper fish first
    const order = fish.slice().sort(function (a, b) { return a.depth - b.depth; });
    order.forEach(function (f) {
      f.x += f.speed * f.dir * dt;
      f.y += Math.sin(time * f.wobSpd + f.wob) * f.wobAmp * dt;
      if (f.dir > 0 && f.x > W + f.size * 2) { f.x = -f.size * 2; f.y = H * 0.30 + Math.random() * H * 0.52; }
      if (f.dir < 0 && f.x < -f.size * 2) { f.x = W + f.size * 2; f.y = H * 0.30 + Math.random() * H * 0.52; }
      drawFish(f);
    });

    // surface shimmer
    ctx.strokeStyle = 'rgba(220,250,255,.30)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 10) {
      const y = Math.sin(x * 0.03 + time * 2) * 3 + Math.sin(x * 0.011 - time * 1.3) * 4;
      if (x === 0) { ctx.moveTo(x, y + 2); } else { ctx.lineTo(x, y + 2); }
    }
    ctx.stroke();

    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running) { return; }
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  window.addEventListener('resize', function () { fit(); if (visible) { start(); } });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        visible = e.isIntersecting;
        if (visible) { start(); } else { stop(); }
      });
    }, { threshold: 0.05 });
    io.observe(wrap);
  } else {
    start();
  }

  fit();

  // test hook
  window.__pondFrame = function (tt) {
    fit();
    time = tt;
    ctx.clearRect(0, 0, W, H);
    drawWater();
    drawBubbles(0);
    fish.slice().sort(function (a, b) { return a.depth - b.depth; }).forEach(drawFish);
  };
})();
