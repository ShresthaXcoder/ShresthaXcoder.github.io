/* =========================================================
   "This is me, arriving."  — 3D
   Night. A house. He comes out with the piece and a fistful
   of smoke. Then you press the button.
   ========================================================= */

const ME3D = (async function () {
  const canvas = document.getElementById('meCanvas');
  if (!canvas) { return; }

  let THREE;
  try { THREE = await import('three'); } catch (e) { return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  } catch (e) {
    const c = document.getElementById('meCard');
    if (c) { c.remove(); }
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060b14);
  scene.fog = new THREE.Fog(0x0a1424, 46, 120);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 400);
  camera.position.set(6, 6.4, 20);
  camera.lookAt(0, 3.6, 0);

  /* ---------- lights ---------- */
  scene.add(new THREE.HemisphereLight(0x4a6a92, 0x0a0f16, 0.9));
  const moonLight = new THREE.DirectionalLight(0xbcd2ff, 1.5);
  moonLight.position.set(-14, 18, 10);
  scene.add(moonLight);
  const windowLight = new THREE.PointLight(0xffb85c, 9, 26, 2);
  windowLight.position.set(0, 2.6, 3.2);
  scene.add(windowLight);
  const fireLight = new THREE.PointLight(0xff7a2a, 0, 70, 2);
  fireLight.position.set(0, 3, 0);
  scene.add(fireLight);

  /* ---------- moon + stars ---------- */
  const glowTex = (function () {
    const S = 128;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.25, 'rgba(255,250,235,0.85)');
    gr.addColorStop(0.55, 'rgba(200,220,255,0.25)');
    gr.addColorStop(1, 'rgba(180,210,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, S, S);
    return new THREE.CanvasTexture(c);
  })();

  const moon = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0xfff4dc, transparent: true, opacity: 0.95,
    depthWrite: false, blending: THREE.AdditiveBlending
  }));
  moon.position.set(-22, 20, -34);
  moon.scale.set(16, 16, 16);
  scene.add(moon);

  const starGeo = new THREE.BufferGeometry();
  const SN = 700, sp = new Float32Array(SN * 3);
  for (let i = 0; i < SN; i++) {
    const r = 70 + Math.random() * 130;
    const t = Math.random() * 6.283;
    const p = Math.acos(Math.random() * 0.9);
    sp[i * 3] = r * Math.sin(p) * Math.cos(t);
    sp[i * 3 + 1] = Math.abs(r * Math.cos(p)) * 0.8 + 6;
    sp[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.9, transparent: true, opacity: 0.75, depthWrite: false
  })));

  /* ---------- ground ---------- */
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshLambertMaterial({ color: 0x1b2419 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // a path to the door
  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 18),
    new THREE.MeshLambertMaterial({ color: 0x2b2a24 })
  );
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.02, 11);
  scene.add(path);

  /* ---------- helpers ---------- */
  function blocks(list) {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const mesh = new THREE.InstancedMesh(geo, mat, Math.max(list.length, 1));
    const m = new THREE.Matrix4();
    const col = new THREE.Color();
    list.forEach(function (b, i) {
      m.makeTranslation(b.x, b.y, b.z);
      mesh.setMatrixAt(i, m);
      col.set(b.color);
      mesh.setColorAt(i, col);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) { mesh.instanceColor.needsUpdate = true; }
    return mesh;
  }

  /* ---------- the house ---------- */
  const WALL = 0xd9c9ae, ROOF = 0x8f2f24, TRIM = 0x6d5c45;
  const houseBlocks = [];
  function push(x, y, z, color) {
    houseBlocks.push({ x: x, y: y, z: z, color: color, bx: x, by: y, bz: z, vx: 0, vy: 0, vz: 0, rx: 0, ry: 0, rz: 0, sx: 0, sy: 0, sz: 0 });
  }

  for (let y = 0; y < 6; y++) {
    for (let x = -4; x <= 4; x++) {
      for (let z = -3; z <= 3; z++) {
        const edge = Math.abs(x) === 4 || Math.abs(z) === 3;
        if (!edge) { continue; }
        if (y <= 2 && x === 0 && z === 3) { continue; }   // doorway
        push(x, y, z, WALL);
      }
    }
  }
  // window openings get filled with a glowing block instead
  const winPositions = [[-2, 4, 3], [2, 4, 3]];
  // roof
  for (let y = 6; y <= 9; y++) {
    const s = 5 - (y - 6);
    for (let x = -s; x <= s; x++) {
      for (let z = -4; z <= 4; z++) {
        if (Math.abs(x) === s || y === 9 || Math.abs(z) === 4) { push(x, y, z, ROOF); }
      }
    }
  }
  // chimney
  for (let y = 8; y <= 11; y++) { push(2, y, -2, 0x6f2a20); }
  // steps
  push(-1, 0, 4, TRIM); push(0, 0, 4, TRIM); push(1, 0, 4, TRIM);
  push(-1, 1, 4, TRIM); push(0, 1, 4, TRIM); push(1, 1, 4, TRIM);

  const houseMesh = blocks(houseBlocks);
  scene.add(houseMesh);

  // warm windows
  const winMat = new THREE.MeshBasicMaterial({ color: 0xffcf7a });
  winPositions.forEach(function (p) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 0.16), winMat);
    w.position.set(p[0], p[1], 3.06);
    scene.add(w);
  });
  const porch = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.2), new THREE.MeshBasicMaterial({ color: 0xffe2a8 }));
  porch.position.set(0, 5, 3.06);
  scene.add(porch);

  /* ---------- the door ---------- */
  const doorGroup = new THREE.Group();
  const doorMesh = blocks([{ x: 0, y: 0, z: 0, color: 0x4a2f1b }, { x: 0, y: 1, z: 0, color: 0x4a2f1b }, { x: 0, y: 2, z: 0, color: 0x4a2f1b }]);
  doorGroup.add(doorMesh);
  doorGroup.position.set(0, 0, 3.1);
  scene.add(doorGroup);

  /* ---------- him ---------- */
  const SKIN = 0xd9a06b, SUIT = 0x1a2231, SHIRT = 0xe8eef5, TIE = 0x8c2b2b;
  const guy = new THREE.Group();
  const body = [];
  for (let y = 0; y < 3; y++) { for (let x = -1; x <= 1; x++) { body.push({ x: x, y: y, z: 0, color: SUIT }); } }
  for (let y = 3; y < 7; y++) { for (let x = -1; x <= 1; x++) { body.push({ x: x, y: y, z: 0, color: SUIT }); } }
  body.push({ x: 0, y: 4, z: 1, color: SHIRT }); body.push({ x: 0, y: 5, z: 1, color: TIE });
  body.push({ x: 0, y: 3, z: 1, color: SHIRT });
  for (let y = 7; y < 10; y++) { for (let x = -1; x <= 1; x++) { for (let z = -1; z <= 0; z++) { body.push({ x: x, y: y, z: z, color: SKIN }); } } }
  for (let x = -1; x <= 1; x++) { for (let z = -1; z <= 0; z++) { body.push({ x: x, y: 10, z: z, color: 0x1b1410 }); } }
  for (let x = -1; x <= 1; x++) { body.push({ x: x, y: 8, z: 1, color: 0x0b0f15 }); }
  guy.add(blocks(body));

  const armR = new THREE.Group();
  armR.add(blocks([{ x: 0, y: 0, z: 0, color: SUIT }, { x: 0, y: 1, z: 0, color: SUIT }, { x: 0, y: 2, z: 0, color: SKIN }]));
  armR.position.set(1.6, 5.6, 0);
  guy.add(armR);

  const piece = new THREE.Group();
  piece.add(blocks([
    { x: 0, y: 0, z: 0, color: 0x14181e }, { x: 1, y: 0, z: 0, color: 0x1b2028 },
    { x: 2, y: 0, z: 0, color: 0x14181e }, { x: 0, y: -1, z: 0, color: 0x0f1216 }
  ]));
  piece.position.set(0, 2.4, 0.4);
  piece.scale.setScalar(0.42);
  armR.add(piece);

  const armL = new THREE.Group();
  armL.add(blocks([{ x: 0, y: 0, z: 0, color: SUIT }, { x: 0, y: 1, z: 0, color: SUIT }, { x: 0, y: 2, z: 0, color: SKIN }]));
  armL.position.set(-1.6, 5.6, 0);
  guy.add(armL);

  guy.position.set(0, 0, 0.6);
  guy.scale.setScalar(0.82);
  scene.add(guy);

  /* ---------- particles ---------- */
  const P_MAX = 900;
  const pPos = new Float32Array(P_MAX * 3);
  const pCol = new Float32Array(P_MAX * 3);
  for (let i = 0; i < P_MAX; i++) { pPos[i * 3 + 1] = -999; }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  const pMesh = new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: 1.7, map: glowTex, vertexColors: true, transparent: true, opacity: 1,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  }));
  pMesh.frustumCulled = false;
  scene.add(pMesh);

  // sparks: small, fast, additive
  const sPos = new Float32Array(P_MAX * 3);
  const sCol = new Float32Array(P_MAX * 3);
  for (let i = 0; i < P_MAX; i++) { sPos[i * 3 + 1] = -999; }
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  sGeo.setAttribute('color', new THREE.BufferAttribute(sCol, 3));
  const sMesh = new THREE.Points(sGeo, new THREE.PointsMaterial({
    size: 0.55, map: glowTex, vertexColors: true, transparent: true, opacity: 1,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  }));
  sMesh.frustumCulled = false;
  scene.add(sMesh);

  // smoke: DARK and normally blended, or it is invisible on a night sky
  const kPos = new Float32Array(P_MAX * 3);
  const kCol = new Float32Array(P_MAX * 3);
  for (let i = 0; i < P_MAX; i++) { kPos[i * 3 + 1] = -999; }
  const kGeo = new THREE.BufferGeometry();
  kGeo.setAttribute('position', new THREE.BufferAttribute(kPos, 3));
  kGeo.setAttribute('color', new THREE.BufferAttribute(kCol, 3));
  const kMesh = new THREE.Points(kGeo, new THREE.PointsMaterial({
    size: 5.5, map: glowTex, vertexColors: true, transparent: true, opacity: 0.85,
    depthWrite: false, sizeAttenuation: true
  }));
  kMesh.frustumCulled = false;
  scene.add(kMesh);

  const sparkLife = new Float32Array(P_MAX), sparkMax = new Float32Array(P_MAX), sVel = new Float32Array(P_MAX * 3);
  const smokeLife = new Float32Array(P_MAX), smokeMax = new Float32Array(P_MAX), kVel = new Float32Array(P_MAX * 3);

  const bits = [];
  for (let i = 0; i < P_MAX; i++) {
    bits.push({ life: 0, x: 0, y: -999, z: 0, vx: 0, vy: 0, vz: 0, max: 1, r: 1, g: 1, b: 1, grav: 0, drag: 0.98 });
  }
  function spawn(x, y, z, vx, vy, vz, life, r, g, b, grav, drag) {
    for (let i = 0; i < P_MAX; i++) {
      const p = bits[i];
      if (p.life > 0) { continue; }
      p.x = x; p.y = y; p.z = z; p.vx = vx; p.vy = vy; p.vz = vz;
      p.life = life; p.max = life; p.r = r; p.g = g; p.b = b;
      p.grav = grav; p.drag = drag;
      return;
    }
  }

  /* ---------- flash + fireball + shockwave ---------- */
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0xfff0c0, transparent: true, opacity: 0,
    depthWrite: false, blending: THREE.AdditiveBlending
  }));
  flash.position.set(0, 3, 0);
  flash.scale.setScalar(8);
  scene.add(flash);

  const ballMat = new THREE.MeshBasicMaterial({ color: 0xff8a2a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), ballMat);
  ball.position.set(0, 3, 0);
  scene.add(ball);

  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffc46a, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  const ring = new THREE.Mesh(new THREE.RingGeometry(1, 1.18, 64), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, 0.4, 0);
  scene.add(ring);

  /* ---------- state ---------- */
  const btn = document.getElementById('meButton');
  const cap = document.getElementById('meCaption');
  let t = 0, started = false, blown = false, blowAt = 0, shake = 0;

  const OPEN_AT = 0.2, WALK_AT = 1.0, STOP_AT = 2.5;

  function paintHouse() {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < houseBlocks.length; i++) {
      const b = houseBlocks[i];
      e.set(b.rx, b.ry, b.rz);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(b.x, b.y, b.z), q, s);
      houseMesh.setMatrixAt(i, m);
    }
    houseMesh.instanceMatrix.needsUpdate = true;
  }

  function reset() {
    t = 0; blown = false; blowAt = 0; shake = 0;
    doorGroup.position.x = 0;
    guy.position.set(0, 0, 0.6);
    armR.rotation.z = 0; armL.rotation.z = 0;
    houseBlocks.forEach(function (b) {
      b.x = b.bx; b.y = b.by; b.z = b.bz;
      b.vx = b.vy = b.vz = 0; b.rx = b.ry = b.rz = 0;
    });
    paintHouse();
    houseMesh.visible = true;
    for (let i = 0; i < P_MAX; i++) {
      bits[i].life = 0; pPos[i * 3 + 1] = -999; pCol[i * 3] = pCol[i * 3 + 1] = pCol[i * 3 + 2] = 0;
      sparkLife[i] = 0; sPos[i * 3 + 1] = -999; sCol[i * 3] = sCol[i * 3 + 1] = sCol[i * 3 + 2] = 0;
      smokeLife[i] = 0; kPos[i * 3 + 1] = -999; kCol[i * 3] = kCol[i * 3 + 1] = kCol[i * 3 + 2] = 0;
    }
    flash.material.opacity = 0;
    ballMat.opacity = 0;
    ringMat.opacity = 0;
    fireLight.intensity = 0;
    if (btn) { btn.textContent = 'Blow it up'; btn.classList.remove('armed'); }
    if (cap) { cap.textContent = 'He is not here to talk.'; }
  }

  function boom() {
    if (blown) { return; }
    blown = true; blowAt = t; shake = 1;

    houseBlocks.forEach(function (b) {
      const dx = b.x, dy = b.y - 3, dz = b.z;
      const len = Math.max(Math.sqrt(dx * dx + dy * dy + dz * dz), 0.8);
      const power = 10 + Math.random() * 13;
      b.vx = (dx / len) * power + (Math.random() - 0.5) * 4;
      b.vy = (dy / len) * power + 8 + Math.random() * 7;
      b.vz = (dz / len) * power + (Math.random() - 0.5) * 4;
      b.sx = (Math.random() - 0.5) * 8; b.sy = (Math.random() - 0.5) * 8; b.sz = (Math.random() - 0.5) * 8;
    });

    for (let i = 0; i < 300; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      const sp = 4 + Math.random() * 20;
      const hot = Math.random();
      spawn(0, 3, 0,
        Math.sin(ph) * Math.cos(th) * sp, Math.cos(ph) * sp * 0.85 + 4, Math.sin(ph) * Math.sin(th) * sp,
        0.6 + Math.random() * 1.2,
        1, 0.4 + hot * 0.5, 0.08 + hot * 0.2,
        11, 0.965);
    }
    for (let i = 0; i < 160; i++) {
      const th = Math.random() * Math.PI * 2;
      const sp = 1 + Math.random() * 6;
      spawn(0, 3.4, 0,
        Math.cos(th) * sp, 2 + Math.random() * 5, Math.sin(th) * sp,
        1.6 + Math.random() * 1.6,
        0.3, 0.29, 0.28,
        -0.7, 0.988);
    }

    flash.material.opacity = 1;
    ballMat.opacity = 1;
    ball.scale.setScalar(0.6);
    ringMat.opacity = 0.9;
    ring.scale.setScalar(1);
    guy.position.z = 5.2;
    armR.rotation.z = 0.5;
    armL.rotation.z = -0.5;

    // sparks: fast, small, additive
    for (let i = 0; i < 220; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      const sp = 12 + Math.random() * 26;
      for (let j = 0; j < P_MAX; j++) {
        if (sparkLife[j] > 0) { continue; }
        sparkLife[j] = 0.5 + Math.random() * 0.9;
        sparkMax[j] = sparkLife[j];
        sPos[j * 3] = 0; sPos[j * 3 + 1] = 3; sPos[j * 3 + 2] = 0;
        sVel[j * 3] = Math.sin(ph) * Math.cos(th) * sp;
        sVel[j * 3 + 1] = Math.cos(ph) * sp + 6;
        sVel[j * 3 + 2] = Math.sin(ph) * Math.sin(th) * sp;
        break;
      }
    }
    // smoke: dark, slow, lingers
    for (let i = 0; i < 90; i++) {
      const th = Math.random() * Math.PI * 2;
      const sp = 0.8 + Math.random() * 4;
      for (let j = 0; j < P_MAX; j++) {
        if (smokeLife[j] > 0) { continue; }
        smokeLife[j] = 2.2 + Math.random() * 2.4;
        smokeMax[j] = smokeLife[j];
        kPos[j * 3] = (Math.random() - 0.5) * 3;
        kPos[j * 3 + 1] = 2.5 + Math.random() * 3;
        kPos[j * 3 + 2] = (Math.random() - 0.5) * 3;
        sVel[j * 3 + 0] = 0;
        kVel[j * 3] = Math.cos(th) * sp;
        kVel[j * 3 + 1] = 1.6 + Math.random() * 3.4;
        kVel[j * 3 + 2] = Math.sin(th) * sp;
        break;
      }
    }

    if (btn) { btn.textContent = 'Again'; btn.classList.remove('armed'); }
    if (cap) { cap.textContent = 'Dhurandhar.'; }
  }

  if (btn) {
    btn.addEventListener('click', function () {
      if (!started) { start(); return; }
      if (blown) { reset(); t = 3.4; return; }
      boom();
    });
  }

  function fit() {
    const holder = canvas.parentNode;
    const w = holder ? holder.clientWidth : 800;
    const h = holder ? holder.clientHeight : 340;
    if (w < 2 || h < 2) { return; }
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', fit);
  fit();

  /* ---------- loop ---------- */
  let last = 0;

  function step(now) {
    const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05);
    last = now;
    if (started) { t += dt; }

    const doorP = Math.min(Math.max((t - OPEN_AT) / 0.85, 0), 1);
    doorGroup.position.x = doorP * 2.4;

    const walkP = Math.min(Math.max((t - WALK_AT) / 1.4, 0), 1);
    if (!blown) {
      guy.position.z = 0.6 + walkP * 3.6;
      guy.position.y = Math.abs(Math.sin(t * 15)) * 0.14 * (1 - walkP);
      guy.rotation.y = -0.18;
    }

    const armsP = Math.min(Math.max((t - STOP_AT) / 0.5, 0), 1);
    if (!blown) {
      armR.rotation.z = -armsP * 1.45;
      armL.rotation.z = armsP * 0.5;
    }

    // smoke curling from his free hand
    if (armsP > 0.5 && !blown && Math.random() > 0.75) {
      spawn(-1.4, 5.4, guy.position.z + 0.3,
        (Math.random() - 0.5) * 0.4, 0.7 + Math.random() * 0.6, (Math.random() - 0.5) * 0.4,
        1.3 + Math.random() * 0.8, 0.5, 0.5, 0.52, -0.3, 0.985);
    }

    if (btn && started && !blown && armsP >= 1 && !btn.classList.contains('armed')) {
      btn.classList.add('armed');
      if (cap) { cap.textContent = 'Your call.'; }
    }

    if (blown) {
      for (let i = 0; i < houseBlocks.length; i++) {
        const b = houseBlocks[i];
        b.vy -= 18 * dt;
        b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
        b.rx += b.sx * dt; b.ry += b.sy * dt; b.rz += b.sz * dt;
        if (b.y < -2) { b.y = -2; b.vy *= -0.25; b.vx *= 0.55; b.vz *= 0.55; }
      }
      paintHouse();

      const since = t - blowAt;
      flash.material.opacity = Math.max(0, 1 - since * 2.2);
      flash.scale.setScalar(8 + since * 55);
      ballMat.opacity = Math.max(0, 1 - since * 1.15);
      ball.scale.setScalar(0.6 + since * 13);
      ringMat.opacity = Math.max(0, 0.9 - since * 0.8);
      ring.scale.setScalar(1 + since * 34);
      fireLight.intensity = Math.max(0, 70 * (1 - since * 1.4));
    }

    for (let i = 0; i < P_MAX; i++) {
      const p = bits[i];
      if (p.life <= 0) { continue; }
      p.life -= dt;
      if (p.life <= 0) {
        pPos[i * 3 + 1] = -999;
        pCol[i * 3] = pCol[i * 3 + 1] = pCol[i * 3 + 2] = 0;
        continue;
      }
      p.vy -= p.grav * dt;
      p.vx *= p.drag; p.vy *= p.drag; p.vz *= p.drag;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      const a = Math.max(p.life / p.max, 0);
      pPos[i * 3] = p.x; pPos[i * 3 + 1] = p.y; pPos[i * 3 + 2] = p.z;
      // a fire particle cools as it ages: white-hot, then yellow, orange, red, ember
      const heat = a;
      const fr = Math.min(1, heat * 1.9);
      const fg = Math.max(0, Math.min(1, (heat - 0.22) * 1.7));
      const fb = Math.max(0, Math.min(1, (heat - 0.62) * 2.2));
      pCol[i * 3] = fr * p.r;
      pCol[i * 3 + 1] = fg * p.g;
      pCol[i * 3 + 2] = fb * p.b;
    }
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.color.needsUpdate = true;

    // sparks
    for (let i = 0; i < P_MAX; i++) {
      if (sparkLife[i] <= 0) { continue; }
      sparkLife[i] -= dt;
      if (sparkLife[i] <= 0) { sPos[i * 3 + 1] = -999; sCol[i * 3] = sCol[i * 3 + 1] = sCol[i * 3 + 2] = 0; continue; }
      sVel[i * 3 + 1] -= 15 * dt;
      sPos[i * 3] += sVel[i * 3] * dt;
      sPos[i * 3 + 1] += sVel[i * 3 + 1] * dt;
      sPos[i * 3 + 2] += sVel[i * 3 + 2] * dt;
      const sa = sparkLife[i] / sparkMax[i];
      sCol[i * 3] = sa; sCol[i * 3 + 1] = sa * 0.82; sCol[i * 3 + 2] = sa * 0.45;
    }
    sGeo.attributes.position.needsUpdate = true;
    sGeo.attributes.color.needsUpdate = true;

    // smoke
    for (let i = 0; i < P_MAX; i++) {
      if (smokeLife[i] <= 0) { continue; }
      smokeLife[i] -= dt;
      if (smokeLife[i] <= 0) { kPos[i * 3 + 1] = -999; kCol[i * 3] = kCol[i * 3 + 1] = kCol[i * 3 + 2] = 0; continue; }
      kVel[i * 3] *= 0.992; kVel[i * 3 + 2] *= 0.992;
      kPos[i * 3] += kVel[i * 3] * dt;
      kPos[i * 3 + 1] += kVel[i * 3 + 1] * dt;
      kPos[i * 3 + 2] += kVel[i * 3 + 2] * dt;
      const ka = smokeLife[i] / smokeMax[i];
      const g2 = (0.10 + 0.16 * (1 - ka)) * Math.min(1, ka * 2.2);
      kCol[i * 3] = g2; kCol[i * 3 + 1] = g2; kCol[i * 3 + 2] = g2 * 1.06;
    }
    kGeo.attributes.position.needsUpdate = true;
    kGeo.attributes.color.needsUpdate = true;

    if (shake > 0) {
      shake = Math.max(0, shake - dt * 1.2);
      const s = shake * shake;
      camera.position.set(6 + (Math.random() - 0.5) * s * 2.4, 6.4 + (Math.random() - 0.5) * s * 1.8, 20 + (Math.random() - 0.5) * s * 1.8);
      camera.lookAt(0, 3.6, 0);
    } else {
      camera.position.set(6, 6.4, 20);
      camera.lookAt(0, 3.6, 0);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(step);
  }

  function start() { if (started) { return; } started = true; t = 0; }

  reset();
  renderer.render(scene, camera);
  canvas.classList.add('on');   // only now cover the illustrated fallback
  last = performance.now();
  requestAnimationFrame(step);

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { start(); io.disconnect(); } });
    }, { threshold: 0.3 });
    io.observe(canvas.parentNode);
  } else {
    start();
  }

  window.__meReplay = function () { reset(); start(); };
})();
