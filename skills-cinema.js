/* =========================================================
   "See my working skills" — a thirty-five second film.
   Bomb, blast, computer, zoom, race, confetti, volcano.
   ========================================================= */
(function () {
  const overlay = document.getElementById('cinema');
  const canvas = document.getElementById('cinemaCanvas');
  const stage = document.getElementById('cinemaCaption');
  const skip = document.getElementById('cinemaSkip');
  const trigger = document.getElementById('skillsBtn');
  if (!overlay || !canvas || !trigger) { return; }

  let THREE = null;
  let started = false;

  async function boot() {
    if (THREE) { return THREE; }
    THREE = await import('three');
    return THREE;
  }

  /* ---------- the whole show ---------- */
  async function run() {
    await boot();

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070c);
    scene.fog = new THREE.Fog(0x05070c, 60, 190);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 600);
    camera.position.set(0, 6, 26);

    scene.add(new THREE.AmbientLight(0x8899bb, 0.75));
    const hemi = new THREE.HemisphereLight(0x9fc4ee, 0x201a14, 1.5);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfff0d8, 2.4);
    key.position.set(12, 20, 14);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x7fb0ff, 1.6);
    rim.position.set(-14, 10, -16);
    scene.add(rim);
    const blastLight = new THREE.PointLight(0xff8a2a, 0, 120, 2);
    scene.add(blastLight);

    /* ---------- helpers ---------- */
    function vox(list, size, color) {
      const geo = new THREE.BoxGeometry(size, size, size);
      const mat = new THREE.MeshLambertMaterial({ color: color === undefined ? 0xffffff : color });
      const mesh = new THREE.InstancedMesh(geo, mat, Math.max(list.length, 1));
      const m = new THREE.Matrix4(), c = new THREE.Color();
      list.forEach(function (b, i) {
        m.makeTranslation(b.x, b.y, b.z);
        mesh.setMatrixAt(i, m);
        if (color === undefined) { c.set(b.color); mesh.setColorAt(i, c); }
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) { mesh.instanceColor.needsUpdate = true; }
      return mesh;
    }

    const glowTex = (function () {
      const S = 128;
      const c = document.createElement('canvas');
      c.width = c.height = S;
      const g = c.getContext('2d');
      const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.3, 'rgba(255,248,235,0.8)');
      gr.addColorStop(0.65, 'rgba(255,200,120,0.22)');
      gr.addColorStop(1, 'rgba(255,180,90,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, S, S);
      return new THREE.CanvasTexture(c);
    })();

    /* ---------- the word SHRESTHA, reused later ---------- */
const FONT = {
  A:["01110","10001","10001","11111","10001","10001","10001"],
  E:["11111","10000","10000","11110","10000","10000","11111"],
  H:["10001","10001","10001","11111","10001","10001","10001"],
  R:["11110","10001","10001","11110","10100","10010","10001"],
  S:["01111","10000","10000","01110","00001","00001","11110"],
  T:["11111","00100","00100","00100","00100","00100","00100"]
};

    function buildWord(text, size, gap, color) {
      const grp = new THREE.Group();
      const letters = text.split('');
      letters.forEach(function (ch, i) {
        const rows = FONT[ch];
        if (!rows) { return; }
        const list = [];
        rows.forEach(function (row, r) {
          for (let c = 0; c < row.length; c++) {
            if (row[c] === '1') { list.push({ x: c - 2, y: (6 - r) - 3, z: 0 }); }
          }
        });
        const m = vox(list, size, color);
        m.position.x = (i - (letters.length - 1) / 2) * gap;
        grp.add(m);
      });
      return grp;
    }

    /* ---------- 1. the bomb ---------- */
    const bombGroup = new THREE.Group();
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(2.1, 28, 20),
      new THREE.MeshStandardMaterial({ color: 0x1a1f27, roughness: 0.45, metalness: 0.65 })
    );
    bombGroup.add(shell);
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.75, 0.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x2b333d, roughness: 0.4, metalness: 0.7 })
    );
    cap.position.y = 2.2;
    bombGroup.add(cap);
    const fuse = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 2.4, 8),
      new THREE.MeshStandardMaterial({ color: 0xb9a68a, roughness: 1 })
    );
    fuse.position.set(0.5, 3.5, 0);
    fuse.rotation.z = -0.35;
    bombGroup.add(fuse);
    const fuseTip = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0xffc86a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    fuseTip.position.set(0.95, 4.6, 0);
    fuseTip.scale.setScalar(1.6);
    bombGroup.add(fuseTip);
    bombGroup.position.set(0, 4, 0);
    scene.add(bombGroup);

    /* ---------- 2. the computer ---------- */
    const compGroup = new THREE.Group();
    const bodyList = [];
    for (let x = -5; x <= 5; x++) {
      for (let y = -3; y <= 3; y++) {
        if (Math.abs(x) === 5 || Math.abs(y) === 3) { bodyList.push({ x: x, y: y, z: 0, color: 0x232b36 }); }
      }
    }
    compGroup.add(vox(bodyList, 0.98));
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x0a1626 });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 5.2), screenMat);
    screen.position.z = 0.55;
    compGroup.add(screen);
    const standList = [];
    for (let x = -1; x <= 1; x++) { standList.push({ x: x, y: -4, z: 0, color: 0x1a2029 }); }
    for (let x = -3; x <= 3; x++) { standList.push({ x: x, y: -5, z: 0, color: 0x151a22 }); }
    compGroup.add(vox(standList, 0.98));
    const compWord = buildWord('SHRESTHA', 0.34, 1.55, 0x5fd8ff);
    compWord.position.set(0, 0, 0.9);
    compGroup.add(compWord);
    compGroup.position.set(0, 7, -6);
    compGroup.scale.setScalar(0.9);
    scene.add(compGroup);

    /* ---------- 3. the runway and the cars ---------- */
    const trackGroup = new THREE.Group();
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 220),
      new THREE.MeshStandardMaterial({ color: 0x1b1e24, roughness: 0.95 })
    );
    road.rotation.x = -Math.PI / 2;
    trackGroup.add(road);
    for (let z = -100; z <= 100; z += 8) {
      const dash = new THREE.Mesh(
        new THREE.PlaneGeometry(0.6, 4),
        new THREE.MeshBasicMaterial({ color: 0xf2f2f2 })
      );
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.02, z);
      trackGroup.add(dash);
    }
    for (const side of [-1, 1]) {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1.4, 220),
        new THREE.MeshStandardMaterial({ color: 0xd8dde4, roughness: 0.8 })
      );
      wall.position.set(side * 8.5, 0.7, 0);
      trackGroup.add(wall);
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 0.28, 220),
        new THREE.MeshBasicMaterial({ color: side > 0 ? 0xff3b30 : 0x3b82f6 })
      );
      strip.position.set(side * 8.5, 1.45, 0);
      trackGroup.add(strip);
    }
    // finish line
    const finish = new THREE.Group();
    for (let i = 0; i < 10; i++) {
      const sq = new THREE.Mesh(
        new THREE.PlaneGeometry(1.7, 1.7),
        new THREE.MeshBasicMaterial({ color: i % 2 ? 0x111111 : 0xf5f5f5 })
      );
      sq.rotation.x = -Math.PI / 2;
      sq.position.set(-7.65 + i * 1.7, 0.03, 0);
      finish.add(sq);
    }
    trackGroup.add(finish);
    trackGroup.position.set(0, 0, -40);
    trackGroup.visible = false;
    scene.add(trackGroup);

    // five cars
    const cars = [];
    const CAR_COLORS = [0xff3b30, 0x2f6fd0, 0xf2c14e, 0x3fa34d, 0xe8e8ee];
    for (let i = 0; i < 5; i++) {
      const car = new THREE.Group();
      const parts = [];
      // chassis
      for (let x = -1; x <= 1; x++) { for (let z = -3; z <= 2; z++) { parts.push({ x: x, y: 0, z: z, color: CAR_COLORS[i] }); } }
      // nose
      parts.push({ x: 0, y: 0, z: 3, color: CAR_COLORS[i] });
      parts.push({ x: 0, y: 0, z: 4, color: CAR_COLORS[i] });
      // cockpit
      parts.push({ x: 0, y: 1, z: -1, color: 0x0b0f15 });
      parts.push({ x: 0, y: 1, z: 0, color: 0x0b0f15 });
      // wings
      for (let x = -2; x <= 2; x++) { parts.push({ x: x, y: 0, z: -3, color: CAR_COLORS[i] }); }
      car.add(vox(parts, 0.52));
      // wheels
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0a0d11, roughness: 0.9 });
      [[-1.05, 0.32, 1.5], [1.05, 0.32, 1.5], [-1.05, 0.32, -1.6], [1.05, 0.32, -1.6]].forEach(function (p) {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 12), wheelMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(p[0], p[1], p[2]);
        car.add(w);
      });
      car.position.set(-6 + i * 3, 0.6, -70 - i * 6);
      car.visible = false;
      trackGroup.add(car);
      cars.push(car);
    }

    /* ---------- 4. the volcano ---------- */
    const volcGroup = new THREE.Group();
    const cone = [];
    for (let y = 0; y < 26; y++) {
      const r = Math.round(15 - y * 0.52);
      for (let a = 0; a < 44; a++) {
        const th = (a / 44) * Math.PI * 2;
        const x = Math.round(Math.cos(th) * r);
        const z = Math.round(Math.sin(th) * r);
        if (y > 6 && Math.hypot(x, z) < 3) { continue; }
        cone.push({ x: x, y: y, z: z, color: y > 20 ? 0x3a2a22 : (y > 10 ? 0x4a3a2e : 0x2f2620) });
      }
    }
    volcGroup.add(vox(cone, 0.95));
    const lavaMat = new THREE.MeshBasicMaterial({ color: 0xff5a1f, transparent: true, opacity: 0.9 });
    const lava = new THREE.Mesh(new THREE.CircleGeometry(4.2, 32), lavaMat);
    lava.rotation.x = -Math.PI / 2;
    lava.position.y = 25.6;
    volcGroup.add(lava);
    volcGroup.position.set(0, -6, -70);
    volcGroup.visible = false;
    scene.add(volcGroup);

    const lavaWord = buildWord('SHRESTHA', 0.5, 2.2, 0xff6a20);
    lavaWord.position.set(0, 26, -70);
    lavaWord.visible = false;
    scene.add(lavaWord);

    /* ---------- particles: fire, sparks, confetti ---------- */
    function makeParticles(max, size, blending, tex) {
      const pos = new Float32Array(max * 3);
      const col = new Float32Array(max * 3);
      for (let i = 0; i < max; i++) { pos[i * 3 + 1] = -9999; }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const mesh = new THREE.Points(geo, new THREE.PointsMaterial({
        size: size, map: tex, vertexColors: true, transparent: true,
        depthWrite: false, blending: blending, sizeAttenuation: true
      }));
      mesh.frustumCulled = false;
      scene.add(mesh);
      const data = [];
      for (let i = 0; i < max; i++) {
        data.push({ life: 0, max: 1, x: 0, y: -9999, z: 0, vx: 0, vy: 0, vz: 0, r: 1, g: 1, b: 1, grav: 0, drag: 0.98 });
      }
      return { mesh: mesh, geo: geo, pos: pos, col: col, data: data, max: max };
    }

    const fire = makeParticles(1400, 2.0, THREE.AdditiveBlending, glowTex);
    const spark = makeParticles(700, 0.7, THREE.AdditiveBlending, glowTex);
    const confetti = makeParticles(900, 1.4, THREE.NormalBlending, null);

    function emit(sys, x, y, z, vx, vy, vz, life, r, g, b, grav, drag) {
      for (let i = 0; i < sys.max; i++) {
        const p = sys.data[i];
        if (p.life > 0) { continue; }
        p.x = x; p.y = y; p.z = z; p.vx = vx; p.vy = vy; p.vz = vz;
        p.life = life; p.max = life; p.r = r; p.g = g; p.b = b;
        p.grav = grav; p.drag = drag;
        return;
      }
    }

    function stepParticles(sys, dt, cool) {
      for (let i = 0; i < sys.max; i++) {
        const p = sys.data[i];
        if (p.life <= 0) { continue; }
        p.life -= dt;
        if (p.life <= 0) {
          sys.pos[i * 3 + 1] = -9999;
          sys.col[i * 3] = sys.col[i * 3 + 1] = sys.col[i * 3 + 2] = 0;
          continue;
        }
        p.vy -= p.grav * dt;
        p.vx *= p.drag; p.vy *= p.drag; p.vz *= p.drag;
        p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
        const a = p.life / p.max;
        sys.pos[i * 3] = p.x; sys.pos[i * 3 + 1] = p.y; sys.pos[i * 3 + 2] = p.z;
        if (cool) {
          const fr = Math.min(1, a * 1.9);
          const fg = Math.max(0, Math.min(1, (a - 0.22) * 1.7));
          const fb = Math.max(0, Math.min(1, (a - 0.62) * 2.2));
          sys.col[i * 3] = fr * p.r; sys.col[i * 3 + 1] = fg * p.g; sys.col[i * 3 + 2] = fb * p.b;
        } else {
          sys.col[i * 3] = p.r * a; sys.col[i * 3 + 1] = p.g * a; sys.col[i * 3 + 2] = p.b * a;
        }
      }
      sys.geo.attributes.position.needsUpdate = true;
      sys.geo.attributes.color.needsUpdate = true;
    }

    /* ---------- flash + shockwave ---------- */
    const flash = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0xfff2cc, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    flash.scale.setScalar(10);
    scene.add(flash);

    const waveMat = new THREE.MeshBasicMaterial({
      color: 0xffc46a, transparent: true, opacity: 0, side: THREE.DoubleSide,
      depthWrite: false, blending: THREE.AdditiveBlending
    });
    const wave = new THREE.Mesh(new THREE.RingGeometry(1, 1.16, 64), waveMat);
    wave.rotation.x = -Math.PI / 2;
    scene.add(wave);

    /* ---------- the script ---------- */
    const T = {
      bomb: 0,
      blast: 3.0,
      compIn: 7.0,
      compOn: 9.0,
      zoom: 13.0,
      track: 17.0,
      race: 18.5,
      finish: 27.5,
      confetti: 28.0,
      volcano: 29.0,
      lava: 32.0,
      end: 35.0
    };

    let t = 0, running = true, fired = {};
    let shake = 0;
    const clock = new THREE.Clock();

    function once(key, at) {
      if (t >= at && !fired[key]) { fired[key] = true; return true; }
      return false;
    }

    function caption(txt) { if (stage) { stage.textContent = txt; } }

    function fit() {
      const w = overlay.clientWidth || window.innerWidth;
      const h = overlay.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', fit);

    function frame() {
      if (!running) { return; }
      const dt = Math.min(clock.getDelta(), 0.05);
      t += dt;

      /* --- 1. bomb --- */
      if (t < T.blast) {
        bombGroup.visible = true;
        bombGroup.position.y = 4 + Math.sin(t * 2.2) * 0.35;
        bombGroup.rotation.y += dt * 0.5;
        fuseTip.scale.setScalar(1.3 + Math.sin(t * 26) * 0.6);
        if (Math.random() > 0.5) {
          emit(spark, 0.95, 4.6, 0, (Math.random() - 0.5) * 3, 2 + Math.random() * 3, (Math.random() - 0.5) * 3,
            0.5, 1, 0.85, 0.5, 6, 0.97);
        }
        camera.position.set(Math.sin(t * 0.5) * 1.2, 5 + Math.sin(t * 0.7) * 0.4, 22 - t * 1.6);
        camera.lookAt(0, 4, 0);
        if (t < 1) { caption('Three seconds\u2026'); }
        else if (t < 2) { caption('Two\u2026'); }
        else { caption('One\u2026'); }
      }

      /* --- 2. the blast --- */
      if (once('blast', T.blast)) {
        bombGroup.visible = false;
        shake = 1;
        flash.material.opacity = 1;
        flash.position.set(0, 4, 0);
        for (let i = 0; i < 700; i++) {
          const th = Math.random() * Math.PI * 2;
          const ph = Math.acos(Math.random() * 2 - 1);
          const sp = 8 + Math.random() * 30;
          emit(fire, 0, 4, 0,
            Math.sin(ph) * Math.cos(th) * sp, Math.cos(ph) * sp * 0.8 + 6, Math.sin(ph) * Math.sin(th) * sp,
            1.0 + Math.random() * 1.8, 1, 0.5 + Math.random() * 0.4, 0.1, 12, 0.965);
        }
        for (let i = 0; i < 300; i++) {
          const th = Math.random() * Math.PI * 2;
          const ph = Math.acos(Math.random() * 2 - 1);
          const sp = 20 + Math.random() * 45;
          emit(spark, 0, 4, 0,
            Math.sin(ph) * Math.cos(th) * sp, Math.cos(ph) * sp + 8, Math.sin(ph) * Math.sin(th) * sp,
            0.9 + Math.random(), 1, 0.9, 0.6, 16, 0.985);
        }
      }

      if (t >= T.blast && t < T.compIn) {
        const since = t - T.blast;
        flash.material.opacity = Math.max(0, 1 - since * 1.8);
        flash.scale.setScalar(10 + since * 90);
        waveMat.opacity = Math.max(0, 0.9 - since * 0.8);
        wave.scale.setScalar(1 + since * 42);
        blastLight.intensity = Math.max(0, 260 * (1 - since * 0.9));
        blastLight.position.set(0, 4, 0);
        if (since < 2.5) { caption(''); }
        else { caption('Fire. Everywhere.'); }
      }

      /* --- 3. the computer --- */
      if (t >= T.compIn && t < T.zoom) {
        const p = Math.min((t - T.compIn) / 2, 1);
        compGroup.visible = true;
        compGroup.position.y = 7 - 7 * (1 - p) * 0.0;
        compGroup.position.set(0, 7, -6 + (1 - p) * -10);
        const glow = Math.max(0, 1 - (t - T.blast) * 0.35);
        if (t >= T.compOn) {
          const on = Math.min((t - T.compOn) / 0.6, 1);
          screenMat.color.setRGB(0.04 + on * 0.2, 0.09 + on * 0.62, 0.15 + on * 0.85);
          blastLight.intensity = on * 60;
          blastLight.position.set(0, 7, -4);
          caption('SHRESTHA');
        } else {
          caption('Something is waking up\u2026');
        }
        camera.position.set(0, 7, 12 - (t - T.compIn) * 1.2);
        camera.lookAt(0, 7, -6);
      }

      /* --- 4. zoom into the screen --- */
      if (t >= T.zoom && t < T.track) {
        const p = Math.min((t - T.zoom) / (T.track - T.zoom), 1);
        const ease = p * p * (3 - 2 * p);
        camera.position.set(0, 7, 8 - ease * 12.2);
        camera.lookAt(0, 7, -6);
        flash.material.opacity = Math.max(0, ease * 1.2);
        flash.position.set(0, 7, -6);
        flash.scale.setScalar(10 + ease * 40);
        caption('SHRESTHA');
      }

      /* --- 5. the track --- */
      if (t >= T.track && t < T.confetti) {
        trackGroup.visible = true;
        compGroup.visible = false;
        flash.material.opacity = Math.max(0, 1 - (t - T.track) * 2);
        blastLight.intensity = Math.max(0, 80 * (1 - (t - T.track) * 1.5));
        cars.forEach(function (c) { c.visible = true; });

        if (t >= T.race) {
          const rp = (t - T.race);
          cars.forEach(function (car, i) {
            const speed = 34 + i * 1.6;
            car.position.z = -70 - i * 6 + rp * speed;
            car.position.x = -6 + i * 3 + Math.sin(rp * 2.2 + i) * 0.7;
            car.rotation.y = Math.sin(rp * 2.2 + i) * 0.06;
          });
          const leader = cars[0].position.z;
          camera.position.set(0, 4.4 + Math.sin(rp * 0.6) * 0.4, leader - 14);
          camera.lookAt(0, 1.2, leader + 10);
          caption('Five cars. One line.');
        } else {
          camera.position.set(0, 5, 20);
          camera.lookAt(0, 1, -20);
          caption('Clear the grid.');
        }
      }

      /* --- 6. finish + confetti --- */
      if (once('finish', T.finish)) {
        for (let i = 0; i < 500; i++) {
          const ang = Math.random() * Math.PI * 2;
          const sp = 6 + Math.random() * 16;
          const hue = Math.random();
          emit(confetti, 0, 8, 0,
            Math.cos(ang) * sp, 8 + Math.random() * 14, Math.sin(ang) * sp,
            3 + Math.random() * 2,
            0.3 + hue * 0.7, 0.3 + (1 - hue) * 0.7, 0.9,
            5, 0.985);
        }
        caption('Finished.');
      }

      /* --- 7. volcano --- */
      if (t >= T.volcano) {
        volcGroup.visible = true;
        trackGroup.visible = false;
        const p = Math.min((t - T.volcano) / 3, 1);
        camera.position.set(Math.sin(t * 0.3) * 14, 16 + p * 8, 26 - p * 4);
        camera.lookAt(0, 12, -70);
        if (Math.random() > 0.35) {
          const sp = 14 + Math.random() * 22;
          const ang = Math.random() * Math.PI * 2;
          emit(fire, 0, 26, -70,
            Math.cos(ang) * (2 + Math.random() * 5), sp, Math.sin(ang) * (2 + Math.random() * 5),
            1.4 + Math.random() * 1.6, 1, 0.55, 0.15, 9, 0.97);
        }
        blastLight.intensity = 60 + Math.sin(t * 9) * 25;
        blastLight.position.set(0, 30, -70);
        lavaMat.opacity = 0.75 + Math.sin(t * 4) * 0.2;
        caption('And out of the fire\u2026');
      }

      if (t >= T.lava) {
        const p = Math.min((t - T.lava) / 2.4, 1);
        lavaWord.visible = true;
        lavaWord.position.y = 26 + p * 12;
        lavaWord.position.z = -70 + p * 26;
        lavaWord.rotation.y = (1 - p) * 0.9;
        lavaWord.scale.setScalar(0.4 + p * 1.5);
        caption('SHRESTHA');
      }

      /* --- 8. the end --- */
      if (t >= T.end) {
        running = false;
        overlay.classList.add('done');
        caption('');
        setTimeout(function () { close(); }, 900);
      }

      stepParticles(fire, dt, true);
      stepParticles(spark, dt, true);
      stepParticles(confetti, dt, false);

      if (shake > 0) {
        shake = Math.max(0, shake - dt * 0.9);
        const s = shake * shake;
        camera.position.x += (Math.random() - 0.5) * s * 3;
        camera.position.y += (Math.random() - 0.5) * s * 2;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(frame);
    }

    function close() {
      running = false;
      overlay.classList.remove('open');
      setTimeout(function () { overlay.classList.remove('done'); }, 400);
      trigger.classList.remove('playing');
      try { renderer.dispose(); } catch (e) {}
    }

    if (skip) {
      skip.addEventListener('click', function (e) { e.stopPropagation(); close(); });
    }

    fit();
    clock.getDelta();
    requestAnimationFrame(frame);
  }

  trigger.addEventListener('click', function () {
    if (started) { return; }
    started = true;
    overlay.classList.add('open');
    trigger.classList.add('playing');
    if (stage) { stage.textContent = ''; }
    run().catch(function (err) {
      overlay.classList.remove('open');
      trigger.classList.remove('playing');
      started = false;
    });
  });
})();
