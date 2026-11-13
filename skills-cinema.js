/* =========================================================
   "See my working skills"
   A bomb goes off, and out of the fire the four panels
   play — each one drifting and pushing in, like a camera
   moving across a still.
   ========================================================= */
(function () {
  const overlay = document.getElementById('cinema');
  const canvas = document.getElementById('cinemaCanvas');
  const captionEl = document.getElementById('cinemaCaption');
  const skip = document.getElementById('cinemaSkip');
  const trigger = document.getElementById('skillsBtn');
  if (!overlay || !canvas || !trigger) { return; }

  const ctx = canvas.getContext('2d');
  let W = 1280, H = 720, DPR = 1;

  function fit() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = overlay.clientWidth || window.innerWidth;
    H = overlay.clientHeight || window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  /* ---------- the four panels ---------- */
  const panels = [
    { src: 'assets/skills-fire.png',     name: 'Fire',     from: 3.6,  to: 10.6, zoom: 1.28, px:  0.5, py: -0.6 },
    { src: 'assets/skills-computer.png', name: 'Machine',  from: 10.6, to: 18.0, zoom: 1.24, px: -0.4, py:  0.4 },
    { src: 'assets/skills-race.png',     name: 'Speed',    from: 18.0, to: 25.0, zoom: 1.30, px:  0.3, py:  0.5 },
    { src: 'assets/skills-volcano.png',  name: 'Pressure', from: 25.0, to: 33.0, zoom: 1.26, px:  0.0, py: -0.5 }
  ];
  panels.forEach(function (p) {
    const im = new Image();
    im.src = p.src;
    p.img = im;
  });

  const T = {
    blast: 3.0,
    end: 35.0
  };

  let t = 0, running = false, last = 0, raf = 0, shake = 0;

  const captionAt = [];
  function cap(txt, at) { captionAt.push({ txt: txt, at: at }); }
  cap('Three\u2026', 0);
  cap('Two\u2026', 1);
  cap('One\u2026', 2);
  cap('', 3.1);
  cap('FIRE', 4.2);
  cap('MACHINE', 11.2);
  cap('SPEED', 18.6);
  cap('PRESSURE', 25.6);
  cap('SHRESTHA', 30.0);
  cap('', 33.4);

  let capIdx = -1;
  function updateCaption() {
    let idx = -1;
    for (let i = 0; i < captionAt.length; i++) { if (t >= captionAt[i].at) { idx = i; } }
    if (idx !== capIdx) {
      capIdx = idx;
      if (captionEl) { captionEl.textContent = idx >= 0 ? captionAt[idx].txt : ''; }
    }
  }

  function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }
  function ease(k) { return k * k * (3 - 2 * k); }
  function radial(x, y, r0, r1, stops) {
    const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
    stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
    return g;
  }

  /* ---------- the bomb ---------- */
  function drawBomb() {
    const cx = W / 2, cy = H * 0.52;

    ctx.fillStyle = '#080a0f';
    ctx.fillRect(-40, -40, W + 80, H + 80);

    ctx.fillStyle = radial(cx, cy + 120, 10, 300, [[0, 'rgba(255,120,40,.18)'], [1, 'rgba(255,120,40,0)']]);
    ctx.fillRect(cx - 300, cy - 60, 600, 360);

    const sparkX = cx + 74, sparkY = cy - 96;
    ctx.fillStyle = radial(sparkX, sparkY, 0, 34, [[0, 'rgba(255,255,220,.95)'], [0.4, 'rgba(255,190,90,.6)'], [1, 'rgba(255,140,40,0)']]);
    ctx.beginPath(); ctx.arc(sparkX, sparkY, 34, 0, 6.283); ctx.fill();

    ctx.strokeStyle = '#c9b48d';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + 8, cy - 62);
    ctx.quadraticCurveTo(cx + 62, cy - 96, sparkX, sparkY);
    ctx.stroke();

    const r = 96;
    ctx.fillStyle = radial(cx - 30, cy - 34, 8, r * 1.5, [[0, '#4a545f'], [0.45, '#232b34'], [1, '#0d1116']]);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.283); ctx.fill();

    ctx.fillStyle = radial(cx - 34, cy - 40, 2, 46, [[0, 'rgba(255,255,255,.55)'], [1, 'rgba(255,255,255,0)']]);
    ctx.beginPath(); ctx.arc(cx - 34, cy - 40, 46, 0, 6.283); ctx.fill();

    ctx.fillStyle = '#2b333d';
    ctx.beginPath();
    ctx.moveTo(cx - 24, cy - r + 6);
    ctx.lineTo(cx + 24, cy - r + 6);
    ctx.lineTo(cx + 16, cy - r - 22);
    ctx.lineTo(cx - 16, cy - r - 22);
    ctx.closePath(); ctx.fill();

    const tick = (t % 1);
    ctx.strokeStyle = 'rgba(255,90,50,' + (0.5 * (1 - tick)) + ')';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 30 + tick * 60, 0, 6.283);
    ctx.stroke();

    for (let i = 0; i < 26; i++) {
      const life = ((t * 1.7 + i * 0.37) % 1);
      const ang = i * 2.1;
      const d = 20 + life * 110;
      const x = sparkX + Math.cos(ang) * d;
      const y = sparkY + Math.sin(ang) * d - life * 40;
      ctx.fillStyle = 'rgba(255,' + Math.round(180 - life * 120) + ',80,' + (1 - life) + ')';
      ctx.beginPath(); ctx.arc(x, y, 2.4 * (1 - life) + 0.6, 0, 6.283); ctx.fill();
    }
  }

  /* ---------- one panel, drifting ---------- */
  function drawPanel(p, k, alpha) {
    const img = p.img;
    if (!img || !img.complete || !img.naturalWidth) { return; }

    const ar = img.naturalWidth / img.naturalHeight;
    const car = W / H;
    let dw, dh;
    if (ar > car) { dh = H; dw = H * ar; } else { dw = W; dh = W / ar; }

    const z = 1.04 + k * (p.zoom - 1.04);
    dw *= z; dh *= z;

    const x = (W - dw) / 2 + (p.px * W * 0.035) * (k - 0.5) * 2;
    const y = (H - dh) / 2 + (p.py * H * 0.035) * (k - 0.5) * 2;

    ctx.globalAlpha = alpha;
    ctx.drawImage(img, x, y, dw, dh);
    ctx.globalAlpha = 1;
  }

  /* ---------- the whole frame ---------- */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    ctx.save();
    if (shake > 0) {
      const s = shake * shake;
      ctx.translate((Math.random() - 0.5) * s * 26, (Math.random() - 0.5) * s * 20);
    }

    if (t < T.blast) {
      drawBomb();
    } else {
      // which panels are on screen, and how strongly
      panels.forEach(function (p, i) {
        if (t < p.from - 0.9 || t > p.to + 0.9) { return; }
        const k = clamp01((t - p.from) / (p.to - p.from));
        let a = 1;
        if (t < p.from) { a = clamp01((t - (p.from - 0.9)) / 0.9); }
        else if (t > p.to) { a = 1 - clamp01((t - p.to) / 0.9); }
        drawPanel(p, ease(k), a);
      });

      // the blast flash that hands over to the first panel
      if (t < T.blast + 1.4) {
        const a = 1 - clamp01((t - T.blast) / 1.4);
        ctx.fillStyle = radial(W / 2, H / 2, 10, Math.max(W, H) * 0.9, [
          [0, 'rgba(255,255,245,' + a + ')'],
          [0.25, 'rgba(255,220,140,' + (a * 0.9) + ')'],
          [0.6, 'rgba(255,120,30,' + (a * 0.55) + ')'],
          [1, 'rgba(120,20,5,0)']
        ]);
        ctx.fillRect(0, 0, W, H);
      }
    }

    ctx.restore();

    // a slow darkening as it closes
    if (t > 32.6) {
      const a = clamp01((t - 32.6) / 1.8);
      ctx.fillStyle = 'rgba(4,6,10,' + (a * 0.9) + ')';
      ctx.fillRect(0, 0, W, H);
      if (a > 0.35) {
        const na = clamp01((a - 0.35) / 0.65);
        ctx.save();
        ctx.globalAlpha = na;
        ctx.font = '900 ' + Math.min(W * 0.1, 120) + 'px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(255,140,50,.95)';
        ctx.shadowBlur = 54;
        ctx.fillStyle = '#ffe9c9';
        ctx.fillText('SHRESTHA', W / 2, H * 0.5);
        ctx.shadowBlur = 0;
        ctx.restore();
      }
    }
  }

  /* ---------- loop ---------- */
  function frame(now) {
    if (!running) { return; }
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;

    if (t > T.blast && shake > 0) { shake = Math.max(0, shake - dt * 1.2); }

    updateCaption();
    draw();

    if (t >= T.end) { finish(); return; }
    raf = requestAnimationFrame(frame);
  }

  function finish() {
    running = false;
    cancelAnimationFrame(raf);
    overlay.classList.add('done');
    setTimeout(function () {
      overlay.classList.remove('open');
      overlay.classList.remove('done');
      trigger.classList.remove('playing');
    }, 900);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    overlay.classList.remove('open');
    overlay.classList.remove('done');
    trigger.classList.remove('playing');
  }

  if (skip) { skip.addEventListener('click', function (e) { e.stopPropagation(); stop(); }); }

  trigger.addEventListener('click', function () {
    if (running) { return; }
    fit();
    t = 0;
    capIdx = -1;
    shake = 1;
    running = true;
    overlay.classList.add('open');
    overlay.classList.remove('done');
    trigger.classList.add('playing');
    last = performance.now();
    raf = requestAnimationFrame(frame);
  });

  window.addEventListener('resize', function () { if (running) { fit(); } });

  // test hook: draw one frame at a given moment
  window.__cinSet = function (tt) {
    fit();
    t = tt;
    capIdx = -1;
    shake = 0;
    updateCaption();
    draw();
  };

  fit();
})();
