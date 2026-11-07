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
  function lonLatToPx(lon, lat, W, H) {
    return [(lon + 180) / 360 * W, (90 - lat) / 180 * H];
  }

  const LAND = [
    [[-168,65],[-160,71],[-140,70],[-125,70],[-100,73],[-80,73],[-62,60],[-55,50],[-66,45],[-70,42],
     [-75,35],[-81,25],[-97,26],[-105,20],[-115,30],[-125,40],[-130,55],[-140,60],[-168,65]],
    [[-81,8],[-75,11],[-60,10],[-50,0],[-35,-6],[-38,-15],[-48,-25],[-58,-35],[-63,-42],[-68,-52],
     [-75,-50],[-72,-40],[-71,-20],[-80,-5],[-81,8]],
    [[-17,15],[-10,5],[9,4],[9,-1],[12,-6],[13,-17],[15,-28],[20,-35],[28,-33],[33,-26],[40,-15],
     [41,-2],[51,12],[43,12],[35,23],[33,31],[20,32],[10,37],[0,36],[-10,30],[-17,21],[-17,15]],
    [[-10,36],[0,44],[3,43],[10,44],[20,40],[28,37],[35,36],[45,40],[50,45],[60,45],[70,40],[80,30],
     [90,22],[95,20],[105,10],[110,20],[120,30],[122,40],[130,43],[135,50],[142,55],[160,60],[180,65],
     [180,72],[140,74],[100,77],[60,70],[30,70],[10,60],[5,58],[-5,50],[-10,36]],
    [[68,23],[72,20],[77,8],[80,13],[87,21],[89,22],[85,25],[78,28],[72,28],[68,23]],
    [[114,-22],[122,-18],[130,-12],[142,-11],[146,-19],[150,-25],[153,-28],[150,-37],[143,-39],
     [135,-35],[129,-32],[115,-34],[114,-22]],
    [[-45,60],[-30,64],[-22,70],[-25,76],[-38,78],[-52,76],[-55,68],[-45,60]]
  ];

  function earthTexture() {
    const W = 1024, H = 512;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');

    const sea = g.createLinearGradient(0, 0, 0, H);
    sea.addColorStop(0.00, '#0a2444');
    sea.addColorStop(0.25, '#124a7d');
    sea.addColorStop(0.50, '#1a6aa8');
    sea.addColorStop(0.75, '#124a7d');
    sea.addColorStop(1.00, '#0a2444');
    g.fillStyle = sea;
    g.fillRect(0, 0, W, H);

    for (let i = 0; i < 420; i++) {
      g.globalAlpha = 0.03 + Math.random() * 0.05;
      g.fillStyle = Math.random() > 0.5 ? '#7fc4f0' : '#08243f';
      g.beginPath();
      g.arc(Math.random() * W, Math.random() * H, 4 + Math.random() * 26, 0, 6.283);
      g.fill();
    }
    g.globalAlpha = 1;

    function path(poly) {
      g.beginPath();
      poly.forEach(function (pt, i) {
        const p = lonLatToPx(pt[0], pt[1], W, H);
        if (i === 0) { g.moveTo(p[0], p[1]); } else { g.lineTo(p[0], p[1]); }
      });
      g.closePath();
    }

    g.shadowColor = 'rgba(0,0,0,0.5)';
    g.shadowBlur = 9;
    LAND.forEach(function (poly) { path(poly); g.fillStyle = '#3f7a45'; g.fill(); });
    g.shadowBlur = 0;
    g.shadowColor = 'transparent';

    LAND.forEach(function (poly) {
      path(poly);
      g.fillStyle = '#4a8a4a';
      g.fill();
      g.save();
      path(poly);
      g.clip();
      for (let i = 0; i < 160; i++) {
        const pick = Math.random();
        g.globalAlpha = 0.10 + Math.random() * 0.2;
        g.fillStyle = pick > 0.72 ? '#8fae5a' : (pick > 0.45 ? '#3d7040' : '#5e9450');
        g.beginPath();
        g.arc(Math.random() * W, Math.random() * H, 6 + Math.random() * 28, 0, 6.283);
        g.fill();
      }
      g.globalAlpha = 0.3;
      g.fillStyle = '#c9b276';
      const d1 = lonLatToPx(18, 22, W, H), d2 = lonLatToPx(52, 24, W, H), d3 = lonLatToPx(133, -25, W, H);
      g.beginPath(); g.ellipse(d1[0], d1[1], 62, 32, 0, 0, 6.283); g.fill();
      g.beginPath(); g.ellipse(d2[0], d2[1], 36, 21, 0, 0, 6.283); g.fill();
      g.beginPath(); g.ellipse(d3[0], d3[1], 48, 28, 0, 0, 6.283); g.fill();
      g.restore();
      g.globalAlpha = 1;
    });

    g.fillStyle = '#eef7ff';
    g.fillRect(0, 0, W, 15);
    g.fillRect(0, H - 23, W, 23);

    const hx = lonLatToPx(HOME.lon, HOME.lat, W, H);
    const glow = g.createRadialGradient(hx[0], hx[1], 0, hx[0], hx[1], 24);
    glow.addColorStop(0, 'rgba(255,190,120,0.95)');
    glow.addColorStop(0.3, 'rgba(255,120,50,0.55)');
    glow.addColorStop(1, 'rgba(255,90,30,0)');
    g.fillStyle = glow;
    g.beginPath(); g.arc(hx[0], hx[1], 24, 0, 6.283); g.fill();

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function cloudTexture() {
    const W = 1024, H = 512;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.clearRect(0, 0, W, H);
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const band = Math.sin((y / H) * Math.PI);
      if (Math.random() > band * 0.95 + 0.08) { continue; }
      const r = 12 + Math.random() * 52;
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, 'rgba(255,255,255,' + (0.3 + Math.random() * 0.38) + ')');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const earthGroup = new THREE.Group();
  scene.add(earthGroup);

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(2, 64, 48),
    new THREE.MeshPhongMaterial({ map: earthTexture(), shininess: 22, specular: 0x244a70 })
  );
  earthGroup.add(earth);

  // clouds, drifting a little faster than the ground
  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(2.03, 40, 28),
    new THREE.MeshLambertMaterial({ map: cloudTexture(), transparent: true, opacity: 0.34, depthWrite: false })
  );
  earthGroup.add(clouds);

  // atmosphere: a soft additive sprite behind the globe.
  // (no custom shaders — they fail to compile on some mobile GPUs and
  //  take the whole render down with them)
  const haloTex = (function () {
    const S = 256;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(S / 2, S / 2, S * 0.30, S / 2, S / 2, S / 2);
    grad.addColorStop(0, 'rgba(120,180,255,0)');
    grad.addColorStop(0.55, 'rgba(110,175,255,0.30)');
    grad.addColorStop(0.78, 'rgba(90,155,255,0.16)');
    grad.addColorStop(1, 'rgba(70,130,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, S, S);
    return new THREE.CanvasTexture(c);
  })();

  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9
  }));
  halo.scale.set(5.4, 5.4, 5.4);
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
  let frames = 0;
  const DUR = 7200;

  function fit() {
    const holder = canvas.parentNode;
    const w = holder ? holder.clientWidth : 320;
    const h = holder ? holder.clientHeight : 240;
    if (w < 2 || h < 2) { return; }
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    houseCam.aspect = w / h;
    houseCam.updateProjectionMatrix();
  }
  window.addEventListener('resize', fit);
  fit();

  function finish() {
    if (done) { return; }
    done = true;
    box.classList.add('done');
    if (bubble) { bubble.classList.add('show'); }
  }

  if (skip) { skip.addEventListener('click', finish); }

  // safety nets: the site must never stay hidden
  setTimeout(finish, 14000);                       // absolute cap
  setTimeout(function () { if (frames < 8) { finish(); } }, 3000);   // nothing is moving

  function frame(now) {
    frames++;
    const t = Math.min((now - t0) / DUR, 1);

    // phase 1: space -> earth -> falling towards home
    if (t < 0.66) {
      const p = t / 0.66;

      // the globe turns so home faces us, faster at first
      const spin = (1 - Math.pow(1 - Math.min(p * 1.35, 1), 2));
      earthGroup.rotation.y = -Math.atan2(homeDir.x, homeDir.z) + (1 - spin) * Math.PI * 1.5;
      if (clouds) { clouds.rotation.y = (1 - spin) * Math.PI * 1.5 + t * 0.18; }

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

      try { renderer.render(houseScene, houseCam); } catch (e) { finish(); return; }
    }

    if (t >= 1) { finish(); return; }
    requestAnimationFrame(frame);
  }

  // draw one frame straight away so there is never a blank flash
  camera.position.set(0, 1.2, 9.5);
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);

  let started = false;
  function start() {
    if (started || done) { return; }
    started = true;
    fit();
    requestAnimationFrame(function (now) { t0 = now; frame(now); });
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { start(); io.disconnect(); }
      });
    }, { threshold: 0.3 });
    io.observe(box);
  } else {
    start();
  }

  window.__playIntro = function () {
    done = false;
    started = false;
    box.classList.remove('done');
    if (bubble) { bubble.classList.remove('show'); }
    try { box.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    start();
  };
})();
