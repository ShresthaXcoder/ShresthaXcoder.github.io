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
  scene.background = new THREE.Color(0x14506e);
  scene.fog = new THREE.FogExp2(0x14506e, 0.038);

  const camera = new THREE.PerspectiveCamera(48, 2, 0.1, 200);
  camera.position.set(0, 1.4, 13);
  camera.lookAt(0, 0, 0);

  /* ---------- light ---------- */
  scene.add(new THREE.HemisphereLight(0xd6f0ff, 0x0d3348, 2.4));
  const sun = new THREE.DirectionalLight(0xffffff, 2.6);
  sun.position.set(3, 14, 6);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0x8fc4e8, 1.1);
  fill.position.set(-8, 2, -6);
  scene.add(fill);

  /* ---------- the water surface, seen from below ---------- */
  const surfGeo = new THREE.PlaneGeometry(46, 26, 60, 34);
  surfGeo.rotateX(Math.PI / 2);
  const surfMat = new THREE.MeshStandardMaterial({
    color: 0x9fdcf5, transparent: true, opacity: 0.22,
    roughness: 0.15, metalness: 0.35, side: THREE.DoubleSide
  });
  const surface = new THREE.Mesh(surfGeo, surfMat);
  surface.position.y = 4.2;
  scene.add(surface);

  const surfBase = surfGeo.attributes.position.array.slice(0);

  /* ---------- the bottom ---------- */
  const floorGeo = new THREE.PlaneGeometry(70, 44, 40, 24);
  floorGeo.rotateX(-Math.PI / 2);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a5b78, roughness: 1 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -5.5;
  scene.add(floor);

  /* ---------- shafts of light ---------- */
  const shafts = [];
  for (let i = 0; i < 6; i++) {
    const g = new THREE.PlaneGeometry(1.6, 14);
    const m = new THREE.MeshBasicMaterial({
      color: 0xcdeeff, transparent: true, opacity: 0.10,
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
    { back: 0x2f6f96, body: 0x6fa8c4, belly: 0xe8f2f7, fin: 0x4d7f9e },   // silver-blue
    { back: 0xc25a1c, body: 0xee8b45, belly: 0xffd9b5, fin: 0xd9732f },   // orange
    { back: 0xa8891f, body: 0xe0bf4e, belly: 0xfff0bd, fin: 0xc0a33c },   // gold
    { back: 0x7a3b52, body: 0xb8697f, belly: 0xf6dbe2, fin: 0x95506a },   // rose
    { back: 0x3a5c74, body: 0x6f8fa3, belly: 0xe4eef3, fin: 0x4f6e82 },   // slate
    { back: 0x2f6b4a, body: 0x62a97c, belly: 0xe2f4e8, fin: 0x468063 }    // green
  ];

  function makeFish(colour, size) {
    const g = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: colour.body, roughness: 0.42, metalness: 0.18
    });
    const backMat = new THREE.MeshStandardMaterial({
      color: colour.back, roughness: 0.45, metalness: 0.15
    });
    const bellyMat = new THREE.MeshStandardMaterial({
      color: colour.belly, roughness: 0.55, metalness: 0.05
    });
    const finMat = new THREE.MeshStandardMaterial({
      color: colour.fin, roughness: 0.6, metalness: 0.05,
      side: THREE.DoubleSide
    });

    /* body: a clean fish silhouette, revolved */
    const profile = [
      [0.02, -0.96], [0.09, -0.84], [0.18, -0.66], [0.30, -0.42],
      [0.41, -0.14], [0.46, 0.10], [0.44, 0.32], [0.36, 0.52],
      [0.25, 0.70], [0.14, 0.85], [0.04, 0.96]
    ].map(function (p) { return new THREE.Vector2(p[0], p[1]); });

    const bodyGeo = new THREE.LatheGeometry(profile, 32);
    bodyGeo.rotateZ(Math.PI / 2);

    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.set(1, 0.94, 0.62);
    g.add(body);

    const back = new THREE.Mesh(bodyGeo.clone(), backMat);
    back.scale.set(0.99, 0.96, 0.63);
    back.position.y = 0.045;
    g.add(back);

    const belly = new THREE.Mesh(bodyGeo.clone(), bellyMat);
    belly.scale.set(0.97, 0.80, 0.55);
    belly.position.y = -0.075;
    g.add(belly);

    /* forked tail */
    const tailShape = new THREE.Shape();
    tailShape.moveTo(0, 0);
    tailShape.quadraticCurveTo(-0.40, 0.26, -0.86, 0.56);
    tailShape.quadraticCurveTo(-0.62, 0.14, -0.72, 0);
    tailShape.quadraticCurveTo(-0.62, -0.14, -0.86, -0.56);
    tailShape.quadraticCurveTo(-0.40, -0.26, 0, 0);

    const tailPivot = new THREE.Group();
    tailPivot.position.x = -0.94;
    const tail = new THREE.Mesh(
      new THREE.ExtrudeGeometry(tailShape, { depth: 0.035, bevelEnabled: false }),
      finMat
    );
    tailPivot.add(tail);
    g.add(tailPivot);

    /* dorsal fin */
    const dorsalShape = new THREE.Shape();
    dorsalShape.moveTo(0.38, 0);
    dorsalShape.quadraticCurveTo(0.06, 0.54, -0.44, 0.30);
    dorsalShape.quadraticCurveTo(-0.14, 0.10, 0.38, 0);
    const dorsal = new THREE.Mesh(
      new THREE.ExtrudeGeometry(dorsalShape, { depth: 0.03, bevelEnabled: false }),
      finMat
    );
    dorsal.position.set(0, 0.28, 0);
    dorsal.rotation.y = Math.PI / 2;
    g.add(dorsal);

    /* pectoral fins */
    [-1, 1].forEach(function (side) {
      const finShape = new THREE.Shape();
      finShape.moveTo(0, 0);
      finShape.quadraticCurveTo(0.16, 0.20, 0.40, 0.08);
      finShape.quadraticCurveTo(0.20, -0.09, 0, 0);
      const fin = new THREE.Mesh(
        new THREE.ExtrudeGeometry(finShape, { depth: 0.02, bevelEnabled: false }),
        finMat
      );
      fin.position.set(0.22, -0.06, side * 0.24);
      fin.rotation.set(side * 0.85, side * 0.2, side * 0.1);
      g.add(fin);
    });

    /* eye */
    [-1, 1].forEach(function (side) {
      const ring = new THREE.Mesh(
        new THREE.SphereGeometry(0.105, 12, 10),
        new THREE.MeshStandardMaterial({ color: 0xf6fafc, roughness: 0.3 })
      );
      ring.position.set(0.54, 0.11, side * 0.22);
      g.add(ring);

      const pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.070, 12, 10),
        new THREE.MeshStandardMaterial({ color: 0x0d141c, roughness: 0.2 })
      );
      pupil.position.set(0.585, 0.115, side * 0.255);
      g.add(pupil);
    });

    g.scale.setScalar(size);
    g.userData = { tailPivot: tailPivot };
    return g;
  }

  const fish = [];
  const COUNT = 10;
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
