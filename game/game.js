/* ==================== VOXEL TOWER DEFENCE ==================== */
/* A small tower defence game. No libraries, no internet needed. */

(function () {
  'use strict';

  var canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    return;
  }
  var ctx = canvas.getContext('2d');

  /* ---------- the map grid ---------- */

  var COLS = 12;
  var ROWS = 9;
  var TILE_W = 64;
  var TILE_H = 32;
  var BLOCK_H = 11;

  var waypoints = [
    { x: 0, y: 1 },
    { x: 10, y: 1 },
    { x: 10, y: 4 },
    { x: 1, y: 4 },
    { x: 1, y: 7 },
    { x: 8, y: 7 }
  ];

  function buildPath() {
    var cells = [];
    var i = 0;
    while (i < waypoints.length - 1) {
      var from = waypoints[i];
      var to = waypoints[i + 1];
      var stepX = 0;
      var stepY = 0;
      if (to.x > from.x) {
        stepX = 1;
      }
      if (to.x < from.x) {
        stepX = -1;
      }
      if (to.y > from.y) {
        stepY = 1;
      }
      if (to.y < from.y) {
        stepY = -1;
      }
      var cx = from.x;
      var cy = from.y;
      while (cx !== to.x || cy !== to.y) {
        cells.push({ x: cx, y: cy });
        cx = cx + stepX;
        cy = cy + stepY;
      }
      i = i + 1;
    }
    var last = waypoints[waypoints.length - 1];
    cells.push({ x: last.x, y: last.y });
    return cells;
  }

  var pathCells = buildPath();
  var pathLookup = {};
  var index = 0;
  while (index < pathCells.length) {
    pathLookup[pathCells[index].x + ',' + pathCells[index].y] = index;
    index = index + 1;
  }

  var lastCell = pathCells[pathCells.length - 1];
  var firstCell = pathCells[0];

  function isPath(gx, gy) {
    return pathLookup[gx + ',' + gy] !== undefined;
  }

  function isBuildable(gx, gy) {
    if (gx < 0 || gy < 0 || gx >= COLS || gy >= ROWS) {
      return false;
    }
    return isPath(gx, gy) === false;
  }

  /* ---------- the two things you can build ---------- */

  var TURRETS = {
    cannon: {
      label: 'Cannon',
      cost: 50,
      range: 2.7,
      damage: 26,
      rate: 0.7,
      speed: 11,
      top: '#ff7a5c',
      left: '#d8492c',
      right: '#b83a20',
      bullet: '#ffd0a0'
    },
    frost: {
      label: 'Frost',
      cost: 75,
      range: 2.3,
      damage: 10,
      rate: 1.0,
      speed: 9,
      slow: 0.45,
      slowTime: 1.6,
      top: '#7fe4f0',
      left: '#3aa8bd',
      right: '#2b8a9c',
      bullet: '#d6fbff'
    }
  };

  var ENEMIES = {
    grunt: { hp: 44, speed: 1.45, gold: 8, size: 13, top: '#f2705c', left: '#c94a38', right: '#a83a2b' },
    runner: { hp: 28, speed: 2.45, gold: 11, size: 10, top: '#ffd166', left: '#d8a83c', right: '#b98c2b' },
    brute: { hp: 155, speed: 0.85, gold: 27, size: 19, top: '#b98cff', left: '#8a5fd6', right: '#6f48b8' }
  };

  /* ---------- game state ---------- */

  var state = {
    gold: 130,
    lives: 20,
    wave: 0,
    score: 0,
    time: 0,
    phase: 'ready',
    speed: 1,
    muted: false,
    selected: 'cannon',
    hover: null
  };

  var enemies = [];
  var turrets = [];
  var bullets = [];
  var sparks = [];
  var spawnQueue = [];
  var spawnTimer = 0;
  var betweenTimer = 0;
  var bestWave = 0;

  try {
    bestWave = parseInt(window.localStorage.getItem('vtd-best') || '0', 10);
    if (isNaN(bestWave)) {
      bestWave = 0;
    }
  } catch (error) {
    bestWave = 0;
  }

  /* ---------- the view ---------- */

  var view = {
    scale: 1,
    ox: 0,
    oy: 0
  };

  var MAP_W = (COLS + ROWS - 1) * (TILE_W / 2);
  var MAP_H = (COLS + ROWS - 1) * (TILE_H / 2) + 120;

  function tileCenter(gx, gy) {
    var sx = (gx - gy) * (TILE_W / 2) + (ROWS - 1) * (TILE_W / 2);
    var sy = (gx + gy) * (TILE_H / 2);
    return { x: sx, y: sy };
  }

  function screenToGrid(px, py) {
    var x = (px - view.ox) / view.scale;
    var y = (py - view.oy) / view.scale;
    var a = (x - (ROWS - 1) * (TILE_W / 2)) / (TILE_W / 2);
    var b = y / (TILE_H / 2);
    return { x: Math.round((a + b) / 2), y: Math.round((b - a) / 2) };
  }

  function resize() {
    var box = canvas.parentNode;
    var width = box.clientWidth;
    var height = box.clientHeight;
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    view.scale = Math.min(width / MAP_W, height / MAP_H);
    view.ox = (width - MAP_W * view.scale) / 2;
    view.oy = (height - MAP_H * view.scale) / 2 + 46 * view.scale;
  }

  window.addEventListener('resize', resize);

  /* ---------- little sound effects, made with code ---------- */

  var audio = null;
  var audioReady = false;

  function unlockAudio() {
    try {
      if (!audio) {
        audio = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audio.state === 'suspended') {
        audio.resume().then(function () {
          audioReady = true;
        }).catch(function () {
          audioReady = false;
        });
        return;
      }
      audioReady = true;
    } catch (error) {
      audioReady = false;
    }
  }

  window.addEventListener('pointerdown', unlockAudio);
  window.addEventListener('keydown', unlockAudio);

  function beep(freq, length, kind, volume) {
    if (state.muted || audioReady === false) {
      return;
    }
    try {
      var osc = audio.createOscillator();
      var gain = audio.createGain();
      osc.type = kind || 'square';
      osc.frequency.value = freq;
      gain.gain.value = volume || 0.05;
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + length);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + length);
    } catch (error) {
      /* sound is a bonus, never a blocker */
    }
  }

  /* ---------- drawing helpers ---------- */

  function drawCube(cx, cy, half, height, topColor, leftColor, rightColor) {
    var hh = half * 0.5;

    ctx.beginPath();
    ctx.moveTo(cx - half, cy);
    ctx.lineTo(cx, cy + hh);
    ctx.lineTo(cx, cy + hh + height);
    ctx.lineTo(cx - half, cy + height);
    ctx.closePath();
    ctx.fillStyle = leftColor;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + half, cy);
    ctx.lineTo(cx, cy + hh);
    ctx.lineTo(cx, cy + hh + height);
    ctx.lineTo(cx + half, cy + height);
    ctx.closePath();
    ctx.fillStyle = rightColor;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy - hh);
    ctx.lineTo(cx + half, cy);
    ctx.lineTo(cx, cy + hh);
    ctx.lineTo(cx - half, cy);
    ctx.closePath();
    ctx.fillStyle = topColor;
    ctx.fill();
  }

  function drawGroundTile(gx, gy) {
    var c = tileCenter(gx, gy);
    var checker = (gx + gy) % 2 === 0;
    if (isPath(gx, gy)) {
      drawCube(c.x, c.y, TILE_W / 2, BLOCK_H, checker ? '#7a5a3c' : '#6f5136', '#553d28', '#46321f');
      return;
    }
    drawCube(c.x, c.y, TILE_W / 2, BLOCK_H, checker ? '#67bf6e' : '#5cb265', '#40874f', '#336f42');
  }

  function drawGround() {
    var diagonal = 0;
    while (diagonal <= COLS + ROWS - 2) {
      var gx = 0;
      while (gx < COLS) {
        var gy = diagonal - gx;
        if (gy >= 0 && gy < ROWS) {
          drawGroundTile(gx, gy);
        }
        gx = gx + 1;
      }
      diagonal = diagonal + 1;
    }
  }

  function drawSpawn() {
    var c = tileCenter(firstCell.x, firstCell.y);
    var pulse = 0.5 + Math.sin(state.time * 2.5) * 0.5;
    ctx.save();
    ctx.globalAlpha = 0.35 + pulse * 0.35;
    ctx.fillStyle = '#ff5a3c';
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, 26, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(255,120,90,0.85)';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPAWN', c.x, c.y - 16);
  }

  function drawBase() {
    var c = tileCenter(lastCell.x, lastCell.y);
    drawCube(c.x, c.y, 22, 26, '#8b7ae0', '#5f4ec4', '#4a3aa8');
    var pulse = 0.6 + Math.sin(state.time * 3) * 0.4;
    ctx.save();
    ctx.globalAlpha = 0.55 + pulse * 0.45;
    ctx.fillStyle = '#c9b8ff';
    ctx.beginPath();
    ctx.moveTo(c.x, c.y - 58);
    ctx.lineTo(c.x + 13, c.y - 34);
    ctx.lineTo(c.x, c.y - 16);
    ctx.lineTo(c.x - 13, c.y - 34);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(190,170,255,0.9)';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BASE', c.x, c.y + 26);
  }

  function drawTurret(turret) {
    var c = tileCenter(turret.gx, turret.gy);
    var def = TURRETS[turret.type];
    var lift = 14 + (turret.level - 1) * 3;

    drawCube(c.x, c.y, 19, 10, '#8a97a6', '#697686', '#57626f');

    ctx.save();
    ctx.translate(c.x, c.y - lift);
    ctx.rotate(turret.angle);

    ctx.fillStyle = '#3d4a5a';
    ctx.fillRect(0, -4, 26, 8);

    ctx.fillStyle = def.left;
    ctx.fillRect(-11, -11, 22, 22);
    ctx.fillStyle = def.top;
    ctx.fillRect(-11, -11, 22, 11);

    ctx.fillStyle = def.bullet;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (turret.level > 1) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('L' + turret.level, c.x, c.y - lift - 18);
    }
  }

  function drawEnemy(enemy) {
    var c = tileCenter(enemy.x, enemy.y);
    var def = ENEMIES[enemy.type];
    var bob = Math.sin(state.time * 9 + enemy.seed) * 2;

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(c.x, c.y + 4, def.size * 0.9, def.size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    var frozen = enemy.slowTimer > 0;
    var top = frozen ? '#bfe9ff' : def.top;
    var left = frozen ? '#8fc4e0' : def.left;
    var right = frozen ? '#74a8c8' : def.right;

    ctx.save();
    ctx.translate(c.x, c.y - 12 + bob);
    drawCube(0, 0, def.size, def.size * 0.9, top, left, right);
    ctx.fillStyle = '#141c26';
    ctx.fillRect(-def.size * 0.5, -def.size * 0.35, 3, 4);
    ctx.fillRect(def.size * 0.5 - 4, -def.size * 0.35, 3, 4);
    ctx.restore();

    var barWidth = def.size * 1.9;
    var ratio = Math.max(0, enemy.hp / enemy.maxHp);
    var barY = c.y - def.size * 2.6 - 10;
    ctx.fillStyle = 'rgba(10,18,28,0.6)';
    ctx.fillRect(c.x - barWidth / 2, barY, barWidth, 4);
    ctx.fillStyle = ratio > 0.5 ? '#63d67a' : (ratio > 0.25 ? '#ffc247' : '#ff5a3c');
    ctx.fillRect(c.x - barWidth / 2, barY, barWidth * ratio, 4);
  }

  function drawBullet(bullet) {
    var c = tileCenter(bullet.x, bullet.y);
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(c.x, c.y - 18, bullet.size, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSpark(spark) {
    var c = tileCenter(spark.x, spark.y);
    ctx.globalAlpha = Math.max(0, spark.life / spark.maxLife);
    ctx.fillStyle = spark.color;
    var s = spark.size;
    ctx.fillRect(c.x - s / 2, c.y - 18 - s / 2, s, s);
    ctx.globalAlpha = 1;
  }

  /* ---------- waves ---------- */

  function buildWave(number) {
    var plan = [];
    var grunts = 5 + Math.floor(number * 1.4);
    plan.push({ type: 'grunt', count: grunts, gap: Math.max(0.28, 0.62 - number * 0.02) });
    if (number >= 3) {
      plan.push({ type: 'runner', count: 3 + Math.floor(number * 0.7), gap: 0.36 });
    }
    if (number >= 5) {
      plan.push({ type: 'brute', count: 1 + Math.floor(number / 4), gap: 1.3 });
    }
    return plan;
  }

  function startWave() {
    if (state.phase !== 'ready') {
      return;
    }
    state.wave = state.wave + 1;
    var plan = buildWave(state.wave);
    spawnQueue = [];
    var i = 0;
    while (i < plan.length) {
      var group = plan[i];
      var n = 0;
      while (n < group.count) {
        spawnQueue.push(group.type);
        n = n + 1;
      }
      i = i + 1;
    }
    spawnTimer = 0;
    state.phase = 'wave';
    beep(420, 0.16, 'square', 0.05);
    beep(620, 0.2, 'square', 0.04);
    refreshHud();
  }

  function spawnEnemy(type) {
    var def = ENEMIES[type];
    var scale = 1 + (state.wave - 1) * 0.2;
    var hp = Math.round(def.hp * scale);
    enemies.push({
      type: type,
      x: firstCell.x,
      y: firstCell.y,
      distance: 0,
      hp: hp,
      maxHp: hp,
      speed: def.speed,
      slowTimer: 0,
      seed: Math.random() * 6.28
    });
  }

  function pathPoint(distance) {
    var i = Math.floor(distance);
    if (i < 0) {
      i = 0;
    }
    if (i >= pathCells.length - 1) {
      return pathCells[pathCells.length - 1];
    }
    var f = distance - i;
    var a = pathCells[i];
    var b = pathCells[i + 1];
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  }

  /* ---------- building ---------- */

  function turretAt(gx, gy) {
    var i = 0;
    while (i < turrets.length) {
      if (turrets[i].gx === gx && turrets[i].gy === gy) {
        return turrets[i];
      }
      i = i + 1;
    }
    return null;
  }

  function upgradeCost(turret) {
    return Math.round(TURRETS[turret.type].cost * 0.8 * turret.level);
  }

  function placeTurret(gx, gy) {
    if (isBuildable(gx, gy) === false) {
      flash('you cannot build on the path');
      beep(140, 0.12, 'sawtooth', 0.04);
      return;
    }

    var existing = turretAt(gx, gy);
    if (existing) {
      if (existing.level >= 5) {
        flash('already at the top level');
        return;
      }
      var price = upgradeCost(existing);
      if (state.gold < price) {
        flash('need ' + price + ' gold to upgrade');
        beep(140, 0.12, 'sawtooth', 0.04);
        return;
      }
      state.gold = state.gold - price;
      existing.level = existing.level + 1;
      beep(760, 0.14, 'triangle', 0.05);
      refreshHud();
      return;
    }

    var def = TURRETS[state.selected];
    if (state.gold < def.cost) {
      flash('need ' + def.cost + ' gold');
      beep(140, 0.12, 'sawtooth', 0.04);
      return;
    }

    state.gold = state.gold - def.cost;
    turrets.push({
      type: state.selected,
      gx: gx,
      gy: gy,
      level: 1,
      angle: 0,
      cooldown: 0
    });
    beep(520, 0.1, 'triangle', 0.05);
    refreshHud();
  }

  /* ---------- updating ---------- */

  function updateEnemies(dt) {
    var i = enemies.length - 1;
    while (i >= 0) {
      var enemy = enemies[i];
      if (enemy.slowTimer > 0) {
        enemy.slowTimer = enemy.slowTimer - dt;
      }
      var factor = enemy.slowTimer > 0 ? (1 - TURRETS.frost.slow) : 1;
      enemy.distance = enemy.distance + enemy.speed * factor * dt;
      var point = pathPoint(enemy.distance);
      enemy.x = point.x;
      enemy.y = point.y;

      if (enemy.distance >= pathCells.length - 1) {
        state.lives = state.lives - 1;
        enemies.splice(i, 1);
        beep(120, 0.3, 'sawtooth', 0.07);
        if (state.lives <= 0) {
          gameOver();
        }
        refreshHud();
      }
      i = i - 1;
    }
  }

  function updateTurrets(dt) {
    var i = 0;
    while (i < turrets.length) {
      var turret = turrets[i];
      var def = TURRETS[turret.type];
      turret.cooldown = turret.cooldown - dt;

      var range = def.range + (turret.level - 1) * 0.16;
      var target = null;
      var bestDistance = -1;
      var j = 0;
      while (j < enemies.length) {
        var enemy = enemies[j];
        var dx = enemy.x - turret.gx;
        var dy = enemy.y - turret.gy;
        var gap = Math.sqrt(dx * dx + dy * dy);
        if (gap <= range && enemy.distance > bestDistance) {
          bestDistance = enemy.distance;
          target = enemy;
        }
        j = j + 1;
      }

      if (target) {
        var aimX = target.x - turret.gx;
        var aimY = target.y - turret.gy;
        turret.angle = Math.atan2(aimY * 2, aimX);
        if (turret.cooldown <= 0) {
          turret.cooldown = def.rate;
          bullets.push({
            x: turret.gx,
            y: turret.gy,
            tx: target.x,
            ty: target.y,
            speed: def.speed,
            damage: def.damage * (1 + (turret.level - 1) * 0.35),
            slow: def.slow || 0,
            slowTime: def.slowTime || 0,
            color: def.bullet,
            size: 4,
            target: target
          });
          beep(turret.type === 'frost' ? 900 : 700, 0.05, 'square', 0.025);
        }
      }
      i = i + 1;
    }
  }

  function updateBullets(dt) {
    var i = bullets.length - 1;
    while (i >= 0) {
      var bullet = bullets[i];
      var target = bullet.target;
      if (!target || target.hp <= 0) {
        bullets.splice(i, 1);
        i = i - 1;
        continue;
      }
      bullet.tx = target.x;
      bullet.ty = target.y;
      var dx = bullet.tx - bullet.x;
      var dy = bullet.ty - bullet.y;
      var gap = Math.sqrt(dx * dx + dy * dy);
      var step = bullet.speed * dt;
      if (gap <= step) {
        target.hp = target.hp - bullet.damage;
        if (bullet.slow > 0) {
          target.slowTimer = bullet.slowTime;
        }
        burst(target.x, target.y, bullet.color, 5);
        if (target.hp <= 0) {
          var def = ENEMIES[target.type];
          state.gold = state.gold + def.gold;
          state.score = state.score + def.gold * 10;
          burst(target.x, target.y, def.top, 12);
          var removeAt = enemies.indexOf(target);
          if (removeAt !== -1) {
            enemies.splice(removeAt, 1);
          }
          beep(300, 0.12, 'triangle', 0.05);
          refreshHud();
        }
        bullets.splice(i, 1);
      } else {
        bullet.x = bullet.x + (dx / gap) * step;
        bullet.y = bullet.y + (dy / gap) * step;
      }
      i = i - 1;
    }
  }

  function burst(x, y, color, count) {
    var n = 0;
    while (n < count) {
      sparks.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 0.5,
        maxLife: 0.5,
        size: 2 + Math.random() * 4,
        color: color
      });
      n = n + 1;
    }
  }

  function updateSparks(dt) {
    var i = sparks.length - 1;
    while (i >= 0) {
      var spark = sparks[i];
      spark.life = spark.life - dt;
      spark.x = spark.x + spark.vx * dt;
      spark.y = spark.y + spark.vy * dt;
      if (spark.life <= 0) {
        sparks.splice(i, 1);
      }
      i = i - 1;
    }
  }

  function updateSpawner(dt) {
    if (state.phase !== 'wave') {
      return;
    }
    if (spawnQueue.length === 0) {
      if (enemies.length === 0) {
        var bonus = 30 + state.wave * 8;
        state.gold = state.gold + bonus;
        state.score = state.score + bonus * 5;
        state.phase = 'ready';
        beep(880, 0.2, 'triangle', 0.05);
        flash('wave ' + state.wave + ' cleared  +' + bonus + ' gold');
        saveBest();
        refreshHud();
      }
      return;
    }
    spawnTimer = spawnTimer - dt;
    if (spawnTimer <= 0) {
      var type = spawnQueue.shift();
      spawnEnemy(type);
      spawnTimer = Math.max(0.26, 0.6 - state.wave * 0.02);
    }
  }

  function saveBest() {
    if (state.wave > bestWave) {
      bestWave = state.wave;
      try {
        window.localStorage.setItem('vtd-best', String(bestWave));
      } catch (error) {
        /* nothing we can do without storage */
      }
    }
  }

  function gameOver() {
    state.phase = 'over';
    saveBest();
    showOverlay('over');
  }

  /* ---------- the main loop ---------- */

  var lastFrame = 0;
  var accumulator = 0;
  var FIXED_STEP = 1 / 60;
  var MAX_STEPS = 14;

  function tick(dt) {
    state.time = state.time + dt;
    updateSpawner(dt);
    updateEnemies(dt);
    updateTurrets(dt);
    updateBullets(dt);
    updateSparks(dt);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (!lastFrame) {
      lastFrame = now;
    }
    var dt = (now - lastFrame) / 1000;
    lastFrame = now;
    if (dt > 0.3) {
      dt = 0.3;
    }

    if (state.phase !== 'over') {
      accumulator = accumulator + dt * state.speed;
      var steps = 0;
      while (accumulator >= FIXED_STEP && steps < MAX_STEPS) {
        tick(FIXED_STEP);
        accumulator = accumulator - FIXED_STEP;
        steps = steps + 1;
      }
      if (steps >= MAX_STEPS) {
        accumulator = 0;
      }
    }

    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, '#16273f');
    sky.addColorStop(1, '#0b1522');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(view.ox, view.oy);
    ctx.scale(view.scale, view.scale);

    drawGround();

    var standing = [];
    standing.push({ depth: lastCell.x + lastCell.y, kind: 'base' });
    standing.push({ depth: firstCell.x + firstCell.y, kind: 'spawn' });

    var i = 0;
    while (i < turrets.length) {
      standing.push({ depth: turrets[i].gx + turrets[i].gy, kind: 'turret', ref: turrets[i] });
      i = i + 1;
    }
    i = 0;
    while (i < enemies.length) {
      standing.push({ depth: enemies[i].x + enemies[i].y, kind: 'enemy', ref: enemies[i] });
      i = i + 1;
    }
    i = 0;
    while (i < bullets.length) {
      standing.push({ depth: bullets[i].x + bullets[i].y, kind: 'bullet', ref: bullets[i] });
      i = i + 1;
    }
    i = 0;
    while (i < sparks.length) {
      standing.push({ depth: sparks[i].x + sparks[i].y, kind: 'spark', ref: sparks[i] });
      i = i + 1;
    }

    standing.sort(function (a, b) {
      return a.depth - b.depth;
    });

    i = 0;
    while (i < standing.length) {
      var item = standing[i];
      if (item.kind === 'base') {
        drawBase();
      }
      if (item.kind === 'spawn') {
        drawSpawn();
      }
      if (item.kind === 'turret') {
        drawTurret(item.ref);
      }
      if (item.kind === 'enemy') {
        drawEnemy(item.ref);
      }
      if (item.kind === 'bullet') {
        drawBullet(item.ref);
      }
      if (item.kind === 'spark') {
        drawSpark(item.ref);
      }
      i = i + 1;
    }

    if (state.hover && isBuildable(state.hover.x, state.hover.y)) {
      var spot = tileCenter(state.hover.x, state.hover.y);
      var def = TURRETS[state.selected];
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = def.top;
      ctx.beginPath();
      ctx.ellipse(spot.x, spot.y, def.range * TILE_W / 2, def.range * TILE_H / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  /* ---------- the page controls ---------- */

  var goldOut = document.getElementById('hudGold');
  var livesOut = document.getElementById('hudLives');
  var waveOut = document.getElementById('hudWave');
  var scoreOut = document.getElementById('hudScore');
  var bestOut = document.getElementById('hudBest');
  var toastOut = document.getElementById('gameToast');
  var waveButton = document.getElementById('sendWave');
  var overlay = document.getElementById('gameOverlay');

  function refreshHud() {
    if (goldOut) {
      goldOut.textContent = String(state.gold);
    }
    if (livesOut) {
      livesOut.textContent = String(Math.max(0, state.lives));
    }
    if (waveOut) {
      waveOut.textContent = String(state.wave);
    }
    if (scoreOut) {
      scoreOut.textContent = String(state.score);
    }
    if (bestOut) {
      bestOut.textContent = String(bestWave);
    }
    if (waveButton) {
      if (state.phase === 'wave') {
        waveButton.textContent = 'Wave ' + state.wave + ' in progress';
        waveButton.disabled = true;
      } else {
        waveButton.textContent = 'Send wave ' + (state.wave + 1);
        waveButton.disabled = false;
      }
    }
  }

  var toastTimer = null;

  function flash(message) {
    if (!toastOut) {
      return;
    }
    toastOut.textContent = message;
    toastOut.classList.add('show');
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(function () {
      toastOut.classList.remove('show');
    }, 1600);
  }

  function showOverlay(kind) {
    if (!overlay) {
      return;
    }
    var heading = kind === 'over' ? 'The base has fallen' : 'Voxel Tower Defence';
    var line = kind === 'over'
      ? 'You held out until wave ' + state.wave + ' with a score of ' + state.score + '.'
      : 'Blocky invaders are marching on your crystal. Build turrets on the grass, keep them off the path, and hold the line.';
    var button = kind === 'over' ? 'Play again' : 'Start playing';
    overlay.innerHTML = '<div class="ov-card">'
      + '<h2>' + heading + '</h2>'
      + '<p>' + line + '</p>'
      + '<button class="ov-go" id="ovGo">' + button + '</button>'
      + '<p class="ov-hint">Tap the grass to build. Tap a turret again to upgrade it.</p>'
      + '</div>';
    overlay.classList.add('show');
    var go = document.getElementById('ovGo');
    if (go) {
      go.addEventListener('click', function () {
        overlay.classList.remove('show');
        restart();
      });
    }
  }

  function restart() {
    state.gold = 130;
    state.lives = 20;
    state.wave = 0;
    state.score = 0;
    state.phase = 'ready';
    enemies = [];
    turrets = [];
    bullets = [];
    sparks = [];
    spawnQueue = [];
    spawnTimer = 0;
    refreshHud();
    beep(660, 0.12, 'triangle', 0.05);
  }

  function pickType(name) {
    state.selected = name;
    var buttons = document.querySelectorAll('[data-turret]');
    var i = 0;
    while (i < buttons.length) {
      buttons[i].classList.toggle('on', buttons[i].getAttribute('data-turret') === name);
      i = i + 1;
    }
  }

  var typeButtons = document.querySelectorAll('[data-turret]');
  var b = 0;
  while (b < typeButtons.length) {
    (function (button) {
      button.addEventListener('click', function () {
        pickType(button.getAttribute('data-turret'));
        beep(700, 0.05, 'square', 0.03);
      });
    })(typeButtons[b]);
    b = b + 1;
  }

  if (waveButton) {
    waveButton.addEventListener('click', startWave);
  }

  var speedButton = document.getElementById('gameSpeed');
  if (speedButton) {
    speedButton.addEventListener('click', function () {
      state.speed = state.speed === 1 ? 2 : 1;
      speedButton.textContent = state.speed === 1 ? '1x speed' : '2x speed';
      speedButton.classList.toggle('on', state.speed === 2);
    });
  }

  var muteButton = document.getElementById('gameMute');
  if (muteButton) {
    muteButton.addEventListener('click', function () {
      state.muted = state.muted === false;
      muteButton.textContent = state.muted ? 'Sound off' : 'Sound on';
      muteButton.classList.toggle('on', state.muted);
    });
  }

  /* ---------- pointer input ---------- */

  function pointerPosition(event) {
    var box = canvas.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  }

  canvas.addEventListener('pointerdown', function (event) {
    if (state.phase === 'over') {
      return;
    }
    var spot = pointerPosition(event);
    var cell = screenToGrid(spot.x, spot.y);
    placeTurret(cell.x, cell.y);
  });

  canvas.addEventListener('pointermove', function (event) {
    var spot = pointerPosition(event);
    state.hover = screenToGrid(spot.x, spot.y);
  });

  canvas.addEventListener('pointerleave', function () {
    state.hover = null;
  });

  /* ---------- go ---------- */

  resize();
  pickType('cannon');
  refreshHud();
  showOverlay('start');
  requestAnimationFrame(frame);
})();
