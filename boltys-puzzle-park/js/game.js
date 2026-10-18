/* Bolty's Lantern Park — one scene at a time, pieces are real sprites. */
(function () {
  const L = window.BoltyLogic;
  const LEVELS = window.BOLTY_LEVELS;
  const SAVE_KEY = "bolty_park_v2";
  const TOTAL = { screw: 50, sort: 30, arrow: 30 };
  const THEMES = [
    { id: "park", name: "Lantern Night", price: 0, colors: ["#140e22", "#f5c15a", "#7ee0c8"] },
    { id: "night", name: "Deep Indigo", price: 180, colors: ["#07060d", "#7c5cff", "#f5c15a"] },
    { id: "sunset", name: "Marigold Dusk", price: 260, colors: ["#3a1d12", "#e85d4c", "#ffb703"] }
  ];

  function freshSave() {
    return {
      coins: 250, gems: 3, hearts: 5, xp: 0, theme: "park",
      music: false, sfx: true, vib: true, streak: 0, lastDaily: "",
      owned: ["park"],
      screw: { unlocked: 1, stars: {}, cur: 1, paid: true },
      sort: { unlocked: 1, stars: {}, cur: 1, paid: false },
      arrow: { unlocked: 1, stars: {}, cur: 1, paid: false }
    };
  }
  let S = freshSave();
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (raw && raw.screw) S = Object.assign(freshSave(), raw);
  } catch (e) {}

  let session = null;
  let selectedPlate = null;
  let audioCtx = null;
  let musicTimer = null;

  function save() { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); paintCurrencies(); }
  function $(id) { return document.getElementById(id); }
  function cfg(world, lv) {
    const list = LEVELS && LEVELS[world];
    const found = list && list.find((x) => x.lv === lv);
    if (found) return found;
    if (world === "screw") return { lv: lv, colors: 2, boxes: 2, screwsPerBox: 2, slots: 3, time: 80, boss: lv % 10 === 0 };
    if (world === "sort") return { lv: lv, colors: 3, speed: "slow", time: 60, boss: lv % 10 === 0 };
    return { lv: lv, size: 5, time: 60, boss: lv % 10 === 0 };
  }
  function cleared(world) { return Object.keys((S[world] && S[world].stars) || {}).length; }
  function worldOpen(world) {
    if (world === "screw") return true;
    if (S[world].paid) return true;
    const n = cleared("screw");
    return world === "sort" ? n >= 10 : n >= 20;
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    document.querySelectorAll(".modal-bg").forEach((m) => m.classList.remove("open"));
    const el = $(id);
    if (el) el.classList.add("active");
    $("app").dataset.screen = id;
  }
  function openModal(id) { $(id).classList.add("open"); }
  function closeModal(id) { $(id).classList.remove("open"); }
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 1700);
  }
  function buzz(ms) { if (S.vib && navigator.vibrate) navigator.vibrate(ms || 16); }
  function ac() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }
  function tone(freq, dur, type, vol, delay, force) {
    if (!force && !S.sfx) return;
    try {
      const ctx = ac();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      o.connect(g); g.connect(ctx.destination);
      const t0 = ctx.currentTime + (delay || 0);
      g.gain.setValueAtTime(vol || 0.07, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.start(t0); o.stop(t0 + dur + 0.02);
    } catch (e) {}
  }
  function sfx(name) {
    if (name === "tap") tone(220, 0.04, "triangle", 0.05);
    else if (name === "lock") {
      tone(196, 0.08, "sine", 0.08);
      tone(392, 0.12, "triangle", 0.07, 0.05);
      tone(588, 0.16, "sine", 0.06, 0.1);
    } else if (name === "bad") tone(110, 0.16, "square", 0.04);
    else if (name === "win") [392, 494, 587, 784].forEach((f, i) => tone(f, 0.14, "triangle", 0.07, i * 0.08));
    else if (name === "lose") { tone(247, 0.16, "triangle", 0.05); tone(165, 0.28, "sine", 0.05, 0.1); }
    else if (name === "go") tone(330, 0.07, "triangle", 0.05);
  }
  function startMusic() {
    if (!S.music || musicTimer) return;
    const notes = [196, 247, 294, 370, 294, 247];
    let i = 0;
    musicTimer = setInterval(() => {
      if (!S.music) return;
      tone(notes[i % notes.length], 0.28, "sine", 0.02, 0, true);
      i++;
    }, 760);
  }
  function stopMusic() { clearInterval(musicTimer); musicTimer = null; }

  function burst(x, y, n) {
    const canvas = $("fx");
    const ctx = canvas.getContext("2d");
    const app = $("app").getBoundingClientRect();
    canvas.width = app.width; canvas.height = app.height;
    const pieces = [];
    const colors = ["#f5c15a", "#fff6d2", "#7ee0c8", "#ffb4a2", "#fff"];
    for (let i = 0; i < (n || 26); i++) {
      pieces.push({
        x: (x != null ? x - app.left : app.width / 2),
        y: (y != null ? y - app.top : app.height * 0.35),
        vx: (Math.random() - 0.5) * 7,
        vy: Math.random() * -6 - 1,
        r: Math.random() * 3.5 + 1.5,
        c: colors[i % colors.length],
        life: 36 + Math.random() * 14
      });
    }
    let f = 0;
    const id = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.22; p.life--;
        ctx.globalAlpha = Math.max(0, p.life / 46);
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (++f > 48) { clearInterval(id); ctx.clearRect(0, 0, canvas.width, canvas.height); }
    }, 16);
  }
  function floatAt(el, text) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const app = $("app").getBoundingClientRect();
    const d = document.createElement("div");
    d.className = "float";
    d.textContent = text;
    d.style.left = (r.left - app.left + r.width / 2) + "px";
    d.style.top = (r.top - app.top) + "px";
    $("app").appendChild(d);
    setTimeout(() => d.remove(), 700);
  }
  function shake(el) {
    if (!el) return;
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
  }
  function fly(fromEl, toEl, src) {
    if (!fromEl || !toEl) return;
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const app = $("app").getBoundingClientRect();
    const img = document.createElement("img");
    img.className = "flyer";
    img.src = src;
    img.style.width = a.width + "px";
    img.style.height = a.height + "px";
    img.style.left = (a.left - app.left) + "px";
    img.style.top = (a.top - app.top) + "px";
    $("app").appendChild(img);
    requestAnimationFrame(() => {
      img.style.left = (b.left - app.left) + "px";
      img.style.top = (b.top - app.top) + "px";
      img.style.transform = "rotate(160deg) scale(.72)";
    });
    setTimeout(() => img.remove(), 380);
  }
  function screwSrc(color) { return "assets/ui/screw-" + color + ".png"; }
  function hearts(n) { return "●".repeat(Math.max(0, n)) + "○".repeat(Math.max(0, 3 - n)); }
  function fmt(sec) {
    sec = Math.max(0, sec | 0);
    return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");
  }
  function lanternHTML(color, selected) {
    const hex = L.colorById(color).hex;
    return `<span class="lantern ${color}${selected ? " selected" : ""}" style="--c:${hex}"><i class="ring"></i><i class="cap"></i><i class="glass"></i></span>`;
  }

  function paintCurrencies() {
    ["hubCoins", "mapCoins", "screwCoins", "shopCoins"].forEach((id) => { if ($(id)) $(id).textContent = S.coins; });
    if ($("hubGems")) $("hubGems").textContent = S.gems;
    if ($("hubHearts")) $("hubHearts").textContent = S.hearts;
    document.documentElement.dataset.theme = S.theme || "park";
  }
  function renderHub() {
    paintCurrencies();
    const today = new Date().toDateString();
    $("dailyInfo").textContent = S.lastDaily === today ? "Claimed. The park sleeps until tomorrow." : "A coin purse is waiting.";
    $("streakRow").innerHTML = "";
    for (let i = 1; i <= 7; i++) {
      const d = document.createElement("div");
      d.className = "lvl";
      d.style.width = "28px"; d.style.height = "28px"; d.style.boxShadow = "none";
      d.style.transform = "none";
      d.textContent = i <= S.streak ? "✓" : "";
      if (i > S.streak) d.style.opacity = ".35";
      $("streakRow").appendChild(d);
    }
    $("streakRow").style.display = "flex";
    $("streakRow").style.gap = "6px";
    $("streakRow").style.margin = "0 0 8px";
    [["screw", "progScrew", "progScrewText"], ["sort", "progSort", "progSortText"], ["arrow", "progArrow", "progArrowText"]].forEach(([w, bar, label]) => {
      const n = cleared(w);
      $(bar).style.width = (n / TOTAL[w]) * 100 + "%";
      $(label).textContent = n + " / " + TOTAL[w];
    });
    const sortOpen = worldOpen("sort");
    const arrowOpen = worldOpen("arrow");
    $("cardSort").classList.toggle("locked", !sortOpen);
    $("cardArrow").classList.toggle("locked", !arrowOpen);
    $("pillSort").textContent = sortOpen ? "Play" : "Lock";
    $("pillArrow").textContent = arrowOpen ? "Play" : "Lock";
    $("badgeSort").textContent = sortOpen ? "" : "Clear 10 screw nights, or 200 coins";
    $("badgeArrow").textContent = arrowOpen ? "" : "Clear 20 screw nights, or 400 coins";
  }

  function openMap(world) {
    if (!worldOpen(world)) {
      const price = world === "sort" ? 200 : 400;
      const need = world === "sort" ? 10 : 20;
      $("lockTitle").textContent = world === "sort" ? "Lantern Sort is dark" : "The garden gate is shut";
      $("lockMsg").textContent = "Finish Screw night " + need + ", or open it now for " + price + " coins.";
      $("lockPay").textContent = "Open · " + price;
      $("lockPay").onclick = () => {
        if (S.coins < price) return toast("Not enough coins");
        S.coins -= price;
        S[world].paid = true;
        save();
        closeModal("modal-lock");
        openMap(world);
      };
      openModal("modal-lock");
      return;
    }
    showScreen("screen-map");
    $("mapTitle").textContent = { screw: "Screw Rescue", sort: "Lantern Sort", arrow: "Arrow Garden" }[world];
    paintCurrencies();
    const grid = $("mapGrid");
    grid.innerHTML = "";
    for (let i = 1; i <= TOTAL[world]; i++) {
      const btn = document.createElement("button");
      const locked = i > S[world].unlocked;
      const stars = S[world].stars[i] || 0;
      btn.className = "lvl" + (locked ? " locked" : "") + (i % 10 === 0 ? " boss" : "") + (i === S[world].cur ? " current" : "") + (stars ? " done" : "");
      btn.innerHTML = locked ? "<b>·</b>" : "<b>" + i + "</b><small>" + (i % 10 === 0 ? "BOSS" : "★".repeat(stars)) + "</small>";
      if (!locked) btn.onclick = () => startGame(world, i);
      grid.appendChild(btn);
    }
    $("btnContinue").onclick = () => startGame(world, Math.min(S[world].cur || 1, S[world].unlocked));
  }

  function stopSession() {
    if (!session) return;
    clearInterval(session.clock);
    session.walkToken = (session.walkToken || 0) + 1;
    session.ended = true;
  }
  function beginSession(world, level, state) {
    stopSession();
    session = {
      world: world, level: level, state: state,
      timeLeft: state.time, hearts: 3, hints: 0, freeHint: true,
      ended: false, paused: false, clock: null, walkToken: 0, walking: false,
      timerId: world === "screw" ? "screwTimer" : world === "sort" ? "sortTimer" : "arrowTimer"
    };
    S[world].cur = level;
    save();
  }
  function startClock() {
    clearInterval(session.clock);
    const el = $(session.timerId);
    const tick = () => { if (el) { el.textContent = fmt(session.timeLeft); el.classList.toggle("warn", session.timeLeft <= 10); } };
    tick();
    session.clock = setInterval(() => {
      if (!session || session.paused || session.ended) return;
      session.timeLeft--;
      tick();
      if (session.timeLeft <= 0) { clearInterval(session.clock); lose("The lamp went out", "Same board. The night will wait."); }
    }, 1000);
  }
  function bossFlash(level) {
    if (level % 10 !== 0) return;
    const el = $("bossFlash");
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 900);
  }
  function startGame(world, level) {
    selectedPlate = null;
    if (world === "screw") startScrew(level);
    else if (world === "sort") startSort(level);
    else startArrow(level);
    bossFlash(level);
    sfx("tap");
  }

  function startScrew(level) {
    const state = L.makeScrew(cfg("screw", level), "screw", level);
    beginSession("screw", level, state);
    showScreen("screen-screw");
    $("screwLevel").textContent = (level % 10 === 0 ? "Boss " : "Night ") + level;
    $("screwGoal").textContent = state.boxes.length + " locks on the bench";
    $("screwHearts").textContent = hearts(session.hearts);
    $("screwCoach").textContent = level === 1 ? "Tap two screws of one color. The lock closes itself." : "Finish one color before you mix the tray.";
    renderScrew();
    startClock();
  }
  function renderScrew() {
    const st = session.state;
    $("screwCoins").textContent = S.coins;
    $("screwHint").textContent = st.slots.filter(Boolean).length + " / " + st.slots.length;
    const locks = $("screwLocks");
    locks.innerHTML = "";
    st.boxes.forEach((box) => {
      const col = L.colorById(box.color);
      const row = document.createElement("div");
      row.className = "lock" + (box.done ? " done" : "");
      let holes = "";
      for (let i = 0; i < box.need; i++) {
        holes += box.done ? `<img class="pip" src="${screwSrc(box.color)}" alt="">` : `<i class="hole" style="border-color:${col.hex}"></i>`;
      }
      row.innerHTML = `<div class="lock-name" style="color:${col.hex}">${col.name}</div><div class="holes">${holes}</div>`;
      locks.appendChild(row);
    });
    const pile = $("screwPile");
    pile.innerHTML = "";
    st.pile.forEach((color, index) => {
      const b = document.createElement("button");
      b.className = "piece pop";
      b.style.transform = "rotate(" + ((index * 17 % 13) - 6) + "deg)";
      b.innerHTML = `<img src="${screwSrc(color)}" alt="">`;
      b.onclick = () => onScrew(index, b);
      pile.appendChild(b);
    });
    const tray = $("screwSlots");
    tray.innerHTML = "";
    st.slots.forEach((color) => {
      const s = document.createElement("div");
      s.className = "slot";
      if (color) s.innerHTML = `<img src="${screwSrc(color)}" alt="">`;
      tray.appendChild(s);
    });
  }
  function onScrew(index, el) {
    if (!session || session.ended || session.world !== "screw") return;
    const color = session.state.pile[index];
    const empty = session.state.slots.findIndex((s) => s == null);
    if (empty === -1) { sfx("bad"); shake($("screen-screw")); toast("Tray is full. Undo."); return; }
    session.undo = L.screwSnap(session.state);
    const res = L.screwTapPile(session.state, index);
    if (!res.ok) { sfx("bad"); return; }
    renderScrew();
    const dest = $("screwSlots").children[empty];
    fly(el, dest, screwSrc(color));
    buzz(10);
    sfx(res.opened.length ? "lock" : "tap");
    if (res.opened.length) {
      const r = el.getBoundingClientRect();
      burst(r.left, r.top, 16);
      floatAt(el, "Shut");
    }
    if (res.won) return setTimeout(win, 280);
    if (res.stuck) {
      shake($("screen-screw"));
      sfx("bad");
      toast("Tray jammed. Undo, then finish one color.");
    }
  }

  function startSort(level) {
    const state = L.makeSort(cfg("sort", level), level);
    state.rng = L.mulberry32(L.hashSeed("sort", level));
    for (let i = 0; i < 4; i++) L.sortSpawn(state, state.rng);
    beginSession("sort", level, state);
    showScreen("screen-sort");
    $("sortLevel").textContent = (level % 10 === 0 ? "Boss " : "Night ") + level;
    $("sortGoal").textContent = "Hang " + state.target + " lanterns";
    $("sortCoach").textContent = "Tap a lantern, then the stall of the same glow.";
    renderSort();
    startClock();
  }
  function renderSort() {
    const st = session.state;
    $("sortScore").textContent = st.served + "/" + st.target;
    $("sortCombo").textContent = st.combo > 1 ? "Combo " + st.combo : "Combo";
    const orders = $("sortOrders");
    orders.innerHTML = "";
    st.colors.forEach((id) => {
      const c = L.colorById(id);
      const d = document.createElement("div");
      d.className = "order";
      d.innerHTML = c.name + `<div style="width:14px;height:14px;border-radius:50%;margin:4px auto 0;background:${c.hex};box-shadow:0 0 8px ${c.hex}"></div>`;
      orders.appendChild(d);
    });
    const tray = $("sortTray");
    tray.innerHTML = "";
    st.tray.forEach((plate) => {
      const b = document.createElement("button");
      b.innerHTML = lanternHTML(plate.color, selectedPlate === plate.id);
      b.onclick = () => { selectedPlate = plate.id; sfx("tap"); renderSort(); };
      tray.appendChild(b);
    });
    const tables = $("sortTables");
    tables.innerHTML = "";
    st.colors.forEach((id) => {
      const c = L.colorById(id);
      const b = document.createElement("button");
      b.className = "table";
      b.innerHTML = `<i class="swatch" style="background:${c.hex};color:${c.hex}"></i>${c.name}`;
      b.onclick = () => servePlate(id, b);
      tables.appendChild(b);
    });
  }
  function servePlate(tableColor, el) {
    if (!session || session.ended || session.world !== "sort") return;
    if (selectedPlate == null) return toast("Tap a lantern first");
    const res = L.sortServe(session.state, selectedPlate, tableColor);
    selectedPlate = null;
    if (!res.ok) {
      session.timeLeft = Math.max(0, session.timeLeft - 4);
      sfx("bad"); shake(el); buzz(28);
      toast("Wrong stall · −4s");
      renderSort();
      return;
    }
    sfx(res.combo > 2 ? "lock" : "tap");
    const r = el.getBoundingClientRect();
    burst(r.left, r.top, 12);
    floatAt(el, res.combo > 1 ? "×" + res.combo : "+1");
    L.sortSpawn(session.state, session.state.rng);
    renderSort();
    if (res.won) win();
  }

  function chevron(dir) {
    return `<svg class="arrow-chev ${dir}" viewBox="0 0 64 64"><path d="M18 40 L32 22 L46 40"/></svg>`;
  }
  function startArrow(level) {
    const state = L.makeArrow(cfg("arrow", level), level);
    beginSession("arrow", level, state);
    showScreen("screen-arrow");
    $("arrowLevel").textContent = (level % 10 === 0 ? "Boss " : "Night ") + level;
    $("arrowGoal").textContent = "Turn the stones, then walk";
    $("arrowHearts").textContent = hearts(session.hearts);
    $("arrowCoach").textContent = level === 1 ? "The road is already true. Press Walk." : "Bolty follows the arrow under his feet.";
    $("btnGo").disabled = false;
    renderArrow();
    startClock();
  }
  function renderArrow() {
    const st = session.state;
    $("arrowWrong").textContent = L.wrongArrows(st) + " off";
    const maze = $("arrowMaze");
    maze.style.gridTemplateColumns = "repeat(" + st.n + ",1fr)";
    maze.style.gap = st.n >= 8 ? "3px" : "5px";
    maze.innerHTML = "";
    for (let y = 0; y < st.n; y++) {
      for (let x = 0; x < st.n; x++) {
        const cell = st.grid[y][x];
        const b = document.createElement("button");
        b.className = "cell " + cell.type;
        b.dataset.x = x; b.dataset.y = y;
        if (cell.type === "wall") b.disabled = true;
        else if (cell.type === "exit") b.innerHTML = `<i class="flag-dot"></i>`;
        else b.innerHTML = chevron(cell.dir);
        if (cell.type !== "wall" && cell.type !== "exit") {
          b.onclick = () => {
            if (!session || session.ended || session.walking) return;
            L.arrowRotate(st, x, y);
            sfx("tap"); buzz(8);
            renderArrow();
          };
        }
        maze.appendChild(b);
      }
    }
    const walker = document.createElement("div");
    walker.className = "walker";
    walker.id = "walker";
    walker.innerHTML = `<img src="assets/ui/bolty.png" alt="">`;
    maze.appendChild(walker);
    requestAnimationFrame(() => moveWalker(0, 0));
  }
  function moveWalker(x, y) {
    const maze = $("arrowMaze");
    const cell = maze.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
    const walker = $("walker");
    if (!cell || !walker) return;
    const mr = maze.getBoundingClientRect();
    const cr = cell.getBoundingClientRect();
    walker.style.width = cr.width + "px";
    walker.style.height = cr.height + "px";
    walker.style.left = (cr.left - mr.left) + "px";
    walker.style.top = (cr.top - mr.top) + "px";
    maze.querySelectorAll(".cell").forEach((c) => c.classList.remove("hot"));
    cell.classList.add("hot");
  }
  function kingGo() {
    if (!session || session.ended || session.world !== "arrow" || session.walking) return;
    const token = ++session.walkToken;
    session.walking = true;
    $("btnGo").disabled = true;
    sfx("go");
    const result = L.arrowWalk(session.state);
    let i = 0;
    const step = () => {
      if (!session || session.walkToken !== token) return;
      const pos = result.steps[i];
      moveWalker(pos.x, pos.y);
      const cell = $("arrowMaze").querySelector(`.cell[data-x="${pos.x}"][data-y="${pos.y}"]`);
      if (!result.ok && i === result.steps.length - 1 && cell) cell.classList.add("bad");
      i++;
      if (i < result.steps.length) { setTimeout(step, 180); return; }
      session.walking = false;
      $("btnGo").disabled = false;
      if (result.ok) { burst(window.innerWidth / 2, window.innerHeight / 2, 32); win(); }
      else {
        session.hearts--;
        $("arrowHearts").textContent = hearts(session.hearts);
        sfx("bad"); shake($("screen-arrow"));
        const why = { loop: "He circled back", edge: "He stepped off the court", wall: "A hedge stopped him", stuck: "That stone has no arrow" }[result.reason] || "Not yet";
        toast(why);
        if (session.hearts <= 0) lose("Bolty stopped", why + ". Turn the road, then walk again.");
      }
    };
    step();
  }

  function starsFor() {
    const ratio = session.timeLeft / session.state.time;
    if (session.hints === 0 && ratio > 0.45) return 3;
    if (ratio > 0.2) return 2;
    return 1;
  }
  function win() {
    if (!session || session.ended) return;
    session.ended = true;
    clearInterval(session.clock);
    const world = session.world, level = session.level, stars = starsFor();
    const boss = level % 10 === 0;
    const coins = 15 + stars * 8 + (boss ? 25 : 0) + Math.floor(session.timeLeft / 4);
    S.coins += coins;
    S.xp += 8 + stars * 4;
    S.hearts = Math.min(5, S.hearts + (stars === 3 ? 1 : 0));
    if (!S[world].stars[level] || S[world].stars[level] < stars) S[world].stars[level] = stars;
    if (S[world].unlocked < level + 1 && level < TOTAL[world]) S[world].unlocked = level + 1;
    S[world].cur = Math.min(TOTAL[world], level + 1);
    save();
    sfx("win");
    burst(window.innerWidth / 2, 160, 42);
    showScreen("screen-win");
    $("winKicker").textContent = boss ? "Boss night done" : "Gate cleared";
    $("winTitle").textContent = "Night " + level;
    $("winCoins").textContent = "+" + coins + " coins";
    $("winSub").textContent = stars === 3 ? "Clean hands. Time left on the lamp." : "The next gate is open.";
    $("xpFill").style.width = (S.xp % 100) + "%";
    $("xpText").textContent = "Park rank " + (Math.floor(S.xp / 100) + 1);
    const box = $("winStars");
    box.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const s = document.createElement("span");
      s.className = "star";
      s.textContent = i < stars ? "★" : "☆";
      box.appendChild(s);
      setTimeout(() => s.classList.add("in"), 80 + i * 120);
    }
    $("btnNext").textContent = level >= TOTAL[world] ? "Park complete" : "Next night";
    $("btnNext").onclick = () => {
      if (level >= TOTAL[world]) { showScreen("screen-hub"); renderHub(); return; }
      startGame(world, level + 1);
    };
  }
  function lose(title, msg) {
    if (!session || session.ended) return;
    session.ended = true;
    clearInterval(session.clock);
    session.walking = false;
    sfx("lose");
    showScreen("screen-lose");
    $("loseTitle").textContent = title || "Not yet";
    $("loseMsg").textContent = msg || "Same board.";
  }
  function revive() {
    if (!session) return;
    if (S.coins < 80) return toast("Need 80 coins");
    S.coins -= 80; save();
    session.ended = false; session.paused = false;
    session.hearts = Math.max(session.hearts, 1);
    session.timeLeft += 25;
    showScreen("screen-" + session.world);
    if (session.world === "screw") renderScrew();
    if (session.world === "sort") renderSort();
    if (session.world === "arrow") { $("btnGo").disabled = false; renderArrow(); $("arrowHearts").textContent = hearts(session.hearts); }
    startClock();
    toast("The lamp is lit again");
  }
  function useHint() {
    if (!session || session.ended) return;
    if (!session.freeHint) {
      if (S.coins < 20) return toast("A hint costs 20 coins");
      S.coins -= 20; save();
    }
    session.freeHint = false;
    session.hints++;
    if (session.world === "screw") {
      const box = session.state.boxes.find((b) => !b.done);
      if (box) { toast("Close " + L.colorById(box.color).name + " next"); $("screwCoach").textContent = "Collect " + box.need + " " + box.color + " screws before mixing."; }
    } else if (session.world === "sort") {
      const plate = session.state.tray[0];
      if (plate) { selectedPlate = plate.id; toast(L.colorById(plate.color).name + " lantern"); renderSort(); }
    } else {
      let flipped = false;
      for (let y = 0; y < session.state.n && !flipped; y++) {
        for (let x = 0; x < session.state.n; x++) {
          const c = session.state.grid[y][x];
          if (c.answer && c.dir !== c.answer) { c.dir = c.answer; flipped = true; toast("One stone turned true"); break; }
        }
      }
      if (!flipped) toast("The road already reaches the arch.");
      renderArrow();
    }
    sfx("lock");
  }
  function claimDaily() {
    const today = new Date().toDateString();
    if (S.lastDaily === today) return toast("Already taken tonight");
    if (S.lastDaily) {
      const diff = (new Date(today) - new Date(new Date(S.lastDaily).toDateString())) / 86400000;
      if (diff > 1) S.streak = 0;
    }
    const gain = [40, 60, 80, 120, 160, 200, 280][Math.min(S.streak, 6)];
    S.coins += gain;
    if (S.streak === 6) S.gems += 1;
    S.streak = Math.min(7, (S.streak || 0) + 1);
    S.lastDaily = today;
    save(); renderHub();
    toast("+" + gain + " coins");
    sfx("lock");
    burst(window.innerWidth / 2, 200, 20);
  }
  function renderShop() {
    paintCurrencies();
    showScreen("screen-shop");
    const grid = $("shopGrid");
    grid.innerHTML = "";
    THEMES.forEach((theme) => {
      const owned = S.owned.indexOf(theme.id) !== -1;
      const card = document.createElement("div");
      card.className = "shop-card";
      card.innerHTML = `<h3>${theme.name}</h3><p>${owned ? (S.theme === theme.id ? "On the park now" : "Owned") : theme.price + " coins"}</p><div class="swatches">${theme.colors.map((c) => `<i style="background:${c}"></i>`).join("")}</div>`;
      const btn = document.createElement("button");
      btn.className = "btn " + (owned ? "ghost" : "gold") + " wide";
      btn.textContent = owned ? (S.theme === theme.id ? "Wearing" : "Wear") : "Buy";
      btn.onclick = () => {
        if (!owned) {
          if (S.coins < theme.price) return toast("Not enough coins");
          S.coins -= theme.price;
          S.owned.push(theme.id);
        }
        S.theme = theme.id;
        save(); renderShop();
      };
      card.appendChild(btn);
      grid.appendChild(card);
    });
  }

  function pause() {
    if (!session || session.ended) return;
    session.paused = true;
    clearInterval(session.clock);
    openModal("modal-pause");
  }
  function resume() {
    if (!session) return;
    closeModal("modal-pause");
    session.paused = false;
    if (!session.ended) startClock();
  }

  function boot() {
    document.documentElement.dataset.theme = S.theme || "park";
    let load = 0;
    const timer = setInterval(() => {
      load = Math.min(100, load + 16);
      $("loadFill").style.width = load + "%";
      $("loadText").textContent = load < 100 ? "Lighting the lanterns…" : "The gate is open";
      if (load >= 100) {
        clearInterval(timer);
        setTimeout(() => { showScreen("screen-hub"); renderHub(); }, 260);
      }
    }, 80);
    $("btnSettings").onclick = () => {
      $("setMusic").checked = !!S.music;
      $("setSfx").checked = S.sfx !== false;
      $("setVib").checked = S.vib !== false;
      openModal("modal-settings");
    };
    $("setClose").onclick = () => closeModal("modal-settings");
    $("setMusic").onchange = (e) => { S.music = e.target.checked; save(); if (S.music) startMusic(); else stopMusic(); };
    $("setSfx").onchange = (e) => { S.sfx = e.target.checked; save(); };
    $("setVib").onchange = (e) => { S.vib = e.target.checked; save(); };
    $("btnDaily").onclick = claimDaily;
    $("btnShop").onclick = renderShop;
    $("shopBack").onclick = () => { showScreen("screen-hub"); renderHub(); };
    $("btnHelp").onclick = () => openModal("modal-help");
    $("helpClose").onclick = () => closeModal("modal-help");
    $("lockClose").onclick = () => closeModal("modal-lock");
    $("cardScrew").onclick = () => openMap("screw");
    $("cardSort").onclick = () => openMap("sort");
    $("cardArrow").onclick = () => openMap("arrow");
    $("mapBack").onclick = () => { showScreen("screen-hub"); renderHub(); };
    $("screwPause").onclick = pause;
    $("sortPause").onclick = pause;
    $("arrowPause").onclick = pause;
    $("btnResume").onclick = resume;
    $("btnRestart").onclick = () => session && startGame(session.world, session.level);
    $("btnQuit").onclick = () => {
      const world = session && session.world;
      stopSession(); session = null;
      if (world) openMap(world); else { showScreen("screen-hub"); renderHub(); }
    };
    $("screwUndo").onclick = () => {
      if (!session || !session.undo) return toast("Nothing to undo");
      L.screwUndo(session.state, session.undo);
      session.undo = null;
      renderScrew();
      sfx("tap");
    };
    $("screwHintBtn").onclick = useHint;
    $("arrowHintBtn").onclick = useHint;
    $("arrowReset").onclick = () => session && startArrow(session.level);
    $("btnGo").onclick = kingGo;
    $("btnRetry").onclick = () => session && startGame(session.world, session.level);
    $("btnRevive").onclick = revive;
    $("btnWinMap").onclick = () => session && openMap(session.world);
    $("btnLoseMap").onclick = () => session && openMap(session.world);
    document.addEventListener("pointerdown", () => { if (S.music) startMusic(); }, { once: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
