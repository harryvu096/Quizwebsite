/* Arrowlane — original tap-away puzzle. Same rules as the genre, original boards. */
(function () {
  const Lane = window.Lane;
  const LEVELS = window.LANE_LEVELS || [];
  const SAVE_KEY = "arrowlane_v1";
  const COL = {
    arrow: "#5cd2e6",
    gold: "#ffc53d",
    bad: "#ff5d73",
    dot: "rgba(92, 102, 184, 0.9)"
  };

  function loadSave() {
    const base = { unlocked: 1, stars: {}, sfx: true, vib: true, lastDaily: "", helpSeen: false };
    try {
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
      if (raw && typeof raw === "object") return Object.assign(base, raw);
    } catch (e) {}
    return base;
  }
  let S = loadSave();
  function persist() { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); }

  let play = null;
  let token = 0;
  let raf = 0;
  let audioCtx = null;
  let toastTimer = 0;
  const pointers = new Map();
  let gesture = null;

  function $(id) { return document.getElementById(id); }
  function show(id) {
    document.querySelectorAll(".screen").forEach(function (s) { s.classList.remove("active"); });
    closeSheets();
    const el = $(id);
    if (el) el.classList.add("active");
    if (id === "screen-play") startLoop();
    else stopLoop();
  }
  function openSheet(id) { $(id).classList.add("open"); }
  function closeSheets() {
    document.querySelectorAll(".sheet").forEach(function (s) { s.classList.remove("open"); });
  }
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 1400);
  }
  function buzz(pattern) {
    if (!S.vib || !navigator.vibrate) return;
    navigator.vibrate(pattern || 12);
  }
  function ac() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }
  function tone(freq, dur, type, vol, delay) {
    if (!S.sfx) return;
    try {
      const ctx = ac();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      const t0 = ctx.currentTime + (delay || 0);
      g.gain.setValueAtTime(vol || 0.06, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    } catch (e) {}
  }
  function sfx(name) {
    if (name === "go") { tone(520, 0.07, "triangle", 0.06); tone(760, 0.09, "sine", 0.04, 0.04); }
    else if (name === "bad") tone(110, 0.16, "sine", 0.05);
    else if (name === "win") [523, 659, 784].forEach(function (f, i) { tone(f, 0.14, "triangle", 0.06, i * 0.08); });
    else if (name === "hint") tone(640, 0.08, "sine", 0.04);
    else tone(240, 0.04, "triangle", 0.03);
  }
  function todayKey() {
    const d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }
  function clearedCount() {
    return Object.keys(S.stars || {}).length;
  }

  function cloneArrows(arrows) {
    return arrows.map(function (a) {
      return { id: a.id, dir: a.dir, cells: a.cells.map(function (c) { return [c[0], c[1]]; }) };
    });
  }

  function renderHome() {
    $("btnPlay").textContent = "Play  ·  Level " + Math.min(S.unlocked, LEVELS.length);
    $("homeProgress").textContent = clearedCount() + " / " + LEVELS.length + " cleared";
    $("btnDaily").textContent = S.lastDaily === todayKey() ? "Daily done" : "Daily";
    requestAnimationFrame(drawHome);
  }

  function drawHome() {
    const canvas = $("homeArt");
    const level = LEVELS[1] || LEVELS[0];
    if (!canvas || !level) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 20) {
      if ($("screen-home").classList.contains("active")) requestAnimationFrame(drawHome);
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    const g = fitGeom(rect.width, rect.height, level.w, level.h);
    drawDots(ctx, g, level.w, level.h);
    level.arrows.forEach(function (a) { drawArrow(ctx, a, g, COL.arrow, 0); });
  }

  function startLevel(lv, daily) {
    let source = null;
    if (daily) {
      try { source = window.LaneGen.daily(new Date()); }
      catch (e) { source = null; }
      if (!source || !source.arrows || !source.arrows.length) return toast("Daily board failed");
    } else {
      source = LEVELS[lv - 1];
      if (!source) return toast("Level missing");
    }
    token += 1;
    const arrows = cloneArrows(source.arrows);
    play = {
      token: token,
      daily: !!daily,
      level: source,
      arrows: arrows,
      hearts: 3,
      hints: source.label === "Normal" || source.tutorial ? 2 : 3,
      hintId: null,
      teachId: source.lv === 1 ? Lane.hint(arrows, source.w, source.h) : null,
      gridOn: false,
      history: [],
      ghosts: [],
      flash: null,
      pressed: null,
      phase: "play",
      coachOn: !!source.coach,
      view: { scale: 1, x: 0, y: 0 }
    };
    show("screen-play");
    updateHud();
    sfx("tap");
  }

  function updateHud() {
    if (!play) return;
    const level = play.level;
    const titles = { 1: "Clear<br>the Board", 2: "Tap Away<br>Arrows", 3: "Find a<br>Free Path" };
    const wrap = $("titleWrap");
    if (titles[level.lv] && !play.daily) {
      wrap.hidden = false;
      $("playTitle").innerHTML = titles[level.lv];
    } else {
      wrap.hidden = true;
    }
    $("playSub").textContent = play.daily ? "Daily" : "Level " + level.lv;
    $("arrowCount").textContent = String(play.arrows.length);
    $("diffPill").textContent = level.label || "Normal";
    $("diffPill").className = "pill " + (level.label || "").split(" ")[0];
    const hearts = $("hearts");
    hearts.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const heart = document.createElement("i");
      if (i >= play.hearts) heart.className = "off";
      hearts.appendChild(heart);
    }
    $("hintCount").textContent = String(play.hints);
    $("btnUndo").disabled = play.history.length === 0 || play.phase !== "play";
    $("btnGrid").classList.toggle("on", play.gridOn);
    const coach = $("coach");
    if (play.coachOn && level.coach) {
      coach.hidden = false;
      coach.textContent = level.coach;
    } else {
      coach.hidden = true;
    }
  }

  function fitGeom(cssW, cssH, w, h) {
    const margin = 16;
    const cell = Math.min((cssW - margin * 2) / (w + 1.55), (cssH - margin * 2) / (h + 1.55));
    const boardW = (w - 1) * cell;
    const boardH = (h - 1) * cell;
    return {
      cssW: cssW,
      cssH: cssH,
      cell: cell,
      ox: (cssW - boardW) / 2,
      oy: (cssH - boardH) / 2,
      stroke: Math.max(5, cell * 0.30)
    };
  }

  function currentGeom() {
    const canvas = $("board");
    const rect = canvas.getBoundingClientRect();
    return fitGeom(rect.width, rect.height, play.level.w, play.level.h);
  }

  function drawDots(ctx, g, w, h) {
    ctx.fillStyle = COL.dot;
    const r = Math.max(1.3, g.cell * 0.055);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        ctx.beginPath();
        ctx.arc(g.ox + x * g.cell, g.oy + y * g.cell, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawArrow(ctx, arrow, g, color, offset) {
    const d = Lane.DIRS[arrow.dir];
    const off = offset || 0;
    const pts = arrow.cells.map(function (c) {
      return [g.ox + c[0] * g.cell + d.x * off, g.oy + c[1] * g.cell + d.y * off];
    });
    let shaft = pts;
    if (pts.length === 1) {
      shaft = [[pts[0][0] - d.x * g.cell * 0.38, pts[0][1] - d.y * g.cell * 0.38], pts[0]];
    }
    const stroke = g.stroke;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = stroke;
    ctx.lineJoin = "round";
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.moveTo(shaft[0][0], shaft[0][1]);
    for (let i = 1; i < shaft.length; i++) ctx.lineTo(shaft[i][0], shaft[i][1]);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(shaft[0][0], shaft[0][1], stroke / 2, 0, Math.PI * 2);
    ctx.fill();
    const head = shaft[shaft.length - 1];
    const tipLen = stroke * 1.42;
    const hw = stroke * 0.78;
    const tip = [head[0] + d.x * tipLen, head[1] + d.y * tipLen];
    const bx = head[0] - d.x * 1.8;
    const by = head[1] - d.y * 1.8;
    const px = -d.y;
    const py = d.x;
    ctx.beginPath();
    ctx.moveTo(tip[0], tip[1]);
    ctx.lineTo(bx + px * hw, by + py * hw);
    ctx.lineTo(bx - px * hw, by - py * hw);
    ctx.closePath();
    ctx.fill();
  }

  function cellPoint(c, g) {
    return [g.ox + c[0] * g.cell, g.oy + c[1] * g.cell];
  }

  function drawRay(ctx, arrow, g, color, stopAt) {
    const d = Lane.DIRS[arrow.dir];
    const head = cellPoint(Lane.headOf(arrow), g);
    let end;
    if (stopAt) end = cellPoint([stopAt.x, stopAt.y], g);
    else {
      const cells = Lane.rayCells(arrow, play.level.w, play.level.h);
      end = cells.length ? cellPoint(cells[cells.length - 1], g) : [head[0] + d.x * g.cell * 0.85, head[1] + d.y * g.cell * 0.85];
    }
    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = Math.max(1.5, g.stroke * 0.18);
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(head[0] + d.x * g.cell * 0.5, head[1] + d.y * g.cell * 0.5);
    ctx.lineTo(end[0], end[1]);
    ctx.stroke();
    ctx.restore();
  }

  function arrowStyle(arrow, now) {
    if (play.flash && play.flash.id === arrow.id && now < play.flash.until) return "bad";
    if (play.pressed === arrow.id || play.hintId === arrow.id) return "hot";
    if (play.teachId && play.teachId === arrow.id) return "hot";
    return "idle";
  }

  function draw() {
    if (!play) return;
    const canvas = $("board");
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 20 || rect.height < 20) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const wantW = Math.floor(rect.width * dpr);
    const wantH = Math.floor(rect.height * dpr);
    if (canvas.width !== wantW || canvas.height !== wantH) {
      canvas.width = wantW;
      canvas.height = wantH;
    }
    const ctx = canvas.getContext("2d");
    const g = fitGeom(rect.width, rect.height, play.level.w, play.level.h);
    play.geom = g;
    const now = performance.now();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.save();
    ctx.translate(rect.width / 2 + play.view.x, rect.height / 2 + play.view.y);
    ctx.scale(play.view.scale, play.view.scale);
    ctx.translate(-rect.width / 2, -rect.height / 2);
    drawDots(ctx, g, play.level.w, play.level.h);

    if (play.gridOn) {
      play.arrows.forEach(function (arrow) {
        const blocked = Lane.blocker(arrow, Lane.occupy(play.arrows), play.level.w, play.level.h);
        drawRay(ctx, arrow, g, blocked ? "rgba(255,93,115,0.75)" : "rgba(62,212,238,0.45)", blocked);
      });
    }
    if (play.pressed) {
      const pressed = play.arrows.find(function (a) { return a.id === play.pressed; });
      if (pressed) {
        const blocked = Lane.blocker(pressed, Lane.occupy(play.arrows), play.level.w, play.level.h);
        drawRay(ctx, pressed, g, blocked ? COL.bad : COL.gold, blocked);
      }
    }
    if (play.flash && now < play.flash.until) {
      const flashed = play.arrows.find(function (a) { return a.id === play.flash.id; });
      if (flashed) drawRay(ctx, flashed, g, COL.bad, play.flash.blocked);
    }

    play.arrows.forEach(function (arrow) {
      const style = arrowStyle(arrow, now);
      const color = style === "bad" ? COL.bad : style === "hot" ? COL.gold : COL.arrow;
      if (style === "hot") {
        ctx.save();
        ctx.shadowColor = "rgba(255,197,61,0.85)";
        ctx.shadowBlur = 12 + Math.sin(now / 160) * 4;
        drawArrow(ctx, arrow, g, color, 0);
        ctx.restore();
      } else if (style === "bad") {
        const shake = Math.sin(now / 28) * 2.4;
        const d = Lane.DIRS[arrow.dir];
        ctx.save();
        ctx.translate(-d.y * shake, d.x * shake);
        drawArrow(ctx, arrow, g, color, 0);
        ctx.restore();
      } else {
        drawArrow(ctx, arrow, g, color, 0);
      }
    });

    play.ghosts = play.ghosts.filter(function (ghost) {
      const p = (now - ghost.t0) / ghost.dur;
      if (p >= 1) return false;
      const d = Lane.DIRS[ghost.arrow.dir];
      const travel = (Math.max(play.level.w, play.level.h) + 2) * g.cell;
      ctx.save();
      ctx.globalAlpha = 1 - p * 0.85;
      drawArrow(ctx, ghost.arrow, g, COL.arrow, p * p * travel);
      ctx.restore();
      return true;
    });
    ctx.restore();
  }

  function startLoop() {
    if (raf) return;
    const tick = function () {
      draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  function stopLoop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function boardPoint(clientX, clientY) {
    const rect = $("board").getBoundingClientRect();
    let x = clientX - rect.left;
    let y = clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    x = (x - cx - play.view.x) / play.view.scale + cx;
    y = (y - cy - play.view.y) / play.view.scale + cy;
    return { x: x, y: y };
  }

  function distToSeg(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const l2 = dx * dx + dy * dy || 1;
    let t = ((px - ax) * dx + (py - ay) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    const qx = ax + t * dx;
    const qy = ay + t * dy;
    return Math.hypot(px - qx, py - qy);
  }

  function pickArrow(clientX, clientY) {
    if (!play) return null;
    const g = play.geom || currentGeom();
    const p = boardPoint(clientX, clientY);
    const threshold = g.stroke * 0.72 + 16 / play.view.scale;
    let best = null;
    let bestD = threshold;
    play.arrows.forEach(function (arrow) {
      const pts = arrow.cells.map(function (c) { return cellPoint(c, g); });
      const d = Lane.DIRS[arrow.dir];
      const head = pts[pts.length - 1];
      pts.push([head[0] + d.x * g.cell * 0.42, head[1] + d.y * g.cell * 0.42]);
      for (let i = 1; i < pts.length; i++) {
        const dist = distToSeg(p.x, p.y, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]);
        if (dist < bestD) {
          bestD = dist;
          best = arrow.id;
        }
      }
    });
    return best;
  }

  function blockedInfo(arrow) {
    return Lane.blocker(arrow, Lane.occupy(play.arrows), play.level.w, play.level.h);
  }

  function commit(id, held) {
    if (!play || play.phase !== "play") return;
    const arrow = play.arrows.find(function (a) { return a.id === id; });
    play.pressed = null;
    if (!arrow) return;
    const blocked = blockedInfo(arrow);
    if (blocked || Lane.selfBlocks(arrow, play.level.w, play.level.h)) {
      if (held) {
        toast("Cancelled");
        draw();
        return;
      }
      wrong(arrow, blocked);
      return;
    }
    const my = play.token;
    play.history.push(cloneArrows(play.arrows));
    play.arrows = play.arrows.filter(function (a) { return a.id !== id; });
    const ray = Lane.rayCells(arrow, play.level.w, play.level.h).length;
    play.ghosts.push({ arrow: arrow, t0: performance.now(), dur: 260 + ray * 26 });
    play.hintId = null;
    play.teachId = null;
    play.gridOn = false;
    play.coachOn = false;
    sfx("go");
    buzz(10);
    updateHud();
    if (!play.arrows.length) {
      play.phase = "clearing";
      setTimeout(function () { if (play && play.token === my) win(); }, 380);
    }
  }

  function wrong(arrow, blocked) {
    const my = play.token;
    play.flash = { id: arrow.id, until: performance.now() + 680, blocked: blocked };
    sfx("bad");
    buzz([16, 36, 18]);
    if (play.level.lv === 1) {
      toast("Blocked. Clear the arrow in front.");
      updateHud();
      return;
    }
    play.hearts -= 1;
    updateHud();
    if (play.hearts <= 0) {
      play.phase = "failing";
      setTimeout(function () { if (play && play.token === my) lose(); }, 480);
    } else {
      toast("Blocked  ·  " + play.hearts + " left");
    }
  }

  function useHint() {
    if (!play || play.phase !== "play") return;
    if (play.hints <= 0) return toast("No hints left");
    const id = Lane.hint(play.arrows, play.level.w, play.level.h);
    if (!id) return;
    play.hints -= 1;
    play.hintId = id;
    sfx("hint");
    updateHud();
  }

  function undo() {
    if (!play || play.phase !== "play" || !play.history.length) return;
    play.arrows = play.history.pop();
    play.ghosts = [];
    play.hintId = null;
    sfx("tap");
    updateHud();
  }

  function win() {
    if (!play || play.phase === "win") return;
    play.phase = "win";
    const stars = Math.max(1, play.hearts);
    if (!play.daily) {
      const lv = play.level.lv;
      if (!S.stars[lv] || S.stars[lv] < stars) S.stars[lv] = stars;
      if (lv < LEVELS.length && S.unlocked < lv + 1) S.unlocked = lv + 1;
    } else {
      S.lastDaily = todayKey();
    }
    persist();
    sfx("win");
    $("winKicker").textContent = play.daily ? "Daily clear" : "Board clear";
    $("winTitle").textContent = play.daily ? "Today" : "Level " + play.level.lv;
    $("winSub").textContent = stars === 3 ? "No mistakes." : "Cleaner next time.";
    const box = $("winStars");
    box.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const s = document.createElement("span");
      s.textContent = i < stars ? "★" : "☆";
      box.appendChild(s);
      setTimeout(function () { s.classList.add("in"); }, 70 + i * 110);
    }
    const last = !play.daily && play.level.lv >= LEVELS.length;
    $("btnNext").textContent = play.daily || last ? "Home" : "Next";
    openSheet("sheet-win");
  }

  function lose() {
    if (!play || play.phase === "lose" || play.phase === "win") return;
    play.phase = "lose";
    openSheet("sheet-lose");
  }

  function openMap() {
    show("screen-map");
    const scroll = $("mapScroll");
    scroll.innerHTML = "";
    const names = ["First Lanes", "Crossings", "Long Roads", "Tight Boards", "Deep Lanes"];
    const size = 40;
    let chapter = 0;
    for (let start = 1; start <= LEVELS.length; start += size) {
      const end = Math.min(LEVELS.length, start + size - 1);
      const title = document.createElement("p");
      title.className = "chapter";
      title.textContent = names[chapter] || "Set " + (chapter + 1);
      chapter += 1;
      scroll.appendChild(title);
      const grid = document.createElement("div");
      grid.className = "map-grid";
      for (let lv = start; lv <= end; lv++) {
        const btn = document.createElement("button");
        const locked = lv > S.unlocked;
        const stars = S.stars[lv] || 0;
        btn.className = "lvl" + (locked ? " locked" : "") + (lv === S.unlocked ? " current" : "") + (stars ? " done" : "");
        btn.innerHTML = lv + (stars ? "<small>" + "★".repeat(stars) + "</small>" : "");
        if (!locked) btn.onclick = function () { startLevel(lv, false); };
        grid.appendChild(btn);
      }
      scroll.appendChild(grid);
    }
    const current = scroll.querySelector(".current");
    if (current) current.scrollIntoView({ block: "center" });
  }

  function openSettings() {
    $("setSfx").checked = S.sfx !== false;
    $("setVib").checked = S.vib !== false;
    $("setRestart").style.display = play && $("screen-play").classList.contains("active") ? "" : "none";
    openSheet("sheet-settings");
  }

  function clampPan() {
    if (!play || !play.geom) return;
    const limitX = play.geom.cssW * 0.42 * play.view.scale;
    const limitY = play.geom.cssH * 0.42 * play.view.scale;
    play.view.x = Math.max(-limitX, Math.min(limitX, play.view.x));
    play.view.y = Math.max(-limitY, Math.min(limitY, play.view.y));
  }

  function pinchDist() {
    const pts = Array.from(pointers.values());
    if (pts.length < 2) return 1;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
  }

  function onDown(e) {
    if (!play || play.phase === "win" || play.phase === "lose") return;
    try { $("board").setPointerCapture(e.pointerId); } catch (err) {}
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size >= 2) {
      gesture = { mode: "pinch", dist: pinchDist(), scale: play.view.scale };
      play.pressed = null;
      return;
    }
    const hit = pickArrow(e.clientX, e.clientY);
    gesture = { mode: "down", x: e.clientX, y: e.clientY, t: performance.now(), hit: hit, moved: false };
    play.pressed = hit;
  }

  function onMove(e) {
    const prev = pointers.get(e.pointerId);
    if (!prev || !play) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    prev.x = e.clientX;
    prev.y = e.clientY;
    if (pointers.size >= 2) {
      if (!gesture || gesture.mode !== "pinch") gesture = { mode: "pinch", dist: pinchDist(), scale: play.view.scale };
      play.view.scale = Math.max(1, Math.min(2.8, gesture.scale * (pinchDist() / gesture.dist)));
      if (play.view.scale === 1) { play.view.x = 0; play.view.y = 0; }
      return;
    }
    if (!gesture || gesture.mode === "pinch") return;
    if (Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) > 18) {
      gesture.moved = true;
      play.pressed = null;
      if (play.view.scale > 1.02) gesture.mode = "pan";
    }
    if (gesture.mode === "pan") {
      play.view.x += dx;
      play.view.y += dy;
      clampPan();
    }
  }

  function onUp(e) {
    pointers.delete(e.pointerId);
    if (pointers.size > 0) return;
    const g = gesture;
    gesture = null;
    if (!play || !g) return;
    if (g.mode === "pinch") return;
    const held = performance.now() - g.t > 260;
    if (!g.moved && g.hit && play.phase === "play") commit(g.hit, held && !!blockedIf(g.hit));
    else play.pressed = null;
  }

  function blockedIf(id) {
    const arrow = play && play.arrows.find(function (a) { return a.id === id; });
    if (!arrow) return false;
    return !!blockedInfo(arrow);
  }

  function goHome() {
    openMap();
  }

  function boot() {
    $("btnGear").innerHTML = "";
    $("btnPlay").onclick = function () { startLevel(Math.min(S.unlocked, LEVELS.length), false); };
    $("btnDaily").onclick = function () {
      if (S.lastDaily === todayKey()) return toast("Daily already clear");
      startLevel(0, true);
    };
    $("btnLevels").onclick = openMap;
    $("btnHelpHome").onclick = function () { openSheet("sheet-help"); };
    $("btnGearHome").onclick = openSettings;
    $("btnGear").onclick = openSettings;
    $("btnBack").onclick = goHome;
    $("mapBack").onclick = goHome;
    $("btnHint").onclick = useHint;
    $("btnUndo").onclick = undo;
    $("btnGrid").onclick = function () {
      if (!play || play.phase !== "play") return;
      play.gridOn = !play.gridOn;
      updateHud();
    };
    $("btnNext").onclick = function () {
      if (!play) return goHome();
      if (play.daily || play.level.lv >= LEVELS.length) return goHome();
      startLevel(play.level.lv + 1, false);
    };
    $("btnWinMap").onclick = openMap;
    $("btnRetry").onclick = function () {
      if (!play) return;
      startLevel(play.daily ? 0 : play.level.lv, play.daily);
    };
    $("btnLoseMap").onclick = openMap;
    $("setClose").onclick = closeSheets;
    $("helpClose").onclick = function () {
      const first = !S.helpSeen && !clearedCount();
      S.helpSeen = true;
      persist();
      closeSheets();
      if (first) startLevel(1, false);
    };
    $("setSfx").onchange = function (e) { S.sfx = e.target.checked; persist(); };
    $("setVib").onchange = function (e) { S.vib = e.target.checked; persist(); };
    $("setRestart").onclick = function () {
      if (!play) return;
      startLevel(play.daily ? 0 : play.level.lv, play.daily);
    };
    $("setHelp").onclick = function () { closeSheets(); openSheet("sheet-help"); };
    $("setHome").onclick = goHome;
    const board = $("board");
    board.addEventListener("pointerdown", onDown);
    board.addEventListener("pointermove", onMove);
    board.addEventListener("pointerup", onUp);
    board.addEventListener("pointercancel", onUp);
    board.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    document.addEventListener("pointerdown", function () { if (S.sfx) ac(); }, { once: true });
    window.addEventListener("resize", function () {
      if ($("screen-home").classList.contains("active")) drawHome();
    });
    window.addEventListener("popstate", function () {
      if (document.querySelector(".sheet.open")) { closeSheets(); history.pushState({ lane: 1 }, ""); return; }
      if ($("screen-play").classList.contains("active") || $("screen-map").classList.contains("active")) goHome();
      history.pushState({ lane: 1 }, "");
    });
    history.pushState({ lane: 1 }, "");
    startLevel(Math.min(S.unlocked || 1, LEVELS.length), false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
