/* =========================================================
   The ocean at the end of the page.
   A small reef: coral, seaweed, jellyfish, and fish with
   faces. No interface, just the water.
   ========================================================= */
(async function () {
  const wrap = document.getElementById('pond');
  const canvas = document.getElementById('pondCanvas');
  if (!wrap || !canvas) { return; }

  let THREE;
  try { THREE = await import('three'); } catch (e) { return; }

  /* ---------- 1. scene ---------- */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#087a9b');
  scene.fog = new THREE.FogExp2('#087a9b', 0.018);

  const camera = new THREE.PerspectiveCamera(48, 2, 0.1, 150);
  camera.position.set(0, 2, 21);
  camera.lookAt(0, 0, 0);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  /* ---------- 2. light ---------- */
  scene.add(new THREE.HemisphereLight(0xa8faff, 0x00354c, 2.3));

  const sun = new THREE.DirectionalLight(0xd5ffff, 3.5);
  sun.position.set(-8, 14, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);

  const blueLight = new THREE.PointLight(0x00dfff, 90, 35);
  blueLight.position.set(-7, 3, 7);
  scene.add(blueLight);

  const pinkLight = new THREE.PointLight(0xff62c9, 75, 25);
  pinkLight.position.set(9, 1, 4);
  scene.add(pinkLight);

  const goldLight = new THREE.PointLight(0xffd58a, 50, 20);
  goldLight.position.set(0, -3, 8);
  scene.add(goldLight);

  /* ---------- 3. materials ---------- */
  function material(color, roughness) {
    return new THREE.MeshPhysicalMaterial({
      color: color,
      roughness: roughness === undefined ? 0.3 : roughness,
      metalness: 0.02,
      clearcoat: 0.65,
      clearcoatRoughness: 0.2
    });
  }

  const sphere = new THREE.SphereGeometry(1, 40, 32);
  const white = material('#ffffff', 0.18);
  const black = material('#10121c', 0.1);
  const cheekMat = material('#ff819a', 0.35);

  /* ---------- 4. the fish ---------- */
  const fishPalettes = [
    { body: '#ff982f', belly: '#ffe4a0', fin: '#ffb33c', stripe: true },
    { body: '#08c9e9', belly: '#c5faff', fin: '#36e6ed', stripe: false },
    { body: '#f15da7', belly: '#ffd6e8', fin: '#ff88c4', stripe: false },
    { body: '#b28aff', belly: '#e8d8ff', fin: '#d0adff', stripe: false },
    { body: '#ffd34d', belly: '#fff2b2', fin: '#ff9c30', stripe: true },
    { body: '#73df8d', belly: '#c8ffd5', fin: '#a0f5a9', stripe: false }
  ];

  function createStripe(bodyX, mat) {
    const positions = [];
    const indices = [];
    const steps = 18;
    const around = 48;
    const xStart = bodyX - 0.115;
    const xEnd = bodyX + 0.115;

    for (let i = 0; i <= steps; i++) {
      const x = xStart + (xEnd - xStart) * i / steps;
      const width = Math.sqrt(Math.max(0.01, 1 - Math.pow(x / 1.15, 2)));
      for (let j = 0; j <= around; j++) {
        const a = j / around * Math.PI * 2;
        positions.push(x, 0.61 * width * Math.sin(a), 0.49 * width * Math.cos(a));
      }
    }
    for (let i = 0; i < steps; i++) {
      for (let j = 0; j < around; j++) {
        const a = i * (around + 1) + j;
        const b = a + around + 1;
        indices.push(a, b, a + 1);
        indices.push(b, b + 1, a + 1);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, mat);
  }

  function createFish(index) {
    const palette = fishPalettes[index % fishPalettes.length];
    const fish = new THREE.Group();

    const bodyMat = material(palette.body, 0.24);
    const finMat = material(palette.fin, 0.3);
    const bellyMaterial = material(palette.belly, 0.38);

    const body = new THREE.Mesh(sphere, bodyMat);
    body.scale.set(1.15, 0.64, 0.49);
    body.castShadow = true;
    fish.add(body);

    const belly = new THREE.Mesh(sphere, bellyMaterial);
    belly.position.set(0.05, -0.31, 0.015);
    belly.scale.set(0.84, 0.29, 0.405);
    fish.add(belly);

    if (palette.stripe) {
      const stripeMat = new THREE.MeshPhysicalMaterial({ color: '#fff5e8', roughness: 0.24, clearcoat: 0.8 });
      fish.add(createStripe(-0.48, stripeMat));
      fish.add(createStripe(0.12, stripeMat));
      fish.add(createStripe(0.69, stripeMat));
    }

    // tail
    const tailPivot = new THREE.Group();
    tailPivot.position.set(-1.02, 0, 0);
    const tailShape = new THREE.Shape();
    tailShape.moveTo(0, 0);
    tailShape.quadraticCurveTo(-0.35, 0.55, -0.88, 0.58);
    tailShape.quadraticCurveTo(-0.72, 0.05, -0.9, -0.58);
    tailShape.quadraticCurveTo(-0.35, -0.48, 0, 0);
    const tailMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(tailShape, {
        depth: 0.08, bevelEnabled: true, bevelSegments: 3,
        bevelSize: 0.045, bevelThickness: 0.04, steps: 1
      }),
      finMat
    );
    tailPivot.add(tailMesh);
    fish.add(tailPivot);

    // dorsal
    const dorsalShape = new THREE.Shape();
    dorsalShape.moveTo(-0.45, 0.52);
    dorsalShape.quadraticCurveTo(-0.15, 1.1, 0.35, 0.57);
    dorsalShape.lineTo(-0.45, 0.52);
    const dorsal = new THREE.Mesh(
      new THREE.ExtrudeGeometry(dorsalShape, {
        depth: 0.06, bevelEnabled: true, bevelSegments: 3,
        bevelSize: 0.035, bevelThickness: 0.025
      }),
      finMat
    );
    dorsal.position.z = -0.025;
    fish.add(dorsal);

    // side fins
    const sideFinShape = new THREE.Shape();
    sideFinShape.moveTo(0, 0);
    sideFinShape.quadraticCurveTo(0.5, -0.25, 0.45, -0.62);
    sideFinShape.quadraticCurveTo(-0.1, -0.42, 0, 0);
    const sideFin = new THREE.Mesh(new THREE.ShapeGeometry(sideFinShape, 20), finMat);
    sideFin.position.set(-0.2, -0.1, 0.43);
    fish.add(sideFin);

    const sideFin2 = sideFin.clone();
    sideFin2.position.z = -0.43;
    sideFin2.rotation.y = Math.PI;
    fish.add(sideFin2);

    // eyes
    function addEye(z) {
      const eye = new THREE.Group();
      eye.position.set(0.76, 0.17, z);
      const eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.155, 28, 28), white);
      eyeball.scale.set(1, 0.95, 0.6);
      eye.add(eyeball);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 24), black);
      pupil.position.set(0.045, 0, 0.085);
      eye.add(pupil);
      const shine = new THREE.Mesh(new THREE.SphereGeometry(0.033, 16, 16), white);
      shine.position.set(0.065, 0.05, 0.15);
      eye.add(shine);
      fish.add(eye);
    }
    addEye(0.435);
    addEye(-0.435);

    // cheek
    const cheek = new THREE.Mesh(sphere, cheekMat);
    cheek.scale.set(0.15, 0.085, 0.045);
    cheek.position.set(0.72, -0.12, 0.445);
    fish.add(cheek);

    // smile
    const smileCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0.95, -0.20, 0.43),
      new THREE.Vector3(1.02, -0.27, 0.44),
      new THREE.Vector3(0.88, -0.30, 0.44)
    );
    const smile = new THREE.Mesh(
      new THREE.TubeGeometry(smileCurve, 12, 0.018, 8, false),
      material('#713d35')
    );
    fish.add(smile);

    fish.userData = {
      tail: tailPivot,
      sideFin: sideFin,
      phase: Math.random() * 10,
      speed: 0.35 + Math.random() * 0.5,
      direction: Math.random() > 0.5 ? 1 : -1,
      baseY: 0,
      bob: Math.random() * 0.4 + 0.15
    };
    return fish;
  }

  /* ---------- 5. populate ---------- */
  const fishes = [];
  for (let i = 0; i < 16; i++) {
    const fish = createFish(i);
    const size = 0.5 + Math.random() * 0.6;
    fish.scale.setScalar(size);
    fish.position.set((Math.random() - 0.5) * 24, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 8);
    fish.userData.baseY = fish.position.y;
    if (fish.userData.direction < 0) { fish.rotation.y = Math.PI; }
    scene.add(fish);
    fishes.push(fish);
  }

  /* ---------- 6. sand ---------- */
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), material('#c9b27c', 0.95));
  sand.rotation.x = -Math.PI / 2;
  sand.position.set(0, -5.7, -2);
  sand.receiveShadow = true;
  scene.add(sand);

  for (let i = 0; i < 120; i++) {
    const stone = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.04 + Math.random() * 0.12, 1),
      material(['#e7d19b', '#ad966b', '#fff0c5'][i % 3], 0.95)
    );
    stone.position.set((Math.random() - 0.5) * 30, -5.55, (Math.random() - 0.5) * 13);
    stone.scale.y = 0.35;
    scene.add(stone);
  }

  /* ---------- 7. coral ---------- */
  const coralColors = ['#ff619c', '#ff8b49', '#b179f9', '#ffdf67', '#ff6471', '#52d9ce'];

  function makeCoral(x, z, color) {
    const coral = new THREE.Group();
    coral.position.set(x, -5.35, z);
    const coralMat = material(color, 0.27);

    function branch(a, b, r) {
      const start = new THREE.Vector3(a[0], a[1], a[2]);
      const end = new THREE.Vector3(b[0], b[1], b[2]);
      const direction = end.clone().sub(start);
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r, direction.length(), 12), coralMat);
      mesh.position.copy(start).add(end).multiplyScalar(0.5);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
      mesh.castShadow = true;
      coral.add(mesh);
    }

    for (let i = 0; i < 5; i++) {
      const h = 0.8 + Math.random() * 1.3;
      const ox = (Math.random() - 0.5) * 0.7;
      branch([0, 0, 0], [ox, h, 0], 0.13);
      branch([ox, h * 0.6, 0], [ox - 0.4, h + 0.45, 0], 0.09);
      branch([ox, h * 0.65, 0], [ox + 0.4, h + 0.5, 0], 0.09);
    }
    scene.add(coral);
  }

  for (let i = 0; i < 14; i++) {
    makeCoral((Math.random() - 0.5) * 29, -3 + Math.random() * 5, coralColors[i % coralColors.length]);
  }

  /* ---------- 8. mushroom coral ---------- */
  for (let i = 0; i < 9; i++) {
    const group = new THREE.Group();
    group.position.set((Math.random() - 0.5) * 28, -5.4, -4 + Math.random() * 5);
    const color = material(['#fa85bc', '#ffcf66', '#9d8aff'][i % 3]);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.17, 0.65, 16), color);
    stem.position.y = 0.3;
    group.add(stem);
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.43, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), color);
    top.scale.y = 0.5;
    top.position.y = 0.62;
    group.add(top);
    scene.add(group);
  }

  /* ---------- 9. seaweed ---------- */
  const seaweeds = [];
  for (let i = 0; i < 26; i++) {
    const group = new THREE.Group();
    const height = 1.5 + Math.random() * 2.3;
    const green = material(['#16a878', '#4bdc99', '#168f7d', '#76c94c'][i % 4]);
    for (let j = 0; j < 3; j++) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3((j - 1) * 0.3, height * 0.3, 0),
        new THREE.Vector3((j - 1) * 0.45, height * 0.7, 0),
        new THREE.Vector3((j - 1) * 0.2, height, 0)
      ]);
      group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.055, 8, false), green));
    }
    group.position.set((Math.random() - 0.5) * 30, -5.35, -2 + Math.random() * 4);
    scene.add(group);
    seaweeds.push({ group: group, phase: Math.random() * 10 });
  }

  /* ---------- 10. jellyfish ---------- */
  const jellyfishes = [];
  function createJellyfish(x, y, z, color) {
    const jelly = new THREE.Group();
    const jellyMat = new THREE.MeshPhysicalMaterial({
      color: color, transparent: true, opacity: 0.68, roughness: 0.15,
      metalness: 0.05, emissive: color, emissiveIntensity: 0.3, clearcoat: 1
    });
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2), jellyMat
    );
    dome.scale.y = 0.75;
    jelly.add(dome);
    for (let i = 0; i < 7; i++) {
      const px = Math.cos(i * Math.PI * 2 / 7) * 0.4;
      const pz = Math.sin(i * Math.PI * 2 / 7) * 0.4;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(px, 0, pz),
        new THREE.Vector3(px + 0.1, -0.4, pz),
        new THREE.Vector3(px - 0.12, -0.8, pz),
        new THREE.Vector3(px + 0.1, -1.1, pz)
      ]);
      jelly.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.025, 7, false), jellyMat));
    }
    jelly.position.set(x, y, z);
    scene.add(jelly);
    jellyfishes.push({ group: jelly, phase: Math.random() * 8, baseY: y });
  }
  createJellyfish(-8, 2, -3, '#ff8adf');
  createJellyfish(8, 3, -5, '#73e8ff');
  createJellyfish(2, -1, -6, '#d5a2ff');

  /* ---------- 11. bubbles ---------- */
  const bubbles = [];
  const bubbleMaterial = new THREE.MeshPhysicalMaterial({
    color: '#d5faff', transparent: true, opacity: 0.4, roughness: 0.05,
    metalness: 0.1, transmission: 0.35, clearcoat: 1
  });
  for (let i = 0; i < 90; i++) {
    const size = 0.035 + Math.random() * 0.11;
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(size, 12, 12), bubbleMaterial);
    bubble.position.set((Math.random() - 0.5) * 30, -5 + Math.random() * 13, (Math.random() - 0.5) * 12);
    bubble.userData = { speed: 0.4 + Math.random() * 1.1, x: bubble.position.x, phase: Math.random() * 10 };
    scene.add(bubble);
    bubbles.push(bubble);
  }

  /* ---------- 12. drifting particles ---------- */
  const particlePositions = [];
  for (let i = 0; i < 700; i++) {
    particlePositions.push((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20);
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
    color: '#d6ffff', size: 0.035, transparent: true, opacity: 0.65, sizeAttenuation: true
  }));
  scene.add(particles);

  /* ---------- 13. sunbeams ---------- */
  const beams = [];
  for (let i = 0; i < 8; i++) {
    const beam = new THREE.Mesh(
      new THREE.ConeGeometry(1.4 + Math.random() * 1.5, 16, 32, 1, true),
      new THREE.MeshBasicMaterial({
        color: '#a9f5ff', transparent: true, opacity: 0.055,
        side: THREE.DoubleSide, depthWrite: false
      })
    );
    beam.position.set(-10 + i * 3, 1, -5);
    beam.scale.x = 0.5;
    beam.rotation.z = (Math.random() - 0.5) * 0.25;
    scene.add(beam);
    beams.push(beam);
  }

  /* ---------- 14. backdrop ---------- */
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 40),
    new THREE.MeshBasicMaterial({ color: '#075d83', transparent: true, opacity: 0.25 })
  );
  backdrop.position.set(0, 1, -13);
  scene.add(backdrop);

  /* ---------- 15. pointer ---------- */
  let mouseX = 0;
  let mouseY = 0;
  wrap.addEventListener('pointermove', function (e) {
    const r = wrap.getBoundingClientRect();
    mouseX = ((e.clientX - r.left) / r.width - 0.5) * 2;
    mouseY = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });

  /* ---------- 16. size ---------- */
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

  /* ---------- 17. animate ---------- */
  const clock = new THREE.Clock();
  let elapsed = 0;
  let running = false;
  let raf = 0;

  function animate() {
    if (!running) { return; }
    raf = requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.04);
    elapsed += delta;
    const t = elapsed;

    fishes.forEach(function (fish) {
      const d = fish.userData;
      fish.position.x += d.speed * delta * d.direction;
      fish.position.y = d.baseY + Math.sin(t * 1.5 + d.phase) * d.bob;
      d.tail.rotation.y = Math.sin(t * 9 + d.phase) * 0.55;
      d.sideFin.rotation.x = Math.sin(t * 8 + d.phase) * 0.25;
      fish.rotation.z = Math.sin(t * 1.6 + d.phase) * 0.045;
      if (d.direction > 0 && fish.position.x > 17) { fish.position.x = -17; }
      if (d.direction < 0 && fish.position.x < -17) { fish.position.x = 17; }
    });

    jellyfishes.forEach(function (j) {
      j.group.position.y = j.baseY + Math.sin(t * 1.1 + j.phase) * 0.65;
      j.group.rotation.z = Math.sin(t + j.phase) * 0.12;
      j.group.children[0].scale.y = 0.75 + Math.sin(t * 2 + j.phase) * 0.08;
    });

    bubbles.forEach(function (b) {
      b.position.y += b.userData.speed * delta;
      b.position.x = b.userData.x + Math.sin(t * 1.5 + b.userData.phase) * 0.25;
      if (b.position.y > 8) { b.position.y = -5.7; }
    });

    seaweeds.forEach(function (p) {
      p.group.rotation.z = Math.sin(t * 1.4 + p.phase) * 0.09;
    });

    blueLight.position.x = Math.sin(t * 0.3) * 8;
    pinkLight.position.y = Math.cos(t * 0.5) * 2;

    beams.forEach(function (b, i) {
      b.rotation.z = Math.sin(t * 0.3 + i) * 0.06;
    });

    particles.rotation.y = t * 0.009;

    camera.position.x += (mouseX * 1.3 - camera.position.x) * 0.018;
    camera.position.y += (2 - mouseY * 0.65 - camera.position.y) * 0.018;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  function start() {
    if (running) { return; }
    running = true;
    clock.getDelta();
    animate();
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
})();
