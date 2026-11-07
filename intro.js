/* =========================================================
   The globe intro
   Earth spins, the camera falls towards Darbhanga, and the
   little guy walks out of his house to say hi.
   Plays once per visitor. Skippable.
   ========================================================= */

const HOME = { lat: 26.15, lon: 85.9 };   // Darbhanga, Bihar

(async function () {
  const box = document.getElementById('globeIntro');
  if (!box) { return; }

  const canvas = document.getElementById('globeCanvas');
  const bubble = document.getElementById('globeBubble');
  const skip = document.getElementById('globeSkip');
  const cap = document.getElementById('globeCap');

  let THREE;
  try {
    THREE = await import('three');
  } catch (e) {
    box.remove();
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  } catch (e) {
    box.remove();
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050a14);
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(6, 4, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x88bbff, 0.7);
  rim.position.set(-8, -3, -6);
  scene.add(rim);

  /* ---------- stars ---------- */
  const starGeo = new THREE.BufferGeometry();
  const SN = 900, sp = new Float32Array(SN * 3);
  for (let i = 0; i < SN; i++) {
    const r = 40 + Math.random() * 120;
    const t = Math.random() * 6.283;
    const p = Math.acos(Math.random() * 2 - 1);
    sp[i * 3] = r * Math.sin(p) * Math.cos(t);
    sp[i * 3 + 1] = r * Math.cos(p);
    sp[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true, opacity: 0.85 }));
  scene.add(stars);

  /* ---------- the earth ---------- */
  function earthTexture() {
    const W = 1024, H = 512;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');

    const sea = g.createLinearGradient(0, 0, 0, H);
    sea.addColorStop(0, '#123c6b');
    sea.addColorStop(0.5, '#1b5a9c');
    sea.addColorStop(1, '#123c6b');
    g.fillStyle = sea;
    g.fillRect(0, 0, W, H);

    // faint latitude bands, so the ocean is not flat
    g.globalAlpha = 0.06;
    g.fillStyle = '#ffffff';
    for (let y = 0; y < H; y += 18) { g.fillRect(0, y, W, 1); }
    g.globalAlpha = 1;

    function px(lon, lat) { return [(lon + 180) / 360 * W, (90 - lat) / 180 * H]; }
    function blob(lon, lat, rx, ry, rot) {
      const [x, y] = px(lon, lat);
      g.beginPath();
      g.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2);
      g.fill();
    }

    g.fillStyle = '#3f7d3f';
    // north america
    blob(-100, 48, 62, 40, 0.2);
    blob(-90, 30, 38, 26, 0);
    // south america
    blob(-60, -12, 30, 44, -0.25);
    // europe
    blob(18, 52, 42, 24, 0);
    // africa
    blob(18, 4, 44, 52, 0);
    blob(28, -22, 30, 26, 0);
    // asia
    blob(88, 46, 92, 42, 0);
    blob(112, 22, 44, 26, 0);
    // india
    blob(78, 20, 20, 24, 0);
    // australia
    blob(134, -25, 30, 20, 0);
    // greenland
    blob(-42, 74, 24, 16, 0);

    g.fillStyle = '#4f8f4a';
    blob(-70, -4, 20, 26, 0);
    blob(20, 10, 26, 30, 0);
    blob(96, 50, 50, 22, 0);

    // ice caps
    g.fillStyle = '#eef6ff';
    g.fillRect(0, 0, W, 14);
    g.fillRect(0, H - 16, W, 16);

    // a warm pin where home is
    const [hx, hy] = px(HOME.lon, HOME.lat);
    const glow = g.createRadialGradient(hx, hy, 0, hx, hy, 26);
    glow.addColorStop(0, 'rgba(255,120,60,0.95)');
    glow.addColorStop(0.45, 'rgba(255,120,60,0.35)');
    glow.addColorStop(1, 'rgba(255,120,60,0)');
    g.fillStyle = glow;
    g.beginPath();
    g.arc(hx, hy, 26, 0, Math.PI * 2);
    g.fill();

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const earthGroup = new THREE.Group();
  scene.add(earthGroup);

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(2, 64, 48),
    new THREE.MeshLambertMaterial({ map: earthTexture() })
  );
  earthGroup.add(earth);

  // thin atmosphere
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(2.09, 48, 32),
    new THREE.MeshBasicMaterial({ color: 0x6fb2ff, transparent: true, opacity: 0.16, side: THREE.BackSide })
  );
  earthGroup.add(halo);

  /* where home sits on the sphere, in world space */
  const latR = HOME.lat * Math.PI / 180;
  const lonR = HOME.lon * Math.PI / 180;
  const homeDir = new THREE.Vector3(
    Math.cos(latR) * Math.sin(lonR),
    Math.sin(latR),
    Math.cos(latR) * Math.cos(lonR)
  );

  /* ---------- the house, for the second half ---------- */
  const houseScene = new THREE.Scene();
  houseScene.background = new THREE.Color(0x0a1524);
  houseScene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 1.2));
  const hKey = new THREE.DirectionalLight(0xffffff, 1.5);
  hKey.position.set(5, 9, 7);
  houseScene.add(hKey);

  const houseCam = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 200);
  houseCam.position.set(0, 4.6, 21);
  houseCam.lookAt(0, 3.2, 0);

  function makeBlocks(list) {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const mesh = new THREE.InstancedMesh(geo, mat, list.length);
    const m = new THREE.Matrix4();
    const col = new THREE.Color();
    list.forEach(function (b, i) {
      m.makeTranslation(b.x, b.y, b.z);
      mesh.setMatrixAt(i, m);
      col.set(b.color);
      mesh.setColorAt(i, col);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;
    return mesh;
  }

  // ground
  const ground = [];
  for (let x = -20; x <= 20; x++) {
    for (let z = -14; z <= 12; z++) {
      ground.push({ x: x, y: -0.5, z: z, color: (x + z) % 2 === 0 ? 0x5d8f52 : 0x548548 });
    }
  }
  houseScene.add(makeBlocks(ground));

  // the house
  const house = [];
  const WALL = 0xf2e6d2, ROOF = 0xd94f3a, DOOR = 0x6b4526, WIN = 0x9fd6ff;
  for (let y = 0; y < 4; y++) {
    for (let x = -3; x <= 3; x++) {
      for (let z = -2; z <= 2; z++) {
        const edge = Math.abs(x) === 3 || Math.abs(z) === 2;
        if (!edge) { continue; }
        if (y === 0 && x === 0 && z === 2) { continue; }        // doorway
        if (y === 1 && x === 0 && z === 2) { continue; }
        house.push({ x: x, y: y, z: z, color: WALL });
      }
    }
  }
  // door frame colour
  house.push({ x: 0, y: 0, z: 2, color: DOOR });
  house.push({ x: 0, y: 1, z: 2, color: DOOR });
  // windows
  house.push({ x: -2, y: 2, z: 2, color: WIN });
  house.push({ x: 2, y: 2, z: 2, color: WIN });
  // roof
  for (let y = 4; y <= 6; y++) {
    const s = 4 - (y - 4);
    for (let x = -s; x <= s; x++) {
      for (let z = -2; z <= 2; z++) {
        if (Math.abs(x) === s || y === 6) {
          house.push({ x: x, y: y, z: z, color: ROOF });
        }
      }
    }
  }
  houseScene.add(makeBlocks(house));

  // the little guy
  const guy = new THREE.Group();
  const body = [];
  const SKIN = 0xd39b6a, SHIRT = 0xff5a3c, PANTS = 0x2b3a55, HAIR = 0x241c16;
  for (let y = 0; y < 2; y++) { for (let x = -1; x <= 1; x++) { body.push({ x: x, y: y, z: 0, color: PANTS }); } }
  for (let y = 2; y < 5; y++) { for (let x = -1; x <= 1; x++) { body.push({ x: x, y: y, z: 0, color: SHIRT }); } }
  for (let y = 5; y < 8; y++) { for (let x = -1; x <= 1; x++) { for (let z = -1; z <= 0; z++) { body.push({ x: x, y: y, z: z, color: SKIN }); } } }
  for (let x = -1; x <= 1; x++) { for (let z = -1; z <= 0; z++) { body.push({ x: x, y: 8, z: z, color: HAIR }); } }
  body.push({ x: -1, y: 6, z: 1, color: 0x171717 });
  body.push({ x: 1, y: 6, z: 1, color: 0x171717 });
  guy.add(makeBlocks(body));

  const arm = new THREE.Group();
  const armBlocks = [];
  for (let y = 0; y < 3; y++) { armBlocks.push({ x: 0, y: y, z: 0, color: y === 0 ? SHIRT : SKIN }); }
  arm.add(makeBlocks(armBlocks));
  arm.position.set(1.6, 4, 0);
  guy.add(arm);

  guy.position.set(0, 0, 0.2);
  guy.scale.set(0.58, 0.58, 0.58);
  houseScene.add(guy);

  /* ---------- timeline ---------- */
  let t0 = performance.now();
  let done = false;
  const DUR = 7200;

  function fit() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    houseCam.aspect = window.innerWidth / window.innerHeight;
    houseCam.updateProjectionMatrix();
  }
  window.addEventListener('resize', fit);
  fit();

  function finish() {
    if (done) { return; }
    done = true;
    box.classList.add('out');
    try { localStorage.setItem('shrestha-intro', '1'); } catch (e) {}
    setTimeout(function () { box.remove(); }, 900);
  }

  skip.addEventListener('click', finish);

  function frame(now) {
    const t = Math.min((now - t0) / DUR, 1);

    // phase 1: space -> earth -> falling towards home
    if (t < 0.66) {
      const p = t / 0.66;

      // the globe turns so home faces us, faster at first
      const spin = (1 - Math.pow(1 - Math.min(p * 1.35, 1), 2));
      earthGroup.rotation.y = -Math.atan2(homeDir.x, homeDir.z) + (1 - spin) * Math.PI * 1.5;

      // camera dives in
      const dist = 9.5 - 6.6 * Math.pow(p, 1.7);
      const target = homeDir.clone().multiplyScalar(2);
      const dir = homeDir.clone().normalize();
      camera.position.copy(dir.multiplyScalar(dist));
      camera.lookAt(target.multiplyScalar(0.35));
      camera.fov = 45 + p * 18;
      camera.updateProjectionMatrix();

      stars.rotation.y = t * 0.4;
      renderer.render(scene, camera);
      if (cap) { cap.textContent = p < 0.45 ? 'SOMEWHERE ON EARTH' : 'DARBHANGA, BIHAR'; }
    } else {
      // phase 2: at the house
      const p = (t - 0.66) / 0.34;
      if (!box.classList.contains('at-house')) {
        box.classList.add('at-house');
        if (cap) { cap.textContent = 'HOME'; }
      }

      // he walks out of the door
      const walk = Math.min(p * 2.2, 1);
      guy.position.z = 0.2 + walk * 2.9;
      guy.position.y = Math.abs(Math.sin(p * 26)) * 0.12 * (1 - walk);
      guy.rotation.y = -0.25 + Math.sin(p * 4) * 0.05;

      // then waves
      const wave = Math.max(0, Math.min((p - 0.45) * 3.2, 1));
      arm.rotation.z = -wave * 2.3 + Math.sin(p * 22) * 0.35 * wave;

      if (p > 0.62 && bubble) { bubble.classList.add('show'); }

      renderer.render(houseScene, houseCam);
    }

    if (t >= 1) { finish(); return; }
    requestAnimationFrame(frame);
  }

  // draw one frame straight away so there is never a blank flash
  camera.position.set(0, 1.2, 9.5);
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);

  requestAnimationFrame(function (now) { t0 = now; frame(now); });

  window.__playIntro = function () {
    try { localStorage.removeItem('shrestha-intro'); } catch (e) {}
    location.reload();
  };
})();
