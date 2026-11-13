/* =========================================================
   The pond at the end of the page — in 3D.
   A rippling surface above, depth and light below, and fish
   with bodies that turn as they swim.
   ========================================================= */
(async function () {
  const wrap = document.getElementById('pond');
  const canvas = document.getElementById('pondCanvas');
  if (!wrap || !canvas) { return; }

  let THREE;
  try { THREE = await import('three'); } catch (e) { fallback2D(); return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  } catch (e) {
    fallback2D();
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070f22);
  scene.fog = new THREE.FogExp2(0x070f22, 0.048);

  const camera = new THREE.PerspectiveCamera(48, 2, 0.1, 200);
  camera.position.set(0, 1.4, 13);
  camera.lookAt(0, 0, 0);

  /* ---------- light ---------- */
  scene.add(new THREE.HemisphereLight(0x5fa8ff, 0x050a16, 1.1));
  const sun = new THREE.DirectionalLight(0xa8e8ff, 1.5);
  sun.position.set(3, 14, 6);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xff5fd0, 0.8);
  fill.position.set(-8, 2, -6);
  scene.add(fill);

  /* ---------- the water surface, seen from below ---------- */
  const surfGeo = new THREE.PlaneGeometry(46, 26, 60, 34);
  surfGeo.rotateX(Math.PI / 2);
  const surfMat = new THREE.MeshStandardMaterial({
    color: 0x2f9fd0, transparent: true, opacity: 0.16,
    roughness: 0.15, metalness: 0.35, side: THREE.DoubleSide
  });
  const surface = new THREE.Mesh(surfGeo, surfMat);
  surface.position.y = 4.2;
  scene.add(surface);

  const surfBase = surfGeo.attributes.position.array.slice(0);

  /* ---------- the bottom ---------- */
  const floorGeo = new THREE.PlaneGeometry(70, 44, 40, 24);
  floorGeo.rotateX(-Math.PI / 2);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x08172c, roughness: 1 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -5.5;
  scene.add(floor);

  /* ---------- shafts of light ---------- */
  const shafts = [];
  for (let i = 0; i < 6; i++) {
    const g = new THREE.PlaneGeometry(1.6, 14);
    const m = new THREE.MeshBasicMaterial({
      color: 0x6fd0ff, transparent: true, opacity: 0.07,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    });
    const s = new THREE.Mesh(g, m);
    s.position.set(-14 + i * 5.4, -1.5, -2 - (i % 3) * 3);
    s.rotation.z = 0.12;
    scene.add(s);
    shafts.push(s);
  }

  /* ---------- bubbles ---------- */
  const bubbleTex = (function () {
    const S = 64;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(S * 0.4, S * 0.35, 1, S / 2, S / 2, S / 2);
    gr.addColorStop(0, 'rgba(255,255,255,.95)');
    gr.addColorStop(0.55, 'rgba(200,240,255,.28)');
    gr.addColorStop(0.85, 'rgba(180,230,255,.16)');
    gr.addColorStop(1, 'rgba(180,230,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, S, S);
    return new THREE.CanvasTexture(c);
  })();

  const BUB = 90;
  const bPos = new Float32Array(BUB * 3);
  const bVel = [];
  for (let i = 0; i < BUB; i++) {
    bPos[i * 3] = (Math.random() - 0.5) * 26;
    bPos[i * 3 + 1] = -5 + Math.random() * 9;
    bPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
    bVel.push(0.25 + Math.random() * 0.6);
  }
  const bGeo = new THREE.BufferGeometry();
  bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
  const bMat = new THREE.PointsMaterial({
    size: 0.30, map: bubbleTex, transparent: true, opacity: 0.75,
    depthWrite: false, blending: THREE.AdditiveBlending
  });
  const bubbles = new THREE.Points(bGeo, bMat);
  scene.add(bubbles);

  /* ---------- one fish ---------- */
  const COLOURS = [
    { glow: 0x4fe6ff, patch: 0xff3fb0, fin: 0x7fe8ff },   // cyan / magenta
    { glow: 0x7f9bff, patch: 0xff5ad0, fin: 0xa8b8ff },   // periwinkle / rose
    { glow: 0x3ff2c8, patch: 0xff4f8a, fin: 0x7fffd8 },   // aqua / coral
    { glow: 0xb07cff, patch: 0x4fe6ff, fin: 0xc8a0ff },   // violet / cyan
    { glow: 0x4fd0ff, patch: 0xff9a3f, fin: 0x8fe0ff },   // blue / amber
    { glow: 0x5fffd0, patch: 0xb04fff, fin: 0x9fffe4 }    // mint / violet
  ];

  /* a soft glowing blotch texture, so the body is not one flat colour */
  function makeSkin(glow, patch) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 128;
    const g = c.getContext('2d');

    const base = '#' + glow.toString(16).padStart(6, '0');
    const hot = '#' + patch.toString(16).padStart(6, '0');

    const grad = g.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, base);
    grad.addColorStop(0.45, '#ffffff');
    grad.addColorStop(0.72, base);
    grad.addColorStop(1, hot);
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 128);

    for (let i = 0; i < 22; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 128;
      const r = 8 + Math.random() * 26;
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, 'rgba(255,60,180,.55)');
      rg.addColorStop(1, 'rgba(255,60,180,0)');
      g.fillStyle = rg;
      g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
    }

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function makeFish(colour, size) {
    const g = new THREE.Group();
    const skin = makeSkin(colour.glow, colour.patch);

    const bodyMat = new THREE.MeshStandardMaterial({
      map: skin, color: 0xffffff,
      emissive: new THREE.Color(colour.glow), emissiveIntensity: 0.55,
      roughness: 0.22, metalness: 0.35,
      transparent: true, opacity: 0.88
    });

    const finMat = new THREE.MeshBasicMaterial({
      color: colour.fin, transparent: true, opacity: 0.42,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    });

    /* a long, deep body like a koi */
    const profile = [
      [0.02, -1.02], [0.08, -0.92], [0.16, -0.76], [0.26, -0.54],
      [0.36, -0.28], [0.42, 0.00], [0.42, 0.26], [0.36, 0.50],
      [0.27, 0.70], [0.16, 0.86], [0.05, 0.98]
    ].map(function (p) { return new THREE.Vector2(p[0], p[1]); });

    const bodyGeo = new THREE.LatheGeometry(profile, 28);
    bodyGeo.rotateZ(Math.PI / 2);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.set(1, 0.92, 0.60);
    g.add(body);

    /* a faint outer shell — the light bleeding off the skin */
    const haloMat = new THREE.MeshBasicMaterial({
      color: colour.glow, transparent: true, opacity: 0.16,
      blending: THREE.AdditiveBlending, depthWrite: false,
      side: THREE.BackSide
    });
    const halo = new THREE.Mesh(bodyGeo.clone(), haloMat);
    halo.scale.set(1.10, 1.03, 0.70);
    g.add(halo);

    /* long flowing tail */
    const tailShape = new THREE.Shape();
    tailShape.moveTo(0, 0);
    tailShape.bezierCurveTo(-0.35, 0.20, -0.75, 0.46, -1.28, 0.72);
    tailShape.bezierCurveTo(-0.95, 0.26, -1.05, 0.06, -1.18, 0.0);
    tailShape.bezierCurveTo(-1.05, -0.06, -0.95, -0.26, -1.28, -0.72);
    tailShape.bezierCurveTo(-0.75, -0.46, -0.35, -0.20, 0, 0);

    const tailPivot = new THREE.Group();
    tailPivot.position.x = -0.94;
    const tail = new THREE.Mesh(
      new THREE.ExtrudeGeometry(tailShape, { depth: 0.03, bevelEnabled: false }),
      finMat
    );
    tail.scale.set(1.1, 1.1, 1);
    tailPivot.add(tail);
    g.add(tailPivot);

    /* tall flowing dorsal */
    const dorsalShape = new THREE.Shape();
    dorsalShape.moveTo(0.40, 0);
    dorsalShape.bezierCurveTo(0.22, 0.52, -0.20, 0.78, -0.62, 0.60);
    dorsalShape.bezierCurveTo(-0.30, 0.34, -0.02, 0.14, 0.40, 0);
    const dorsal = new THREE.Mesh(
      new THREE.ExtrudeGeometry(dorsalShape, { depth: 0.03, bevelEnabled: false }),
      finMat
    );
    dorsal.position.set(0, 0.26, 0);
    dorsal.rotation.y = Math.PI / 2;
    g.add(dorsal);

    /* anal fin */
    const analShape = new THREE.Shape();
    analShape.moveTo(0.16, 0);
    analShape.bezierCurveTo(-0.02, -0.34, -0.30, -0.44, -0.52, -0.30);
    analShape.bezierCurveTo(-0.28, -0.16, -0.08, -0.06, 0.16, 0);
    const anal = new THREE.Mesh(
      new THREE.ExtrudeGeometry(analShape, { depth: 0.025, bevelEnabled: false }),
      finMat
    );
    anal.position.set(0, -0.26, 0);
    anal.rotation.y = Math.PI / 2;
    g.add(anal);

    /* wide pectoral fins */
    [-1, 1].forEach(function (side) {
      const finShape = new THREE.Shape();
      finShape.moveTo(0, 0);
      finShape.bezierCurveTo(0.18, 0.26, 0.46, 0.30, 0.66, 0.06);
      finShape.bezierCurveTo(0.44, -0.10, 0.20, -0.10, 0, 0);
      const fin = new THREE.Mesh(
        new THREE.ExtrudeGeometry(finShape, { depth: 0.02, bevelEnabled: false }),
        finMat
      );
      fin.position.set(0.24, -0.06, side * 0.22);
      fin.rotation.set(side * 0.8, side * 0.3, side * 0.15);
      g.add(fin);
    });

    /* the eye: a bright bead with a catchlight */
    [-1, 1].forEach(function (side) {
      const pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 12, 10),
        new THREE.MeshBasicMaterial({ color: 0x101a2e })
      );
      pupil.position.set(0.60, 0.10, side * 0.24);
      g.add(pupil);
      const glint = new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      glint.position.set(0.63, 0.13, side * 0.26);
      g.add(glint);
    });

    /* the aura around it */
    const aura = new THREE.Sprite(new THREE.SpriteMaterial({
      map: bubbleTex, color: colour.glow, transparent: true, opacity: 0.30,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    aura.scale.setScalar(3.4);
    g.add(aura);

    g.scale.setScalar(size);
    g.userData = { tailPivot: tailPivot };
    return g;
  }

  const fish = [];
  const COUNT = 9;
  for (let i = 0; i < COUNT; i++) {
    const c = COLOURS[i % COLOURS.length];
    const size = 0.55 + Math.random() * 0.55;
    const f = makeFish(c, size);
    const dir = Math.random() > 0.5 ? 1 : -1;
    f.position.set(
      (Math.random() - 0.5) * 24,
      -3.2 + Math.random() * 6,
      (Math.random() - 0.5) * 9
    );
    f.rotation.y = dir > 0 ? 0 : Math.PI;
    scene.add(f);
    fish.push({
      mesh: f,
      dir: dir,
      speed: 0.8 + Math.random() * 1.5,
      phase: Math.random() * 6.283,
      amp: 0.35 + Math.random() * 0.7,
      bob: 0.6 + Math.random() * 1.2,
      tailRate: 5 + Math.random() * 4
    });
  }

  /* ---------- size ---------- */
  function fit() {
    const w = wrap.clientWidth || 800;
    const h = wrap.clientHeight || 260;
    if (w < 2 || h < 2) { return; }
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', fit);
  fit();

  /* ---------- loop ---------- */
  let running = false, raf = 0, t = 0, last = 0;

  function frame(now) {
    if (!running) { return; }
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;

    // ripple the surface
    const pos = surfGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = surfBase[i * 3];
      const z = surfBase[i * 3 + 2];
      pos.array[i * 3 + 1] = Math.sin(x * 0.55 + t * 1.6) * 0.22
                           + Math.cos(z * 0.7 - t * 1.1) * 0.16
                           + Math.sin((x + z) * 0.35 + t * 2.2) * 0.10;
    }
    pos.needsUpdate = true;

    // shafts sway
    shafts.forEach(function (s, i) {
      s.rotation.z = 0.12 + Math.sin(t * 0.5 + i) * 0.06;
      s.material.opacity = 0.07 + 0.05 * Math.abs(Math.sin(t * 0.7 + i));
    });

    // bubbles rise
    const bp = bGeo.attributes.position;
    for (let i = 0; i < BUB; i++) {
      bp.array[i * 3 + 1] += bVel[i] * dt;
      bp.array[i * 3] += Math.sin(t * 1.5 + i) * 0.004;
      if (bp.array[i * 3 + 1] > 4.2) {
        bp.array[i * 3 + 1] = -5;
        bp.array[i * 3] = (Math.random() - 0.5) * 26;
        bp.array[i * 3 + 2] = (Math.random() - 0.5) * 14;
      }
    }
    bp.needsUpdate = true;

    // swim
    fish.forEach(function (f) {
      const m = f.mesh;
      m.position.x += f.speed * f.dir * dt;
      m.position.y += Math.sin(t * f.bob + f.phase) * 0.006;
      m.rotation.z = Math.sin(t * f.bob + f.phase) * 0.10;
      m.userData.tailPivot.rotation.y = Math.sin(t * f.tailRate + f.phase) * 0.55;

      if (f.dir > 0 && m.position.x > 15) { m.position.x = -15; }
      if (f.dir < 0 && m.position.x < -15) { m.position.x = 15; }
    });

    // a slow drift of the camera, so it never sits still
    camera.position.x = Math.sin(t * 0.18) * 1.6;
    camera.position.y = 1.4 + Math.sin(t * 0.3) * 0.35;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
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

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { start(); } else { stop(); }
      });
    }, { threshold: 0.05 });
    io.observe(wrap);
  } else {
    start();
  }

  window.__pondDraw = function (tt) {
    fit();
    t = tt;
    renderer.render(scene, camera);
  };

  /* ---------- if 3D cannot start, draw it instead ---------- */
  function fallback2D() {
    const ctx = canvas.getContext('2d');
    if (!ctx) { return; }
    let W = 800, H = 260, DPR = 1, raf = 0, running = false, last = 0, time = 0;

    function fit2() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap.clientWidth || 800;
      H = wrap.clientHeight || 260;
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    const PAL = [
      ['#ff8a3c', '#ffb877'], ['#4ea8e0', '#8fd0f2'], ['#f2c14e', '#ffe08a'],
      ['#e0576b', '#ff9aa8'], ['#7b6cf6', '#b3a9ff']
    ];
    const fish = [];
    for (let i = 0; i < 6; i++) {
      const p = PAL[i % PAL.length];
      fish.push({
        x: Math.random() * 800, y: 0.3 + Math.random() * 0.5,
        s: 14 + Math.random() * 16, dir: Math.random() > 0.5 ? 1 : -1,
        sp: 18 + Math.random() * 26, ph: Math.random() * 6.283,
        c: p[0], f: p[1]
      });
    }
    const bub = [];
    for (let i = 0; i < 18; i++) {
      bub.push({ x: Math.random() * 800, y: Math.random() * 260, r: 1 + Math.random() * 3, v: 10 + Math.random() * 22 });
    }

    function drawFish(f) {
      const s = f.s, wag = Math.sin(time * 5 + f.ph) * 0.42;
      ctx.save();
      ctx.translate(f.x, f.y * H);
      ctx.scale(f.dir, 1);
      ctx.rotate(Math.sin(time + f.ph) * 0.08);
      ctx.fillStyle = f.f;
      ctx.beginPath();
      ctx.moveTo(-s * 0.95, 0);
      ctx.quadraticCurveTo(-s * 1.5, -s * 0.62 + wag * s, -s * 1.75, wag * s * 1.4);
      ctx.quadraticCurveTo(-s * 1.5, s * 0.62 + wag * s, -s * 0.95, 0);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-s * 0.25, -s * 0.42);
      ctx.quadraticCurveTo(-s * 0.05, -s * 0.95, s * 0.35, -s * 0.40);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = f.c;
      ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.58, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#0d1620';
      ctx.beginPath(); ctx.arc(s * 0.55, -s * 0.12, s * 0.12, 0, 6.283); ctx.fill();
      ctx.restore();
    }

    function frame2(now) {
      if (!running) { return; }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now; time += dt;

      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#1a6f9c'); g.addColorStop(0.35, '#12587f'); g.addColorStop(1, '#072a41');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

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

      bub.forEach(function (b) {
        b.y -= b.v * dt;
        if (b.y < -6) { b.y = H + 6; b.x = Math.random() * W; }
        ctx.strokeStyle = 'rgba(200,240,255,.35)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.283); ctx.stroke();
      });

      fish.forEach(function (f) {
        f.x += f.sp * f.dir * dt;
        if (f.dir > 0 && f.x > W + f.s * 2) { f.x = -f.s * 2; }
        if (f.dir < 0 && f.x < -f.s * 2) { f.x = W + f.s * 2; }
        drawFish(f);
      });

      ctx.strokeStyle = 'rgba(220,250,255,.30)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 10) {
        const y = Math.sin(x * 0.03 + time * 2) * 3 + Math.sin(x * 0.011 - time * 1.3) * 4;
        if (x === 0) { ctx.moveTo(x, y + 2); } else { ctx.lineTo(x, y + 2); }
      }
      ctx.stroke();

      raf = requestAnimationFrame(frame2);
    }

    function start2() {
      if (running) { return; }
      running = true; last = performance.now();
      raf = requestAnimationFrame(frame2);
    }

    window.addEventListener('resize', fit2);
    fit2();
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (e.isIntersecting) { start2(); }
          else { running = false; cancelAnimationFrame(raf); }
        });
      }, { threshold: 0.05 });
      io.observe(wrap);
    } else {
      start2();
    }
  }
})();
