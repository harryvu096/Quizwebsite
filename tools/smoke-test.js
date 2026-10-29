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
  assert(doc.body.getAttribute("data-build") === "ahw13", "build tag synced");

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

  console.log("\n[10] Mock exam — VU-exact flow");
  window.showMockSubjects();
  await sleep(20);
  assert($("#screen-mocksub").classList.contains("active"), "mock subject picker opens");
  const mockCards = doc.querySelectorAll("#mockGrid .pick-card");
  assert(mockCards.length >= 60, "mock subjects listed (" + mockCards.length + ")");
  window.prepMock("cs101");               // objective paper (40 MCQs)
  await sleep(20);
  assert($("#screen-mockterms").classList.contains("active"), "conduct instructions screen");
  const agree = doc.getElementById("mtAgree");
  agree.checked = true; agree.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert(doc.getElementById("btnStartExam").disabled === false, "start enabled after agree");
  window.beginMock();
  await sleep(20);
  assert($("#screen-mock").classList.contains("active"), "exam room opens");
  const MKU = window.AHW.getMock();
  assert(MKU.items.length === 40, "objective paper has 40 MCQs");
  assert(doc.querySelectorAll("#mockPal .mp2").length === 40, "palette shows 40 questions");

  // -- select an option -> both Save buttons enable
  const rows = doc.querySelectorAll("#mockOpts .vt-orow");
  assert(rows.length === 4, "4 radio option rows");
  rows[1].dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await sleep(10);
  const saves = doc.querySelectorAll(".js-save");
  assert(saves.length === 2 && saves[0].disabled === false, "Save buttons enable after pick");
  window.mockSave();
  await sleep(10);
  assert(MKU.saved[0] === true, "answer 1 saved");
  assert(doc.querySelector("#mockPal .mp2.done") !== null, "palette shows green saved");

  // -- Save & Move to Next
  doc.querySelectorAll("#mockOpts .vt-orow")[2].dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await sleep(10);
  window.mockSaveNext();
  await sleep(150);
  assert(MKU.idx === 1 && MKU.saved[0] === true, "Save & Move to Next works");

  // -- Previous button (was broken on mobile layout)
  window.mockPrev();
  await sleep(10);
  assert(MKU.idx === 0, "Previous goes back to Q1");
  assert(doc.getElementById("mkQNo").textContent.includes("1 of 40"), "Q number repaints on Previous");

  // -- modified-after-save -> hint + re-save
  assert(doc.getElementById("mkModHint").hidden === true, "no mod hint when clean");
  doc.querySelectorAll("#mockOpts .vt-orow")[3].dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await sleep(10);
  assert(MKU.modified[0] === true && doc.getElementById("mkModHint").hidden === false, "edit after Save shows VU re-save hint");
  window.mockSave();
  await sleep(10);
  assert(MKU.modified[0] === false && doc.getElementById("mkModHint").hidden === true, "re-save clears modified state");

  // -- Mark for Review + Clear Response
  window.mockFlag();
  await sleep(10);
  assert(MKU.flagged[0] === true && doc.querySelector("#mockPal .mp2.sm") !== null, "saved+marked palette state");
  window.mockClear();
  await sleep(10);
  assert(MKU.picks[0] === null && MKU.saved[0] === false, "Clear Response wipes selection + save state");

  // -- keyboard: ArrowRight / S (select first, then save — VU order)
  doc.body.focus();
  doc.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  await sleep(10);
  assert(MKU.idx === 1, "ArrowRight navigates next");
  const q1 = MKU.items[1];
  const rightIdx = q1.opts.indexOf(q1.ans);
  doc.querySelectorAll("#mockOpts .vt-orow")[rightIdx].dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await sleep(10);
  doc.dispatchEvent(new window.KeyboardEvent("keydown", { key: "s", bubbles: true }));
  await sleep(10);
  assert(MKU.saved[1] === true, "S key saves current answer");

  // -- grading: only SAVED answers count (VU rule)
  // Q2: pick a WRONG option but do NOT save -> must score 0
  const q2 = MKU.items[2];
  const wrongIdx = q2.opts.indexOf(q2.ans) === 0 ? 1 : 0;
  MKU.idx = 2;
  MKU.picks[2] = wrongIdx;
  window.mockFinish(false);
  await sleep(20);
  assert($("#screen-mockres").classList.contains("active"), "result screen after finish");
  assert(MKU.mcqGot === 1, "only the saved correct answer counted (got=" + MKU.mcqGot + ")");

  console.log("\n[12] Assignment Studio");
  assert(typeof window.showAssignmentLab === "function", "showAssignmentLab defined");
  const L = window.ASN_LIB;
  assert(L && typeof L.parseAssignmentText === "function" && typeof L.buildDocx === "function", "ASN_LIB loaded");

  // -- parser: messy student paste
  const parsed = L.parseAssignmentText(
    "Assignment #1 CS101\n" +
    "Question No. 1\nWhat is operating system? (5 marks)\nAnswer:\nAn OS is system software that manages hardware and software resources.\n\n" +
    "Q2. Explain paging with example. (10 marks)\nAns: Paging splits memory into fixed-size frames so processes can be stored non-contiguously.\nSecond line of answer.\n\n" +
    "3) Differentiate between compiler and interpreter.\nSolution: A compiler translates the whole program at once while an interpreter translates line by line."
  );
  assert(parsed.length === 3, "parser found 3 questions");
  assert(/operating system/i.test(parsed[0].q) && parsed[0].marks === 5, "Q1 text + marks parsed (" + parsed[0].marks + ")");
  assert(/system software/i.test(parsed[0].answer), "Q1 answer parsed");
  assert(/paging/i.test(parsed[1].q) && parsed[1].marks === 10, "Q2 marks parsed (" + parsed[1].marks + ")");
  assert(/Second line/.test(parsed[1].answer) && /frames/.test(parsed[1].answer), "Q2 multi-line answer kept");
  assert(/compiler and interpreter/i.test(parsed[2].q), "numbered-list question parsed");

  // -- humanizer: markdown + AI-isms
  const hum = L.humanizeText("## Heading\n**In conclusion,** we *must* leverage a robust approach.\n\nMoreover, it is important to note that systems are comprehensive.", "student", false, 3);
  assert(!hum.includes("##") && !hum.includes("**") && !hum.includes("In conclusion"), "markdown + AI phrases stripped");
  assert(/use/.test(hum) && !/leverage/.test(hum), "AI vocabulary humanized");

  // -- docx writer: real ZIP + OOXML
  const meta = { sid: "BC210204567", name: "Test Student", subject: "CS101", subjectTitle: "Intro to Computing", assignmentNo: "1", semester: "Fall 2026", teacher: "Sir ABC", dueDate: "" };
  const blob = L.buildDocx(meta, parsed, { cover: true });
  assert(blob && blob.size > 1500, "docx blob generated (" + blob.size + " bytes)");
  const buf = new Uint8Array(await blob.arrayBuffer());
  assert(buf[0] === 0x50 && buf[1] === 0x4B, "ZIP magic bytes present");
  assert(/_AssignmentNo1_.*\.docx$/.test(L.vuFileName()) || /\.docx$/.test(L.vuFileName()), "VU filename convention: " + L.vuFileName());

  // -- read our own docx back (stored method) and verify content
  const backText = await L.extractDocxText(buf.buffer);
  assert(backText.includes("VIRTUAL UNIVERSITY OF PAKISTAN"), "cover page university line");
  assert(backText.includes("BC210204567") && backText.includes("CS101"), "cover has student ID + subject");
  assert(backText.includes("Question No. 1") && backText.includes("5 Marks"), "Q1 heading in docx");
  assert(/operating system/i.test(backText) && /system software/i.test(backText), "question + answer text in docx");
  assert(backText.includes("Answer:"), "Answer: labels present");
  assert(backText.includes("Question No. 3"), "all 3 questions in docx");

  // -- XML well-formed enough (balanced tags spot-check)
  const xml = L.buildDocxXml(meta, parsed, { cover: true });
  const opens = (xml.match(/<w:p[ >]/g) || []).length, closes = (xml.match(/<\/w:p>/g) || []).length;
  assert(opens === closes, "document.xml paragraphs balanced (" + opens + "/" + closes + ")");

  // -- UI flow: open studio, paste, parse -> cards
  window.showAssignmentLab();
  await sleep(30);
  assert($("#screen-assign").classList.contains("active"), "assignment screen opens");
  doc.getElementById("asSid").value = "BC210204567";
  doc.getElementById("asSubject").value = "cs101";
  doc.getElementById("asPaste").value = "Q1: What is RAM? (2 marks)\nAns: RAM is random access memory.";
  window.asnParse();
  await sleep(20);
  assert(window.ASN_LIB.state.questions.length === 1, "UI parse stored 1 question");
  assert(doc.querySelectorAll("#asQList .as-qcard").length === 1, "question card rendered");

  console.log("\n[13] Escape closes dialog");
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
