/* Headless smoke test — jsdom. Not shipped with the site; run: node tools/smoke-test.js */
const fs = require("fs");
const path = require("path");
const http = require("http");
const { JSDOM, VirtualConsole } = require("jsdom");

const ROOT = path.join(__dirname, "..");
const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", e => { const m = String(e && e.message || e); if (!/Could not load|not implemented/i.test(m)) errors.push("jsdomError: " + m); });
vc.on("error", (...a) => errors.push("console.error: " + a.join(" ")));

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".webmanifest": "application/manifest+json" };
const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\//, "");
  if (!rel) rel = "index.html";
  const p = path.join(ROOT, rel);
  if (fs.existsSync(p) && fs.statSync(p).isFile()) {
    res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
    res.end(fs.readFileSync(p));
  } else { res.writeHead(404); res.end("nope"); }
});

function assert(cond, label) {
  if (cond) console.log("  ✓", label);
  else { errors.push("ASSERT FAIL: " + label); console.log("  ✗", label); }
}

(async () => {
  await new Promise(r => server.listen(0, r));
  const PORT = server.address().port;

  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const dom = new JSDOM(html, {
    url: "http://localhost:" + PORT + "/index.html",
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(w) {
      w.scrollTo = () => {};
      w.print = () => {};
      w.AudioContext = function () {
        return {
          createOscillator: () => ({ connect() {}, start() {}, stop() {}, frequency: { value: 0 } }),
          createGain: () => ({ connect() {}, gain: { value: 0, exponentialRampToValueAtTime() {}, setTargetAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {} } }),
          get currentTime() { return 0; }, resume() {}
        };
      };
      w.HTMLCanvasElement.prototype.getContext = function () {
        return { clearRect() {}, beginPath() {}, arc() {}, fill() {}, save() {}, restore() {}, translate() {}, rotate() {}, scale() {}, fillRect() {}, fillText() {}, fillStyle: "", globalAlpha: 1, font: "" };
      };
    }
  });

  const { window } = dom;
  const doc = window.document;
  const $ = s => doc.querySelector(s);
  const click = el => { if (!el) throw new Error("click on missing el"); el.dispatchEvent(new window.MouseEvent("click", { bubbles: true })); };
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  await sleep(700); // let external scripts load

  console.log("\n[1] Boot");
  assert(typeof window.startJourney === "function", "app.js loaded (startJourney defined)");
  assert(typeof window.startDailyChallenge === "function", "daily challenge defined");
  assert(typeof window.confirmUser === "function" && typeof window.alertUser === "function", "custom dialogs defined");
  const nb = window.MCQS ? Object.keys(window.MCQS).length : 0;
  assert(nb > 100, "MCQ data loaded (" + nb + " banks)");
  assert($("#modal-dialog") !== null, "dialog modal exists");
  assert($("#fbReportBtn") !== null, "Report button exists");
  assert(doc.body.getAttribute("data-build") === "ahw12", "build tag synced");

  console.log("\n[2] Home → Subjects");
  doc.getElementById("playerName").value = "SmokeTester";
  click(doc.querySelector("#home-card .btn-green")); // Start Journey
  await sleep(50);
  assert($("#screen-subjects").classList.contains("active"), "subjects screen active");
  const cards = doc.querySelectorAll("#subjectGrid .pick-card");
  assert(cards.length >= 60, "subject cards rendered (" + cards.length + ")");

  console.log("\n[3] Enter quiz + answer");
  window.startLevel("cs601", "mid", 1);
  await sleep(50);
  assert($("#screen-quiz").classList.contains("active"), "quiz screen active");
  assert(doc.getElementById("qText").textContent.length > 5, "question text rendered");
  click(doc.querySelectorAll("#optsBox .opt")[0]);
  await sleep(50);
  assert($("#feedback").classList.contains("show"), "feedback shown after answer");
  assert(window.AHW.getG().answered === true, "answer registered");

  console.log("\n[4] Report button");
  click($("#fbReportBtn"));
  await sleep(20);
  assert(Array.isArray(window.AHW.profile.reports) && window.AHW.profile.reports.length === 1, "report saved to profile");

  console.log("\n[5] Review swipe-back + next");
  window.fbNext(); // Q0 answered → move to Q1
  await sleep(20);
  assert(window.AHW.getG().idx === 1, "advanced to question 2");
  click(doc.querySelectorAll("#optsBox .opt")[0]); // answer Q1
  await sleep(20);
  window.goPrevQuestion(); // swipe back to Q0 in review mode
  await sleep(20);
  assert(doc.getElementById("fbTitle").textContent.includes("Review"), "review mode works");
  window.fbNext(); // back to current (Q1)
  await sleep(20);
  assert(window.AHW.getG().view === null && window.AHW.getG().idx === 1, "back to current question");

  console.log("\n[6] Dialogs");
  let resolved = null;
  window.confirmUser("test?").then(v => (resolved = v));
  await sleep(20);
  assert($("#modal-dialog").classList.contains("open"), "confirm dialog opens");
  click(doc.getElementById("dlgCancel"));
  await sleep(20);
  assert(resolved === false, "cancel resolves false");
  assert(!$("#modal-dialog").classList.contains("open"), "dialog closed");

  console.log("\n[7] Daily Challenge");
  window.goHome();
  await sleep(20);
  window.startDailyChallenge();
  await sleep(50);
  assert($("#screen-quiz").classList.contains("active"), "daily quiz started");
  assert(window.AHW.getG().mode === "daily" && window.AHW.getG().qs.length === 5, "daily has 5 questions");
  for (let i = 0; i < 5; i++) {
    const G = window.AHW.getG();
    const q = G.qs[G.idx];
    const btns = [...doc.querySelectorAll("#optsBox .opt")];
    const idx = q.opts.indexOf(q.ans);
    click(btns[idx] || btns[0]);
    await sleep(10);
    window.fbNext();
    await sleep(10);
  }
  assert($("#screen-complete").classList.contains("active"), "daily complete screen");
  assert(window.AHW.profile.daily && window.AHW.profile.daily.done === true, "daily status saved");
  assert(window.AHW.profile.daily.streak >= 1, "daily streak counted (" + window.AHW.profile.daily.streak + ")");

  console.log("\n[8] Mistake vault + SRS");
  window.AHW.profile.mistakes.push({ q: "srs test q", opts: ["a", "b"], ans: "a", why: "w", ts: Date.now(), due: Date.now(), ivl: 0 });
  window.srsTouch("srs test q", true);
  await sleep(10);
  const m = window.AHW.profile.mistakes.find(x => x.q === "srs test q");
  assert(m && m.ivl === 1 && m.due > Date.now(), "SRS advanced after correct answer");
  window.srsTouch("srs test q", false);
  assert(m.ivl === 0 && m.due <= Date.now() + 50, "SRS reset after wrong answer");

  console.log("\n[9] Reset progress (async dialog)");
  window.showSubjects();
  const xpBefore = window.AHW.profile.xp;
  window.resetProgress();
  await sleep(20);
  click(doc.getElementById("dlgOk"));
  await sleep(20);
  assert(window.AHW.profile.xp === 0, "xp reset (was " + xpBefore + ")");
  assert(window.AHW.profile.mistakes.length === 0, "vault reset");
  assert(window.AHW.profile.totalScore === 0, "totalScore reset");

  console.log("\n[10] Mock exam entry");
  window.showMockSubjects();
  await sleep(20);
  assert($("#screen-mocksub").classList.contains("active"), "mock subject picker opens");
  const mockCards = doc.querySelectorAll("#mockGrid .pick-card");
  assert(mockCards.length >= 60, "mock subjects listed (" + mockCards.length + ")");

  console.log("\n[11] Escape closes dialog");
  window.alertUser("bye");
  await sleep(20);
  doc.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await sleep(20);
  assert(!$("#modal-dialog").classList.contains("open"), "Escape closed dialog");

  console.log("\n" + "─".repeat(50));
  if (errors.length) { console.log("FAILED:", errors.length); errors.forEach(e => console.log(" -", e)); process.exit(1); }
  console.log("ALL SMOKE TESTS PASSED ✅");
  process.exit(0);
})().catch(e => { console.log("CRASH:", e); errors.forEach(x => console.log(" -", x)); process.exit(1); });
