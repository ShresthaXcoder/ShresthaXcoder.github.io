/* =========================================================
   "See my working skills" — a thirty-five second 2D film.
   Drawn, not modelled: flat vector art, retro racer, CRT,
   and a volcano that raises the name.
   ========================================================= */
(function () {
  const overlay = document.getElementById('cinema');
  const canvas = document.getElementById('cinemaCanvas');
  const captionEl = document.getElementById('cinemaCaption');
  const skip = document.getElementById('cinemaSkip');
  const trigger = document.getElementById('skillsBtn');
  window.__cinLoaded = true;
  if (!overlay || !canvas || !trigger) { window.__cinWhy = 'missing elements'; return; }

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

  /* ---------- the script ---------- */
  const T = {
    fuse: 0,
    blast: 3.0,
    fireOut: 6.2,
    crt: 6.6,
    crtOn: 8.2,
    zoom: 11.6,
    road: 13.2,
    race: 14.4,
    finish: 24.0,
    confetti: 24.4,
    volcano: 26.4,
    lava: 30.2,
    name: 31.6,
    end: 35.0
  };

  let t = 0, running = false, last = 0, raf = 0;
  let shake = 0;
  const captionAt = [];

  function caption(txt, at) {
    captionAt.push({ txt: txt, at: at });
  }
  caption('Three\u2026', 0);
  caption('Two\u2026', 1);
  caption('One\u2026', 2);
  caption('', 3.05);
  caption('FIRE', 3.4);
  caption('Something is waking up\u2026', 7.0);
  caption('SHRESTHA', 8.6);
  caption('Clear the grid.', 13.4);
  caption('Five cars. One line.', 14.8);
  caption('FINISH', 24.2);
  caption('And out of the fire\u2026', 26.8);
  caption('SHRESTHA', 31.8);

  let capIdx = -1;
  function updateCaption() {
    let idx = -1;
    for (let i = 0; i < captionAt.length; i++) { if (t >= captionAt[i].at) { idx = i; } }
    if (idx !== capIdx) {
      capIdx = idx;
      if (captionEl) { captionEl.textContent = idx >= 0 ? captionAt[idx].txt : ''; }
    }
  }

  /* ---------- helpers ---------- */
  function lerp(a, b, k) { return a + (b - a) * k; }
  function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }
  function ease(k) { return k * k * (3 - 2 * k); }

  function grad(x0, y0, x1, y1, stops) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
    return g;
  }
  function radial(x, y, r0, r1, stops) {
    const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
    stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
    return g;
  }

  /* ---------- 1. the bomb ---------- */
  function drawBomb() {
    const cx = W / 2, cy = H * 0.52;
    const pop = 1 - clamp01((t - 2.4) / 0.6);

    // floor glow
    ctx.fillStyle = radial(cx, cy + 120, 10, 300, [[0, 'rgba(255,120,40,.18)'], [1, 'rgba(255,120,40,0)']]);
    ctx.fillRect(cx - 300, cy - 60, 600, 360);

    // fuse spark
    const sparkX = cx + 74, sparkY = cy - 96;
    ctx.fillStyle = radial(sparkX, sparkY, 0, 34, [[0, 'rgba(255,255,220,.95)'], [0.4, 'rgba(255,190,90,.6)'], [1, 'rgba(255,140,40,0)']]);
    ctx.beginPath(); ctx.arc(sparkX, sparkY, 34, 0, 6.283); ctx.fill();

    // fuse
    ctx.strokeStyle = '#c9b48d';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + 8, cy - 62);
    ctx.quadraticCurveTo(cx + 62, cy - 96, sparkX, sparkY);
    ctx.stroke();

    // body
    const r = 96 * (0.9 + 0.1 * pop);
    ctx.fillStyle = radial(cx - 30, cy - 34, 8, r * 1.5, [[0, '#4a545f'], [0.45, '#232b34'], [1, '#0d1116']]);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.283); ctx.fill();

    // highlight
    ctx.fillStyle = radial(cx - 34, cy - 40, 2, 46, [[0, 'rgba(255,255,255,.55)'], [1, 'rgba(255,255,255,0)']]);
    ctx.beginPath(); ctx.arc(cx - 34, cy - 40, 46, 0, 6.283); ctx.fill();

    // cap
    ctx.fillStyle = '#2b333d';
    ctx.beginPath();
    ctx.moveTo(cx - 24, cy - r + 6);
    ctx.lineTo(cx + 24, cy - r + 6);
    ctx.lineTo(cx + 16, cy - r - 22);
    ctx.lineTo(cx - 16, cy - r - 22);
    ctx.closePath(); ctx.fill();

    // ticking ring
    const tick = (t % 1);
    ctx.strokeStyle = 'rgba(255,90,50,' + (0.5 * (1 - tick)) + ')';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 30 + tick * 60, 0, 6.283);
    ctx.stroke();

    // embers off the fuse
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

  /* ---------- 2. fire, full frame ---------- */
  function drawFire(alpha, heat) {
    // the furnace behind
    ctx.fillStyle = radial(W / 2, H * 0.72, 40, Math.max(W, H) * 0.85, [
      [0, 'rgba(255,246,210,' + (0.95 * alpha) + ')'],
      [0.18, 'rgba(255,190,70,' + (0.9 * alpha) + ')'],
      [0.45, 'rgba(255,110,25,' + (0.8 * alpha) + ')'],
      [0.75, 'rgba(180,40,10,' + (0.55 * alpha) + ')'],
      [1, 'rgba(60,8,4,' + (0.2 * alpha) + ')']
    ]);
    ctx.fillRect(0, 0, W, H);

    // tongues of flame
    const N = 26;
    for (let i = 0; i < N; i++) {
      const p = i / N;
      const bx = W * (0.06 + p * 0.9) + Math.sin(t * 1.6 + i * 2.3) * W * 0.03;
      const h = H * (0.45 + 0.5 * Math.abs(Math.sin(t * 1.9 + i * 1.7))) * heat;
      const w = W * (0.045 + 0.03 * Math.sin(i * 3.1));
      const sway = Math.sin(t * 3.1 + i * 1.9) * w * 0.8;

      ctx.beginPath();
      ctx.moveTo(bx - w, H);
      ctx.quadraticCurveTo(bx - w * 0.7, H - h * 0.55, bx + sway, H - h);
      ctx.quadraticCurveTo(bx + w * 0.7, H - h * 0.55, bx + w, H);
      ctx.closePath();

      ctx.fillStyle = grad(bx, H, bx, H - h, [
        [0, 'rgba(255,70,10,' + (0.0 * alpha) + ')'],
        [0.25, 'rgba(255,120,20,' + (0.75 * alpha) + ')'],
        [0.62, 'rgba(255,180,45,' + (0.9 * alpha) + ')'],
        [0.88, 'rgba(255,232,140,' + (0.85 * alpha) + ')'],
        [1, 'rgba(255,255,235,0)']
      ]);
      ctx.fill();
    }

    // flying embers
    for (let i = 0; i < 90; i++) {
      const seed = i * 0.618;
      const life = ((t * (0.35 + (i % 7) * 0.06) + seed) % 1);
      const x = ((seed * 7919) % 100) / 100 * W + Math.sin(t * 2 + i) * 30;
      const y = H - life * H * 1.05;
      const s = 1.6 + (i % 5) * 0.7;
      ctx.fillStyle = 'rgba(255,' + Math.round(200 - life * 140) + ',70,' + ((1 - life) * 0.95 * alpha) + ')';
      ctx.beginPath(); ctx.arc(x, y, s * (1 - life * 0.5), 0, 6.283); ctx.fill();
    }
  }

  /* ---------- 3. the CRT ---------- */
  function drawCRT(on) {
    // purple room
    ctx.fillStyle = grad(0, 0, 0, H, [[0, '#3b1d63'], [0.55, '#4b2378'], [1, '#2a1445']]);
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) {
      const y = (i / 26) * H;
      ctx.fillStyle = 'rgba(255,255,255,0.025)';
      ctx.fillRect(0, y, W, 2);
    }

    const cx = W / 2, cy = H * 0.46;
    const mw = Math.min(W * 0.52, 620), mh = mw * 0.78;

    // monitor shadow
    ctx.fillStyle = 'rgba(0,0,0,.45)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + mh * 0.62, mw * 0.5, mh * 0.1, 0, 0, 6.283);
    ctx.fill();

    // bezel
    ctx.fillStyle = grad(0, cy - mh / 2, 0, cy + mh / 2, [[0, '#efe9d8'], [0.6, '#ddd5c0'], [1, '#b8ae95']]);
    roundRect(cx - mw / 2, cy - mh / 2, mw, mh, mw * 0.045);
    ctx.fill();

    // inner bevel
    ctx.strokeStyle = 'rgba(120,110,90,.45)';
    ctx.lineWidth = 3;
    roundRect(cx - mw / 2 + 10, cy - mh / 2 + 10, mw - 20, mh - 20, mw * 0.035);
    ctx.stroke();

    // screen
    const sw = mw * 0.78, sh = mh * 0.66;
    const sx = cx - sw / 2, sy = cy - sh / 2 - mh * 0.03;

    ctx.save();
    roundRect(sx, sy, sw, sh, mw * 0.03);
    ctx.clip();

    if (!on) {
      ctx.fillStyle = '#0a0d12';
      ctx.fillRect(sx, sy, sw, sh);
    } else {
      ctx.fillStyle = grad(sx, sy, sx, sy + sh, [[0, '#0b1a3a'], [0.5, '#103a6b'], [1, '#0a2244']]);
      ctx.fillRect(sx, sy, sw, sh);

      // scrolling grid
      ctx.strokeStyle = 'rgba(90,220,255,.22)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 14; i++) {
        const yy = sy + ((i * 26 + t * 40) % sh);
        ctx.beginPath(); ctx.moveTo(sx, yy); ctx.lineTo(sx + sw, yy); ctx.stroke();
      }
      for (let i = 0; i < 18; i++) {
        const xx = sx + ((i * 40 + t * 18) % sw);
        ctx.beginPath(); ctx.moveTo(xx, sy); ctx.lineTo(xx, sy + sh); ctx.stroke();
      }

      // the name on the screen
      const fs = sw * 0.13;
      ctx.font = '900 ' + fs + 'px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(90,220,255,.9)';
      ctx.shadowBlur = 26;
      ctx.fillStyle = '#d9f6ff';
      ctx.fillText('SHRESTHA', sx + sw / 2, sy + sh * 0.44);
      ctx.shadowBlur = 0;

      ctx.font = '600 ' + (fs * 0.32) + 'px ui-monospace, monospace';
      ctx.fillStyle = 'rgba(150,230,255,.75)';
      ctx.fillText('WORKING SKILLS', sx + sw / 2, sy + sh * 0.66);

      // scanlines
      ctx.fillStyle = 'rgba(0,0,0,.22)';
      for (let y = sy; y < sy + sh; y += 4) { ctx.fillRect(sx, y, sw, 2); }

      // glass sheen
      ctx.fillStyle = 'rgba(255,255,255,.07)';
      ctx.beginPath();
      ctx.moveTo(sx, sy); ctx.lineTo(sx + sw * 0.42, sy);
      ctx.lineTo(sx, sy + sh * 0.55); ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    // power led
    ctx.fillStyle = on ? '#57e06a' : '#3a4038';
    ctx.beginPath(); ctx.arc(cx + mw * 0.34, cy + mh * 0.42, 5, 0, 6.283); ctx.fill();

    // stand
    ctx.fillStyle = '#c9c1ab';
    ctx.beginPath();
    ctx.moveTo(cx - mw * 0.09, cy + mh / 2 - 6);
    ctx.lineTo(cx + mw * 0.09, cy + mh / 2 - 6);
    ctx.lineTo(cx + mw * 0.14, cy + mh / 2 + mh * 0.09);
    ctx.lineTo(cx - mw * 0.14, cy + mh / 2 + mh * 0.09);
    ctx.closePath(); ctx.fill();

    // keyboard
    const kw = mw * 0.82, kh = mh * 0.13;
    ctx.fillStyle = grad(0, cy + mh * 0.62, 0, cy + mh * 0.62 + kh, [[0, '#e6dfcc'], [1, '#bdb4a0']]);
    roundRect(cx - kw / 2, cy + mh * 0.62, kw, kh, 8);
    ctx.fill();
    ctx.fillStyle = 'rgba(90,82,68,.35)';
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 16; c++) {
        ctx.fillRect(cx - kw / 2 + 12 + c * (kw - 24) / 16, cy + mh * 0.62 + 8 + r * (kh - 16) / 3, (kw - 24) / 16 - 4, (kh - 16) / 3 - 3);
      }
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ---------- 4. the race ---------- */
  const HORIZON = 0.40;

  function roadGeom(z) {
    const hy = H * HORIZON;
    const y = hy + (H * (1 - HORIZON)) / z;
    const half = (W * 0.92) / z;
    return { y: y, half: half };
  }

  function drawRace() {
    const hy = H * HORIZON;

    // sky
    ctx.fillStyle = grad(0, 0, 0, hy, [[0, '#6fb3e8'], [0.6, '#a9d4f2'], [1, '#dfeefb']]);
    ctx.fillRect(0, 0, W, hy);

    // distant city
    ctx.fillStyle = '#8fb7d6';
    for (let i = 0; i < 26; i++) {
      const bw = W * 0.02 + (i % 4) * W * 0.008;
      const bh = H * (0.03 + ((i * 37) % 9) * 0.008);
      ctx.fillRect((i / 26) * W, hy - bh, bw, bh);
    }

    // grass
    ctx.fillStyle = grad(0, hy, 0, H, [[0, '#4f9a4a'], [1, '#2f6b2c']]);
    ctx.fillRect(0, hy, W, H - hy);

    // road
    const near = roadGeom(1.0), far = roadGeom(14);
    ctx.fillStyle = grad(0, hy, 0, H, [[0, '#6b6f78'], [1, '#3d4149']]);
    ctx.beginPath();
    ctx.moveTo(W / 2 - near.half, near.y);
    ctx.lineTo(W / 2 - far.half, far.y);
    ctx.lineTo(W / 2 + far.half, far.y);
    ctx.lineTo(W / 2 + near.half, near.y);
    ctx.closePath(); ctx.fill();

    // verges
    [['#d94f3a', -1], ['#f0f0f0', 1]].forEach(function (v) {
      ctx.fillStyle = v[0];
      ctx.beginPath();
      ctx.moveTo(W / 2 + v[1] * (near.half - 26), near.y);
      ctx.lineTo(W / 2 + v[1] * (far.half - 8), far.y);
      ctx.lineTo(W / 2 + v[1] * (far.half + 2), far.y);
      ctx.lineTo(W / 2 + v[1] * (near.half + 14), near.y);
      ctx.closePath(); ctx.fill();
    });

    // centre dashes, moving
    const speed = (t - T.race) * 2.2;
    for (let i = 0; i < 22; i++) {
      const z = 1.2 + ((i + (speed % 1)) * 0.62);
      if (z > 13) { continue; }
      const a = roadGeom(z), b = roadGeom(z + 0.3);
      const wA = Math.max(2, 30 / z), wB = Math.max(1, 30 / (z + 0.3));
      ctx.fillStyle = 'rgba(255,255,255,' + (0.9 - z * 0.05) + ')';
      ctx.beginPath();
      ctx.moveTo(W / 2 - wA, a.y); ctx.lineTo(W / 2 - wB, b.y);
      ctx.lineTo(W / 2 + wB, b.y); ctx.lineTo(W / 2 + wA, a.y);
      ctx.closePath(); ctx.fill();
    }

    // start gantry
    const g = roadGeom(9);
    ctx.fillStyle = '#3b4a63';
    ctx.fillRect(W / 2 - g.half - 26, g.y - H * 0.20, 10, H * 0.20);
    ctx.fillRect(W / 2 + g.half + 16, g.y - H * 0.20, 10, H * 0.20);
    ctx.fillRect(W / 2 - g.half - 26, g.y - H * 0.20, g.half * 2 + 52, 14);

    // lights
    for (let i = 0; i < 3; i++) {
      const lit = t > T.race - 1.2 + i * 0.35;
      ctx.fillStyle = lit ? '#ff3b30' : '#4a1a18';
      ctx.beginPath();
      ctx.arc(W / 2 - 30 + i * 30, g.y - H * 0.20 + 7, 6, 0, 6.283);
      ctx.fill();
    }

    // cars, far to near
    const cars = [];
    for (let i = 0; i < 5; i++) {
      const rp = Math.max(0, t - T.race);
      const z = 9.5 - i * 0.9 - rp * 0.55;
      if (z < 1.05) { continue; }
      cars.push({ z: z, x: (i - 2) * 0.16 });
    }
    cars.sort(function (a, b) { return b.z - a.z; });
    const colors = ['#ff3b30', '#2f6fd0', '#f2c14e', '#3fa34d', '#f2f2f7'];
    cars.forEach(function (c, i) {
      const g2 = roadGeom(c.z);
      const scale = Math.min(1.6, 3.4 / c.z);
      drawCar(W / 2 + c.x * g2.half * 1.4, g2.y - 6 * scale, scale * 46, colors[i % colors.length]);
    });

    // your own car at the bottom
    drawCar(W / 2, H - 46, 150, '#ff6a1f', true);
  }

  function drawCar(x, y, s, color, hero) {
    const w = s, h = s * 0.42;
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.beginPath(); ctx.ellipse(x, y + h * 0.30, w * 0.52, h * 0.18, 0, 0, 6.283); ctx.fill();
    // wheels
    ctx.fillStyle = '#14181d';
    ctx.beginPath(); ctx.ellipse(x - w * 0.42, y, w * 0.13, h * 0.36, 0, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + w * 0.42, y, w * 0.13, h * 0.36, 0, 0, 6.283); ctx.fill();
    // body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.30, y - h * 0.10);
    ctx.lineTo(x + w * 0.30, y - h * 0.10);
    ctx.lineTo(x + w * 0.16, y - h * 0.62);
    ctx.lineTo(x - w * 0.16, y - h * 0.62);
    ctx.closePath(); ctx.fill();
    // nose
    ctx.beginPath();
    ctx.moveTo(x - w * 0.14, y - h * 0.62);
    ctx.lineTo(x + w * 0.14, y - h * 0.62);
    ctx.lineTo(x, y - h * 1.02);
    ctx.closePath(); ctx.fill();
    // cockpit
    ctx.fillStyle = '#0b0f15';
    ctx.beginPath(); ctx.ellipse(x, y - h * 0.42, w * 0.10, h * 0.16, 0, 0, 6.283); ctx.fill();
    // rear wing
    ctx.fillStyle = color;
    ctx.fillRect(x - w * 0.34, y - h * 0.20, w * 0.68, h * 0.13);
    // highlight
    ctx.fillStyle = 'rgba(255,255,255,.25)';
    ctx.fillRect(x - w * 0.22, y - h * 0.56, w * 0.44, h * 0.06);
    if (hero) {
      ctx.strokeStyle = 'rgba(255,255,255,.5)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(x, y - h * 0.3, w * 0.34, h * 0.5, 0, 0, 6.283); ctx.stroke();
    }
  }

  /* ---------- 5. confetti ---------- */
  let confetti = [];
  function seedConfetti() {
    confetti = [];
    const cols = ['#ff3b30', '#f2c14e', '#3fa34d', '#2f6fd0', '#ffffff', '#ff7ab6'];
    for (let i = 0; i < 240; i++) {
      confetti.push({
        x: W / 2 + (Math.random() - 0.5) * W * 0.4,
        y: H * 0.42,
        vx: (Math.random() - 0.5) * 620,
        vy: -Math.random() * 520 - 120,
        rot: Math.random() * 6.283,
        vr: (Math.random() - 0.5) * 12,
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 6,
        c: cols[(Math.random() * cols.length) | 0]
      });
    }
  }
  function drawConfetti(dt) {
    confetti.forEach(function (p) {
      p.vy += 900 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
  }

  /* ---------- 6. the volcano ---------- */
  function drawVolcano() {
    const hy = H * 0.72;

    // sky
    ctx.fillStyle = grad(0, 0, 0, H, [[0, '#1a0b3d'], [0.42, '#4a1259'], [0.68, '#9b1f4a'], [1, '#3a0d22']]);
    ctx.fillRect(0, 0, W, H);

    // stars
    for (let i = 0; i < 70; i++) {
      const x = ((i * 7919) % 1000) / 1000 * W;
      const y = ((i * 104729) % 1000) / 1000 * H * 0.42;
      ctx.fillStyle = 'rgba(255,240,255,' + (0.25 + (i % 5) * 0.12) + ')';
      ctx.beginPath(); ctx.arc(x, y, 1.3, 0, 6.283); ctx.fill();
    }

    // far ranges
    ctx.fillStyle = '#2b0f3d';
    jagged(H * 0.62, H * 0.30, 7);
    ctx.fillStyle = '#3d1246';
    jagged(H * 0.70, H * 0.22, 9);

    // the cone
    const cx = W / 2;
    const topY = H * 0.20, baseY = H * 0.86;
    const halfTop = W * 0.055, halfBase = W * 0.34;

    ctx.fillStyle = grad(0, topY, 0, baseY, [[0, '#a8282f'], [0.35, '#6d1526'], [1, '#260812']]);
    ctx.beginPath();
    // a rocky left edge, then a rocky right edge back up
    ctx.moveTo(cx - halfTop, topY);
    const STEPS = 14;
    for (let i = 1; i <= STEPS; i++) {
      const k = i / STEPS;
      const x = cx - lerp(halfTop, halfBase, k) + Math.sin(i * 3.7) * W * 0.012;
      const y = lerp(topY, baseY, k) + Math.sin(i * 2.3) * H * 0.008;
      ctx.lineTo(x, y);
    }
    for (let i = STEPS; i >= 0; i--) {
      const k = i / STEPS;
      const x = cx + lerp(halfTop, halfBase, k) + Math.sin(i * 3.1 + 1.2) * W * 0.012;
      const y = lerp(topY, baseY, k) + Math.sin(i * 2.7 + 0.6) * H * 0.008;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // a darker crag on the shadowed side
    ctx.fillStyle = 'rgba(20,4,10,.45)';
    ctx.beginPath();
    ctx.moveTo(cx + halfTop * 0.3, topY + 6);
    for (let i = 1; i <= 8; i++) {
      const k = i / 8;
      ctx.lineTo(cx + lerp(halfTop * 0.3, halfBase * 0.7, k), lerp(topY, baseY, k));
    }
    ctx.lineTo(cx + halfBase, baseY);
    ctx.lineTo(cx, baseY);
    ctx.closePath();
    ctx.fill();

    // ridges
    ctx.strokeStyle = 'rgba(255,120,60,.30)';
    ctx.lineWidth = 3;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * halfTop * 0.3, topY + 8);
      ctx.lineTo(cx + i * halfBase * 0.34, baseY);
      ctx.stroke();
    }

    // lava veins
    for (let i = 0; i < 9; i++) {
      const off = (i - 4) * 0.22;
      ctx.strokeStyle = 'rgba(255,' + (110 + i * 8) + ',40,' + (0.55 + 0.3 * Math.sin(t * 3 + i)) + ')';
      ctx.lineWidth = 4 - (i % 3);
      ctx.beginPath();
      ctx.moveTo(cx + off * halfTop, topY + 12);
      ctx.quadraticCurveTo(cx + off * halfBase * 0.8 + Math.sin(t * 2 + i) * 12, (topY + baseY) / 2, cx + off * halfBase * 0.92, baseY - 6);
      ctx.stroke();
    }

    // crater glow
    const glow = 0.75 + 0.25 * Math.sin(t * 6);
    ctx.fillStyle = radial(cx, topY + 10, 4, W * 0.30, [
      [0, 'rgba(255,255,220,' + glow + ')'],
      [0.18, 'rgba(255,190,60,' + (0.9 * glow) + ')'],
      [0.45, 'rgba(255,110,20,' + (0.5 * glow) + ')'],
      [1, 'rgba(255,80,10,0)']
    ]);
    ctx.beginPath(); ctx.arc(cx, topY + 10, W * 0.30, 0, 6.283); ctx.fill();

    // the eruption column
    const erupt = clamp01((t - T.volcano - 0.4) / 1.2);
    if (erupt > 0) {
      for (let i = 0; i < 120; i++) {
        const seed = i * 0.317;
        const life = ((t * (0.30 + (i % 6) * 0.05) + seed) % 1);
        const spread = (i % 11) / 11 - 0.5;
        const x = cx + spread * W * 0.30 * life + Math.sin(t * 2 + i) * 14;
        const y = (topY + 10) - life * H * 0.62;
        const s = (3 + (i % 5) * 2) * (1 - life * 0.6) * erupt;
        ctx.fillStyle = 'rgba(255,' + Math.round(220 - life * 150) + ',60,' + ((1 - life) * 0.95 * erupt) + ')';
        ctx.beginPath(); ctx.arc(x, y, Math.max(0.6, s), 0, 6.283); ctx.fill();
      }
      // fire glow above the crater
      ctx.fillStyle = radial(cx, topY - H * 0.05, 10, W * 0.26 * (0.6 + erupt * 0.6), [
        [0, 'rgba(255,240,180,' + (0.55 * erupt) + ')'],
        [0.5, 'rgba(255,130,40,' + (0.30 * erupt) + ')'],
        [1, 'rgba(255,90,20,0)']
      ]);
      ctx.beginPath(); ctx.arc(cx, topY - H * 0.05, W * 0.30, 0, 6.283); ctx.fill();
    }

    // lava lake
    ctx.fillStyle = grad(0, hy, 0, H, [[0, '#ff6a10'], [0.5, '#c02a08'], [1, '#5a0f04']]);
    ctx.beginPath();
    ctx.ellipse(cx, H * 0.92, W * 0.42, H * 0.09, 0, 0, 6.283);
    ctx.fill();
    for (let i = 0; i < 14; i++) {
      const x = cx + Math.sin(i * 2.1 + t) * W * 0.32;
      const y = H * 0.90 + Math.cos(i * 1.7 + t * 1.3) * H * 0.035;
      ctx.fillStyle = 'rgba(255,220,120,' + (0.25 + 0.25 * Math.sin(t * 4 + i)) + ')';
      ctx.beginPath(); ctx.ellipse(x, y, W * 0.03, H * 0.008, 0, 0, 6.283); ctx.fill();
    }

    // the name, rising out of the lava
    const p = clamp01((t - T.name) / 2.2);
    if (p > 0) {
      const rise = (1 - ease(p)) * H * 0.30;
      const alpha = clamp01(p * 1.6);
      const fs = Math.min(W * 0.105, 132);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = '900 ' + fs + 'px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(255,120,30,.95)';
      ctx.shadowBlur = 64;
      ctx.fillStyle = grad(0, H * 0.36 + rise, 0, H * 0.36 + rise + fs, [
        [0, '#fff3c4'], [0.45, '#ffb43a'], [0.8, '#ff5a1f'], [1, '#b02008']
      ]);
      ctx.fillText('SHRESTHA', cx, H * 0.30 + rise);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  function jagged(baseY, height, peaks) {
    ctx.beginPath();
    ctx.moveTo(-20, baseY);
    for (let i = 0; i <= peaks; i++) {
      const x = (i / peaks) * (W + 40) - 20;
      const y = baseY - height * (0.35 + 0.65 * Math.abs(Math.sin(i * 2.7 + 1.3)));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W + 20, baseY);
    ctx.closePath();
    ctx.fill();
  }

  /* ---------- the frame ---------- */
  function draw(dt) {
    ctx.clearRect(0, 0, W, H);

    ctx.save();
    if (shake > 0) {
      shake = Math.max(0, shake - dt * 1.1);
      const s = shake * shake;
      ctx.translate((Math.random() - 0.5) * s * 26, (Math.random() - 0.5) * s * 20);
    }

    if (t < T.blast) {
      ctx.fillStyle = '#080a0f';
      ctx.fillRect(-40, -40, W + 80, H + 80);
      drawBomb();
    } else if (t < T.fireOut) {
      const a = clamp01(1 - (t - T.blast - 1.6) / 1.4);
      const heat = clamp01(1 - (t - T.blast) / 3);
      drawFire(a, 0.6 + heat * 0.8);
    } else if (t < T.road) {
      const on = t >= T.crtOn;
      const zoomK = clamp01((t - T.zoom) / (T.road - T.zoom));
      ctx.save();
      if (zoomK > 0) {
        const k = 1 + ease(zoomK) * 6;
        ctx.translate(W / 2, H * 0.46);
        ctx.scale(k, k);
        ctx.translate(-W / 2, -H * 0.46);
      }
      drawCRT(on);
      ctx.restore();
      if (zoomK > 0.55) {
        ctx.fillStyle = 'rgba(210,246,255,' + ((zoomK - 0.55) / 0.45) + ')';
        ctx.fillRect(0, 0, W, H);
      }
    } else if (t < T.volcano) {
      drawRace();
      if (t >= T.confetti) { drawConfetti(dt); }
      if (t >= T.finish) {
        ctx.fillStyle = 'rgba(0,0,0,' + Math.min(0.35, (t - T.finish) * 0.5) + ')';
        ctx.fillRect(0, 0, W, H);
      }
    } else {
      drawVolcano();
      if (t > T.volcano && t < T.volcano + 0.9) {
        shake = Math.max(shake, 1 - (t - T.volcano) / 0.9);
      }
    }

    ctx.restore();

    // fire gathering at the very end
    if (t > T.name + 1.0 && t < T.end) {
      const a = clamp01((t - T.name - 1.0) / 1.4) * 0.26;
      ctx.save();
      ctx.globalAlpha = a;
      drawFire(1, 0.8);
      ctx.restore();
    }
  }

  /* ---------- loop ---------- */
  function frame(now) {
    if (!running) { return; }
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;

    updateCaption();
    draw(dt);

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

  if (skip) {
    skip.addEventListener('click', function (e) { e.stopPropagation(); stop(); });
  }

  trigger.addEventListener('click', function () {
    if (running) { return; }
    fit();
    t = 0;
    capIdx = -1;
    confetti = [];
    shake = 0;
    seedConfetti();
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
    if (!confetti.length) { seedConfetti(); }
    updateCaption();
    draw(0.016);
  };

  fit();
})();
