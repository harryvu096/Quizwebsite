/* ======================================================================
   AHW QUIZVERSE - BRAIN GAMES + AI EXAMINER (c) 2026 AHW Quizverse / All VU Students.
   Exam prep ko game banane ka system:
   - 🔤 Word Scramble  : VU terms ke letter-tiles solve karo (terminology pakki hoti hai)
   - ⚡ 60s Blitz      : speed MCQ rush, combo multiplier
   - 🤖 AI Examiner    : subjective-style short answers, offline "AI" grading
     (rule-based NLP: keyword extraction + fuzzy match — koi API key nahi chahiye,
     offline bhi chalta hai)
   ====================================================================== */
if (!profile.games || typeof profile.games !== "object") profile.games = {};

/* ---------- shared question pool ---------- */
let AQ_CACHE = null;
function allQs(){
  if (AQ_CACHE) return AQ_CACHE;
  const out = [];
  SUBJECTS.forEach(S => { ["mid","final"].forEach(ex => {
    const E = S.exams[ex]; if (!E || E.placeholder) return;
    E.lv.forEach(L => L.questions.forEach(q => out.push({ q:q[0], opts:q[1], ans:q[1][q[2]], why:q[3], course:S.code })));
  }); });
  AQ_CACHE = out; return out;
}
function gpShuffle(a){ for(let i=a.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; } return a; }

function showGames(){
  sfx.click();
  const g = profile.games;
  const grid = document.getElementById("gamesHub");
  grid.innerHTML = "";
  const cards = [
    { t:"🔤 Word Scramble", d:"Scrambled VU terms ko letter-tiles se solve karein. Terminology + spelling pakki hoti hai — brain games wali feeling, exam wala content.", b:"Best: "+(g.scramble||0), fn:"startScramble()", c:"#f59e0b" },
    { t:"⚡ 60-Second Blitz", d:"Sirf 60 second! Jitne ho sake MCQs, combo multiplier ke sath. Speed = exam mein time bachta hai.", b:"Best: "+(g.blitz||0), fn:"startBlitz()", c:"#ef4444" },
    { t:"🤖 AI Examiner (Subjective)", d:"Short-answer questions — apne alfaz mein likhein. Hamara offline AI examiner keywords match kar ke marks aur feedback deta hai. Subjective prep ka HAL!", b:"Best: "+(g.subjective||0)+"/25", fn:"startSubjective()", c:"#8b5cf6" }
  ];
  cards.forEach(cd => {
    const d = document.createElement("div");
    d.className = "pick-card";
    d.style.setProperty("--c1", cd.c); d.style.setProperty("--c2", "#7c3aed");
    d.innerHTML = '<div class="pick-ribbon"></div><div class="pick-title" style="font-size:18px">'+cd.t+'</div>'+
      '<div class="pick-sub" style="margin:8px 0">'+cd.d+'</div>'+
      '<div style="font-size:12px;font-weight:900;color:#7a72a3">🏆 '+cd.b+'</div>'+
      '<div style="margin-top:12px"><span class="btn btn-blue" style="pointer-events:none">Play ➜</span></div>';
    d.onclick = () => { (window[cd.fn.split("(")[0]])(); };
    grid.appendChild(d);
  });
  show("screen-games");
}
function gpHud(html){ document.getElementById("gpHud").innerHTML = html; }
function gpOpen(title){
  document.getElementById("gpTitle").textContent = title;
  show("screen-gameplay");
}
function gpOverlay(html){
  document.getElementById("gpArea").innerHTML = '<div class="card" style="text-align:center;margin-top:10px">'+html+'</div>';
}

/* ================= 🔤 WORD SCRAMBLE ================= */
let SC = null;
function startScramble(){
  SC = { score:0, lives:3, streak:0 };
  gpOpen("🔤 Word Scramble — VU Terms");
  nextScramble();
}
function pickTerm(){
  const AQ = allQs();
  for(let i=0;i<50;i++){
    const q = AQ[(Math.random()*AQ.length)|0];
    const words = (q.ans + " " + q.why).match(/[A-Za-z][A-Za-z\-]{5,14}/g) || [];
    const cand = words.filter(w => /^[A-Za-z\-]+$/.test(w));
    if(cand.length) return { word: cand[(Math.random()*cand.length)|0].toUpperCase(), hint: q.q, course: q.course };
  }
  return { word:"VIRTUAL", hint:"Our university", course:"VU" };
}
function nextScramble(){
  if(SC.lives<=0){ endScramble(); return; }
  const t = pickTerm(); SC.cur = t; SC.picked = [];
  SC.tiles = gpShuffle(t.word.split(""));
  if(SC.tiles.join("")===t.word) SC.tiles.reverse();
  gpHud('❤️ '.repeat(SC.lives) + ' · 🔥 '+SC.streak + ' · 💰 '+SC.score);
  renderScramble();
}
function renderScramble(){
  const a = document.getElementById("gpArea");
  a.innerHTML = '<div class="cpp-ch"><b style="color:#0b2b60">'+SC.cur.course+'</b>'+
    '<div class="cpp-ch-title">Clue: '+SC.cur.hint.replace(/</g,"&lt;")+'</div>'+
    '<div style="font-size:11px;color:#7a72a3;font-weight:800">Tap letters in order to spell the term</div></div>'+
    '<div class="sc-slots" id="scSlots"></div>'+
    '<div class="sc-tiles" id="scTiles"></div>';
  paintScrambleParts();
}
function paintScrambleParts(){
  const slots = document.getElementById("scSlots"), tiles = document.getElementById("scTiles");
  slots.innerHTML=""; tiles.innerHTML="";
  SC.cur.word.split("").forEach((ch,i)=>{
    const s=document.createElement("div"); s.className="sc-slot"+(SC.picked[i]!=null?" on":"");
    s.textContent = SC.picked[i]!=null ? SC.tiles[SC.picked[i]] : "";
    s.onclick=()=>{ if(SC.picked[i]!=null){ const ti=SC.picked[i]; SC.picked.splice(SC.picked.indexOf(ti),1); SC.picked=SC.picked.filter(x=>x!==ti); sfx.click(); paintScrambleParts(); } };
    slots.appendChild(s);
  });
  SC.tiles.forEach((ch,i)=>{
    const b=document.createElement("button"); b.className="sc-tile"+(SC.picked.includes(i)?" used":"");
    b.textContent=ch;
    b.onclick=()=>{ if(SC.picked.includes(i)) return; SC.picked.push(i); sfx.click();
      if(SC.picked.length===SC.cur.word.length){
        const guess=SC.picked.map(x=>SC.tiles[x]).join("");
        if(guess===SC.cur.word){
          SC.score += 10 + SC.streak*2; SC.streak++; sfx.correct(); buzz(50);
          streakBanner("✅ "+SC.cur.word+"  +"+(10+(SC.streak-1)*2));
          setTimeout(nextScramble, 500);
        }else{
          SC.lives--; SC.streak=0; sfx.wrong(); buzz([80,40,80]);
          streakBanner("❌ Correct was: "+SC.cur.word);
          setTimeout(nextScramble, 900);
        }
      } else paintScrambleParts();
    };
    tiles.appendChild(b);
  });
}
function endScramble(){
  const best = Math.max(profile.games.scramble||0, SC.score);
  profile.games.scramble = best; save();
  gpOverlay('<div class="res-emoji">🔤</div><div class="res-title">Score: '+SC.score+'</div>'+
    '<div class="sub">Best: '+best+' · Words mastery = exam mein exact terms yaad!</div>'+
    '<div class="btn-row" style="justify-content:center;margin-top:12px"><button class="btn btn-green" onclick="startScramble()">🔄 Play Again</button><button class="btn btn-gray" onclick="showGames()">🧠 Games Hub</button></div>');
}

/* ================= ⚡ 60s BLITZ ================= */
let BZ = null;
function startBlitz(){
  if(BZ && BZ.timer) clearInterval(BZ.timer);
  BZ = { score:0, combo:0, left:60 };
  gpOpen("⚡ 60-Second Blitz");
  BZ.timer = setInterval(()=>{ BZ.left--;
    if(BZ.left<=0){ clearInterval(BZ.timer); endBlitz(); }
    gpHud(blitzHud());
  },1000);
  blitzNext();
}
function blitzHud(){ return '⏱ '+Math.max(0,BZ.left)+'s · 🔥 '+BZ.combo+' · 💰 '+BZ.score; }
function blitzNext(){
  const q = allQs()[(Math.random()*allQs().length)|0];
  BZ.q = q;
  gpHud(blitzHud());
  const a = document.getElementById("gpArea");
  a.innerHTML = '<div class="cpp-ch"><b style="color:#0b2b60">'+q.course+'</b><div class="cpp-ch-title" style="margin-top:4px">'+q.q.replace(/</g,"&lt;")+'</div></div><div class="sc-tiles" style="grid-template-columns:1fr 1fr" id="bzOpts"></div>';
  const box = document.getElementById("bzOpts");
  gpShuffle([...q.opts]).forEach(o=>{
    const b=document.createElement("button"); b.className="sc-tile wide"; b.textContent=o;
    b.onclick=()=>{ if(o===q.ans){ BZ.score+=10+BZ.combo*2; BZ.combo++; sfx.click(); } else { BZ.combo=0; sfx.wrong(); } blitzNext(); };
    box.appendChild(b);
  });
}
function endBlitz(){
  const best = Math.max(profile.games.blitz||0, BZ.score);
  profile.games.blitz = best; save();
  gpOverlay('<div class="res-emoji">⚡</div><div class="res-title">Score: '+BZ.score+'</div>'+
    '<div class="sub">Best: '+best+' · Speed se exam mein waqt bachta hai!</div>'+
    '<div class="btn-row" style="justify-content:center;margin-top:12px"><button class="btn btn-green" onclick="startBlitz()">🔄 Play Again</button><button class="btn btn-gray" onclick="showGames()">🧠 Games Hub</button></div>');
}

/* ================= 🤖 AI EXAMINER (offline subjective grading) ================= */
const AI_STOP = new Set(("the a an of and in on to for is are was were with by from that this it its as at be been being have has had not no or nor but if than then so such via into over under using used use uses which who whom whose when where while also can may might must shall will would could should about between during each per without within more most less least very only own same just because cause often").split(" "));
function aiKeywords(text){
  const m = (String(text).toLowerCase().match(/[a-z][a-z\-]{3,}/g)) || [];
  const freq = {};
  m.forEach(w => { if(!AI_STOP.has(w)) freq[w] = (freq[w]||0)+1; });
  return Object.keys(freq).sort((a,b)=>(b.length+freq[b]*2)-(a.length+freq[a]*2)).slice(0,6);
}
function aiSim(a,b){
  if(a===b) return 1;
  if(a.length>4 && b.length>4){
    if(a.startsWith(b.slice(0,5)) || b.startsWith(a.slice(0,5))) return 0.9;
    let d=0; const n=Math.min(a.length,b.length);
    for(let i=0;i<n;i++) if(a[i]!==b[i]) d++;
    if(Math.abs(a.length-b.length)+d <= 1) return 0.85;
  }
  return a.includes(b) || b.includes(a) ? 0.8 : 0;
}
function aiGrade(user, ans, why){
  const kw = aiKeywords(ans + " " + why);
  const ut = (String(user).toLowerCase().match(/[a-z][a-z\-]{3,}/g)) || [];
  const matched = [], missing = [];
  kw.forEach(w => {
    const hit = ut.some(t => aiSim(t,w) >= 0.8);
    (hit?matched:missing).push(w);
  });
  const r = kw.length ? matched.length/kw.length : 0;
  const marks = r>=0.6 ? 5 : r>=0.4 ? 3 : r>=0.2 ? 2 : 0;
  return { marks, matched, missing, ratio:r };
}
let SX = null;
function startSubjective(){
  SX = { marks:0, qn:0, total:5 };
  gpOpen("🤖 AI Examiner — Subjective Trainer");
  sxNext();
}
function sxNext(){
  if(SX.qn >= SX.total){ endSubjective(); return; }
  const AQ = allQs().filter(q => q.q.includes("___"));
  const q = AQ[(Math.random()*AQ.length)|0];
  SX.q = q;
  gpHud('Question '+(SX.qn+1)+' / '+SX.total+' · Marks: '+SX.marks+'/25');
  const a = document.getElementById("gpArea");
  a.innerHTML = '<div class="cpp-ch"><b style="color:#0b2b60">'+q.course+' · Short Question (5 marks)</b>'+
    '<div class="cpp-ch-title" style="margin-top:4px">'+q.q.replace(/___/,"<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>").replace(/</g,"&lt;")+'</div>'+
    '<div style="font-size:11.5px;color:#7a72a3;font-weight:800;margin-top:4px">Apne alfaz mein 1-2 lines likhein — AI examiner keywords match kar ke grade karega.</div></div>'+
    '<textarea id="sxAns" class="cpp-stdin" rows="4" placeholder="Write your answer here..."></textarea>'+
    '<div class="btn-row" style="margin-top:10px"><button class="btn btn-purple" onclick="sxSubmit()">🤖 Submit to AI</button></div>'+
    '<div id="sxFeed"></div>';
}
function sxSubmit(){
  const user = document.getElementById("sxAns").value.trim();
  if(user.length < 8){ streakBanner("✍️ Thora likhein — at least a few words!"); return; }
  const g = aiGrade(user, SX.q.ans, SX.q.why);
  SX.marks += g.marks; SX.qn++;
  const feed = document.getElementById("sxFeed");
  feed.innerHTML = '<div class="cpp-ch" style="margin-top:12px;border-color:'+(g.marks>=3?"#16a34a":"#dc2626")+'">'+
    '<div class="cpp-ch-title">🤖 AI Examiner: '+g.marks+' / 5 marks</div>'+
    '<div style="font-size:12.5px;line-height:1.6;margin-top:4px">'+
    (g.matched.length ? '✅ Covered: <b>'+g.matched.join(", ")+'</b><br>' : '')+
    (g.missing.length ? '❌ Missing keywords: <b>'+g.missing.join(", ")+'</b><br>' : '🌟 All key points covered!')+
    '📘 Model answer: <b>'+SX.q.ans+'</b> — '+SX.q.why.replace(/</g,"&lt;")+'</div>'+
    '<div class="btn-row" style="margin-top:10px"><button class="btn btn-blue" onclick="sxNext()">Next ➜</button></div></div>';
  if(g.marks>=3){ sfx.correct(); buzz(50); } else sfx.wrong();
  gpHud('Question '+Math.min(SX.qn+1,SX.total)+' / '+SX.total+' · Marks: '+SX.marks+'/25');
}
function endSubjective(){
  const best = Math.max(profile.games.subjective||0, SX.marks);
  profile.games.subjective = best; save();
  const pct = SX.marks/25;
  gpOverlay('<div class="res-emoji">🤖</div><div class="res-title">'+SX.marks+' / 25 marks</div>'+
    '<div class="sub">'+(pct>=0.8?"Outstanding! Subjective answers strong hain.":pct>=0.5?"Good! Keywords improve karte jayen.":"Model answers parh kar keywords ki practice karein.")+' · Best: '+best+'/25</div>'+
    '<div class="btn-row" style="justify-content:center;margin-top:12px"><button class="btn btn-green" onclick="startSubjective()">🔄 Play Again</button><button class="btn btn-gray" onclick="showGames()">🧠 Games Hub</button></div>');
}
