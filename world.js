const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('world');
let sceneAPI = null;

/* ================= THREE.JS VOXEL WORLD ================= */
(async function init(){
  if (window.__siteKey !== 'ok') {
    return;
  }
  const THREE = await import('three');
  // Wait for the opening splash before building, so several thousand voxels
  // are not created while the logo is still drawing.
  if (window.__splashDone) {
    await window.__splashDone;
  }
  // NOTE: post-processing bloom is intentionally not used — UnrealBloomPass
  // destroys the alpha channel, which would tint the CSS sky behind the canvas.
  // Glow is done with additive sprites instead.
  sceneAPI = build(THREE, null);
  window.__scene = sceneAPI;
  buildBoy(THREE);
})().catch(function(err){ if(window.console) console.warn('3D unavailable:', err && err.message); document.body.classList.add('no3d'); });

/* ==================== THE LITTLE 3D BOY ==================== */
/* A small second scene that shows a voxel version of me above the About heading. */

function buildBoy(THREE) {
  var canvas = document.getElementById('boyCanvas');
  if (!canvas) {
    return;
  }

  function giveUpOnBoy() {
    var holder = canvas.closest ? canvas.closest('.about-boy') : null;
    if (holder) {
      holder.style.display = 'none';
    }
  }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (error) {
    giveUpOnBoy();
    return;
  }
  if (!renderer || !renderer.getContext()) {
    giveUpOnBoy();
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
  camera.position.set(0, 11, 35);
  camera.lookAt(0, 8.5, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x9fb6c9, 1.2));
  var sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(9, 20, 14);
  scene.add(sun);
  var rim = new THREE.DirectionalLight(0xbcd8ff, 0.6);
  rim.position.set(-11, 7, -9);
  scene.add(rim);

  function makeBlocks(list, size) {
    var geo = new THREE.BoxGeometry(size, size, size);
    var mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    var mesh = new THREE.InstancedMesh(geo, mat, list.length);
    var matrix = new THREE.Matrix4();
    var colour = new THREE.Color();
    var i = 0;
    while (i < list.length) {
      matrix.makeTranslation(list[i].x, list[i].y, list[i].z);
      mesh.setMatrixAt(i, matrix);
      colour.set(list[i].color);
      mesh.setColorAt(i, colour);
      i = i + 1;
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;
    return mesh;
  }

  var skin = 0xd39b6a;
  var hair = 0x241c16;
  var shirt = 0xff5a3c;
  var shirtTop = 0xd8492c;
  var pants = 0x2b3a55;
  var shoe = 0x1b2430;
  var eye = 0x171717;
  var mouth = 0x8a4a3a;

  var cells = {};
  function put(x, y, z, color) {
    cells[x + ',' + y + ',' + z] = { x: x, y: y, z: z, color: color };
  }

  var x;
  var y;
  var z;

  // shoes
  y = 0;
  for (x = -2; x <= 2; x = x + 1) {
    if (x === 0) {
      continue;
    }
    for (z = -1; z <= 1; z = z + 1) {
      put(x, y, z, shoe);
    }
  }

  // legs
  for (y = 1; y <= 4; y = y + 1) {
    for (x = -2; x <= 2; x = x + 1) {
      if (x === 0) {
        continue;
      }
      for (z = -1; z <= 1; z = z + 1) {
        put(x, y, z, pants);
      }
    }
  }

  // shirt
  for (y = 5; y <= 9; y = y + 1) {
    var shirtColor = (y === 9) ? shirtTop : shirt;
    for (x = -2; x <= 2; x = x + 1) {
      for (z = -1; z <= 1; z = z + 1) {
        put(x, y, z, shirtColor);
      }
    }
  }

  // left arm, hanging
  for (y = 5; y <= 9; y = y + 1) {
    var leftColor = (y >= 8) ? shirt : skin;
    for (z = -1; z <= 1; z = z + 1) {
      put(-3, y, z, leftColor);
    }
  }

  // neck
  for (x = -1; x <= 1; x = x + 1) {
    put(x, 10, 0, skin);
  }

  // head
  for (y = 11; y <= 15; y = y + 1) {
    for (x = -2; x <= 2; x = x + 1) {
      for (z = -1; z <= 1; z = z + 1) {
        put(x, y, z, skin);
      }
    }
  }

  // hair on top
  for (x = -2; x <= 2; x = x + 1) {
    for (z = -1; z <= 1; z = z + 1) {
      put(x, 16, z, hair);
    }
  }

  // hair down the back
  for (y = 13; y <= 15; y = y + 1) {
    for (x = -2; x <= 2; x = x + 1) {
      put(x, y, -1, hair);
    }
  }

  // hair at the sides
  for (y = 14; y <= 15; y = y + 1) {
    put(-2, y, 0, hair);
    put(2, y, 0, hair);
  }

  // face
  put(-1, 13, 1, eye);
  put(1, 13, 1, eye);
  put(0, 12, 1, mouth);

  var bodyList = [];
  var key;
  for (key in cells) {
    bodyList.push(cells[key]);
  }

  var boy = new THREE.Group();
  boy.add(makeBlocks(bodyList, 1));
  scene.add(boy);

  // right arm, separate so it can wave
  var armList = [];
  var armY = 0;
  while (armY >= -4) {
    var armColor = (armY >= -1) ? shirt : skin;
    for (z = -1; z <= 1; z = z + 1) {
      armList.push({ x: 0, y: armY, z: z, color: armColor });
    }
    armY = armY - 1;
  }
  var armGroup = new THREE.Group();
  armGroup.add(makeBlocks(armList, 1));
  armGroup.position.set(3, 9, 0);
  boy.add(armGroup);

  boy.position.y = 0;

  function resize() {
    var box = canvas.parentNode;
    var width = box ? box.clientWidth : 260;
    var height = box ? box.clientHeight : 310;
    if (width < 2 || height < 2) {
      return;
    }
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  var clock = new THREE.Clock();
  var onScreen = true;

  var BOY_POSES = {
    wave:  { arm: 2.32, armX: 0, turn: 0, lean: 0 },
    high:  { arm: 2.95, armX: 0, turn: -0.35, lean: -0.05 },
    out:   { arm: 1.55, armX: 0, turn: 0.4, lean: 0.06 },
    down:  { arm: 0.12, armX: 0, turn: 0.1, lean: 0 },
    back:  { arm: 0.6, armX: 0, turn: 2.9, lean: 0 }
  };
  var boyPose = 'wave';

  window.__boyPose = function (name) {
    if (BOY_POSES[name]) {
      boyPose = name;
    }
  };

  window.__boyShot = function (done) {
    renderer.render(scene, camera);
    var shot = document.createElement('canvas');
    shot.width = canvas.width;
    shot.height = canvas.height;
    var paint = shot.getContext('2d');
    paint.fillStyle = '#0b1522';
    paint.fillRect(0, 0, shot.width, shot.height);
    paint.drawImage(canvas, 0, 0);
    var unit = shot.width / 260;
    paint.fillStyle = '#ffffff';
    paint.font = '700 ' + (20 * unit) + 'px "Space Grotesk", system-ui, sans-serif';
    paint.textAlign = 'center';
    paint.fillText('SHRESTHA', shot.width / 2, shot.height - 26 * unit);
    paint.fillStyle = 'rgba(255,255,255,0.55)';
    paint.font = '400 ' + (11 * unit) + 'px "Plus Jakarta Sans", system-ui, sans-serif';
    paint.fillText('shresthaxcoder.github.io', shot.width / 2, shot.height - 12 * unit);
    done(shot);
  };

  if ('IntersectionObserver' in window) {
    var watcher = new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen) {
        resize();
      }
    }, { threshold: 0.05 });
    watcher.observe(canvas);
  }

  function draw() {
    requestAnimationFrame(draw);
    if (!onScreen) {
      return;
    }
    var t = clock.getElapsedTime();
    var pose = BOY_POSES[boyPose];
    var wantArm = pose.arm;
    if (boyPose === 'wave') {
      wantArm = wantArm + Math.sin(t * 5) * 0.26;
    }
    armGroup.rotation.z = armGroup.rotation.z + (wantArm - armGroup.rotation.z) * 0.16;
    armGroup.rotation.x = armGroup.rotation.x + (pose.armX - armGroup.rotation.x) * 0.16;
    boy.rotation.y = boy.rotation.y + (pose.turn - boy.rotation.y) * 0.1;
    boy.rotation.z = boy.rotation.z + (pose.lean - boy.rotation.z) * 0.12;
    boy.position.y = Math.sin(t * 1.6) * 0.22;
    renderer.render(scene, camera);
  }
  draw();
}

function build(THREE, PP){
  let composer = null, bloom = null;
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  if(renderer.outputColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, innerWidth/innerHeight, 0.1, 800);
  camera.position.set(0, 6, 46);
  camera.lookAt(0, 4, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x9fb6c9, 1.15));
  const sunLight = new THREE.DirectionalLight(0xfff3e0, 1.5); sunLight.position.set(26, 42, 20); scene.add(sunLight);
  const fill = new THREE.DirectionalLight(0xbcd8ff, 0.5); fill.position.set(-28, 12, -18); scene.add(fill);
  const fireLight = new THREE.PointLight(0xff8a3c, 0, 26); scene.add(fireLight);

  const jitter = (hex, amt)=>{ const c=new THREE.Color(hex); const h={}; c.getHSL(h);
    c.setHSL(h.h,h.s,Math.max(0,Math.min(1,h.l+(Math.random()-0.5)*amt))); return c.getHex(); };
  function makeVoxels(cubes, size, useColor){
    const geo = new THREE.BoxGeometry(size,size,size);
    const mat = new THREE.MeshLambertMaterial({color:0xffffff});
    const mesh = new THREE.InstancedMesh(geo, mat, cubes.length);
    const m = new THREE.Matrix4(), c = new THREE.Color();
    cubes.forEach((b,i)=>{ m.makeTranslation(b.x,b.y,b.z); mesh.setMatrixAt(i,m);
      if(useColor!==false){ c.set(b.color); mesh.setColorAt(i,c); } });
    mesh.instanceMatrix.needsUpdate = true;
    if(mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    return mesh;
  }

  const GRASS=0x6ec177, DIRT=0xa97f57, STONE=0xa7b0ba, WOOD=0x8a6239, LEAF=0x4f9e5c,
        ROOF=0xc4573f, FLOWER=[0xff6f9c,0xffd23f,0xffffff,0xb98cff], SAND=0xe6d3a3, WATER=0x4aa8e0;
  const R = 16, POND = {x:-6, z:5, r:3.6, level:1};
  const inPond = (x,z)=> Math.hypot(x-POND.x, z-POND.z) < POND.r;
  function heightAt(x,z){
    const d = Math.hypot(x,z);
    const h = Math.sin(x*0.55)*0.6 + Math.cos(z*0.45)*0.6 + Math.sin((x+z)*0.3)*0.4;
    let t = Math.round(1.8 - Math.pow(d/R,2)*3.0 + h*0.7);
    if(inPond(x,z)) t = POND.level-1;
    return t;
  }
  const cubes = [], waterCubes = [];
  for(let x=-R;x<=R;x++) for(let z=-R;z<=R;z++){
    const d = Math.hypot(x,z); if(d>R) continue;
    const top = heightAt(x,z);
    const bottom = Math.round(-4.5 + Math.pow(d/R,2)*6.0);
    if(bottom>top) continue;
    for(let y=bottom;y<=top;y++){
      let base = y===top ? (inPond(x,z)?SAND:GRASS) : (y>=top-2 ? DIRT : STONE);
      cubes.push({x,y,z,color:jitter(base,0.09)});
    }
    if(inPond(x,z) && Math.hypot(x-POND.x,z-POND.z) < POND.r-0.6) waterCubes.push({x,y:POND.level,z});
  }
  // trees
  for(let i=0;i<11;i++){
    const a=Math.random()*Math.PI*2, r=3+Math.random()*10;
    const tx=Math.round(Math.cos(a)*r), tz=Math.round(Math.sin(a)*r);
    if(Math.hypot(tx,tz)>R-2 || inPond(tx,tz)) continue;
    const top=heightAt(tx,tz);
    for(let k=1;k<=2;k++) cubes.push({x:tx,y:top+k,z:tz,color:jitter(WOOD,0.08)});
    for(let lx=-1;lx<=1;lx++) for(let lz=-1;lz<=1;lz++){ if(Math.abs(lx)+Math.abs(lz)>1) continue;
      cubes.push({x:tx+lx,y:top+2,z:tz+lz,color:jitter(LEAF,0.1)}); }
    cubes.push({x:tx,y:top+3,z:tz,color:jitter(LEAF,0.1)});
  }
  // flowers + rocks
  for(let i=0;i<42;i++){
    const a=Math.random()*Math.PI*2, r=Math.random()*R;
    const fx=Math.round(Math.cos(a)*r), fz=Math.round(Math.sin(a)*r);
    if(Math.hypot(fx,fz)>R-1 || inPond(fx,fz)) continue;
    const top=heightAt(fx,fz);
    cubes.push({x:fx,y:top+1,z:fz,color:FLOWER[Math.floor(Math.random()*FLOWER.length)]});
  }
  for(let i=0;i<16;i++){
    const a=Math.random()*Math.PI*2, r=Math.random()*R;
    const rx=Math.round(Math.cos(a)*r), rz=Math.round(Math.sin(a)*r);
    if(Math.hypot(rx,rz)>R-1 || inPond(rx,rz)) continue;
    const top=heightAt(rx,rz);
    cubes.push({x:rx,y:top+1,z:rz,color:jitter(STONE,0.1)});
    if(Math.random()>0.5) cubes.push({x:rx+1,y:top+1,z:rz,color:jitter(STONE,0.1)});
  }
  // stone path
  for(let t=-9;t<=9;t++){
    const px=Math.round(t*0.9), pz=Math.round(-t*0.55);
    if(Math.hypot(px,pz)>R-2) continue;
    const top=heightAt(px,pz);
    cubes.push({x:px,y:top,z:pz,color:jitter(0xd9c9a6,0.05)});
  }
  // hut
  (function(){
    const hx=8, hz=-7, hy=heightAt(hx,hz);
    for(let x=-2;x<=2;x++) for(let z=-2;z<=2;z++){
      if(Math.abs(x)===2 && Math.abs(z)===2) continue;
      const wallH = 3;
      for(let y=1;y<=wallH;y++){
        if(x===0 && z===2 && y<=2) continue; // door
        cubes.push({x:hx+x,y:hy+y,z:hz+z,color:jitter(WOOD,0.07)});
      }
    }
    for(let x=-3;x<=3;x++) for(let z=-3;z<=3;z++){
      if(Math.abs(x)+Math.abs(z)>4) continue;
      cubes.push({x:hx+x,y:hy+4,z:hz+z,color:jitter(ROOF,0.08)});
    }
    cubes.push({x:hx+1,y:hy+2,z:hz-2,color:0xffd76a}); // lit window
  })();
  // campfire ring
  const FIRE = {x:4, z:6, y:heightAt(4,6)};
  for(let a=0;a<8;a++){
    const ang=a/8*Math.PI*2;
    cubes.push({x:Math.round(FIRE.x+Math.cos(ang)*1.6), y:FIRE.y+1, z:Math.round(FIRE.z+Math.sin(ang)*1.6), color:jitter(STONE,0.08)});
  }
  const island = new THREE.Group();
  island.add(makeVoxels(cubes, 1.0));
  scene.add(island);

  // water (animated)
  const water = makeVoxels(waterCubes, 1.0, false);
  water.material = new THREE.MeshLambertMaterial({color:WATER, transparent:true, opacity:0.86});
  island.add(water);
  const wBase = waterCubes.map(c=>({x:c.x,z:c.z,y:c.y}));

  // waterfall
  const wfX = POND.x, wfZ = POND.z - POND.r + 0.4, wfTop = 4;
  const wfCubes = [];
  for(let y=POND.level; y<=wfTop; y++) wfCubes.push({x:wfX, y, z:wfZ});
  for(let x=-1;x<=1;x++) for(let y=wfTop+1;y<=wfTop+2;y++) cubes.push({x:wfX+x,y,z:wfZ-1,color:jitter(STONE,0.08)});
  const fall = makeVoxels(wfCubes, 0.92, false);
  fall.material = new THREE.MeshLambertMaterial({color:0x9fd8f5, transparent:true, opacity:0.85});
  island.add(fall);
  const fallBase = wfCubes.map(c=>({x:c.x,y:c.y,z:c.z}));

  // windmill
  const mill = new THREE.Group();
  const mx=-9, mz=-8, my=heightAt(mx,mz);
  const tower=[]; for(let y=1;y<=4;y++) for(let x=-1;x<=1;x++) for(let z=-1;z<=1;z++){
    if(Math.abs(x)+Math.abs(z)===2) continue; tower.push({x,y,z,color:jitter(0xe8e2d4,0.05)}); }
  mill.add(makeVoxels(tower,1.0));
  const blades = new THREE.Group();
  for(let i=0;i<4;i++){
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.5,3.4,0.35), new THREE.MeshLambertMaterial({color:0xf2ede2}));
    b.position.y = 1.7; const arm = new THREE.Group(); arm.add(b); arm.rotation.z = i*Math.PI/2; blades.add(arm);
  }
  blades.position.set(0,4.4,-1.4); mill.add(blades);
  mill.position.set(mx, my, mz);
  island.add(mill);

  // flames
  const flames = new THREE.Group();
  const flameCols = [0xffb03a,0xff7a2f,0xffd76a];
  const flameMeshes = [];
  for(let i=0;i<5;i++){
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.5), new THREE.MeshBasicMaterial({color:flameCols[i%3]}));
    f.position.set(FIRE.x+(Math.random()-0.5)*0.7, FIRE.y+1.4, FIRE.z+(Math.random()-0.5)*0.7);
    f.userData.ph = Math.random()*6.28; flames.add(f); flameMeshes.push(f);
  }
  island.add(flames);

  /* ---------- mini islands ---------- */
  const minis = [];
  for(let m=0;m<3;m++){
    const mr = 3 + m;
    const mc = [];
    for(let x=-mr;x<=mr;x++) for(let z=-mr;z<=mr;z++){
      const d=Math.hypot(x,z); if(d>mr) continue;
      const top = Math.round(0.8 - Math.pow(d/mr,2)*1.4);
      const bot = Math.round(-2.5 + Math.pow(d/mr,2)*3.5);
      if(bot>top) continue;
      for(let y=bot;y<=top;y++) mc.push({x,y,z,color:jitter(y===top?GRASS:(y>=top-1?DIRT:STONE),0.09)});
    }
    for(let i=0;i<2;i++){ const tx=Math.round((Math.random()-0.5)*mr), tz=Math.round((Math.random()-0.5)*mr);
      const top=Math.round(0.8-Math.pow(Math.hypot(tx,tz)/mr,2)*1.4);
      mc.push({x:tx,y:top+1,z:tz,color:jitter(WOOD,0.08)});
      mc.push({x:tx,y:top+2,z:tz,color:jitter(LEAF,0.1)}); }
    const g = new THREE.Group(); g.add(makeVoxels(mc,1.0));
    g.userData = {ang: m*2.1, rad: 23+m*3, y: 2+m*2.5, spin: 0.05+m*0.02};
    island.add(g); minis.push(g);
  }

  /* ---------- clouds + shadows ---------- */
  const cloudCubes = [];
  for(let i=0;i<6;i++){
    const side = (i%2)?1:-1;
    const cx = side*(30+Math.random()*18), cy = 10+Math.random()*6, cz = -48+Math.random()*30;
    const w=3+Math.floor(Math.random()*3), h=1+Math.floor(Math.random()*2), dp=2+Math.floor(Math.random()*2);
    for(let x=0;x<w;x++) for(let y=0;y<h;y++) for(let z=0;z<dp;z++){
      if(Math.random()<0.18) continue; cloudCubes.push({x:cx+x,y:cy+y,z:cz+z,color:0xffffff}); }
  }
  const cloudMat = new THREE.MeshLambertMaterial({color:0xf8fcff, emissive:0xdfe9f4, emissiveIntensity:0.5});
  const clouds = new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1), cloudMat, cloudCubes.length);
  { const m=new THREE.Matrix4(); cloudCubes.forEach((b,i)=>{ m.makeTranslation(b.x,b.y,b.z); clouds.setMatrixAt(i,m); });
    clouds.instanceMatrix.needsUpdate = true; }
  scene.add(clouds);

  /* ---------- birds ---------- */
  const birds = [];
  for(let i=0;i<7;i++){
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.3,0.3), new THREE.MeshLambertMaterial({color:0x2f3d52}));
    g.add(body);
    const wingGeo = new THREE.BoxGeometry(0.95,0.09,0.34);
    const wingMat = new THREE.MeshLambertMaterial({color:0x44546d});
    const wL = new THREE.Mesh(wingGeo, wingMat); wL.position.set(-0.48,0.07,0); g.add(wL);
    const wR = new THREE.Mesh(wingGeo, wingMat); wR.position.set(0.48,0.07,0); g.add(wR);
    g.userData = {ang:Math.random()*6.28, rad:13+Math.random()*10, y:11+Math.random()*5, sp:0.25+Math.random()*0.3, ph:Math.random()*6.28, wL, wR};
    scene.add(g); birds.push(g);
  }

  /* ---------- falling leaves ---------- */
  const LEAF_N = 40;
  const leafMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.36,0.12,0.36),
    new THREE.MeshLambertMaterial({color:0x8fd07a}), LEAF_N);
  { const c=new THREE.Color(), m=new THREE.Matrix4();
    for(let i=0;i<LEAF_N;i++){ c.set(Math.random()>0.6?0xffb03a:0x7ed08a); leafMesh.setColorAt(i,c); m.makeTranslation(0,0,0); leafMesh.setMatrixAt(i,m); } }
  const leaves = [];
  for(let i=0;i<LEAF_N;i++) leaves.push({x:(Math.random()-0.5)*34, y:Math.random()*28, z:-22+Math.random()*26, s:0.4+Math.random()*0.5, r:Math.random()*6.28});
  scene.add(leafMesh);

  /* ---------- sun + stars ---------- */
  const sunTex = (function(){
    const c = document.createElement('canvas'); c.width=c.height=128;
    const g = c.getContext('2d'); const grd = g.createRadialGradient(64,64,0,64,64,64);
    grd.addColorStop(0,'rgba(255,246,214,1)'); grd.addColorStop(.25,'rgba(255,224,150,.85)');
    grd.addColorStop(.6,'rgba(255,196,110,.25)'); grd.addColorStop(1,'rgba(255,180,90,0)');
    g.fillStyle=grd; g.fillRect(0,0,128,128); return new THREE.CanvasTexture(c);
  })();
  const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({map:sunTex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending}));
  sunSprite.scale.set(15,15,1); sunSprite.position.set(30, 20, -34); scene.add(sunSprite);
  const sunCubes = [];
  for(let x=-1;x<=1;x++) for(let y=-1;y<=1;y++){ if(Math.abs(x)+Math.abs(y)===2 && Math.random()>0.5) continue; sunCubes.push({x,y,z:0}); }
  const sunDisc = makeVoxels(sunCubes, 1.55, false);
  sunDisc.material = new THREE.MeshBasicMaterial({color:0xfff3cf, transparent:true, opacity:1});
  sunDisc.position.set(30,20,-34); scene.add(sunDisc);

  const starGeo = new THREE.BufferGeometry();
  const SN = 420, sp = new Float32Array(SN*3);
  for(let i=0;i<SN;i++){ const r=60+Math.random()*120, t=Math.random()*6.28, p=Math.acos(Math.random());
    sp[i*3]=r*Math.sin(p)*Math.cos(t); sp[i*3+1]=Math.abs(r*Math.cos(p))*0.7+6; sp[i*3+2]=r*Math.sin(p)*Math.sin(t); }
  starGeo.setAttribute('position', new THREE.BufferAttribute(sp,3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({color:0xffffff, size:0.9, transparent:true, opacity:0, depthWrite:false}));
  scene.add(stars);

  /* ---------- the name ---------- */
  const FONT = {
    S:["01111","10000","10000","01110","00001","00001","11110"],
    H:["10001","10001","10001","11111","10001","10001","10001"],
    R:["11110","10001","10001","11110","10100","10010","10001"],
    E:["11111","10000","10000","11110","10000","10000","11111"],
    T:["11111","00100","00100","00100","00100","00100","00100"],
    A:["01110","10001","10001","11111","10001","10001","10001"]
  };
  const nameGroup = new THREE.Group(), word = "SHRESTHA", SPACING = 6, GAP = 0.06, letters = [];
  const inkA = new THREE.Color(0x1c2c48), inkB = new THREE.Color(0x0b1626);
  word.split('').forEach((ch,i)=>{
    const rows = FONT[ch]; if(!rows) return;
    const lc = [];
    rows.forEach((row,r)=>{ for(let c=0;c<row.length;c++) if(row[c]==='1'){
      lc.push({x:c-2,y:(6-r)-3,z:-0.5}); lc.push({x:c-2,y:(6-r)-3,z:0.5}); } });
    const mesh = makeVoxels(lc, 1-GAP, false);
    const baseCol = inkA.clone().lerp(inkB, i/(word.length-1));
    mesh.material = new THREE.MeshLambertMaterial({color: baseCol});
    mesh.position.x = (i-(word.length-1)/2)*SPACING;
    mesh.userData = {baseCol: baseCol, baseX:mesh.position.x, idx:i, rx:(Math.random()-0.5), ry:(Math.random()-0.5), rz:(Math.random()-0.5)};
    nameGroup.add(mesh); letters.push(mesh);
  });
  const NAME_NIGHT = new THREE.Color(0xdbe7f5);
  const NAME_Y = 8.4; nameGroup.position.y = NAME_Y; scene.add(nameGroup);

  /* sparkles orbiting the name */
  const SPK = 26;
  const sparkles = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22,0.22,0.22),
    new THREE.MeshBasicMaterial({color:0xffd76a, transparent:true, opacity:0.9}), SPK);
  const spkData = [];
  for(let i=0;i<SPK;i++) spkData.push({a:Math.random()*6.28, r:26+Math.random()*10, y:(Math.random()-0.5)*10, sp:0.15+Math.random()*0.4});
  scene.add(sparkles);

  /* ================= v4: NEW 3D OBJECTS ================= */
  let weather = 'clear', manualNight = 0, flash = 0, shakeAmt = 0;
  const flashOverlay = document.getElementById('flash');
  const flashLight = new THREE.PointLight(0xdceaff, 0, 300); flashLight.position.set(0,24,-8); scene.add(flashLight);
  const nightLight = new THREE.PointLight(0x9fc4ff, 0, 60); nightLight.position.set(0, 12, 0); scene.add(nightLight);

  const WORLD_EXTRA = [];   // objects scaled with the voxel world
  const SCENE_EXTRA = [];   // full-screen objects (weather, meteors)

  /* --- moon --- */
  const moonTex = (function(){
    const c=document.createElement('canvas'); c.width=c.height=128; const g=c.getContext('2d');
    const grd=g.createRadialGradient(64,64,0,64,64,64);
    grd.addColorStop(0,'rgba(236,245,255,1)'); grd.addColorStop(.3,'rgba(198,219,255,.5)');
    grd.addColorStop(.66,'rgba(168,198,255,.16)'); grd.addColorStop(1,'rgba(160,190,255,0)');
    g.fillStyle=grd; g.fillRect(0,0,128,128); return new THREE.CanvasTexture(c);
  })();
  const moonGlow = new THREE.Sprite(new THREE.SpriteMaterial({map:moonTex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, opacity:0}));
  moonGlow.scale.set(15,15,1); moonGlow.position.set(-30,20,-36); scene.add(moonGlow); WORLD_EXTRA.push(moonGlow);
  const moonCubes=[]; for(let x=-1;x<=1;x++) for(let y=-1;y<=1;y++){ moonCubes.push({x,y,z:0}); }
  const moonDisc = makeVoxels(moonCubes, 1.4, false);
  moonDisc.material = new THREE.MeshBasicMaterial({color:0xeaf2ff, transparent:true, opacity:0});
  moonDisc.position.set(-30,20,-36); scene.add(moonDisc); WORLD_EXTRA.push(moonDisc);

  /* --- lamp posts (bulbs glow at night, one shared light) --- */
  const lamps = [];
  [[-4,10],[10,4],[3,-11],[-11,2]].forEach(function(p){
    const lx=p[0], lz=p[1], ly=heightAt(lx,lz);
    const post=[]; for(let y=1;y<=3;y++) post.push({x:lx,y:ly+y,z:lz});
    const pm = makeVoxels(post,0.9,false); pm.material = new THREE.MeshLambertMaterial({color:0x6b5a44}); island.add(pm);
    const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.8,0.8,0.8), new THREE.MeshBasicMaterial({color:0xffe9a8, transparent:true, opacity:0.25}));
    bulb.position.set(lx, ly+4, lz); island.add(bulb); lamps.push(bulb);
  });

  /* --- stone cliff behind the waterfall --- */
  const cliffCubes=[];
  for(let cx=-2;cx<=2;cx++) for(let cz=-2;cz<=0;cz++){
    const bx=wfX+cx, bz=wfZ-1.7+cz;
    if(Math.hypot(bx,bz) > R-1) continue;
    const base = heightAt(bx,bz);
    for(let y=base; y<=wfTop+1; y++) cliffCubes.push({x:bx, y, z:bz, color:jitter(STONE,0.09)});
  }
  const cliff = makeVoxels(cliffCubes, 1.0); island.add(cliff);

  /* --- boat sailing the pond --- */
  const boat = new THREE.Group();
  { const b=[];
    for(let x=-1;x<=1;x++) for(let z=-1;z<=1;z++){ if(Math.abs(x)+Math.abs(z)===2) continue; b.push({x,y:0,z}); }
    const hull = makeVoxels(b,0.85,false); hull.material=new THREE.MeshLambertMaterial({color:0x8a6239}); boat.add(hull);
    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.18,2.2,0.18), new THREE.MeshLambertMaterial({color:0x6b5a44}));
    mast.position.y=1.4; boat.add(mast);
    const sail = new THREE.Mesh(new THREE.BoxGeometry(1.4,1.5,0.1), new THREE.MeshLambertMaterial({color:0xf5f1e8}));
    sail.position.set(0,1.7,0.3); boat.add(sail); }
  boat.userData={a:0}; boat.position.set(POND.x, POND.level+0.3, POND.z); island.add(boat);

  /* --- jumping fish --- */
  const fishes=[];
  for(let i=0;i<4;i++){
    const f=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.3,0.3), new THREE.MeshLambertMaterial({color:0x9fd8f5}));
    f.userData={a:Math.random()*6.28, r:1.1+Math.random()*1.7, ph:Math.random()*6.28};
    island.add(f); fishes.push(f);
  }

  /* --- butterflies --- */
  const butterflies=[];
  for(let i=0;i<9;i++){
    const g=new THREE.Group();
    const c1=new THREE.Mesh(new THREE.BoxGeometry(0.46,0.06,0.32), new THREE.MeshLambertMaterial({color:i%2?0xff6f9c:0xffd23f}));
    const c2=new THREE.Mesh(new THREE.BoxGeometry(0.46,0.06,0.32), new THREE.MeshLambertMaterial({color:i%2?0xffd23f:0xb98cff}));
    c1.position.x=-0.23; c2.position.x=0.23; g.add(c1); g.add(c2);
    g.userData={ang:Math.random()*6.28, r:3+Math.random()*9, y:3.6+Math.random()*2, ph:Math.random()*6.28, c1, c2};
    island.add(g); butterflies.push(g);
  }

  /* --- waving character --- */
  const char = new THREE.Group();
  { const body=[]; body.push({x:0,y:0,z:0}); body.push({x:0,y:1,z:0});
    const torso=makeVoxels(body,0.8,false); torso.material=new THREE.MeshLambertMaterial({color:0x3a6ea5}); char.add(torso);
    const head=new THREE.Mesh(new THREE.BoxGeometry(0.68,0.68,0.68), new THREE.MeshLambertMaterial({color:0xe8c39e}));
    head.position.y=1.75; char.add(head);
    const arm=new THREE.Mesh(new THREE.BoxGeometry(0.26,0.85,0.26), new THREE.MeshLambertMaterial({color:0xe8c39e}));
    arm.position.set(0.52,1.25,0); char.add(arm); char.userData={arm}; }
  char.position.set(6, heightAt(6,-4), -4); island.add(char);

  /* --- chimney smoke --- */
  const hutY = heightAt(8,-7), smoke=[];
  for(let i=0;i<9;i++){
    const s=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.6,0.6),
      new THREE.MeshLambertMaterial({color:0xdde3e9, transparent:true, opacity:0.5, depthWrite:false}));
    s.userData={t:i/9}; island.add(s); smoke.push(s);
  }

  /* --- waterfall mist --- */
  const mist=[];
  for(let i=0;i<7;i++){
    const m=new THREE.Mesh(new THREE.BoxGeometry(0.95,0.6,0.95),
      new THREE.MeshLambertMaterial({color:0xffffff, transparent:true, opacity:0.3, depthWrite:false}));
    m.userData={ph:Math.random()*6.28}; island.add(m); mist.push(m);
  }

  /* --- fireflies (world) --- */
  const FF=54;
  const fireflies = new THREE.InstancedMesh(new THREE.BoxGeometry(0.17,0.17,0.17),
    new THREE.MeshBasicMaterial({color:0xffe680, transparent:true, opacity:0}), FF);
  const ffData=[]; for(let i=0;i<FF;i++) ffData.push({x:(Math.random()-0.5)*30, y:2+Math.random()*7, z:(Math.random()-0.5)*30, ph:Math.random()*6.28, sp:0.3+Math.random()*0.7});
  scene.add(fireflies); WORLD_EXTRA.push(fireflies);

  /* --- hot air balloon (world) --- */
  const balloon = new THREE.Group();
  { const bc=[];
    for(let x=-2;x<=2;x++) for(let y=0;y<3;y++) for(let z=-2;z<=2;z++){
      const d=Math.hypot(x,z); if(d>2.3 || (y===0 && d>1.5)) continue;
      bc.push({x,y,z,color: y===2 ? 0xffd23f : (((x+z)&1) ? 0xff5a3c : 0xf5f1e8)});
    }
    balloon.add(makeVoxels(bc,0.95));
    const basket=new THREE.Mesh(new THREE.BoxGeometry(1.1,0.85,1.1), new THREE.MeshLambertMaterial({color:0x8a6239}));
    basket.position.y=-1.15; balloon.add(basket); }
  balloon.userData={a:0}; scene.add(balloon); WORLD_EXTRA.push(balloon);

  /* --- rocket (world) --- */
  const rocket = new THREE.Group();
  { const rc=[]; rc.push({x:0,y:0,z:0}); rc.push({x:0,y:1,z:0}); rc.push({x:0,y:2,z:0});
    const body=makeVoxels(rc,0.7,false); body.material=new THREE.MeshLambertMaterial({color:0xf5f1e8}); rocket.add(body);
    const nose=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.55,0.55), new THREE.MeshLambertMaterial({color:0xff5a3c}));
    nose.position.y=2.05; rocket.add(nose);
    const flame=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.5), new THREE.MeshBasicMaterial({color:0xffb03a}));
    flame.position.y=-0.75; rocket.add(flame); rocket.userData={flame,a:0}; }
  scene.add(rocket); WORLD_EXTRA.push(rocket);

  /* --- rain / snow / meteor (full-screen, unscaled) --- */
  const RAIN=460;
  const rain = new THREE.InstancedMesh(new THREE.BoxGeometry(0.085,1.05,0.085),
    new THREE.MeshBasicMaterial({color:0xa9d8f0, transparent:true, opacity:0}), RAIN);
  const rainData=[]; for(let i=0;i<RAIN;i++) rainData.push({x:(Math.random()-0.5)*90, y:Math.random()*46, z:-46+Math.random()*56, s:0.7+Math.random()*1.0});
  scene.add(rain); SCENE_EXTRA.push(rain);

  const SNOW=340;
  const snow = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22,0.22,0.22),
    new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0}), SNOW);
  const snowData=[]; for(let i=0;i<SNOW;i++) snowData.push({x:(Math.random()-0.5)*90, y:Math.random()*46, z:-46+Math.random()*56, s:0.18+Math.random()*0.5, ph:Math.random()*6.28});
  scene.add(snow); SCENE_EXTRA.push(snow);

  const meteor = new THREE.Mesh(new THREE.BoxGeometry(3.4,0.16,0.16),
    new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0}));
  scene.add(meteor); SCENE_EXTRA.push(meteor);
  let meteorWait = 2+Math.random()*5, meteorLife = 0;
  const meteorFrom = new THREE.Vector3();

  let voxelTotal = cubes.length + waterCubes.length + wfCubes.length + cloudCubes.length + cliffCubes.length + FF + RAIN + SNOW;

  /* ================= v5: NEW 3D OBJECTS ================= */
  const v5tick = { fire: true, score: 0 };

  /* 1. voxel rainbow arch */
  (function(){
    const cols=[0xff5a5a,0xffb03a,0xffe86a,0x63b96a,0x4aa8e0,0x7a6cf0,0xb06cf0], c=[];
    cols.forEach(function(col,i){ const r=10.5+i*0.7;
      for(let a=0;a<=22;a++){ const ang=Math.PI*(a/22);
        c.push({x:Math.cos(ang)*r, y:Math.sin(ang)*r*0.6, z:-18+i*0.28, color:col}); } });
    const rb = makeVoxels(c,1.15); rb.material.transparent=true; rb.material.opacity=0.5;
    rb.position.y=-1.5; scene.add(rb); WORLD_EXTRA.push(rb);
  })();

  /* 2. lighthouse island + rotating beam */
  const lighthouse = new THREE.Group();
  { const c=[];
    for(let x=-4;x<=4;x++) for(let z=-4;z<=4;z++){ const d=Math.hypot(x,z); if(d>4) continue;
      const top=Math.round(0.8-Math.pow(d/4,2)*1.4), bot=Math.round(-2.5+Math.pow(d/4,2)*3.5);
      if(bot>top) continue;
      for(let y=bot;y<=top;y++) c.push({x,y,z,color:jitter(y===top?GRASS:(y>=top-1?DIRT:STONE),0.09)}); }
    for(let y=1;y<=6;y++) for(let x=-1;x<=1;x++) for(let z=-1;z<=1;z++){
      if(Math.abs(x)+Math.abs(z)===2) continue;
      c.push({x,y,z,color:(y%2)?0xf5f1e8:0xff5a3c}); }
    lighthouse.add(makeVoxels(c,1.0));
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5), new THREE.MeshBasicMaterial({color:0xfff0b0, transparent:true, opacity:0.35}));
    lamp.position.y=7; lighthouse.add(lamp); lighthouse.userData={lamp};
  }
  lighthouse.position.set(-27, 7, -12); scene.add(lighthouse); WORLD_EXTRA.push(lighthouse);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(22,0.55,0.55),
    new THREE.MeshBasicMaterial({color:0xfff0b0, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
  beam.position.set(-27, 14, -12); scene.add(beam); WORLD_EXTRA.push(beam);

  /* 3. sky whale */
  const whale = new THREE.Group();
  { const c=[];
    for(let x=-4;x<=4;x++) for(let y=-1;y<=1;y++) for(let z=-1;z<=1;z++){
      if(Math.abs(y)+Math.abs(z)>2) continue; c.push({x,y,z,color:0x7093c6}); }
    c.push({x:-5,y:0,z:0,color:0x3d5c8a}); c.push({x:-5,y:1,z:0,color:0x3d5c8a}); c.push({x:-6,y:0,z:0,color:0x3d5c8a});
    c.push({x:5,y:0,z:0,color:0x5f86bf});
    whale.add(makeVoxels(c,0.92)); whale.userData={a:0}; }
  scene.add(whale); WORLD_EXTRA.push(whale);

  /* 4. floating lanterns (night) */
  const LAN=16;
  const lanterns = new THREE.InstancedMesh(new THREE.BoxGeometry(0.62,0.82,0.62),
    new THREE.MeshBasicMaterial({color:0xffb03a, transparent:true, opacity:0}), LAN);
  const lanData=[]; for(let i=0;i<LAN;i++) lanData.push({x:(Math.random()-0.5)*34, y:Math.random()*28, z:-22+Math.random()*28, s:0.35+Math.random()*0.45, ph:Math.random()*6.28});
  scene.add(lanterns); WORLD_EXTRA.push(lanterns);

  /* 5. fireworks (night) */
  const FWN=30;
  const fireworks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34,0.34,0.34),
    new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0, depthWrite:false}), FWN);
  { const c=new THREE.Color(); for(let i=0;i<FWN;i++){ c.setHSL(Math.random(),0.85,0.62); fireworks.setColorAt(i,c); } }
  const fwData=[]; for(let i=0;i<FWN;i++) fwData.push({dx:(Math.random()-0.5)*2, dy:(Math.random()-0.5)*2, dz:(Math.random()-0.5)*2});
  scene.add(fireworks); WORLD_EXTRA.push(fireworks);
  let fwWait = 5+Math.random()*6, fwLife = 0; const fwPos = new THREE.Vector3();

  /* 6. airplane with motion trail */
  const plane = new THREE.Group();
  { const c=[];
    for(let x=-3;x<=3;x++) c.push({x,y:0,z:0,color:0xf5f1e8});
    for(let x=-1;x<=1;x++){ c.push({x,y:0,z:1,color:0xf5f1e8}); c.push({x,y:0,z:-1,color:0xf5f1e8}); }
    c.push({x:0,y:1,z:0,color:0xff5a3c}); c.push({x:0,y:-1,z:0,color:0xff5a3c});
    plane.add(makeVoxels(c,0.8));
    for(let i=1;i<=5;i++){ const t=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.7,0.7),
      new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.30-i*0.05})); t.position.set(-3.4-i*0.8,0,0); plane.add(t); }
    plane.userData={a:0};
  }
  scene.add(plane); WORLD_EXTRA.push(plane);

  /* 7. drone with spinning rotors */
  const drone = new THREE.Group(); const rotors=[];
  { const c=[{x:0,y:0,z:0},{x:1,y:0,z:0},{x:-1,y:0,z:0},{x:0,y:0,z:1},{x:0,y:0,z:-1}];
    drone.add(makeVoxels(c,0.5));
    [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(function(p){
      const r=new THREE.Mesh(new THREE.BoxGeometry(1.1,0.07,0.16), new THREE.MeshBasicMaterial({color:0x2f3d52, transparent:true, opacity:0.75}));
      r.position.set(p[0],0.34,p[1]); drone.add(r); rotors.push(r); });
    drone.userData={a:0};
  }
  scene.add(drone); WORLD_EXTRA.push(drone);

  /* 8. kite + string */
  const kite = new THREE.Group();
  { const c=[]; for(let x=-1;x<=1;x++) for(let y=-1;y<=1;y++){ if(Math.abs(x)+Math.abs(y)===2) continue; c.push({x,y,z:0,color:0xff6f9c}); }
    kite.add(makeVoxels(c,0.68)); }
  scene.add(kite); WORLD_EXTRA.push(kite);
  const kiteLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),
    new THREE.LineBasicMaterial({color:0x7d8fa3, transparent:true, opacity:0.45}));
  scene.add(kiteLine); WORLD_EXTRA.push(kiteLine);

  /* 9. glowing crystals */
  const crystalCubes=[];
  for(let i=0;i<11;i++){
    const a=Math.random()*6.28, r=4+Math.random()*9;
    const cx=Math.round(Math.cos(a)*r), cz=Math.round(Math.sin(a)*r);
    if(Math.hypot(cx,cz)>R-2 || inPond(cx,cz)) continue;
    const base=heightAt(cx,cz), h=1+Math.floor(Math.random()*3);
    for(let y=1;y<=h;y++) crystalCubes.push({x:cx,y:base+y,z:cz,color:y===h?0xb98cff:0x7a6cf0});
  }
  const crystals = makeVoxels(crystalCubes, 0.85);
  crystals.material = new THREE.MeshLambertMaterial({color:0xffffff, emissive:0x4a3a8a, emissiveIntensity:0.25});
  island.add(crystals);

  /* 10. hot spring + steam */
  const SPX=-9, SPZ=9, SPY=heightAt(-9,9), steam=[];
  { const c=[];
    for(let x=-2;x<=2;x++) for(let z=-2;z<=2;z++){ if(Math.hypot(x,z)>2.2) continue; c.push({x:SPX+x,y:SPY+1,z:SPZ+z}); }
    const sp=makeVoxels(c,1.0,false); sp.material=new THREE.MeshLambertMaterial({color:0x6fd8e8, transparent:true, opacity:0.85});
    island.add(sp);
    for(let i=0;i<7;i++){ const s=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.7,0.7),
      new THREE.MeshLambertMaterial({color:0xffffff, transparent:true, opacity:0.28, depthWrite:false}));
      s.userData={t:i/7}; island.add(s); steam.push(s); }
  }

  /* 11. lily pads + water spout */
  for(let i=0;i<6;i++){
    const a=Math.random()*6.28, r=0.8+Math.random()*2.2;
    const p=new THREE.Mesh(new THREE.BoxGeometry(1.1,0.12,1.1), new THREE.MeshLambertMaterial({color:0x4f9e5c}));
    p.position.set(POND.x+Math.cos(a)*r, POND.level+0.14, POND.z+Math.sin(a)*r); island.add(p);
  }
  const spout=[];
  for(let i=0;i<5;i++){
    const s=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.4,0.4), new THREE.MeshLambertMaterial({color:0x9fd8f5, transparent:true, opacity:0.8}));
    s.userData={ph:i/5}; island.add(s); spout.push(s);
  }

  /* 12. rail + cart circling the island */
  { const rail=[];
    for(let a=0;a<72;a++){ const ang=a/72*Math.PI*2;
      const rx=Math.cos(ang)*11.5, rz=Math.sin(ang)*11.5;
      if(Math.hypot(rx,rz)>R-1) continue;
      rail.push({x:rx, y:heightAt(Math.round(rx),Math.round(rz))+0.6, z:rz, color:0x6b5a44}); }
    island.add(makeVoxels(rail,0.55)); }
  const cart = new THREE.Group();
  { const c=[]; for(let x=-1;x<=1;x++) for(let z=-1;z<=1;z++) c.push({x,y:0,z,color:0x8a6239});
    cart.add(makeVoxels(c,0.7)); }
  cart.userData={a:0}; island.add(cart);

  /* 13. wandering deer */
  const deer = new THREE.Group();
  { const c=[{x:0,y:0,z:0},{x:1,y:0,z:0},{x:2,y:0,z:0},{x:2,y:1,z:0},{x:2,y:2,z:0},{x:3,y:2,z:0},{x:1,y:2,z:0}];
    deer.add(makeVoxels(c,0.55)); }
  deer.userData={a:Math.random()*6.28}; island.add(deer);

  /* 14. swaying grass tufts */
  const TUFT=80;
  const tufts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.26,0.72,0.26),
    new THREE.MeshLambertMaterial({color:0x5fa96b}), TUFT);
  const tuftData=[]; let guard=0;
  while(tuftData.length<TUFT && guard++<900){
    const a=Math.random()*6.28, r=Math.random()*R;
    const tx=Math.round(Math.cos(a)*r), tz=Math.round(Math.sin(a)*r);
    if(Math.hypot(tx,tz)>R-1 || inPond(tx,tz)) continue;
    tuftData.push({x:tx, y:heightAt(tx,tz)+1, z:tz, ph:Math.random()*6.28});
  }
  island.add(tufts);

  /* 15. voxel "2043" monument */
  (function(){
    const DG={'2':["01110","10001","00001","00010","00100","01000","11111"],
              '0':["01110","10001","10011","10101","11001","10001","01110"],
              '4':["00010","00110","01010","10010","11111","00010","00010"],
              '3':["01110","10001","00001","00110","00001","10001","01110"]};
    const c=[]; let off=0;
    '2043'.split('').forEach(function(ch){
      const g=DG[ch]; g.forEach(function(row,r){ for(let i=0;i<row.length;i++){
        if(row[i]==='1') c.push({x:off+i, y:(6-r), z:0, color:0xff5a3c}); } });
      off += 6;
    });
    const m = makeVoxels(c,0.8);
    const grp = new THREE.Group(); grp.add(m);
    grp.position.set(-8.5, heightAt(-8,-12)+1.5, -12); grp.rotation.y = 0.35;
    island.add(grp);
  })();

  /* 16. telescope */
  const scope = new THREE.Group();
  { const c=[{x:0,y:0,z:0},{x:0,y:1,z:0},{x:0,y:2,z:0}];
    scope.add(makeVoxels(c,0.5));
    const tube = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.6,2.4), new THREE.MeshLambertMaterial({color:0x3d4a5c}));
    tube.position.set(0,2.5,-0.6); tube.rotation.x = -0.5; scope.add(tube); }
  scope.position.set(11, heightAt(11,-2), -2); island.add(scope);

  /* 17. swing under a tree */
  const swing = new THREE.Group();
  { const ropeMat=new THREE.MeshLambertMaterial({color:0x8a6239});
    [-0.8,0.8].forEach(function(dx){ const r=new THREE.Mesh(new THREE.BoxGeometry(0.12,3.2,0.12), ropeMat); r.position.set(dx,-1.6,0); swing.add(r); });
    const seat=new THREE.Mesh(new THREE.BoxGeometry(2.0,0.2,0.7), new THREE.MeshLambertMaterial({color:0xa97f57}));
    seat.position.y=-3.2; swing.add(seat); swing.userData={seat}; }
  swing.position.set(-2, heightAt(-2,-6)+4.6, -6); island.add(swing);

  /* 18. snowman (appears with snow) */
  const snowman = new THREE.Group();
  { const c=[{x:0,y:0,z:0},{x:0,y:1,z:0},{x:0,y:2,z:0},{x:0,y:3,z:0}];
    snowman.add(makeVoxels(c,0.8,false));
    snowman.children[0].material = new THREE.MeshLambertMaterial({color:0xf4f8ff});
    const nose=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.5), new THREE.MeshLambertMaterial({color:0xff8a3c}));
    nose.position.set(0,2.6,0.5); snowman.add(nose); }
  snowman.position.set(3, heightAt(3,3), 3); snowman.visible=false; island.add(snowman);

  /* ---------- interaction: raycaster + orbit ---------- */
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let orbitY=0, orbitX=0, zoomOff=0, dragging=false, lastPX=0, lastPY=0, dragDist=0;
  let charJump = 0, fireOn = true;

  canvas.addEventListener('pointerdown', function(e){
    dragging=true; lastPX=e.clientX; lastPY=e.clientY; dragDist=0;
  });
  window.addEventListener('pointermove', function(e){
    if(!dragging) return;
    const dx=e.clientX-lastPX, dy=e.clientY-lastPY;
    dragDist += Math.abs(dx)+Math.abs(dy);
    orbitY += dx*0.006; orbitX += dy*0.004;
    orbitY = Math.max(-0.85, Math.min(0.85, orbitY));
    orbitX = Math.max(-0.55, Math.min(0.6, orbitX));
    lastPX=e.clientX; lastPY=e.clientY;
    canvas.style.cursor = 'grabbing';
  });
  window.addEventListener('pointerup', function(e){
    if(dragging && dragDist < 7) pickAt(e.clientX, e.clientY);
    dragging=false; canvas.style.cursor='grab';
  });
  canvas.style.cursor='grab';
  // A double tap now shows the world notice (handled in ui.js), so the old
  // fullscreen shortcut on the canvas is gone. Focus mode owns fullscreen.
  canvas.addEventListener('wheel', function(e){
    e.preventDefault();
    zoomOff = Math.max(-16, Math.min(24, zoomOff + e.deltaY*0.02));
  }, {passive:false});

  function pickAt(cx, cy){
    const r = canvas.getBoundingClientRect();
    ndc.x = ((cx-r.left)/r.width)*2 - 1;
    ndc.y = -((cy-r.top)/r.height)*2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects([char, crystals, flames], true);
    if(!hits.length) return;
    const root = (function(o){ let p=o; while(p.parent && p.parent!==island) p=p.parent; return p; })(hits[0].object);
    if(root === char){ charJump = 1; spawnHearts(); }
    else if(root === flames){ fireOn = !fireOn; flames.visible = fireOn; toast('campfire ' + (fireOn?'lit':'out')); }
    else if(root === crystals){
      const id = hits[0].instanceId;
      if(id != null){ const m = new THREE.Matrix4().makeScale(0,0,0); crystals.setMatrixAt(id, m); crystals.instanceMatrix.needsUpdate=true;
        v5tick.score++; updateScore(); toast('crystal collected · ' + v5tick.score); }
    }
  }
  function updateScore(){
    const el = document.getElementById('scoreVal'); if(el) el.textContent = v5tick.score;
    const w = document.getElementById('score'); if(w) w.classList.add('show');
  }
  function spawnHearts(){
    const host = document.getElementById('hearts'); if(!host) return;
    for(let i=0;i<5;i++){
      const h=document.createElement('i'); h.className='heart'; h.textContent='\u2665';
      h.style.left = (48+Math.random()*8)+'%'; h.style.bottom='40%';
      h.style.animationDelay=(i*0.08)+'s'; host.appendChild(h);
      setTimeout(function(){ h.remove(); }, 1600);
    }
  }

  /* ================= v6: BOTTOM ITEMS AND TILTED THINGS ================= */

  // Vines hanging under the rim of the island.
  var vineBlocks = [];
  var vineTotal = 28;
  var vineIndex = 0;
  while (vineIndex < vineTotal) {
    var vineAngle = (vineIndex / vineTotal) * Math.PI * 2;
    var vineRadius = 9 + Math.random() * 4;
    var vineX = Math.round(Math.cos(vineAngle) * vineRadius);
    var vineZ = Math.round(Math.sin(vineAngle) * vineRadius);
    var vineLength = 2 + Math.floor(Math.random() * 3);
    var vineStep = 0;
    while (vineStep < vineLength) {
      vineBlocks.push({ x: vineX, y: -5 - vineStep, z: vineZ, color: 0x3f8550 });
      vineStep = vineStep + 1;
    }
    vineIndex = vineIndex + 1;
  }
  var vines = makeVoxels(vineBlocks, 0.6);
  island.add(vines);

  // Stone spikes pointing down from the underside.
  var spikeBlocks = [];
  var spikeTotal = 10;
  var spikeIndex = 0;
  while (spikeIndex < spikeTotal) {
    var spikeAngle = Math.random() * Math.PI * 2;
    var spikeRadius = Math.random() * 8;
    var spikeX = Math.round(Math.cos(spikeAngle) * spikeRadius);
    var spikeZ = Math.round(Math.sin(spikeAngle) * spikeRadius);
    var spikeLength = 1 + Math.floor(Math.random() * 3);
    var spikeStep = 0;
    while (spikeStep < spikeLength) {
      spikeBlocks.push({ x: spikeX, y: -5 - spikeStep, z: spikeZ, color: 0x8a95a1 });
      spikeStep = spikeStep + 1;
    }
    spikeIndex = spikeIndex + 1;
  }
  island.add(makeVoxels(spikeBlocks, 0.9));

  // Purple crystals growing downward, they glow after dark.
  var downCrystalBlocks = [];
  var downCrystalTotal = 8;
  var downCrystalIndex = 0;
  while (downCrystalIndex < downCrystalTotal) {
    var downAngle = Math.random() * Math.PI * 2;
    var downRadius = 2 + Math.random() * 6;
    var downX = Math.round(Math.cos(downAngle) * downRadius);
    var downZ = Math.round(Math.sin(downAngle) * downRadius);
    var downLength = 2 + Math.floor(Math.random() * 3);
    var downStep = 0;
    while (downStep < downLength) {
      downCrystalBlocks.push({ x: downX, y: -5 - downStep, z: downZ, color: 0x8a7cf0 });
      downStep = downStep + 1;
    }
    downCrystalIndex = downCrystalIndex + 1;
  }
  var downCrystals = makeVoxels(downCrystalBlocks, 0.7);
  downCrystals.material = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x5a4ac0, emissiveIntensity: 0.3 });
  island.add(downCrystals);

  // Lanterns hanging on chains that swing.
  var chains = [];
  var chainTotal = 4;
  var chainIndex = 0;
  while (chainIndex < chainTotal) {
    var chainAngle = (chainIndex / chainTotal) * Math.PI * 2 + 0.6;
    var chainRadius = 8 + Math.random() * 3;
    var chainGroup = new THREE.Group();
    var linkBlocks = [];
    var linkTotal = 4 + Math.floor(Math.random() * 3);
    var linkStep = 0;
    while (linkStep < linkTotal) {
      linkBlocks.push({ x: 0, y: 0 - linkStep, z: 0, color: 0x6b5a44 });
      linkStep = linkStep + 1;
    }
    chainGroup.add(makeVoxels(linkBlocks, 0.4));
    var chainLantern = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.3, 1.1),
      new THREE.MeshBasicMaterial({ color: 0xffb03a })
    );
    chainLantern.position.y = 0 - linkTotal - 0.8;
    chainGroup.add(chainLantern);
    chainGroup.position.set(Math.cos(chainAngle) * chainRadius, -5, Math.sin(chainAngle) * chainRadius);
    chainGroup.userData.phase = Math.random() * Math.PI * 2;
    island.add(chainGroup);
    chains.push(chainGroup);
    chainIndex = chainIndex + 1;
  }

  // A waterfall that pours off the bottom of the island.
  var bottomFallBlocks = [];
  var bottomFallTotal = 10;
  var bottomFallIndex = 0;
  while (bottomFallIndex < bottomFallTotal) {
    bottomFallBlocks.push({ x: 0, y: 0, z: 0 });
    bottomFallIndex = bottomFallIndex + 1;
  }
  var bottomFall = makeVoxels(bottomFallBlocks, 0.9, false);
  bottomFall.material = new THREE.MeshLambertMaterial({ color: 0x9fd8f5, transparent: true, opacity: 0.8 });
  bottomFall.position.set(-3, -5, 4);
  island.add(bottomFall);

  // Tilted debris that floats around the island, each piece spins on its own axis.
  var debrisTotal = 26;
  var debrisMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
    debrisTotal
  );
  var debrisPalette = [0x8a6a4b, 0x9aa6b2, 0x63b96a, 0x8a7cf0, 0xffb03a];
  var debrisData = [];
  var debrisIndex = 0;
  while (debrisIndex < debrisTotal) {
    var debrisItem = {};
    debrisItem.angle = Math.random() * Math.PI * 2;
    debrisItem.radius = 17 + Math.random() * 13;
    debrisItem.height = -4 + Math.random() * 16;
    debrisItem.spin = 0.2 + Math.random() * 0.9;
    debrisItem.tilt = Math.random() * Math.PI;
    debrisItem.size = 0.35 + Math.random() * 0.55;
    debrisData.push(debrisItem);
    var debrisColor = new THREE.Color(debrisPalette[debrisIndex % debrisPalette.length]);
    debrisMesh.setColorAt(debrisIndex, debrisColor);
    debrisIndex = debrisIndex + 1;
  }
  debrisMesh.instanceColor.needsUpdate = true;
  island.add(debrisMesh);

  // A big tilted ring around the island.
  var tiltRing = new THREE.Mesh(
    new THREE.TorusGeometry(19, 0.16, 8, 120),
    new THREE.MeshBasicMaterial({ color: 0xffb03a, transparent: true, opacity: 0.45 })
  );
  tiltRing.rotation.x = Math.PI * 0.42;
  tiltRing.rotation.z = 0.28;
  island.add(tiltRing);

  // Three tilted slabs drifting around the island.
  var slabs = [];
  var slabTotal = 3;
  var slabIndex = 0;
  while (slabIndex < slabTotal) {
    var slabBlocks = [];
    var slabWidth = 1 + slabIndex;
    var slabX = 0 - slabWidth;
    while (slabX <= slabWidth) {
      var slabZ = 0 - slabWidth;
      while (slabZ <= slabWidth) {
        if (Math.abs(slabX) + Math.abs(slabZ) <= slabWidth + 1) {
          slabBlocks.push({ x: slabX, y: 0, z: slabZ, color: 0x6ec177 });
        }
        slabZ = slabZ + 1;
      }
      slabX = slabX + 1;
    }
    var slabMesh = makeVoxels(slabBlocks, 1.0);
    island.add(slabMesh);
    slabs.push(slabMesh);
    slabIndex = slabIndex + 1;
  }

  // A signpost leaning to one side.
  var signPost = new THREE.Group();
  var signPostBlocks = [];
  signPostBlocks.push({ x: 0, y: 0, z: 0 });
  signPostBlocks.push({ x: 0, y: 1, z: 0 });
  signPostBlocks.push({ x: 0, y: 2, z: 0 });
  signPost.add(makeVoxels(signPostBlocks, 0.45));
  var signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.9, 0.2),
    new THREE.MeshLambertMaterial({ color: 0xff5a3c })
  );
  signBoard.position.y = 2.5;
  signPost.add(signBoard);
  signPost.position.set(9, heightAt(9, 6), 6);
  signPost.rotation.z = 0.14;
  signPost.rotation.y = -0.4;
  island.add(signPost);

  // A hanging anchor under the island.
  var anchor = new THREE.Group();
  var anchorBlocks = [];
  anchorBlocks.push({ x: 0, y: 0, z: 0, color: 0x3d4a5c });
  anchorBlocks.push({ x: 0, y: 1, z: 0, color: 0x3d4a5c });
  anchorBlocks.push({ x: -1, y: 1, z: 0, color: 0x3d4a5c });
  anchorBlocks.push({ x: 1, y: 1, z: 0, color: 0x3d4a5c });
  anchorBlocks.push({ x: -1, y: -1, z: 0, color: 0x3d4a5c });
  anchorBlocks.push({ x: 1, y: -1, z: 0, color: 0x3d4a5c });
  anchor.add(makeVoxels(anchorBlocks, 0.7));
  var anchorRope = [];
  var anchorRopeStep = 0;
  while (anchorRopeStep < 6) {
    anchorRope.push({ x: 0, y: 2 + anchorRopeStep, z: 0, color: 0x6b5a44 });
    anchorRopeStep = anchorRopeStep + 1;
  }
  anchor.add(makeVoxels(anchorRope, 0.35));
  anchor.position.set(5, -9, -6);
  anchor.rotation.z = 0.2;
  island.add(anchor);

  // Glowing mushrooms growing on the underside.
  var mushroomBlocks = [];
  var mushroomTotal = 14;
  var mushroomIndex = 0;
  while (mushroomIndex < mushroomTotal) {
    var mushroomAngle = Math.random() * Math.PI * 2;
    var mushroomRadius = Math.random() * 8;
    var mushroomX = Math.round(Math.cos(mushroomAngle) * mushroomRadius);
    var mushroomZ = Math.round(Math.sin(mushroomAngle) * mushroomRadius);
    mushroomBlocks.push({ x: mushroomX, y: -5, z: mushroomZ, color: 0x6fd8e8 });
    mushroomIndex = mushroomIndex + 1;
  }
  var mushrooms = makeVoxels(mushroomBlocks, 0.5);
  mushrooms.material = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x2f8fa0, emissiveIntensity: 0.4 });
  island.add(mushrooms);

  // Embers that drift up at night.
  var emberTotal = 44;
  var embers = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.16, 0.16, 0.16),
    new THREE.MeshBasicMaterial({ color: 0xff8a3c, transparent: true, opacity: 0 }),
    emberTotal
  );
  var emberData = [];
  var emberIndex = 0;
  while (emberIndex < emberTotal) {
    var emberItem = {};
    emberItem.x = (Math.random() - 0.5) * 26;
    emberItem.y = Math.random() * 16;
    emberItem.z = (Math.random() - 0.5) * 26;
    emberItem.speed = 0.3 + Math.random() * 0.7;
    emberData.push(emberItem);
    emberIndex = emberIndex + 1;
  }
  island.add(embers);

  // A slow vortex of particles circling the island.
  var vortexTotal = 46;
  var vortex = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.2),
    new THREE.MeshBasicMaterial({ color: 0x7aa2ff, transparent: true, opacity: 0.34 }),
    vortexTotal
  );
  var vortexData = [];
  var vortexIndex = 0;
  while (vortexIndex < vortexTotal) {
    var vortexItem = {};
    vortexItem.angle = Math.random() * Math.PI * 2;
    vortexItem.radius = 16 + Math.random() * 8;
    vortexItem.height = -10 + Math.random() * 24;
    vortexItem.speed = 0.15 + Math.random() * 0.35;
    vortexData.push(vortexItem);
    vortexIndex = vortexIndex + 1;
  }
  island.add(vortex);

  // Water dripping off the underside.
  var dripTotal = 26;
  var drips = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.14, 0.5, 0.14),
    new THREE.MeshBasicMaterial({ color: 0x9fd8f5, transparent: true, opacity: 0.7 }),
    dripTotal
  );
  var dripData = [];
  var dripIndex = 0;
  while (dripIndex < dripTotal) {
    var dripItem = {};
    dripItem.x = (Math.random() - 0.5) * 18;
    dripItem.y = -6 - Math.random() * 9;
    dripItem.z = (Math.random() - 0.5) * 18;
    dripItem.speed = 0.25 + Math.random() * 0.5;
    dripData.push(dripItem);
    dripIndex = dripIndex + 1;
  }
  island.add(drips);

  // Tilted light shafts leaning through the island.
  var shafts = [];
  var shaftTotal = 4;
  var shaftIndex = 0;
  while (shaftIndex < shaftTotal) {
    var shaftMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 19),
      new THREE.MeshBasicMaterial({
        color: 0xfff3d0,
        transparent: true,
        opacity: 0.04,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    var shaftAngle = (shaftIndex / shaftTotal) * Math.PI * 2;
    shaftMesh.position.set(Math.cos(shaftAngle) * 17, 5, Math.sin(shaftAngle) * 17);
    shaftMesh.rotation.y = shaftAngle;
    shaftMesh.rotation.z = 0.22;
    island.add(shaftMesh);
    shafts.push(shaftMesh);
    shaftIndex = shaftIndex + 1;
  }

  /* ---------- world scale ---------- */
  const world = new THREE.Group();
  const wparts = [island, clouds, nameGroup, stars, leafMesh, sparkles, sunSprite, sunDisc].concat(birds, WORLD_EXTRA);
  wparts.forEach(o=>scene.remove(o));
  wparts.forEach(o=>world.add(o));
  scene.add(world);

  function fitScale(){
    const vFov = camera.fov*Math.PI/180;
    const visH = 2*Math.tan(vFov/2)*camera.position.z;
    const visW = visH*camera.aspect;
    return Math.max(0.15, Math.min(1.5, visW/(camera.aspect<0.9?58:68)));
  }
  function applyFit(){ const f=fitScale(); world.scale.setScalar(f); world.position.y = 10.9 - NAME_Y*f; }
  applyFit();

  /* ---------- post-processing ---------- */
  if(PP){
    try{
      const c = new PP.EffectComposer(renderer);
      c.addPass(new PP.RenderPass(scene, camera));
      bloom = new PP.UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.26, 0.7, 0.94);
      c.addPass(bloom);
      c.addPass(new PP.OutputPass());
      composer = c;
    }catch(e){ composer = null; bloom = null; }
  }

  /* ---------- interaction ---------- */
  const mouse={x:0,y:0}, tgt={x:0,y:0};
  addEventListener('pointermove', e=>{ tgt.x=(e.clientX/innerWidth-0.5); tgt.y=(e.clientY/innerHeight-0.5); });
  addEventListener('resize', ()=>{ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight); if(composer&&composer.setSize) composer.setSize(innerWidth,innerHeight); applyFit(); });

  let scatter = 0, scatterDir = 0;
  addEventListener('pointerdown', e=>{ if(e.target===canvas){ scatter=1; scatterDir=Math.random()>0.5?1:-1; } });

  /* ---------- a little creature that follows the pointer ---------- */
  const petCells = {};
  function putPet(x, y, z, color) { petCells[x + ',' + y + ',' + z] = { x: x, y: y, z: z, color: color }; }

  let px, pz;
  // legs
  putPet(-2, 0, 2, 0xd97a33);
  putPet(2, 0, 2, 0xd97a33);
  putPet(-2, 0, -2, 0xd97a33);
  putPet(2, 0, -2, 0xd97a33);
  // body
  for (px = -2; px <= 2; px = px + 1) {
    for (pz = -3; pz <= 1; pz = pz + 1) {
      for (let py = 1; py <= 3; py = py + 1) {
        if (Math.abs(px) === 2 && (pz === -3 || pz === 1)) { continue; }
        putPet(px, py, pz, py === 1 ? 0xf7e7d3 : 0xff9a4d);
      }
    }
  }
  // head
  for (px = -1; px <= 1; px = px + 1) {
    for (pz = 2; pz <= 4; pz = pz + 1) {
      for (let py = 3; py <= 5; py = py + 1) {
        putPet(px, py, pz, 0xff9a4d);
      }
    }
  }
  // ears, face, snout
  putPet(-1, 6, 3, 0xff9a4d);
  putPet(1, 6, 3, 0xff9a4d);
  putPet(-1, 4, 4, 0x2a1d16);
  putPet(1, 4, 4, 0x2a1d16);
  putPet(0, 3, 5, 0x2a1d16);
  putPet(0, 4, 5, 0xf7e7d3);

  const petList = [];
  for (const petKey in petCells) { petList.push(petCells[petKey]); }

  const pet = new THREE.Group();
  pet.add(makeVoxels(petList, 1.0));
  pet.scale.setScalar(0.7);
  pet.position.set(0, 0, 6);
  island.add(pet);

  // tail, kept separate so it can wag
  const tailBlocks = [];
  for (let ti = 0; ti < 4; ti = ti + 1) {
    tailBlocks.push({ x: 0, y: 2 + ti * 0.6, z: -4 - ti * 0.4, color: ti === 3 ? 0xf7e7d3 : 0xff9a4d });
  }
  const petTail = makeVoxels(tailBlocks, 0.85);
  petTail.scale.setScalar(0.7);
  island.add(petTail);

  const petRay = new THREE.Raycaster();
  const petHit = new THREE.Vector3();
  island.updateWorldMatrix(true, false);
  const groundY = island.localToWorld(new THREE.Vector3(0, 3, 0)).y;
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -groundY);
  let petWalk = 0;

  /* ---------- the time machine: the island grows into a future ---------- */
  let era = 0.43;
  const futurePillars = [];
  for (let fi = 0; fi < 8; fi = fi + 1) {
    const fa = (fi / 8) * Math.PI * 2 + 0.4;
    const fx = Math.cos(fa) * (R - 1.5);
    const fz = Math.sin(fa) * (R - 1.5);
    const towerBlocks = [];
    const towerH = 5 + (fi % 3) * 3;
    for (let ty = 0; ty < towerH; ty = ty + 1) {
      towerBlocks.push({ x: 0, y: ty, z: 0, color: 0x7fe8ff });
    }
    const tower = makeVoxels(towerBlocks, 0.8);
    tower.material = new THREE.MeshLambertMaterial({
      color: 0xffffff, emissive: 0x1f9fd0, emissiveIntensity: 0.7, transparent: true, opacity: 0
    });
    tower.position.set(fx, heightAt(fx, fz) + 1, fz);
    island.add(tower);
    futurePillars.push(tower);
  }

  const holoRing = new THREE.Mesh(
    new THREE.TorusGeometry(11.5, 0.1, 6, 96),
    new THREE.MeshBasicMaterial({ color: 0x7fe8ff, transparent: true, opacity: 0 })
  );
  holoRing.rotation.x = Math.PI / 2;
  holoRing.position.y = 15;
  island.add(holoRing);

  const clock = new THREE.Clock();
  let scrollY = window.scrollY, sunset = 0;
  addEventListener('scroll', ()=>{ scrollY = window.scrollY; }, {passive:true});
  const sunsetEl = document.getElementById('skySunset');
  const nightEl = document.getElementById('skyNight');
  let lastDusk = -1;

  function draw(){ if(composer&&composer.render) composer.render(); else renderer.render(scene, camera); }

  function frame(){
    const t = clock.getElapsedTime();
    const vh = innerHeight;
    const heroP = Math.min(1, Math.max(0, scrollY/(vh*0.85)));
    const docH = Math.max(1, document.documentElement.scrollHeight - vh);
    const pageP = Math.min(1, Math.max(0, scrollY/docH));
    mouse.x += (tgt.x-mouse.x)*0.05; mouse.y += (tgt.y-mouse.y)*0.05;

    // time of day — drives every night-time effect
    sunset += ((pageP*0.85) - sunset)*0.05;
    // the time machine pushes the sky toward dawn in the past, night in the future
    const eraNight = Math.max(0, (era - 0.5) * 1.7) + Math.max(0, (0.43 - era) * 0.6);
    const night = Math.min(1, Math.max(sunset, manualNight, eraNight));

    // the island grows as the years pass, and towers rise in the future
    island.scale.setScalar(0.87 + era * 0.22);
    const futureP = Math.max(0, (era - 0.6) / 0.4);
    for (let fp = 0; fp < futurePillars.length; fp = fp + 1) {
      futurePillars[fp].material.opacity = futureP * 0.95;
      futurePillars[fp].scale.y = 0.3 + futureP * 0.7;
    }
    holoRing.material.opacity = futureP * 0.5;
    holoRing.rotation.z = holoRing.rotation.z + 0.004;

    // the creature walks toward wherever the pointer is
    petRay.setFromCamera({ x: tgt.x * 2, y: -tgt.y * 2 }, camera);
    if (petRay.ray.intersectPlane(groundPlane, petHit)) {
      const petLocal = pet.parent.worldToLocal(petHit.clone());
      const petRad = Math.hypot(petLocal.x, petLocal.z) || 1;
      const petMax = R - 1.5;
      if (petRad > petMax) {
        petLocal.x = petLocal.x * (petMax / petRad);
        petLocal.z = petLocal.z * (petMax / petRad);
      }
      const petDx = petLocal.x - pet.position.x;
      const petDz = petLocal.z - pet.position.z;
      const petDist = Math.hypot(petDx, petDz);
      if (petDist > 0.4) {
        const petStep = Math.min(petDist, 0.1 + petDist * 0.05);
        pet.position.x = pet.position.x + (petDx / petDist) * petStep;
        pet.position.z = pet.position.z + (petDz / petDist) * petStep;
        pet.rotation.y = Math.atan2(petDx, petDz);
        petWalk = Math.min(1, petWalk + 0.1);
      } else {
        petWalk = Math.max(0, petWalk - 0.08);
      }
    }
    pet.position.y = heightAt(pet.position.x, pet.position.z) + 0.5 + Math.abs(Math.sin(t * 11)) * 0.4 * petWalk;
    pet.rotation.z = Math.sin(t * 11) * 0.06 * petWalk;
    petTail.position.set(pet.position.x, pet.position.y, pet.position.z);
    petTail.rotation.y = pet.rotation.y + Math.sin(t * 9) * (0.35 + petWalk * 0.5);
    petTail.scale.setScalar(0.7 + Math.sin(t * 3) * 0.04);

    scatter = Math.max(0, scatter - 0.012);
    const sc = scatter*scatter;

    // name
    nameGroup.rotation.y = heroP*Math.PI*0.72 + mouse.x*0.35;
    nameGroup.rotation.x = Math.sin(heroP*Math.PI)*0.20 + mouse.y*0.16;
    nameGroup.position.y = NAME_Y + heroP*17;
    nameGroup.position.z = -heroP*5;
    letters.forEach((l,i)=>{
      const u = l.userData, spread = 1 + heroP*0.25;
      l.position.x = u.baseX*spread + u.rx*sc*9*scatterDir;
      l.position.y = Math.sin(i*0.9)*heroP*1.2 + u.ry*sc*7;
      l.position.z = Math.cos(i*1.3)*heroP*1.4 + u.rz*sc*7;
      l.rotation.y = (i%2?1:-1)*heroP*0.42 + u.ry*sc*3;
      l.rotation.z = (i%2?-1:1)*heroP*0.14 + u.rx*sc*3;
      l.material.color.copy(u.baseCol).lerp(NAME_NIGHT, night*0.86);
    });

    // sparkles
    { const m=new THREE.Matrix4();
      spkData.forEach((s,i)=>{ s.a += 0.006; const x=Math.cos(s.a)*s.r, z=Math.sin(s.a)*s.r, y=s.y+Math.sin(t*0.8+i)*1.2;
        m.makeTranslation(x, NAME_Y+heroP*17+y, z); sparkles.setMatrixAt(i,m); });
      sparkles.instanceMatrix.needsUpdate = true; }

    // island
    island.position.y = -3.4 - pageP*26 + Math.sin(t*0.6)*0.25;
    island.rotation.y = pageP*0.5;

    // water shimmer
    { const m=new THREE.Matrix4();
      wBase.forEach((c,i)=>{ m.makeTranslation(c.x, c.y + Math.sin(t*1.6 + c.x*0.7 + c.z*0.5)*0.09, c.z); water.setMatrixAt(i,m); });
      water.instanceMatrix.needsUpdate = true; }
    // waterfall
    { const m=new THREE.Matrix4();
      fallBase.forEach((c,i)=>{ const off = ((t*2.6 + i*0.5) % (wfTop-POND.level+1)); 
        m.makeTranslation(c.x, wfTop - off, c.z); fall.setMatrixAt(i,m); });
      fall.instanceMatrix.needsUpdate = true; }

    // windmill + flames + firelight
    blades.rotation.z = t*1.1;
    flameMeshes.forEach((f,i)=>{ f.position.y = FIRE.y+1.4 + Math.sin(t*9+i)*0.18; f.scale.setScalar(0.7+Math.abs(Math.sin(t*7+i))*0.6); });
    fireLight.position.set(FIRE.x, FIRE.y+2, FIRE.z);
    fireLight.intensity = 8 + Math.sin(t*12)*3 + Math.sin(t*23)*2;
    fireLight.distance = 26;

    // mini islands
    minis.forEach(g=>{ g.userData.ang += g.userData.spin*0.01;
      g.position.set(Math.cos(g.userData.ang)*g.userData.rad, g.userData.y+Math.sin(t*0.5+g.userData.ang)*1.1, Math.sin(g.userData.ang)*g.userData.rad);
      g.rotation.y = g.userData.ang; });

    // clouds drift + birds + leaves
    clouds.position.x = Math.sin(t*0.07)*4;
    birds.forEach((b,i)=>{ const u=b.userData; u.ang += 0.0035*u.sp;
      b.position.set(Math.cos(u.ang)*u.rad, u.y+Math.sin(t*0.9+u.ph)*1.1, Math.sin(u.ang)*u.rad*0.7 - 15);
      b.rotation.y = -u.ang + Math.PI/2;
      const flap = Math.sin(t*9+u.ph)*0.7; u.wL.rotation.z = flap; u.wR.rotation.z = -flap; });
    { const m=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), s=new THREE.Vector3();
      leaves.forEach((lf,i)=>{ lf.y -= lf.s*0.16; lf.x += Math.sin(t+lf.r)*0.02; lf.r += 0.02;
        if(lf.y < -6){ lf.y = 24+Math.random()*8; lf.x = (Math.random()-0.5)*34; lf.z = -22+Math.random()*26; }
        e.set(lf.r, lf.r*0.7, lf.r*0.5); q.setFromEuler(e); s.set(1,1,1);
        m.compose(new THREE.Vector3(lf.x, lf.y, lf.z), q, s); leafMesh.setMatrixAt(i,m); });
      leafMesh.instanceMatrix.needsUpdate = true; }

    /* ================= v4: ANIMATION ================= */

    lamps.forEach(function(b){ b.material.opacity = 0.22 + night*0.78; });
    nightLight.intensity = night*16;

    boat.userData.a += 0.0042;
    boat.position.set(POND.x + Math.cos(boat.userData.a)*2.05,
                      POND.level + 0.26 + Math.sin(t*1.7)*0.07,
                      POND.z + Math.sin(boat.userData.a)*2.05);
    boat.rotation.y = -boat.userData.a + Math.PI/2;
    boat.rotation.z = Math.sin(t*1.7)*0.06;

    fishes.forEach(function(f){ const u=f.userData; u.a += 0.013;
      const j=Math.max(0, Math.sin(u.a*1.5+u.ph)); const jy=j*j*1.7;
      f.position.set(POND.x+Math.cos(u.a)*u.r, POND.level+0.3+jy, POND.z+Math.sin(u.a)*u.r);
      f.rotation.z = -j*1.0; f.rotation.y = u.a+1.5; });

    butterflies.forEach(function(b){ const u=b.userData;
      b.position.set(Math.cos(u.ang+t*0.18)*u.r, u.y+Math.sin(t*1.5+u.ph)*0.55, Math.sin(u.ang+t*0.18)*u.r);
      const fl=Math.abs(Math.sin(t*15+u.ph))*0.85+0.15; u.c1.rotation.z=fl; u.c2.rotation.z=-fl;
      b.rotation.y = -u.ang - t*0.18; });

    char.userData.arm.rotation.z = Math.sin(t*3.4)*0.95 - 0.7;
    char.rotation.y = Math.sin(t*0.5)*0.35;

    smoke.forEach(function(s,i){ s.userData.t += 0.0042; if(s.userData.t>1) s.userData.t -= 1;
      const k=s.userData.t;
      s.position.set(9+Math.sin(t*0.8+i)*0.9*k, hutY+5+k*7.5, -7+Math.cos(t*0.7+i)*0.9*k);
      s.scale.setScalar(0.55+k*1.7); s.material.opacity = 0.5*(1-k); });

    mist.forEach(function(m,i){ const ph=m.userData.ph;
      m.position.set(wfX+Math.sin(t*1.1+ph)*0.85, POND.level+0.55+Math.abs(Math.sin(t*0.9+ph))*1.0, wfZ+0.5+Math.cos(t*1.0+ph)*0.65);
      m.material.opacity = 0.28*(0.45+0.55*Math.sin(t*1.3+ph)); });

    { const m=new THREE.Matrix4();
      ffData.forEach(function(f,i){ const x=f.x+Math.sin(t*f.sp+f.ph)*3.2, z=f.z+Math.cos(t*f.sp*0.8+f.ph)*3.2, y=f.y+Math.sin(t*1.2+f.ph)*1.3;
        m.makeTranslation(x,y,z); fireflies.setMatrixAt(i,m); });
      fireflies.instanceMatrix.needsUpdate = true; }
    fireflies.material.opacity = Math.max(0, night-0.32)*1.5;

    balloon.userData.a += 0.0013;
    balloon.position.set(Math.cos(balloon.userData.a)*30, 15+Math.sin(t*0.4)*1.7, Math.sin(balloon.userData.a)*30);
    balloon.rotation.y = -balloon.userData.a;

    rocket.userData.a += 0.0048;
    const ra = rocket.userData.a;
    rocket.position.set(Math.cos(ra)*38, 9+Math.sin(ra*2)*6, Math.sin(ra)*38);
    rocket.rotation.y = -ra + Math.PI/2;
    rocket.rotation.z = Math.cos(ra*2)*0.28;
    rocket.userData.flame.scale.setScalar(0.7+Math.abs(Math.sin(t*16))*0.8);

    const rainOn = (weather==='rain') ? 1 : 0;
    rain.material.opacity += (rainOn*0.55 - rain.material.opacity)*0.05;
    if(rain.material.opacity > 0.02){ const m=new THREE.Matrix4();
      rainData.forEach(function(r,i){ r.y -= r.s*0.95; if(r.y < -10){ r.y = 34+Math.random()*12; r.x=(Math.random()-0.5)*90; }
        m.makeTranslation(r.x, r.y, r.z); rain.setMatrixAt(i,m); });
      rain.instanceMatrix.needsUpdate = true; }

    const snowOn = (weather==='snow') ? 1 : 0;
    snow.material.opacity += (snowOn*0.92 - snow.material.opacity)*0.05;
    if(snow.material.opacity > 0.02){ const m=new THREE.Matrix4();
      snowData.forEach(function(r,i){ r.y -= r.s*0.24; r.x += Math.sin(t*0.6+r.ph)*0.06;
        if(r.y < -10){ r.y = 34+Math.random()*12; r.x=(Math.random()-0.5)*90; }
        m.makeTranslation(r.x, r.y, r.z); snow.setMatrixAt(i,m); });
      snow.instanceMatrix.needsUpdate = true; }

    if(weather==='rain' && flash<=0 && Math.random()<0.0024) flash = 1;
    if(flash>0){ flash -= 0.045; const f=Math.max(0,flash);
      flashLight.intensity = f*90; flashLight.position.set((Math.random()-0.5)*30, 24, -10);
      if(flashOverlay) flashOverlay.style.opacity = (f*0.5).toFixed(3);
      shakeAmt = f*0.5;
    } else { flashLight.intensity = 0; if(flashOverlay) flashOverlay.style.opacity = 0; shakeAmt *= 0.86; }

    meteorWait -= 0.016;
    if(meteorWait<=0 && meteorLife<=0 && night>0.28){ meteorLife = 1; meteorWait = 6+Math.random()*11;
      meteorFrom.set(-44+Math.random()*24, 27+Math.random()*9, -32+Math.random()*24); }
    if(meteorLife>0){ meteorLife -= 0.011; const k=1-meteorLife;
      meteor.position.set(meteorFrom.x+k*92, meteorFrom.y-k*46, meteorFrom.z);
      meteor.rotation.z = -0.46;
      meteor.material.opacity = Math.sin(k*Math.PI)*0.95; }
    else meteor.material.opacity = 0;



    /* ================= v5: ANIMATION ================= */
    const rbSpeed = 0.0006;

    // lighthouse beam + lamp at night
    beam.rotation.y = t*0.9;
    beam.material.opacity = Math.max(0, night-0.35)*0.5;
    lighthouse.userData.lamp.material.opacity = 0.3 + night*0.7;

    // whale drifts through the sky
    whale.userData.a += 0.0009;
    const wa = whale.userData.a;
    whale.position.set(Math.cos(wa)*25, 20 + Math.sin(t*0.35)*2.5, Math.sin(wa)*25 - 12);
    whale.rotation.y = -wa + Math.PI/2;
    whale.rotation.z = Math.sin(t*0.5)*0.08;

    // lanterns rise at night
    lanterns.material.opacity = Math.max(0, night-0.4)*1.6;
    if(lanterns.material.opacity > 0.02){ const m=new THREE.Matrix4();
      lanData.forEach(function(l,i){ l.y += l.s*0.06; if(l.y > 32){ l.y = -4; l.x=(Math.random()-0.5)*34; }
        m.makeTranslation(l.x + Math.sin(t*0.5+l.ph)*0.6, l.y, l.z); lanterns.setMatrixAt(i,m); });
      lanterns.instanceMatrix.needsUpdate = true; }

    // fireworks at night
    fwWait -= 0.016;
    if(fwWait<=0 && fwLife<=0 && night>0.5){ fwLife=1; fwWait=3+Math.random()*6;
      fwPos.set(-24+Math.random()*48, 20+Math.random()*9, -26+Math.random()*30); }
    if(fwLife>0){ fwLife -= 0.016; const k=1-fwLife, rad=k*7;
      const m=new THREE.Matrix4();
      fwData.forEach(function(d,i){ m.makeTranslation(fwPos.x+d.dx*rad, fwPos.y+d.dy*rad - k*k*3, fwPos.z+d.dz*rad); fireworks.setMatrixAt(i,m); });
      fireworks.instanceMatrix.needsUpdate = true;
      fireworks.material.opacity = Math.sin(k*Math.PI)*0.95; }
    else fireworks.material.opacity = 0;

    // airplane circles the sky
    plane.userData.a += 0.0035;
    const pa = plane.userData.a;
    plane.position.set(Math.cos(pa)*34, 19 + Math.sin(pa*1.5)*3, Math.sin(pa)*34 - 8);
    plane.rotation.y = -pa + Math.PI/2;
    plane.rotation.z = -0.18;

    // drone bobs and spins its rotors
    drone.userData.a += 0.006;
    const da = drone.userData.a;
    drone.position.set(Math.cos(da)*16, 12 + Math.sin(t*1.1)*1.4, Math.sin(da)*16);
    drone.rotation.y = -da;
    rotors.forEach(function(r,i){ r.rotation.y = t*(14+i*3); });

    // kite flies on a string
    const kx = 12 + Math.sin(t*0.5)*3.2, ky = 13 + Math.sin(t*0.9)*1.6, kz = 7 + Math.cos(t*0.4)*2.4;
    kite.position.set(kx, ky, kz);
    kite.rotation.z = Math.sin(t*1.4)*0.25;
    kite.rotation.y = Math.sin(t*0.5)*0.5;
    { const p = kiteLine.geometry.attributes.position;
      p.setXYZ(0, kx, ky - 0.5, kz); p.setXYZ(1, kx*0.62, heightAt(Math.round(kx*0.62), Math.round(kz*0.62)) + 1, kz*0.62);
      p.needsUpdate = true; }

    // crystals glow at night
    crystals.material.emissiveIntensity = 0.2 + night*1.1;

    // hot spring steam
    steam.forEach(function(s,i){ s.userData.t += 0.004; if(s.userData.t>1) s.userData.t -= 1;
      const k=s.userData.t;
      s.position.set(SPX+Math.sin(t*0.9+i)*0.8*k, SPY+2+k*4.5, SPZ+Math.cos(t*0.8+i)*0.8*k);
      s.scale.setScalar(0.5+k*1.6); s.material.opacity = 0.26*(1-k); });

    // water spout
    spout.forEach(function(s,i){ const ph=s.userData.ph;
      const k = (t*0.35 + ph) % 1;
      s.position.set(POND.x, POND.level + 0.3 + Math.sin(k*Math.PI)*3.2, POND.z);
      s.scale.setScalar(1 - k*0.6); s.material.opacity = 0.8*(1-k); });

    // train cart on the rail
    cart.userData.a += 0.0028;
    { const a = cart.userData.a, cr = 11.5;
      const cxp = Math.cos(a)*cr, czp = Math.sin(a)*cr;
      cart.position.set(cxp, heightAt(Math.round(cxp),Math.round(czp))+1.2, czp);
      cart.rotation.y = -a + Math.PI/2; }

    // deer wanders
    deer.userData.a += 0.0016;
    { const a = deer.userData.a, dr = 6.5 + Math.sin(a*2)*2;
      const dx2 = Math.cos(a)*dr, dz2 = Math.sin(a)*dr;
      deer.position.set(dx2, heightAt(Math.round(dx2),Math.round(dz2)), dz2);
      deer.rotation.y = -a + Math.PI/2; }

    // grass tufts sway
    { const m=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), sc=new THREE.Vector3(1,1,1), pv=new THREE.Vector3();
      tuftData.forEach(function(g,i){ const sway=Math.sin(t*1.6+g.ph)*0.22;
        e.set(sway, 0, sway*0.6); q.setFromEuler(e); pv.set(g.x, g.y, g.z);
        m.compose(pv,q,sc); tufts.setMatrixAt(i,m); });
      tufts.instanceMatrix.needsUpdate = true; }

    // swing + character jump + snowman
    swing.userData.seat.position.x = Math.sin(t*0.9)*0.7;
    swing.rotation.z = Math.sin(t*0.9)*0.16;
    if(charJump > 0){ charJump -= 0.02; const j = Math.max(0, charJump);
      char.position.y = heightAt(6,-4) + Math.sin((1-j)*Math.PI)*2.2; }
    snowman.visible = (weather === 'snow');



    /* ================= v6: BOTTOM AND TILTED ANIMATION ================= */

    // The hanging chains swing gently.
    var swingIndex = 0;
    while (swingIndex < chains.length) {
      var swingChain = chains[swingIndex];
      swingChain.rotation.z = Math.sin(t * 1.1 + swingChain.userData.phase) * 0.22;
      swingChain.rotation.x = Math.cos(t * 0.9 + swingChain.userData.phase) * 0.16;
      swingIndex = swingIndex + 1;
    }

    // The bottom waterfall keeps falling and resets.
    var fallMatrix = new THREE.Matrix4();
    var fallIndex = 0;
    while (fallIndex < bottomFallTotal) {
      var fallOffset = (t * 3.2 + fallIndex * 1.1) % 10;
      fallMatrix.makeTranslation(-3, -5 - fallOffset, 4);
      bottomFall.setMatrixAt(fallIndex, fallMatrix);
      fallIndex = fallIndex + 1;
    }
    bottomFall.instanceMatrix.needsUpdate = true;

    // The debris floats around and each piece spins on its own axis.
    var debrisMatrix = new THREE.Matrix4();
    var debrisQuat = new THREE.Quaternion();
    var debrisEuler = new THREE.Euler();
    var debrisPos = new THREE.Vector3();
    var debrisScale = new THREE.Vector3();
    var debrisStep = 0;
    while (debrisStep < debrisTotal) {
      var piece = debrisData[debrisStep];
      var pieceAngle = piece.angle + t * piece.spin * 0.25;
      var pieceX = Math.cos(pieceAngle) * piece.radius;
      var pieceZ = Math.sin(pieceAngle) * piece.radius;
      var pieceY = piece.height + Math.sin(t * 0.7 + piece.angle) * 1.4;
      debrisEuler.set(t * piece.spin, piece.tilt + t * piece.spin * 0.6, t * piece.spin * 0.4);
      debrisQuat.setFromEuler(debrisEuler);
      debrisPos.set(pieceX, pieceY, pieceZ);
      debrisScale.set(piece.size, piece.size, piece.size);
      debrisMatrix.compose(debrisPos, debrisQuat, debrisScale);
      debrisMesh.setMatrixAt(debrisStep, debrisMatrix);
      debrisStep = debrisStep + 1;
    }
    debrisMesh.instanceMatrix.needsUpdate = true;

    // The big ring turns slowly.
    tiltRing.rotation.z = 0.28 + t * 0.06;

    // The slabs drift and stay tilted.
    var slabStep = 0;
    while (slabStep < slabs.length) {
      var slabAngle = t * (0.12 + slabStep * 0.05) + slabStep * 2.1;
      var slabRadius = 27 + slabStep * 5;
      var slabY = -4 + slabStep * 4 + Math.sin(t * 0.5 + slabStep) * 1.2;
      slabs[slabStep].position.set(Math.cos(slabAngle) * slabRadius, slabY, Math.sin(slabAngle) * slabRadius);
      slabs[slabStep].rotation.x = 0.35 + Math.sin(t * 0.4 + slabStep) * 0.2;
      slabs[slabStep].rotation.y = 0 - slabAngle;
      slabs[slabStep].rotation.z = 0.18;
      slabStep = slabStep + 1;
    }

    // Embers rise at night.
    embers.material.opacity = Math.max(0, night - 0.35) * 1.6;
    if (embers.material.opacity > 0.02) {
      var emberMatrix = new THREE.Matrix4();
      var emberStep = 0;
      while (emberStep < emberTotal) {
        var ember = emberData[emberStep];
        ember.y = ember.y + ember.speed * 0.05;
        if (ember.y > 18) {
          ember.y = -6;
          ember.x = (Math.random() - 0.5) * 26;
          ember.z = (Math.random() - 0.5) * 26;
        }
        emberMatrix.makeTranslation(ember.x + Math.sin(t + emberStep) * 0.5, ember.y, ember.z);
        embers.setMatrixAt(emberStep, emberMatrix);
        emberStep = emberStep + 1;
      }
      embers.instanceMatrix.needsUpdate = true;
    }

    // The vortex keeps circling.
    var vortexMatrix = new THREE.Matrix4();
    var vortexStep = 0;
    while (vortexStep < vortexTotal) {
      var swirl = vortexData[vortexStep];
      swirl.angle = swirl.angle + swirl.speed * 0.02;
      var swirlX = Math.cos(swirl.angle) * swirl.radius;
      var swirlZ = Math.sin(swirl.angle) * swirl.radius;
      var swirlY = swirl.height + Math.sin(t * 0.6 + swirl.angle) * 2;
      vortexMatrix.makeTranslation(swirlX, swirlY, swirlZ);
      vortex.setMatrixAt(vortexStep, vortexMatrix);
      vortexStep = vortexStep + 1;
    }
    vortex.instanceMatrix.needsUpdate = true;

    // The drips fall and reset.
    var dripMatrix = new THREE.Matrix4();
    var dripStep = 0;
    while (dripStep < dripTotal) {
      var drop = dripData[dripStep];
      drop.y = drop.y - drop.speed * 0.35;
      if (drop.y < -17) {
        drop.y = -6;
      }
      dripMatrix.makeTranslation(drop.x, drop.y, drop.z);
      drips.setMatrixAt(dripStep, dripMatrix);
      dripStep = dripStep + 1;
    }
    drips.instanceMatrix.needsUpdate = true;

    // The light shafts breathe and turn.
    var shaftStep = 0;
    while (shaftStep < shafts.length) {
      shafts[shaftStep].material.opacity = 0.025 + Math.abs(Math.sin(t * 0.4 + shaftStep)) * 0.045;
      shafts[shaftStep].rotation.y = shafts[shaftStep].rotation.y + 0.0012;
      shaftStep = shaftStep + 1;
    }

    // The anchor sways.
    anchor.rotation.z = 0.2 + Math.sin(t * 0.8) * 0.12;
    anchor.rotation.y = Math.sin(t * 0.6) * 0.3;

    // The underside glows after dark.
    mushrooms.material.emissiveIntensity = 0.3 + night * 1.4;
    downCrystals.material.emissiveIntensity = 0.25 + night * 1.3;

    // sun / stars / sunset
    if(sunsetEl) sunsetEl.style.opacity = night.toFixed(3);
    if(nightEl) nightEl.style.opacity = Math.max(0,(night-0.5)/0.5).toFixed(3);
    if(Math.abs(night-lastDusk) > 0.06){ lastDusk = night; document.body.classList.toggle('dusk', night > 0.62); }
    sunSprite.position.set(30 - night*10, 20 - night*22, -34);
    sunDisc.position.copy(sunSprite.position);
    sunDisc.material.opacity = Math.max(0, 1 - night*1.35);
    sunSprite.material.opacity = Math.max(0, 1 - night*1.35);
    moonGlow.material.opacity = night*0.9;
    moonDisc.material.opacity = night;
    stars.material.opacity = Math.max(0, night-0.22)*1.1;
    sunLight.intensity = 1.5 - night*1.15;
    fill.intensity = 0.5 + night*0.25;

    camera.position.x = mouse.x*2.4;
    camera.position.y = 6 - mouse.y*1.8;
    camera.position.z = 46 - pageP*8;
    camera.lookAt(0, 4 - pageP*6, 0);


    camera.position.x += (Math.random()-0.5)*shakeAmt;
    camera.position.y += (Math.random()-0.5)*shakeAmt;


    // orbit / zoom camera offsets (applied after the base framing)
    if(Math.abs(orbitY)>0.001 || Math.abs(orbitX)>0.001 || zoomOff!==0){
      const camR = (46 - pageP*8 - zoomOff);
      const bx = camera.position.x, bz = camera.position.z;
      camera.position.x = bx*Math.cos(orbitY) + bz*Math.sin(orbitY);
      camera.position.z = -bx*Math.sin(orbitY) + bz*Math.cos(orbitY);
      camera.position.y += orbitX*9;
      const rad = Math.hypot(camera.position.x, camera.position.z) || 1;
      const want = Math.max(24, Math.min(80, camR));
      camera.position.x *= want/rad; camera.position.z *= want/rad;
      camera.lookAt(0, 4 - pageP*6, 0);
    }

    draw();
    if(!reduce) requestAnimationFrame(frame);
  }
  frame();
  if(reduce) draw();
  return {scene, camera, renderer, voxels: voxelTotal,
    setWeather:function(w){ weather = w; },
    setNight:function(n){ manualNight = n; },
    setEra:function(v){ era = Math.max(0, Math.min(1, v)); },
    setFx:function(k,v){
      if(k==='birds') birds.forEach(function(b){ b.visible = v; });
      else if(k==='leaves') leafMesh.visible = v;
      else if(k==='fireflies') fireflies.visible = v;
      else if(k==='clouds') clouds.visible = v;
    },
    reset:function(){ weather='clear'; manualNight=0;
      birds.forEach(function(b){ b.visible=true; });
      leafMesh.visible=true; fireflies.visible=true; clouds.visible=true; }};
}
