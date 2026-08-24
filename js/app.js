/* ======================================================================
   AHW QUIZVERSE - (c) 2026 AHW Quizverse / All VU Students.
   All rights reserved. This code, design and the MCQ database are the
   property of AHW Quizverse. Copying, re-publishing or reselling without
   written permission is prohibited. Developed for VU students' benefit.
   ====================================================================== */
/* ======================================================================
   AHW QUIZVERSE — VU Multi-Subject (Mid + Final) Exam Arena
   192 real repeated MCQs from VU past-paper solved files
   ====================================================================== */

/* Question banks live in data/mcqs.json (loaded via data/mcqs.js) */
const MCQS = (typeof window !== "undefined" && window.MCQS) ? window.MCQS : {};

/* If the data file failed to load (e.g. index.html opened alone without the
   folder), show a clear warning instead of silently marking everything
   "Coming Soon". */
if(!Object.keys(MCQS).length){
  document.addEventListener("DOMContentLoaded", function(){
    const n=document.getElementById("liveCountNote");
    if(n){ n.style.color="#e21b3c";
      n.innerHTML="⚠️ MCQ data could not be loaded! index.html alone is not enough — download the full folder or open the <b>standalone.html</b> link."; }
  });
}

function dataFor(key){
  const d = MCQS[key] || null; if(d && d.lv) return d;
  return { placeholder:true, lv:[{id:1, icon:"🚧", name:"Loading Soon", desc:"Fresh content pack arriving — pick another arena today! ⚡", c1:"#64748b", c2:"#94a3b8", questions:[["This subject's full question bank is being finalized right now. Meanwhile, try any other arena! 🎮",["Got it","Cool","Rising Warrior","On my way"],0,"Under construction — you're witnessing history being written. ☣️"]]}], boss:{id:4, icon:"👑", name:"GRAND BOSS", desc:"15 random questions from this subject · 4 hearts", c1:"#facc15", c2:"#ef4444", boss:true, bossCount:15, questions:[]} };
}

/* The master registry of all subjects */
const SUBJECTS = [
  { id:"cs101", code:"CS101", title:"Introduction to Computing", icon:"💻", cat:"cs", c1:"#0ea5e9", c2:"#6366f1", exams:{mid:{label:"Midterm", ...dataFor('Q_CS101_MID')}, final:{label:"Finalterm", ...dataFor('Q_CS101_FINAL')}} },
  { id:"cs201", code:"CS201", title:"Introduction to Programming (C++)", icon:"⌨️", cat:"cs", c1:"#f59e0b", c2:"#ef4444", exams:{mid:{label:"Midterm", ...dataFor('Q_CS201_MID')}, final:{label:"Finalterm", ...dataFor('Q_CS201_FINAL')}} },
  { id:"cs301", code:"CS301", title:"Data Structures", icon:"🌳", cat:"cs", c1:"#10b981", c2:"#0ea5e9", exams:{mid:{label:"Midterm", ...dataFor('Q_CS301_MID')}, final:{label:"Finalterm", ...dataFor('Q_CS301_FINAL')}} },
  { id:"cs302", code:"CS302", title:"Digital Logic Design", icon:"🔌", cat:"cs", c1:"#f59e0b", c2:"#84cc16", exams:{mid:{label:"Midterm", ...dataFor('Q_CS302_MID')}, final:{label:"Finalterm", ...dataFor('Q_CS302_FINAL')}} },
  { id:"cs304", code:"CS304", title:"Object Oriented Programming", icon:"🧱", cat:"cs", c1:"#ec4899", c2:"#8b5cf6", exams:{mid:{label:"Midterm", ...dataFor('Q_CS304_MID')}, final:{label:"Finalterm", ...dataFor('Q_CS304_FINAL')}} },
  { id:"cs402", code:"CS402", title:"Theory of Automata", icon:"🧩", cat:"cs", c1:"#8b5cf6", c2:"#0ea5e9", exams:{mid:{label:"Midterm", ...dataFor('Q_CS402_MID')}, final:{label:"Finalterm", ...dataFor('Q_CS402_FINAL')}} },
  { id:"cs403", code:"CS403", title:"Database Management Systems", icon:"🗄️", cat:"cs", c1:"#06b6d4", c2:"#f59e0b", exams:{mid:{label:"Midterm", ...dataFor('Q_CS403_MID')}, final:{label:"Finalterm", ...dataFor('Q_CS403_FINAL')}} },
  { id:"cs504", code:"CS504", title:"Software Engineering - I", icon:"🏗️", cat:"cs", c1:"#6366f1", c2:"#ec4899", exams:{mid:{label:"Midterm", ...dataFor('Q_CS504_MID')}, final:{label:"Finalterm", ...dataFor('Q_CS504_FINAL')}} },
  { id:"cs601", code:"CS601", title:"Data Communication", icon:"📡", cat:"cs", c1:"#8b5cf6", c2:"#ec4899", exams:{mid:{label:"Midterm", ...dataFor('Q_CS601_MID')}, final:{label:"Finalterm", ...dataFor('Q_CS601_FINAL')}} },
  { id:"cs604", code:"CS604", title:"Operating Systems", icon:"⚙️", cat:"cs", c1:"#f43f5e", c2:"#0ea5e9", exams:{mid:{label:"Midterm", ...dataFor('Q_CS604_MID')}, final:{label:"Finalterm", ...dataFor('Q_CS604_FINAL')}} },
  { id:"cs607", code:"CS607", title:"Artificial Intelligence", icon:"🧠", cat:"cs", c1:"#22c55e", c2:"#8b5cf6", exams:{mid:{label:"Midterm", ...dataFor('Q_CS607_MID')}, final:{label:"Finalterm", ...dataFor('Q_CS607_FINAL')}} },
  { id:"cs610", code:"CS610", title:"Computer Networks", icon:"🌐", cat:"cs", c1:"#06b6d4", c2:"#64748b", exams:{mid:{label:"Midterm", ...dataFor('Q_CS610_MID')}, final:{label:"Finalterm", ...dataFor('Q_CS610_FINAL')}} },
  { id:"mth100", code:"MTH100", title:"General Mathematics", icon:"🧮", cat:"math", c1:"#f59e0b", c2:"#f97316", exams:{mid:{label:"Midterm", ...dataFor('Q_MTH100_MID')}, final:{label:"Finalterm", ...dataFor('Q_MTH100_FINAL')}} },
  { id:"mth101", code:"MTH101", title:"Calculus & Analytical Geometry", icon:"📐", cat:"math", c1:"#0ea5e9", c2:"#6366f1", exams:{mid:{label:"Midterm", ...dataFor('Q_MTH101_MID')}, final:{label:"Finalterm", ...dataFor('Q_MTH101_FINAL')}} },
  { id:"mth104", code:"MTH104", title:"Logic & Discrete Mathematics", icon:"🧩", cat:"math", c1:"#8b5cf6", c2:"#f43f5e", exams:{mid:{label:"Midterm", ...dataFor('Q_MTH104_MID')}, final:{label:"Finalterm", ...dataFor('Q_MTH104_FINAL')}} },
  { id:"mth202", code:"MTH202", title:"Discrete Mathematics", icon:"🗺️", cat:"math", c1:"#10b981", c2:"#8b5cf6", exams:{mid:{label:"Midterm", ...dataFor('Q_MTH202_MID')}, final:{label:"Finalterm", ...dataFor('Q_MTH202_FINAL')}} },
  { id:"mth301", code:"MTH301", title:"Calculus II", icon:"〰️", cat:"math", c1:"#06b6d4", c2:"#8b5cf6", exams:{mid:{label:"Midterm", ...dataFor('Q_MTH301_MID')}, final:{label:"Finalterm", ...dataFor('Q_MTH301_FINAL')}} },
  { id:"sta301", code:"STA301", title:"Statistics & Probability", icon:"📊", cat:"math", c1:"#14b8a6", c2:"#f59e0b", exams:{mid:{label:"Midterm", ...dataFor('Q_STA301_MID')}, final:{label:"Finalterm", ...dataFor('Q_STA301_FINAL')}} },
  { id:"sta630", code:"STA630", title:"Research Methods", icon:"🔬", cat:"math", c1:"#84cc16", c2:"#6366f1", exams:{mid:{label:"Midterm", ...dataFor('Q_STA630_MID')}, final:{label:"Finalterm", ...dataFor('Q_STA630_FINAL')}} },
  { id:"mcm101", code:"MCM101", title:"Introduction to Mass Communication", icon:"📰", cat:"mcm", c1:"#b45309", c2:"#6366f1", exams:{mid:{label:"Midterm", ...dataFor('Q_MCM101_MID')}, final:{label:"Finalterm", ...dataFor('Q_MCM101_FINAL')}} },
  { id:"phy101", code:"PHY101", title:"Physics (Introduction)", icon:"⚛️", cat:"pak", c1:"#7c3aed", c2:"#06b6d4", exams:{mid:{label:"Midterm", ...dataFor('Q_PHY101_MID')}, final:{label:"Finalterm", ...dataFor('Q_PHY101_FINAL')}} },
  { id:"pak301", code:"PAK301", title:"Pakistan Studies", icon:"🇵🇰", cat:"pak", c1:"#16a34a", c2:"#0f766e", exams:{mid:{label:"Midterm", ...dataFor('Q_PAK301_MID')}, final:{label:"Finalterm", ...dataFor('Q_PAK301_FINAL')}} },
  { id:"pak302", code:"PAK302", title:"Pakistan Studies (Advanced)", icon:"🏛️", cat:"pak", c1:"#065f46", c2:"#3b82f6", exams:{mid:{label:"Midterm", ...dataFor('Q_PAK302_MID')}, final:{label:"Finalterm", ...dataFor('Q_PAK302_FINAL')}} },
  { id:"pak522", code:"PAK522", title:"Ideology & Constitution of Pakistan", icon:"⚖️", cat:"pak", c1:"#b91c1c", c2:"#7c3aed", exams:{mid:{label:"Midterm", ...dataFor('Q_PAK522_MID')}, final:{label:"Finalterm", ...dataFor('Q_PAK522_FINAL')}} },
  { id:"isl202", code:"ISL202", title:"Islamiat", icon:"🕌", cat:"pak", c1:"#0f766e", c2:"#16a34a", exams:{mid:{label:"Midterm", ...dataFor('Q_ISL202_MID')}, final:{label:"Finalterm", ...dataFor('Q_ISL202_FINAL')}} },
  { id:"eco402", code:"ECO402", title:"Microeconomics", icon:"📉", cat:"mgt", c1:"#0ea5e9", c2:"#f59e0b", exams:{mid:{label:"Midterm", ...dataFor('Q_ECO402_MID')}, final:{label:"Finalterm", ...dataFor('Q_ECO402_FINAL')}} },
  { id:"eco403", code:"ECO403", title:"Macroeconomics", icon:"📈", cat:"mgt", c1:"#16a34a", c2:"#8b5cf6", exams:{mid:{label:"Midterm", ...dataFor('Q_ECO403_MID')}, final:{label:"Finalterm", ...dataFor('Q_ECO403_FINAL')}} },
  { id:"psy403", code:"PSY403", title:"Social Psychology", icon:"🫂", cat:"psy", c1:"#ec4899", c2:"#0ea5e9", exams:{mid:{label:"Midterm", ...dataFor('Q_PSY403_MID')}, final:{label:"Finalterm", ...dataFor('Q_PSY403_FINAL')}} },
  { id:"psy404", code:"PSY404", title:"Abnormal Psychology", icon:"🧩", cat:"psy", c1:"#8b5cf6","c2":"#f43f5e", exams:{mid:{label:"Midterm", ...dataFor('Q_PSY404_MID')}, final:{label:"Finalterm", ...dataFor('Q_PSY404_FINAL')}} },
  /* ---- Coming Soon (VU catalog, banks in progress) ---- */
  { id:"eco404", code:"ECO404", title:"Managerial Economics", icon:"🧑‍💼", cat:"mgt", c1:"#b45309", c2:"#0ea5e9", exams:{mid:{label:"Midterm", ...dataFor('Q_ECO404_MID')}, final:{label:"Finalterm", ...dataFor('Q_ECO404_FINAL')}} },
  { id:"eco501", code:"ECO501", title:"Development Economics", icon:"🌱", cat:"mgt", c1:"#16a34a", c2:"#f97316", exams:{mid:{label:"Midterm", ...dataFor('Q_ECO501_MID')}, final:{label:"Finalterm", ...dataFor('Q_ECO501_FINAL')}} },
  { id:"psy405", code:"PSY405", title:"Personality Psychology", icon:"🎭", cat:"psy", c1:"#f59e0b", c2:"#8b5cf6", exams:{mid:{label:"Midterm", ...dataFor('Q_PSY405_MID')}, final:{label:"Finalterm", ...dataFor('Q_PSY405_FINAL')}} },
  { id:"psy406", code:"PSY406", title:"Educational Psychology", icon:"🏫", cat:"psy", c1:"#0ea5e9", c2:"#22c55e", exams:{mid:{label:"Midterm", ...dataFor('Q_PSY406_MID')}, final:{label:"Finalterm", ...dataFor('Q_PSY406_FINAL')}} },
  { id:"psy504", code:"PSY504", title:"Cognitive Psychology", icon:"🧠", cat:"psy", c1:"#6366f1", c2:"#ec4899", exams:{mid:{label:"Midterm", ...dataFor('Q_PSY504_MID')}, final:{label:"Finalterm", ...dataFor('Q_PSY504_FINAL')}} },
  { id:"psy505", code:"PSY505", title:"Developmental Psychology", icon:"👶", cat:"psy", c1:"#14b8a6", c2:"#f59e0b", exams:{mid:{label:"Midterm", ...dataFor('Q_PSY505_MID')}, final:{label:"Finalterm", ...dataFor('Q_PSY505_FINAL')}} },
  { id:"soc201", code:"SOC201", title:"Social Statistics", icon:"🧾", cat:"soc", c1:"#0e7490", c2:"#f59e0b", exams:{mid:{label:"Midterm", ...dataFor('Q_SOC201_MID')}, final:{label:"Finalterm", ...dataFor('Q_SOC201_FINAL')}} },
  { id:"soc301", code:"SOC301", title:"Introduction to Social Work", icon:"🤲", cat:"soc", c1:"#16a34a", c2:"#0ea5e9", exams:{mid:{label:"Midterm", ...dataFor('Q_SOC301_MID')}, final:{label:"Finalterm", ...dataFor('Q_SOC301_FINAL')}} },
  { id:"soc302", code:"SOC302", title:"Sociological Theories", icon:"📜", cat:"soc", c1:"#7c3aed", c2:"#f43f5e", exams:{mid:{label:"Midterm", ...dataFor('Q_SOC302_MID')}, final:{label:"Finalterm", ...dataFor('Q_SOC302_FINAL')}} },
  { id:"soc401", code:"SOC401", title:"Cultural Anthropology", icon:"🏺", cat:"soc", c1:"#b45309", c2:"#22c55e", exams:{mid:{label:"Midterm", ...dataFor('Q_SOC401_MID')}, final:{label:"Finalterm", ...dataFor('Q_SOC401_FINAL')}} },
  { id:"eng401", code:"ENG401", title:"Introduction to Literature", icon:"📚", cat:"eng", c1:"#8b5cf6", c2:"#f97316", exams:{mid:{label:"Midterm", ...dataFor('Q_ENG401_MID')}, final:{label:"Finalterm", ...dataFor('Q_ENG401_FINAL')}} },
  { id:"eng501", code:"ENG501", title:"History of English Language", icon:"🕰️", cat:"eng", c1:"#0e7490", c2:"#ec4899", exams:{mid:{label:"Midterm", ...dataFor('Q_ENG501_MID')}, final:{label:"Finalterm", ...dataFor('Q_ENG501_FINAL')}} },
  { id:"eng502", code:"ENG502", title:"Introduction to Linguistics", icon:"🗣️", cat:"eng", c1:"#16a34a", c2:"#6366f1", exams:{mid:{label:"Midterm", ...dataFor('Q_ENG502_MID')}, final:{label:"Finalterm", ...dataFor('Q_ENG502_FINAL')}} },
  { id:"mcm301", code:"MCM301", title:"Communication Skills", icon:"🗣️", cat:"mcm", c1:"#0ea5e9", c2:"#a855f7", exams:{mid:{label:"Midterm", ...dataFor('Q_MCM301_MID')}, final:{label:"Finalterm", ...dataFor('Q_MCM301_FINAL')}} },
  { id:"mcm304", code:"MCM304", title:"Mass Media in Pakistan", icon:"🗞️", cat:"mcm", c1:"#f43f5e", c2:"#22c55e", exams:{mid:{label:"Midterm", ...dataFor('Q_MCM304_MID')}, final:{label:"Finalterm", ...dataFor('Q_MCM304_FINAL')}} },
  { id:"mcm310", code:"MCM310", title:"Journalistic Writing", icon:"✏️", cat:"mcm", c1:"#ec4899", c2:"#f59e0b", exams:{mid:{label:"Midterm", ...dataFor('Q_MCM310_MID')}, final:{label:"Finalterm", ...dataFor('Q_MCM310_FINAL')}} },
  { id:"eng101", code:"ENG101", title:"English Comprehension", icon:"📖", cat:"eng", c1:"#0ea5e9", c2:"#10b981", exams:{mid:{label:"Midterm", ...dataFor('Q_ENG101_MID')}, final:{label:"Finalterm", ...dataFor('Q_ENG101_FINAL')}} },
  { id:"eng201", code:"ENG201", title:"Business & Technical English Writing", icon:"✍️", cat:"eng", c1:"#ec4899", c2:"#f97316", exams:{mid:{label:"Midterm", ...dataFor('Q_ENG201_MID')}, final:{label:"Finalterm", ...dataFor('Q_ENG201_FINAL')}} },
  { id:"eng301", code:"ENG301", title:"Business Communication", icon:"🤝", cat:"eng", c1:"#06b6d4", c2:"#8b5cf6", exams:{mid:{label:"Midterm", ...dataFor('Q_ENG301_MID')}, final:{label:"Finalterm", ...dataFor('Q_ENG301_FINAL')}} },
  { id:"psy101", code:"PSY101", title:"Introduction to Psychology", icon:"🧠", cat:"psy", c1:"#a855f7", c2:"#14b8a6", exams:{mid:{label:"Midterm", ...dataFor('Q_PSY101_MID')}, final:{label:"Finalterm", ...dataFor('Q_PSY101_FINAL')}} },
  { id:"psy502", code:"PSY502", title:"History & Systems of Psychology", icon:"⏳", cat:"psy", c1:"#b45309", c2:"#7c3aed", exams:{mid:{label:"Midterm", ...dataFor('Q_PSY502_MID')}, final:{label:"Finalterm", ...dataFor('Q_PSY502_FINAL')}} },
  { id:"mgt101", code:"MGT101", title:"Financial Accounting", icon:"📒", cat:"mgt", c1:"#b45309", c2:"#dc2626", exams:{mid:{label:"Midterm", ...dataFor('Q_MGT101_MID')}, final:{label:"Finalterm", ...dataFor('Q_MGT101_FINAL')}} },
  { id:"mgt211", code:"MGT211", title:"Introduction to Business", icon:"💼", cat:"mgt", c1:"#0e7490", c2:"#06b6d4", exams:{mid:{label:"Midterm", ...dataFor('Q_MGT211_MID')}, final:{label:"Finalterm", ...dataFor('Q_MGT211_FINAL')}} },
  { id:"mgt301", code:"MGT301", title:"Principles of Marketing", icon:"📣", cat:"mgt", c1:"#be185d", c2:"#7c3aed", exams:{mid:{label:"Midterm", ...dataFor('Q_MGT301_MID')}, final:{label:"Finalterm", ...dataFor('Q_MGT301_FINAL')}} },
  { id:"mgt402", code:"MGT402", title:"Cost & Management Accounting", icon:"🧮", cat:"mgt", c1:"#1d4ed8", c2:"#7c3aed", exams:{mid:{label:"Midterm", ...dataFor('Q_MGT402_MID')}, final:{label:"Finalterm", ...dataFor('Q_MGT402_FINAL')}} },
  { id:"mgt501", code:"MGT501", title:"Human Resource Management", icon:"🧑‍💼", cat:"mgt", c1:"#b91c1c", c2:"#f59e0b", exams:{mid:{label:"Midterm", ...dataFor('Q_MGT501_MID')}, final:{label:"Finalterm", ...dataFor('Q_MGT501_FINAL')}} },
  { id:"mgt503", code:"MGT503", title:"Principles of Management", icon:"🧭", cat:"mgt", c1:"#4338ca", c2:"#db2777", exams:{mid:{label:"Midterm", ...dataFor('Q_MGT503_MID')}, final:{label:"Finalterm", ...dataFor('Q_MGT503_FINAL')}} },
  { id:"mgt602", code:"MGT602", title:"Entrepreneurship", icon:"💡", cat:"mgt", c1:"#b45309", c2:"#ec4899", exams:{mid:{label:"Midterm", ...dataFor('Q_MGT602_MID')}, final:{label:"Finalterm", ...dataFor('Q_MGT602_FINAL')}} },
  { id:"eco401", code:"ECO401", title:"Economics", icon:"📈", cat:"mgt", c1:"#0ea5e9", c2:"#6366f1", exams:{mid:{label:"Midterm", ...dataFor('Q_ECO401_MID')}, final:{label:"Finalterm", ...dataFor('Q_ECO401_FINAL')}} },
  { id:"acc501", code:"ACC501", title:"Business Finance", icon:"💰", cat:"mgt", c1:"#0e7490", c2:"#06b6d4", exams:{mid:{label:"Midterm", ...dataFor('Q_ACC501_MID')}, final:{label:"Finalterm", ...dataFor('Q_ACC501_FINAL')}} },
  { id:"mgt502", code:"MGT502", title:"Organizational Behaviour", icon:"🧑‍🤝", cat:"mgt", c1:"#a855f7", c2:"#14b8a6", exams:{mid:{label:"Midterm", ...dataFor('Q_MGT502_MID')}, final:{label:"Finalterm", ...dataFor('Q_MGT502_FINAL')}} },
  /* ---- Coming Soon (question banks in progress) ---- */
  { id:"cs506", code:"CS506", title:"Web Design and Development", icon:"🌐", cat:"cs", c1:"#10b981", c2:"#0ea5e9", exams:{mid:{label:"Midterm", ...dataFor('Q_CS506_MID')}, final:{label:"Finalterm", ...dataFor('Q_CS506_FINAL')}} },
  { id:"cs501", code:"CS501", title:"Advanced Computer Architecture", icon:"🖥️", cat:"cs", c1:"#f43f5e", c2:"#8b5cf6", exams:{mid:{label:"Midterm", ...dataFor('Q_CS501_MID')}, final:{label:"Finalterm", ...dataFor('Q_CS501_FINAL')}} },
  { id:"cs609", code:"CS609", title:"System Programming", icon:"⚙️", cat:"cs", c1:"#f59e0b", c2:"#22c55e", exams:{mid:{label:"Midterm", ...dataFor('Q_CS609_MID')}, final:{label:"Finalterm", ...dataFor('Q_CS609_FINAL')}} },
  { id:"soc101", code:"SOC101", title:"Introduction to Sociology", icon:"🏛️", cat:"soc", c1:"#b45309", c2:"#ec4899", exams:{mid:{label:"Midterm", ...dataFor('Q_SOC101_MID')}, final:{label:"Finalterm", ...dataFor('Q_SOC101_FINAL')}} },
  { id:"mth302", code:"MTH302", title:"Business Mathematics & Statistics", icon:"🧮", cat:"math", c1:"#8b5cf6", c2:"#f59e0b", exams:{mid:{label:"Midterm", ...dataFor('Q_MTH302_MID')}, final:{label:"Finalterm", ...dataFor('Q_MTH302_FINAL')}} },
  { id:"mgt610", code:"MGT610", title:"Business Ethics", icon:"🤝", cat:"mgt", c1:"#16a34a", c2:"#0ea5e9", exams:{mid:{label:"Midterm", ...dataFor('Q_MGT610_MID')}, final:{label:"Finalterm", ...dataFor('Q_MGT610_FINAL')}} },
  { id:"mgt611", code:"MGT611", title:"Business & Labor Law", icon:"⚖️", cat:"mgt", c1:"#b91c1c", c2:"#6366f1", exams:{mid:{label:"Midterm", ...dataFor('Q_MGT611_MID')}, final:{label:"Finalterm", ...dataFor('Q_MGT611_FINAL')}} },
  { id:"fin630", code:"FIN630", title:"Investment Analysis & Portfolio Management", icon:"📊", cat:"mgt", c1:"#0f766e", c2:"#f97316", exams:{mid:{label:"Midterm", ...dataFor('Q_FIN630_MID')}, final:{label:"Finalterm", ...dataFor('Q_FIN630_FINAL')}} }
];

const store={
  get(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } },
  set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
};
let profile = store.get("ahw_profile_v1") || { name:"", xp:0, muted:false, unlocked:{}, stars:{}, best:{}, lb:[], mistakes:[], totalScore:0 };
if(!Array.isArray(profile.mistakes)) profile.mistakes=[];
if(!Array.isArray(profile.certs)) profile.certs=[];
if(!profile.certStats || typeof profile.certStats!=="object") profile.certStats={};
if(typeof profile.totalScore!=="number") profile.totalScore=0;
if(typeof profile.vibrate!=="boolean") profile.vibrate=true;   // haptics on by default, toggle in quiz topbar
if(typeof profile.turbo!=="boolean") profile.turbo=false;      // auto-next mode, OFF by default
/* migrate old numeric progress keys -> cs601:final */
(function migrate(){
  let moved=false;
  ["unlocked","stars","best"].forEach(sec=>{
    Object.keys(profile[sec]||{}).forEach(k=>{
      if(/^\d+$/.test(k)){ profile[sec]["cs601:final:"+k]=profile[sec][k]; delete profile[sec][k]; moved=true; }
    });
  });
  if(moved) store.set("ahw_profile_v1",profile);
})();
function save(){ store.set("ahw_profile_v1",profile); }
const pKey=(sid,ex,lid)=>sid+":"+ex+":"+lid;

/* ===================== AUDIO (robust unlock) ===================== */
let AC=null;
function ac(){
  if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return null; } }
  if(AC && AC.state==="suspended"){ try{ AC.resume(); }catch(e){} }
  return AC;
}
/* Browsers block AudioContext until a user gesture — unlock on ANY interaction */
["pointerdown","keydown","touchstart","click"].forEach(ev=>{
  document.addEventListener(ev,()=>{ ac(); },{passive:true});
});
document.addEventListener("visibilitychange",()=>{ if(!document.hidden) ac(); });

function tone(f,t0,d,type,v){
  if(profile.muted) return;
  const c=ac(); if(!c) return;
  try{
    const o=c.createOscillator(), g=c.createGain();
    o.type=type||"sine"; o.frequency.value=f;
    const s=c.currentTime+t0;
    g.gain.setValueAtTime(0.0001,s);
    g.gain.exponentialRampToValueAtTime(v||0.16, s+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, s+d);
    o.connect(g); g.connect(c.destination); o.start(s); o.stop(s+d+0.06);
  }catch(e){}
}
const sfx={
  click(){ tone(520,0,.07,"triangle",.09); },
  correct(){ tone(659,0,.13,"triangle",.18); tone(988,.11,.32,"triangle",.18); tone(1319,.22,.18,"triangle",.12); },
  wrong(){ tone(233,0,.22,"sawtooth",.10); tone(174,.16,.3,"sawtooth",.10); },
  tick(){ tone(1150,0,.045,"square",.055); },
  fanfare(){ [523,659,784,1047,1319].forEach((f,i)=>tone(f,i*.13,.3,"triangle",.15)); },
  gameover(){ [392,330,262,196].forEach((f,i)=>tone(f,i*.17,.3,"sawtooth",.09)); },
  unlock(){ tone(880,0,.15,"triangle",.15); tone(1175,.14,.35,"triangle",.15); },
  heart(){ tone(311,0,.14,"square",.08); tone(262,.12,.2,"square",.08); }
};
function testSound(){ sfx.click(); setTimeout(()=>sfx.correct(),120); setTimeout(()=>sfx.fanfare(),320);
  const b=event && event.target; if(b){ b.textContent="🔊 Playing..."; setTimeout(()=>b.textContent="🔊 Test Sound",900); } }

/* ===================== CONFETTI ===================== */
const cvs=document.getElementById("confettiCanvas");
let ctx=null; try{ ctx=cvs?.getContext ? cvs.getContext("2d") : null; }catch(e){ ctx=null; }
let parts=[], confettiOn=false;
function sizeCanvas(){ if(cvs && ctx){ cvs.width=innerWidth; cvs.height=innerHeight; } }
try{ sizeCanvas(); addEventListener("resize",sizeCanvas); }catch(e){}
const CCOLORS=["#facc15","#ec4899","#7c3aed","#34d15f","#38bdf8","#f97316","#ffffff"];
function burst(x,y,n){
  for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, sp=4+Math.random()*7;
    parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-4,g:.25+Math.random()*.15,
      s:5+Math.random()*7,c:CCOLORS[(Math.random()*CCOLORS.length)|0],
      r:Math.random()*Math.PI,vr:(Math.random()-.5)*.3,life:70+Math.random()*40,rect:Math.random()>.5});
  }
  if(!ctx){ return; }
  if(!confettiOn){ confettiOn=true; tickConfetti(); }
}
function tickConfetti(){
  if(!ctx){ confettiOn=false; return; }
  ctx.clearRect(0,0,cvs.width,cvs.height);
  parts=parts.filter(p=>p.life>0 && p.y<cvs.height+30);
  parts.forEach(p=>{ p.life--; p.x+=p.vx; p.y+=p.vy; p.vy+=p.g; p.vx*=.99; p.r+=p.vr;
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r); ctx.fillStyle=p.c; ctx.globalAlpha=Math.min(1,p.life/30);
    if(p.rect) ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6); else { ctx.beginPath(); ctx.arc(0,0,p.s/2,0,7); ctx.fill(); }
    ctx.restore();
  });
  if(parts.length) requestAnimationFrame(tickConfetti); else { confettiOn=false; if(ctx) ctx.clearRect(0,0,cvs.width,cvs.height); }
}
function celebrate(){ let i=0; const iv=setInterval(()=>{ burst(Math.random()*innerWidth, innerHeight*.12, 45); if(++i>7) clearInterval(iv); },220); }

/* ===================== XP ===================== */
const XP_LEVELS=[[0,"Rookie"],[150,"Apprentice"],[350,"Scholar"],[650,"Networker"],[1000,"Pro"],[1500,"Expert"],[2200,"Master"],[3200,"Legend"]];
function levelInfo(xp){
  let cur=XP_LEVELS[0], next=null, idx=1;
  for(let i=0;i<XP_LEVELS.length;i++){ if(xp>=XP_LEVELS[i][0]){ cur=XP_LEVELS[i]; idx=i+1; next=XP_LEVELS[i+1]||null; } }
  const pct = next ? Math.min(100,((xp-cur[0])/(next[0]-cur[0]))*100) : 100;
  return {idx, title:cur[1], pct};
}

/* ===================== NAV + HASH ROUTING =====================
   Every main screen owns a URL hash (#/cpp, #/map/cs101/mid, #/exams/...)
   so sharing a link or refreshing reopens the SAME screen, and the phone
   back button still walks screen-by-screen inside the app. */
function applyScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  const el=document.getElementById(id); if(el) el.classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
  /* VUtes screens get the authentic VU grey backdrop instead of the game gradient */
  document.body.classList.toggle("vu-mode", id==="screen-mock"||id==="screen-mockterms");
}
function routeFor(id){
  if(id==="screen-home") return "#/";
  if(id==="screen-subjects") return "#/subjects";
  if(id==="screen-exams") return "#/exams/"+(G.backSid||"");
  if(id==="screen-map") return "#/map/"+(G.backSid||"")+"/"+(G.backEx||"mid");
  if(id==="screen-mocksub") return "#/mock";
  if(id==="screen-cpp") return "#/cpp";
  return null; /* transient screens (quiz/results/mock exam) keep parent URL */
}
function show(id, fromPop){
  applyScreen(id);
  const r=routeFor(id);
  if(r!==null && !fromPop && location.hash!==r){ window.__lastRoute=r; location.hash=r; }
}
function routeApply(){
  const h0=location.hash||"#/";
  if(h0===window.__lastRoute){ window.__lastRoute=null; return; }   // show() already applied it
  if(typeof MK!=="undefined" && MK && MK.started && !MK.done){ MK.done=true; clearInterval(MK.timer); }
  const h=location.hash||"#/";
  let m=h.match(/^#\/map\/([\w-]+)\/(mid|final)/);
  if(m){ if(SUBJECTS.find(x=>x.id===m[1])) showMap(m[1],m[2],true); return; }
  m=h.match(/^#\/exams\/([\w-]+)/);
  if(m){ if(SUBJECTS.find(x=>x.id===m[1])) showExams(m[1],true); return; }
  if(h.indexOf("#/subjects")===0){ showSubjects(); return; }
  if(h.indexOf("#/cpp")===0){ if(typeof showCppLab==="function") showCppLab(); return; }
  if(h.indexOf("#/mock")===0){ if(typeof showMockSubjects==="function") showMockSubjects(); return; }
  fillHome(); applyScreen("screen-home");
}
window.addEventListener("hashchange", routeApply);
window.addEventListener("DOMContentLoaded", routeApply);   // shared/refreshed URL par wahi screen khole

function openModal(id){ sfx.click(); document.getElementById(id).classList.add("open"); }

/* ===================== CONTACT & SUGGESTIONS ===================== */
const AHW_SUPPORT_WA="923470675100";
function initContactForm(){
  const sel=document.getElementById("sugSubject"); if(!sel) return;
  if(sel.options.length) return;
  sel.innerHTML='<option>General / not subject-specific</option>'+SUBJECTS.map(S=>'<option>'+S.code+" - "+S.title+'</option>').join("");
}
function sendSuggestion(){
  const n=(document.getElementById("sugName").value||"").trim();
  const sub=document.getElementById("sugSubject").value;
  const typ=document.getElementById("sugType").value;
  const msg=(document.getElementById("sugMsg").value||"").trim();
  if(!n){ alert("Please type your name first! ✍️"); return; }
  if(!msg){ alert("Please write your message / issue before sending."); return; }
  const text="🎮 AHW QUIZVERSE - Feedback\n-----------------------------\n👤 Name: "+n+"\n📚 Subject: "+sub+"\n🏷️ Type: "+typ+"\n💬 Message: "+msg+"\n-----------------------------\n⚡ Sent from AHW Quizverse game";
  SUG_LAST={text:text, url:"https://wa.me/"+AHW_SUPPORT_WA+"?text="+encodeURIComponent(text)};
  document.getElementById("sugWaLink").href=SUG_LAST.url;
  document.getElementById("sugFormView").style.display="none";
  document.getElementById("sugDoneView").style.display="block";
  sfx.correct(); streakBanner("📩 Message ready — tap the WhatsApp button!");
  /* auto-open too (works in normal browsers); blocked popups still have the button below */
  try{
    const a=document.createElement("a"); a.href=SUG_LAST.url; a.target="_blank"; a.rel="noopener";
    document.body.appendChild(a); a.click(); a.remove();
  }catch(e){}
  try{ if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text); }catch(e){}
}
let SUG_LAST={text:"",url:""};
function copySuggestion(){
  const done=()=>streakBanner("📋 Message copied — paste it in WhatsApp to 0347-0675100!");
  try{ if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(SUG_LAST.text).then(done).catch(function(){done();}); return; } }catch(e){}
  const ta=document.createElement("textarea"); ta.value=SUG_LAST.text; document.body.appendChild(ta); ta.select();
  try{ document.execCommand("copy"); }catch(e){}
  ta.remove(); done();
}
function backToSuggestionForm(){ sfx.click(); document.getElementById("sugDoneView").style.display="none"; document.getElementById("sugFormView").style.display="block"; }
function resetContactView(){ const f=document.getElementById("sugFormView"),d=document.getElementById("sugDoneView"); if(f) f.style.display="block"; if(d) d.style.display="none"; }
function closeModal(id){ document.getElementById(id).classList.remove("open"); }
function goHome(){ fillHome(); show("screen-home"); }
function escape(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;"); }

function fillHome(){ document.getElementById("playerName").value=profile.name||"";
  document.getElementById("welcomeBack").textContent = profile.name ? ("Welcome back, "+profile.name+"! 🎯 Pick up where you left off.") : ""; }
fillHome();
initContactForm();
/* dynamic subject counts on home (never go stale again) */
["heroCount","featCount","footCount"].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent=SUBJECTS.length; });
(function liveNote(){
  const live=SUBJECTS.filter(S=>!S.exams.mid.placeholder && !S.exams.final.placeholder).length;
  const coming=SUBJECTS.length-live;
  const el=document.getElementById("liveCountNote");
  if(el) el.textContent="✅ "+live+" subjects live now"+(coming?" · 🚧 "+coming+" coming soon":"");
})();
function startJourney(){
  ac();
  const n=document.getElementById("playerName").value.trim();
  if(n) profile.name=n;
  if(!profile.name) profile.name="Warrior";
  save(); sfx.fanfare(); showSubjects();
}

/* ===================== SUBJECTS ===================== */
function examStats(sid,ex){
  const S=SUBJECTS.find(s=>s.id===sid);
  const levels=S.exams[ex].lv.length;
  let stars=0, done=0;
  for(let i=1;i<=levels+1;i++){ stars+=(profile.stars[pKey(sid,ex,i)]||0); if((profile.stars[pKey(sid,ex,i)]||0)>=2) done++; }
  return {stars, total:levels*3, done, totalLv:levels};
}
let curCat="all";
function setCat(cat,btn){ sfx.click(); curCat=cat;
  document.querySelectorAll("#catChips .chip").forEach(c=>c.classList.remove("on"));
  btn.classList.add("on"); renderSubjects(); }
function subjectCard(S){
  const m=examStats(S.id,"mid"), f=examStats(S.id,"final");
  const card=document.createElement("div");
  card.className="pick-card"; card.style.setProperty("--c1",S.c1); card.style.setProperty("--c2",S.c2);
  const overall=Math.round(((m.stars+f.stars)/(m.total+f.total))*100)||0;
  card.innerHTML='<div class="pick-ribbon"></div>'+
    '<div class="pick-icon">'+S.icon+'</div>'+
    '<div class="pick-code">'+S.code+'</div>'+
    '<div class="pick-title">'+S.title+'</div>'+
    '<div class="pick-sub">📝 Midterm · 🏁 Finalterm</div>'+
    '<div class="pick-bar"><div class="pick-fill" style="width:'+overall+'%"></div></div>'+
    '<div style="font-size:12px;font-weight:800;color:#7a72a3;margin-top:8px">⭐ '+(m.stars+f.stars)+" / "+(m.total+f.total)+' stars · '+overall+'%</div>';
  const midSoon=!!S.exams.mid.placeholder, finSoon=!!S.exams.final.placeholder;
  if(midSoon&&finSoon) card.innerHTML+='<div class="soon-badge">🚧 COMING SOON</div>';
  else if(midSoon||finSoon) card.innerHTML+='<div class="soon-badge">🚧 '+(midSoon?"MID":"FINAL")+' SOON</div>';
  card.onclick=()=>{ sfx.click(); showExams(S.id); };
  return card;
}
function renderSubjects(){
  const q=(document.getElementById("subSearch").value||"").toLowerCase().trim();
  const grid=document.getElementById("subjectGrid"); grid.innerHTML="";
  const list=SUBJECTS.filter(S=>{
    const matchCat = curCat==="all" || S.cat===curCat;
    const matchQ = !q || S.code.toLowerCase().includes(q) || S.title.toLowerCase().includes(q) || (S.cat==="mcm"&&"media journalism mass communication".includes(q)) || (S.cat==="mgt"&&"management business mba accounting marketing hr hrm entrepreneurship finance economics eco micro macro".includes(q));
    return matchCat && matchQ;
  });
  /* keep every category in neat code order: CS101, CS201... ENG101, ENG201... */
  list.sort((a,b)=>a.code.localeCompare(b.code, undefined, {numeric:true}));
  if(!list.length){
    grid.innerHTML='<div class="empty-state"><span class="no-match-emoji">🔭</span>No subject found for "'+escape(q)+'" — try another search!</div>';
    return;
  }
  if(q || curCat!=="all"){ list.forEach(S=>grid.appendChild(subjectCard(S))); return; }
  ["cs","mgt","math","pak","sci","psy","mcm","eng","soc"].forEach(cat=>{
    const items=list.filter(S=>S.cat===cat);
    if(!items.length) return;
    const h=document.createElement("div"); h.className="cat-head";
    const LBL = {"cs":"💻 COMPUTER SCIENCE","math":"🔢 MATH & STATS","pak":"🇵🇰 PAKISTAN STUDIES & PHYSICS","sci":"⚛️ PHYSICS & SCIENCES","psy":"🧠 PSYCHOLOGY","mcm":"📰 MASS COMMUNICATION","mgt":"💼 MANAGEMENT & ECONOMICS","eng":"📖 ENGLISH","soc":"🏛️ SOCIAL SCIENCES"};
    h.textContent = LBL[cat]||cat;
    grid.appendChild(h);
    items.forEach(S=>grid.appendChild(subjectCard(S)));
  });
}
function showSubjects(){
  const li=levelInfo(profile.xp);
  document.getElementById("chipName").textContent=profile.name||"Warrior";
  document.getElementById("avatarLetter").textContent=(profile.name||"W")[0].toUpperCase();
  document.getElementById("xpFill").style.width=li.pct+"%";
  document.getElementById("xpText").textContent="Lv "+li.idx+" "+li.title+" · "+profile.xp+" XP";
  document.getElementById("scoreText").innerHTML="💰 Score: "+(profile.totalScore||0)+" <span style='opacity:.65;font-size:10px'>· saved 💾</span>";
  document.getElementById("muteBtn").textContent=profile.muted?"🔇":"🔊";
  renderSubjects();
  show("screen-subjects");
}

/* ===================== EXAMS ===================== */
function showExams(sid){
  const S=SUBJECTS.find(s=>s.id===sid);
  document.getElementById("examHeader").innerHTML='<button class="crumb-btn" onclick="showSubjects()">‹ Subjects</button> '+S.icon+" "+S.code+
    ' <span style="opacity:.8;font-size:13px">'+S.title+'</span>';
  const grid=document.getElementById("examGrid"); grid.innerHTML="";
  [["mid","📝","Midterm Arena","First half syllabus · past-paper MCQs"],["final","🏁","Finalterm Arena","Second half syllabus · past-paper MCQs"]].forEach(([ex,icon,title,desc])=>{
    const st=examStats(sid,ex);
    const pct=Math.round((st.stars/st.total)*100)||0;
    const card=document.createElement("div");
    card.className="pick-card"; card.style.setProperty("--c1",S.c1); card.style.setProperty("--c2",S.c2);
    const isPlaceholder=!!S.exams[ex].placeholder;
    card.innerHTML='<div class="pick-ribbon"></div><div class="exam-tag">'+S.exams[ex].label.toUpperCase()+'</div>'+
      '<div class="pick-icon">'+icon+'</div>'+
      '<div class="pick-code" style="font-size:20px">'+title+'</div>'+
      '<div class="pick-title">'+(isPlaceholder?"Question bank arriving soon — stay tuned!":desc)+'</div>'+
      '<div class="pick-bar"><div class="pick-fill" style="width:'+pct+'%"></div></div>'+
      '<div style="font-size:12px;font-weight:800;color:#7a72a3;margin-top:8px">'+(isPlaceholder?"🚧 Coming Soon · 0 MCQs yet":"⭐ "+st.stars+" / "+st.total+' stars · '+pct+'%')+'</div>';
    if(isPlaceholder) card.innerHTML+='<div class="soon-badge">🚧 COMING SOON</div>';
    card.onclick=()=>{ sfx.click(); showMap(sid,ex); };
    grid.appendChild(card);
  });
  show("screen-exams");
}

/* ===================== LEVEL MAP ===================== */
function getLevel(sid,ex,lid){
  const E=SUBJECTS.find(s=>s.id===sid).exams[ex];
  if(E.boss.id===lid) return E.boss;
  return E.lv.find(l=>l.id===lid);
}
function showMap(sid,ex){
  const S=SUBJECTS.find(s=>s.id===sid);
  G.backSid=sid; G.backEx=ex;
  document.getElementById("mapHeader").innerHTML='<button class="crumb-btn" onclick="showExams(\''+sid+'\')">‹ '+S.code+'</button> '+
    (ex==="mid"?"📝 Midterm Arena":"🏁 Finalterm Arena");
  document.getElementById("muteBtnMap").textContent=profile.muted?"🔇":"🔊";

  const grid=document.getElementById("levelGrid"); grid.innerHTML="";
  const levels=[...S.exams[ex].lv, S.exams[ex].boss];
  levels.forEach(L=>{
    const isPlaceholder = !!SUBJECTS.find(sx=>sx.id===sid).exams[ex].placeholder;
    const unlocked = !isPlaceholder && (L.id===1 || profile.unlocked[pKey(sid,ex,L.id)]===true); 
    const st=profile.stars[pKey(sid,ex,L.id)]||0;
    const best=profile.best[pKey(sid,ex,L.id)]||0;
    const card=document.createElement("div");
    card.className="lvl-card "+(unlocked?"playable":"locked")+(L.boss?" boss-card":"");
    card.style.setProperty("--c1",L.c1); card.style.setProperty("--c2",L.c2);
    const starsHtml='<span class="'+(st>=1?"":"off")+'">★</span><span class="'+(st>=2?"":"off")+'">★</span><span class="'+(st>=3?"":"off")+'">★</span>';
    card.innerHTML='<div class="lvl-ribbon"></div>'+
      (L.boss?'<div class="boss-badge">BOSS</div>':"")+
      '<div class="lvl-head"><div class="lvl-icon">'+L.icon+'</div>'+
      '<div><div class="lvl-name">'+(L.boss?"👑 ":"Level "+L.id+" · ")+L.name+'</div>'+
      '<div class="lvl-desc">'+L.desc+'</div></div></div>'+
      '<div class="lvl-meta"><div class="stars">'+starsHtml+'<div style="font-size:11px;color:#7a72a3;font-weight:800;letter-spacing:0">'+(best?("Best: "+best):"&nbsp;")+'</div></div>'+
      (unlocked?'<button class="btn-play" onclick="startLevel(\''+sid+'\',\''+ex+'\','+L.id+')">PLAY ▶</button>':'<button class="btn-locked">🔒 Locked</button>')+
      '</div>';
    if(unlocked) card.onclick=(e)=>{ if(!e.target.closest("button")) startLevel(sid,ex,L.id); };
    grid.appendChild(card);
  });
  show("screen-map");
}

/* ===================== QUIZ ENGINE ===================== */
const TIME_LIMIT=60, TIMER_WARN=15, TIMER_DANGER=5, HEART_PRICE=100;
let G={ level:null, sid:null, ex:null, qs:[], idx:-1, hearts:3, streak:0, maxStreak:0, correct:0, score:0, xpEarned:0, timer:null, timeLeft:0, answered:false, results:[], backSid:null, backEx:null };
const SHAPES=[
 '<svg class="shape" width="22" height="22" viewBox="0 0 24 24"><polygon points="12,3 22,21 2,21" fill="white"/></svg>',
 '<svg class="shape" width="22" height="22" viewBox="0 0 24 24"><polygon points="12,2 22,12 12,22 2,12" fill="white"/></svg>',
 '<svg class="shape" width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="white"/></svg>',
 '<svg class="shape" width="22" height="22" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="white"/></svg>'];
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; } return a; }

function buildLevelQuestions(sid,ex,L){
  let pool;
  if(L.boss){ const all=[]; SUBJECTS.find(s=>s.id===sid).exams[ex].lv.forEach(x=>all.push(...x.questions)); const cap=Math.min(L.bossCount||12, all.length); pool=shuffle([...all]).slice(0,cap); }
  else pool=shuffle([...L.questions]);
  return pool.map(q=>({q:q[0],opts:shuffle([...q[1]]),ans:q[1][q[2]],why:q[3]}));
}

function startLevel(sid,ex,lid){
  ac(); sfx.click();
  const L=getLevel(sid,ex,lid);
  const S=SUBJECTS.find(s=>s.id===sid);
  G={level:L, sid, ex, qs:buildLevelQuestions(sid,ex,L), idx:-1, hearts:L.boss?4:3, streak:0, maxStreak:0, correct:0, score:0, xpEarned:0, timer:null, timeLeft:0, answered:false, results:[], picks:[], view:null, turboT:null, backSid:sid, backEx:ex, mistakes:[], customArena:false, revives:0};
  document.getElementById("qLevelName").textContent = L.boss ? "👑 "+S.code+" BOSS" : (S.code+" · Level "+L.id);
  document.getElementById("qTopic").textContent = (L.boss? "GRAND BOSS · "+(ex==="mid"?"MID":"FINAL")+" MIX" : L.name.toUpperCase());
  document.getElementById("qTopic").style.setProperty("--lc1",L.c1);
  document.getElementById("qTopic").style.setProperty("--lc2",L.c2);
  document.getElementById("muteBtn2").textContent=profile.muted?"🔇":"🔊";
  refreshQuizToggles();
  show("screen-quiz");
  nextQuestion();
}

function renderHearts(){
  const h=document.getElementById("heartsPill"); h.innerHTML="";
  const total=G.level.boss?4:3;
  for(let i=0;i<total;i++){ const s=document.createElement("span"); s.className="hp"+(i<G.hearts?"":" lost"); s.textContent="❤️"; h.appendChild(s); }
}
function renderProg(){
  const p=document.getElementById("qProg"); p.innerHTML="";
  G.qs.forEach((_,i)=>{ const d=document.createElement("div");
    d.className="q-dot"+(i===G.idx?" cur":"")+(G.results[i]==="ok"?" ok":G.results[i]==="bad"?" bad":"");
    p.appendChild(d); });
}
function updateScore(){ document.getElementById("liveScore").textContent=G.score; }
function updateStreak(){
  const p=document.getElementById("streakPill");
  if(G.streak>=2){ p.classList.add("on"); document.getElementById("streakNum").textContent=G.streak; }
  else p.classList.remove("on");
}

function showGameOver(){
  clearInterval(G.timer);
  save();
  document.getElementById("goScore").textContent=G.score;
  document.getElementById("goCorrect").textContent=G.correct+" / "+G.qs.length;
  document.getElementById("goStreak").textContent=G.maxStreak+"x";
  const b=document.getElementById("btnReviewGO");
  if(G.mistakes && G.mistakes.length){ b.style.display=""; b.textContent="❌ Review My "+G.mistakes.length+" Mistake(s)"; } else { b.style.display="none"; }
  document.getElementById("goQuote").textContent=pick([
    '"Every expert was once a beginner. Retry and come back stronger!"',
    '"Failure is just XP in disguise. One more run!"',
    '"The Grand Boss is scared of players who never quit. Be that player!"'
  ]);
  sfx.gameover();
  show("screen-gameover");
}

function nextQuestion(){
  if(G.hearts<=0 && G.idx>=0){ showRevive(); return; }
  advanceQuestion();
}
function advanceQuestion(){
  G.idx++;
  clearTimeout(G.turboT); G.view=null;
  if(G.idx>=G.qs.length){ finishLevel(); return; }
  G.answered=false;
  const q=G.qs[G.idx];
  renderHearts(); renderProg(); updateScore(); updateStreak();
  document.getElementById("feedback").className="feedback";
  document.getElementById("fbNextBtn").textContent=(G.idx===G.qs.length-1)?"Finish 🏁":"Next ➜";
  document.getElementById("qText").textContent=q.q;

  const box=document.getElementById("optsBox"); box.innerHTML="";
  const cls=["opt-a","opt-b","opt-c","opt-d"];
  q.opts.forEach((opt,i)=>{
    const b=document.createElement("button");
    b.className="opt "+cls[i];
    b.innerHTML=SHAPES[i];
    const sp=document.createElement("span"); sp.textContent=opt;
    b.appendChild(sp);
    b.onclick=()=>answer(i,false);
    box.appendChild(b);
  });
  window.scrollTo({top:0,behavior:"smooth"});   // naya question: view upar le aao
  startTimer();
}

function startTimer(){
  clearInterval(G.timer);
  G.tEndQ=Date.now()+TIME_LIMIT*1000;              // wall-clock based: immune to throttling/drift
  G.timeLeft=TIME_LIMIT;
  const R=30, C=2*Math.PI*R;
  const fg=document.getElementById("timerFg"), num=document.getElementById("timerNum"), wrap=document.getElementById("timerWrap");
  fg.setAttribute("stroke-dasharray",C);
  function paint(){
    wrap.classList.toggle("warn", G.timeLeft<=TIMER_WARN && G.timeLeft>TIMER_DANGER);
    wrap.classList.toggle("danger", G.timeLeft<=TIMER_DANGER);
    num.textContent=Math.ceil(G.timeLeft);
    fg.setAttribute("stroke-dashoffset", C*(1-G.timeLeft/TIME_LIMIT));
  }
  paint();
  let lastTickSec=TIME_LIMIT;
  G.timer=setInterval(()=>{
    G.timeLeft=Math.max(0,(G.tEndQ-Date.now())/1000);
    if(G.timeLeft<=TIMER_DANGER && Math.ceil(G.timeLeft)<lastTickSec && G.timeLeft>0){ lastTickSec=Math.ceil(G.timeLeft); sfx.tick(); }
    if(G.timeLeft<=0){ G.timeLeft=0; clearInterval(G.timer); paint(); answer(-1,true); return; }
    paint();
  },100);
}

function answer(i,timeout){
  if(G.answered) return; G.answered=true;
  clearInterval(G.timer);
  const q=G.qs[G.idx];
  G.picks=G.picks||[]; G.picks[G.idx]=i;      // remember the player's pick for review navigation
  const btns=[...document.querySelectorAll("#optsBox .opt")];
  btns.forEach((b,bi)=>{ b.disabled=true; if(q.opts[bi]!==q.ans) b.classList.add("dim"); });
  const correctIdx=q.opts.indexOf(q.ans);
  btns[correctIdx].classList.remove("dim"); btns[correctIdx].classList.add("correct");

  const fb=document.getElementById("feedback");
  const fbTitle=document.getElementById("fbTitle"), fbWhy=document.getElementById("fbWhy"), fbPts=document.getElementById("fbPoints");
  const isRight=(i>=0 && q.opts[i]===q.ans);

  if(isRight){
    G.correct++; G.results[G.idx]="ok";
    G.streak++; G.maxStreak=Math.max(G.maxStreak,G.streak);
    const base=100, timeBonus=Math.round((G.timeLeft/TIME_LIMIT)*100), streakBonus=G.streak>=2?Math.min((G.streak-1)*20,100):0;
    const pts=base+timeBonus+streakBonus;
    G.score+=pts; G.xpEarned+=10+(G.streak>=3?5:0);
    sfx.correct();
    const r=btns[i].getBoundingClientRect();
    floatScore(r.left+r.width/2, r.top, "+"+pts);
    if(G.streak===3) streakBanner("🔥 "+pName()+" IS ON FIRE!");
    if(G.streak===5) streakBanner("⚡ "+pName()+", UNSTOPPABLE "+G.streak+"x!");
    if(G.streak===8) streakBanner("🚀 "+pName()+"! LEGENDARY "+G.streak+"x COMBO!");
    burst(r.left+r.width/2, r.top, 26);
    buzz(60);                                  // haptic tap on correct
    fb.className="feedback show good";
    fbTitle.innerHTML=pick(["🎉 Nailed it, "+pName()+"!","🔥 Smashed it, "+pName()+"!","💪 Brilliant, "+pName()+"!","🎯 Perfect shot, "+pName()+"!","⚡ You've got the moves, "+pName()+"!","👏 Well played, "+pName()+"!","🧠 Genius, "+pName()+"!"]);
    fbPts.classList.remove("hidden");
    fbPts.textContent="+"+pts+" pts (100 base + "+timeBonus+" speed"+(streakBonus?" + "+streakBonus+" streak":"")+")";
  } else {
    G.results[G.idx]="bad";
    G.streak=0; G.hearts--;
    renderHearts(); updateStreak(); updateScore();
    if(i>=0){ btns[i].classList.remove("dim"); btns[i].classList.add("wrongpick"); sfx.heart(); }
    sfx.wrong();
    buzz([90,50,90]);                          // double buzz on wrong
    // log into Mistake Vault
    if(!G.mistakes) G.mistakes=[];
    G.mistakes.push({q:q.q, opts:[...q.opts], ans:q.ans, picked:(i>=0?i:null), why:q.why, ts:Date.now()});
    if(!G.customArena){
      profile.mistakes=profile.mistakes.filter(m=>m.q!==q.q);
      profile.mistakes.push({q:q.q, opts:[...q.opts], ans:q.ans, picked:(i>=0?i:null), why:q.why, ts:Date.now()});
      if(profile.mistakes.length>60){ profile.mistakes=profile.mistakes.slice(-60); }
      save();
    }
    fb.className="feedback show bad";
    fbTitle.innerHTML = timeout ? "⏰ Time's up, "+pName()+"! The answer was: <b style='color:#15803d'>"+escape(q.ans)+"</b>"
                                : "💥 Ouch, "+pName()+"! The answer was: <b style='color:#15803d'>"+escape(q.ans)+"</b>";
    fbPts.classList.add("hidden");
  }
  fbWhy.innerHTML="💡 <b>Remember:</b> "+escape(q.why);
  updateScore();
  if(G.hearts<=0) document.getElementById("fbNextBtn").textContent=(G.score>=HEART_PRICE)?"❤️ Revive with 100 💰 ➜":"😵 Game Over ➜";
  scrollFeedbackIntoView();
  if(profile.turbo && G.hearts>0) scheduleTurbo();   // optional auto-next (1.5s) when Turbo is ON
}

/* On small screens the feedback panel can land below the fold after an
   answer. Gently auto-scroll so the explanation + Next button sit
   comfortably on screen — never flung all the way to the top. */
function scrollFeedbackIntoView(){
  setTimeout(()=>{
    const fb=document.getElementById("feedback"); if(!fb) return;
    const r=fb.getBoundingClientRect();
    if(r.top>=0 && r.bottom<=innerHeight) return;              // already fully visible
    const target=r.top + window.scrollY - Math.max(80, innerHeight*0.16);
    window.scrollTo({top:Math.max(0,target), behavior:"smooth"});
  },380);
}

/* ===================== HAPTICS / TURBO / TOGGLES ===================== */
function buzz(pattern){ if(profile.vibrate && navigator.vibrate){ try{ navigator.vibrate(pattern); }catch(e){} } }
function scheduleTurbo(){
  clearTimeout(G.turboT);
  G.turboT=setTimeout(()=>{
    const quizOn=document.getElementById("screen-quiz").classList.contains("active");
    if(quizOn && G.answered && G.view==null && G.hearts>0 && !document.querySelector(".modal-bg.open,.gobalt.open")) fbNext();
  },1500);
}
function toggleVibrate(){
  profile.vibrate=!profile.vibrate; save(); refreshQuizToggles();
  if(profile.vibrate){
    /* some browsers (iOS Safari, privacy browsers) have no vibration API */
    if(typeof navigator!=="undefined" && "vibrate" in navigator) buzz([80,40,80]);
    else streakBanner("⚠️ Vibration not supported in this browser");
  } else streakBanner("📴 Vibration OFF");
}
function toggleTurbo(){
  profile.turbo=!profile.turbo; save(); refreshQuizToggles();
  if(profile.turbo){ streakBanner("⚡ TURBO MODE ON — auto-Next after 1.5s!"); if(G.answered) scheduleTurbo(); }
  else { clearTimeout(G.turboT); streakBanner("⚡ Turbo mode OFF"); }
}
function refreshQuizToggles(){
  const v=document.getElementById("vibBtn"), t=document.getElementById("turboBtn");
  if(v){ v.style.opacity=profile.vibrate?"1":"0.4"; v.title="Vibration: "+(profile.vibrate?"ON":"OFF"); }
  if(t){ t.classList.toggle("turbo-on",!!profile.turbo); t.title="Turbo auto-next: "+(profile.turbo?"ON":"OFF"); }
}

/* ===================== SWIPE REVIEW NAVIGATION ===================== */
/* Right swipe = next, left swipe = previous. Previous questions reopen in a
   read-only review state (your pick marked ✕ / correct marked ✓) without
   touching hearts, score or the timer. */
function fbNext(){                       // dispatcher for the feedback Next button
  clearTimeout(G.turboT);
  if(G.view!=null){ stepView(1); return; }
  nextQuestion();
}
function goPrevQuestion(){
  if(!G.answered || G.idx<1 || G.view===0) return;
  clearTimeout(G.turboT); sfx.click();
  G.view=(G.view==null? G.idx : G.view)-1;
  paintView();
}
function stepView(d){
  if(G.view==null) return;
  const nv=G.view+d;
  if(nv<0) return;
  if(nv>=G.idx){ G.view=null; sfx.click(); restoreCurrent(); return; }
  sfx.click(); G.view=nv; paintView();
}
function renderOpts(q, disabled){
  const box=document.getElementById("optsBox"); box.innerHTML="";
  const cls=["opt-a","opt-b","opt-c","opt-d"];
  q.opts.forEach((opt,i)=>{
    const b=document.createElement("button");
    b.className="opt "+cls[i]; b.innerHTML=SHAPES[i];
    const sp=document.createElement("span"); sp.textContent=opt; b.appendChild(sp);
    if(disabled) b.disabled=true; else b.onclick=()=>answer(i,false);
    box.appendChild(b);
  });
}
function paintAnsweredState(i){
  const q=G.qs[i];
  const btns=[...document.querySelectorAll("#optsBox .opt")];
  btns.forEach((b,bi)=>{ b.disabled=true; if(q.opts[bi]!==q.ans) b.classList.add("dim"); });
  const ci=q.opts.indexOf(q.ans);
  if(btns[ci]){ btns[ci].classList.remove("dim"); btns[ci].classList.add("correct"); }
  const p=(G.picks && G.picks[i]!=null)? G.picks[i] : null;
  if(p!=null && p>=0 && q.opts[p]!==q.ans && btns[p]){ btns[p].classList.remove("dim"); btns[p].classList.add("wrongpick"); }
}
function paintView(){                    // read-only view of a previous question
  const i=G.view, q=G.qs[i];
  document.getElementById("qText").textContent=q.q;
  renderOpts(q,true); paintAnsweredState(i); renderProg();
  const fb=document.getElementById("feedback");
  fb.className="feedback show "+(G.results[i]==="ok"?"good":"bad");
  document.getElementById("fbTitle").textContent=(G.results[i]==="ok"?"✅ Review — you nailed this one!":"❌ Review — you missed this one");
  document.getElementById("fbWhy").innerHTML="💡 <b>Remember:</b> "+escape(q.why);
  document.getElementById("fbPoints").classList.add("hidden");
  document.getElementById("fbNextBtn").textContent="➜ Back to Current";
  document.getElementById("timerNum").textContent="⏸";
  window.scrollTo({top:0,behavior:"smooth"});
}
function restoreCurrent(){               // return from review to the live question
  const i=G.idx, q=G.qs[i];
  document.getElementById("qText").textContent=q.q;
  renderOpts(q,true); paintAnsweredState(i); renderProg();
  const ok=G.results[i]==="ok";
  const fb=document.getElementById("feedback");
  fb.className="feedback show "+(ok?"good":"bad");
  document.getElementById("fbTitle").textContent= ok ? "🎯 "+pName()+", you got this right!" : "💥 Ouch, "+pName()+"! The answer was: "+escape(q.ans);
  document.getElementById("fbWhy").innerHTML="💡 <b>Remember:</b> "+escape(q.why);
  document.getElementById("fbPoints").classList.add("hidden");
  document.getElementById("fbNextBtn").textContent=(i===G.qs.length-1)?"Finish 🏁":"Next ➜";
  if(G.hearts<=0) document.getElementById("fbNextBtn").textContent=(G.score>=HEART_PRICE)?"❤️ Revive with 100 💰 ➜":"😵 Game Over ➜";
  window.scrollTo({top:0,behavior:"smooth"});
}

function copyCurrentQuestion(btn){
  if(!G || !G.qs || !G.qs[G.idx]) return;
  const q=G.qs[G.idx];
  const letters=["A","B","C","D","E","F"];
  let txt="📝 Question: "+q.q+"\n\n";
  q.opts.forEach((o,i)=>{ txt+=letters[i]+". "+o+(o===q.ans?"  ✔️":"")+"\n"; });
  txt+="\n✅ Correct Answer: "+q.ans+"\n";
  if(q.why) txt+="💡 Explanation: "+q.why+"\n";
  txt+="\n⚡ From AHW Quizverse (Virtual University MCQ practice)";
  const done=()=>{ if(btn){ btn.textContent="✅ Copied!"; btn.classList.add("done"); setTimeout(()=>{ btn.textContent="📋 Copy Question"; btn.classList.remove("done"); },1600); } streakBanner("📋 Question copied — paste it anywhere!"); };
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(done).catch(function(){ fallbackCopy(txt); done(); }); return; }
  }catch(e){}
  fallbackCopy(txt); done();
}
function fallbackCopy(txt){
  const ta=document.createElement("textarea"); ta.value=txt; ta.style.position="fixed"; ta.style.opacity="0";
  document.body.appendChild(ta); ta.select();
  try{ document.execCommand("copy"); }catch(e){}
  ta.remove();
}
function pName(){ const n=(profile.name||"Warrior").trim(); return n.split(/\s+/)[0]; }

/* ===================== REVIVE / HEART SHOP ===================== */
function showRevive(){
  clearInterval(G.timer);
  const canBuy=G.score>=HEART_PRICE;
  document.getElementById("reviveScore").textContent=G.score;
  document.getElementById("reviveCount").textContent=G.revives?("⭐ Is run me revives used: "+G.revives):"";
  document.getElementById("reviveMsg").textContent=canBuy
    ? ("Warriors never give up, "+(profile.name||"Warrior")+"! Buy 1 ❤️ with your earned "+HEART_PRICE+" 💰 score — the level continues right where you left it. NO game over!")
    : ("You need "+HEART_PRICE+" 💰 to buy a heart, but you only have "+G.score+" 💰. Next time, answer fast to stack speed bonuses — then revive for sure!");
  const b=document.getElementById("btnBuyHeart");
  b.disabled=!canBuy; b.style.opacity=canBuy?"1":"0.45"; b.style.cursor=canBuy?"pointer":"not-allowed";
  document.getElementById("modal-revive").classList.add("open");
  sfx.heart();
}
function buyHeart(){
  if(G.score<HEART_PRICE || G.hearts>0) return;
  G.score-=HEART_PRICE; G.hearts=1; G.revives=(G.revives||0)+1;
  updateScore(); renderHearts();
  closeModal("modal-revive"); sfx.unlock();
  streakBanner("❤️ REVIVED! -100 💰 — the run continues!");
  advanceQuestion();
}
function declineRevive(){ closeModal("modal-revive"); sfx.click(); showGameOver(); }

function floatScore(x,y,txt){
  const d=document.createElement("div"); d.className="floating-score"; d.textContent=txt;
  d.style.left=(x-30)+"px"; d.style.top=(y-10)+"px"; document.body.appendChild(d);
  setTimeout(()=>d.remove(),1000);
}
function streakBanner(txt){
  const b=document.getElementById("streakBanner"); b.textContent=txt;
  b.classList.remove("show"); void b.offsetWidth; b.classList.add("show");
  sfx.unlock();
}
function pick(a){ return a[(Math.random()*a.length)|0]; }
function quitQuiz(){ clearInterval(G.timer); sfx.click();
  if(G.customArena){ closeModal("modal-vault"); showSubjects(); return; }
  backToMap(); }
function backToMap(){
  if(G.customArena || !G.sid){ showSubjects(); return; }
  showMap(G.backSid||G.sid, G.backEx||G.ex||"mid");
}

/* ===================== FINISH ===================== */
function finishLevel(){
  clearInterval(G.timer);
  const total=G.qs.length, acc=G.correct/total;
  const pass=G.customArena ? acc>=0.5 : acc>=0.7;
  let stars=0; if(acc>=0.9)stars=3; else if(acc>=0.7)stars=2; else if(acc>=0.5)stars=1;
  const perfect=G.correct===total;
  G.xpEarned+=stars*15+(pass?50:0)+(perfect?75:0);
  profile.xp+=G.xpEarned;
  let unlockedNext=false, nextId=null, S=null;
  if(!G.customArena){
    const K=pKey(G.sid,G.ex,G.level.id);
    if(G.score>(profile.best[K]||0)) profile.best[K]=G.score;
    if(stars>(profile.stars[K]||0)) profile.stars[K]=stars;
    S=SUBJECTS.find(s=>s.id===G.sid);
    nextId=G.level.boss?null:G.level.id+1;
    if(pass && nextId){ if(!profile.unlocked[pKey(G.sid,G.ex,nextId)]){ profile.unlocked[pKey(G.sid,G.ex,nextId)]=true; unlockedNext=true; } }
    profile.lb.push({name:profile.name||"Warrior", sub:G.sid, ex:G.ex, level:G.level.id, score:G.score, acc:Math.round(acc*100), when:Date.now()});
    profile.lb.sort((a,b)=>b.score-a.score); profile.lb=profile.lb.slice(0,15);
    profile.totalScore=(profile.totalScore||0)+G.score;
    const CK=G.sid+":"+G.ex;
    const cs=profile.certStats[CK]||(profile.certStats[CK]={correct:0,total:0});
    cs.correct+=G.correct; cs.total+=G.qs.length;
  }
  save();

  document.getElementById("resEmoji").textContent=pass?(perfect?"🤩":stars===3?"🏆":"🎉"):"😅";
  document.getElementById("resTitle").textContent=pass?(G.customArena?"📕 Vault Cleared!":(G.level.boss?"👑 BOSS DEFEATED!":"Level Conquered!")):"So Close!";
  document.getElementById("resMsg").textContent=pass
    ? (perfect?("FLAWLESS! 100% — "+pName()+", you're an absolute legend!"):G.customArena?"Your mistakes are now your strengths!":unlockedNext?("You smashed it, "+pName()+"! Next level is yours."):("Great job, "+pName()+"!"))
    : (G.customArena?("Below 50%, "+pName()+" — your vault is still haunting you. One more run!"):("You scored "+Math.round(acc*100)+"%, "+pName()+" — need 70% to unlock the next arena."));
  document.getElementById("stScore").textContent=G.score;
  document.getElementById("stAcc").textContent=Math.round(acc*100)+"%";
  document.getElementById("stStreak").textContent=G.maxStreak+"x";
  document.getElementById("stXP").textContent="+"+G.xpEarned;
  const willUnlockBoss = !G.customArena && unlockedNext && nextId && S && nextId===S.exams[G.ex].boss.id;
  document.getElementById("unlockNote").className="unlock-note"+(unlockedNext?" show":"");
  document.getElementById("unlockNote").textContent = willUnlockBoss ? "🔓👑 THE GRAND BOSS IS UNLOCKED! Good luck!" : "🔓 Next Level Unlocked! Keep the streak alive!";
  document.getElementById("failNote").className="fail-note"+(pass?"":" show");
  document.getElementById("btnNextLvl").style.display=(pass&&nextId&&!G.customArena)?"":"none";
  const rb=document.getElementById("btnReview");
  if(G.mistakes && G.mistakes.length){ rb.style.display=""; rb.textContent="❌ Review My "+G.mistakes.length+" Mistake(s)"; } else { rb.style.display="none"; }

  const rs=document.getElementById("resStars"); rs.innerHTML="";
  for(let i=1;i<=3;i++){ const sp=document.createElement("span"); sp.className=(i<=stars)?"":"off"; sp.textContent="⭐";
    rs.appendChild(sp); setTimeout(()=>{ sp.classList.add("on"); if(i<=stars) sfx.tick(); },400+i*380); }

  show("screen-complete");
  if(pass){ sfx.fanfare(); celebrate(); } else { sfx.gameover(); }
  if(!G.customArena && G.level.boss && pass) awardCertificate(G.sid, G.ex);
}

function replayLevel(){ sfx.click();
  if(G.customArena){ startMistakeArena(); return; }
  startLevel(G.sid,G.ex,G.level.id); }
function nextLevel(){ sfx.click(); startLevel(G.sid,G.ex,G.level.id+1); }

/* ===================== MISTAKE VAULT ===================== */
let reviewSrc=[];          // mistake list currently shown in the review modal
let reviewFromVault=true;   // true = all-time vault, false = this level's mistakes
function buildReviewCard(m){
  const div=document.createElement("div"); div.className="rv-card";
  const qEl=document.createElement("div"); qEl.className="rv-q"; qEl.textContent=m.q; div.appendChild(qEl);
  m.opts.forEach((o,i)=>{
    const d=document.createElement("div");
    d.className="rv-opt"+(o===m.ans?" right":(i===m.picked?" wrong":""));
    d.textContent=o;
    div.appendChild(d);
  });
  const w=document.createElement("div"); w.className="rv-why"; w.textContent="💡 "+m.why; div.appendChild(w);
  return div;
}
function showReview(fromVault){
  sfx.click();
  const src=fromVault? profile.mistakes : (G.mistakes||[]);
  reviewSrc=src; reviewFromVault=fromVault;
  const body=document.getElementById("vaultBody"); body.innerHTML="";
  document.getElementById("vaultTitle").textContent = fromVault? "📕 Mistake Vault — All Saved" : "❌ This Level's Mistakes";
  document.getElementById("vaultCount").textContent = src.length+" saved";
  const playBtn=document.getElementById("btnVaultPlay");
  playBtn.style.display = src.length? "":"none";
  playBtn.textContent = fromVault? "⚔️ Practice My Mistakes" : "⚔️ Practice These Mistakes";
  if(!src.length){ body.innerHTML='<div class="lb-empty">No mistakes saved yet — you are unbeatable! 🏆</div>'; }
  else src.slice().reverse().forEach(m=>body.appendChild(buildReviewCard(m)));
  document.getElementById("modal-vault").classList.add("open");
}
function showVault(){ showReview(true); }
function clearVault(){
  sfx.wrong();
  if(profile.mistakes && profile.mistakes.length){
    if(confirm("Clear ALL saved mistakes from the vault? ("+profile.mistakes.length+" questions)")){
      profile.mistakes=[]; save();
      document.getElementById("vaultBody").innerHTML='<div class="lb-empty">Vault cleared! Fresh start 🌱</div>';
      document.getElementById("vaultCount").textContent="0 saved";
      document.getElementById("btnVaultPlay").style.display="none";
      document.getElementById("goQuote");
    }
  }
}
function startMistakeArena(){
  const src=(reviewSrc && reviewSrc.length)? reviewSrc : (profile.mistakes||[]);
  if(!src.length) return;
  closeModal("modal-vault"); sfx.fanfare();
  // build a custom mini-arena from the current review source (up to 12 questions)
  const cp=src.slice(-12).map(m=>({q:m.q,opts:shuffle([...m.opts]),ans:m.ans,why:m.why}));
  const label = reviewFromVault ? "📕 MISTAKE VAULT" : "📕 PRACTICE ARENA";
  G={level:{id:0,name:label,c1:"#e11d48",c2:"#7c3aed",boss:true,icon:"📕"}, sid:null, ex:null,
      qs:cp, idx:-1, hearts:4, streak:0, maxStreak:0, correct:0, score:0, xpEarned:0,
      timer:null, timeLeft:0, answered:false, results:[], picks:[], view:null, turboT:null, customArena:true, mistakes:[], backSid:null, backEx:null};
  document.getElementById("qLevelName").textContent=label;
  document.getElementById("qTopic").textContent= reviewFromVault? "YOUR WEAK POINTS" : "THIS LEVEL'S MISTAKES";
  document.getElementById("qTopic").style.setProperty("--lc1","#e11d48");
  document.getElementById("qTopic").style.setProperty("--lc2","#7c3aed");
  document.getElementById("muteBtn2").textContent=profile.muted?"🔇":"🔊";
  refreshQuizToggles();
  show("screen-quiz"); nextQuestion();
}

/* ===================== CERTIFICATES ===================== */
let CERT_CURRENT=null;
function gradeOf(acc){
  if(acc>=90) return {e:"🏆", t:"OUTSTANDING", msg:"Exam-ready! A top-class result — you have truly mastered this subject.", c:"#16a34a"};
  if(acc>=80) return {e:"🥇", t:"EXCELLENT", msg:"Strong command of the topic — nearly exam-perfect. Keep it up!", c:"#2563eb"};
  if(acc>=70) return {e:"🥈", t:"GOOD", msg:"Solid performance! Polish the weak areas and you'll be golden.", c:"#f59e0b"};
  return {e:"🥉", t:"KEEP GOING", msg:"You conquered it — now sharpen the rough edges for an even better score.", c:"#f97316"};
}
function certDate(ts){ try{ return new Date(ts).toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"}); }catch(e){ return new Date(ts).toLocaleDateString(); } }
function buildCertHTML(c){
  return '<div class="cert-frame"><div class="cert-inner">'+
    '<div class="cert-logo">⚡ AHW QUIZVERSE</div>'+
    '<div class="cert-kicker">CERTIFICATE OF ACHIEVEMENT</div>'+
    '<div class="cert-title">Champion of Knowledge</div>'+
    '<div class="cert-to">Proudly presented to</div>'+
    '<div class="cert-name">'+escape(c.name)+'</div>'+
    '<div class="cert-for">for conquering <b>all levels + the Grand Boss</b> of</div>'+
    '<div class="cert-sub">'+c.icon+' '+escape(c.code)+' · '+escape(c.title)+' — <b>'+c.exam+'</b></div>'+
    '<div class="cert-stats">'+
      '<div class="cert-stat"><b>'+c.correct+'</b><span>Correct MCQs</span></div>'+
      '<div class="cert-stat"><b>'+c.total+'</b><span>Attempted</span></div>'+
      '<div class="cert-stat"><b>'+c.acc+'%</b><span>Accuracy</span></div>'+
    '</div>'+
    '<div class="cert-grade" style="background:'+c.grade.c+'">'+c.grade.e+' '+c.grade.t+'</div>'+
    '<div class="cert-gmsg">'+c.grade.msg+'</div>'+
    '<div class="cert-foot">'+
      '<div class="cert-date">📅 Issued: '+certDate(c.date)+'<br>🌐 AHW Quizverse · Virtual University exam practice</div>'+
      '<div class="cert-sign"><div class="sig">Huraira</div><div class="role">Founder · AHW Quizverse</div><div class="cert-seal">🎖️</div></div>'+
    '</div>'+
  '</div></div>';
}
function viewCertById(id,isNew){
  const c=profile.certs.find(x=>x.id===id); if(!c) return;
  CERT_CURRENT=c;
  document.getElementById("certNew").style.display = isNew? "":"none";
  document.getElementById("certBody").innerHTML = buildCertHTML(c);
  document.getElementById("modal-certs").classList.remove("open");
  openModal("modal-cert");
}
function showCerts(){
  sfx.click();
  const body=document.getElementById("certsBody"); body.innerHTML="";
  if(!profile.certs.length){ body.innerHTML='<div class="lb-empty">🎓 No certificates yet.<br><br>Conquer <b>all levels + the Grand Boss</b> of any subject\'s Midterm or Finalterm arena to earn your first achievement!</div>'; }
  else profile.certs.slice().reverse().forEach(c=>{
    const d=document.createElement("div"); d.className="rv-card"; d.style.cursor="pointer";
    d.innerHTML='<div class="rv-q">'+c.icon+' '+escape(c.code)+' · '+c.exam+'</div>'+
      '<div class="rv-why" style="margin-top:2px">'+c.grade.e+' '+c.grade.t+' · '+c.acc+'% · '+c.correct+'/'+c.total+' correct</div>'+
      '<div style="font-size:11px;font-weight:700;color:#9b92b8;margin-top:6px">📅 '+certDate(c.date)+'</div>';
    d.onclick=()=>{ sfx.click(); viewCertById(c.id,false); };
    body.appendChild(d);
  });
  openModal("modal-certs");
}
function printCert(){
  if(!CERT_CURRENT) return;
  const c=CERT_CURRENT;
  const area=document.getElementById("certPrintArea");
  area.innerHTML = buildCertHTML(c);
  document.body.classList.add("print-cert");
  const finish=()=>{ document.body.classList.remove("print-cert"); };
  try{ window.print(); }catch(e){}
  /* afterprint is not reliable everywhere — clear a moment later */
  setTimeout(finish, 500);
  try{ window.addEventListener("afterprint", finish, {once:true}); }catch(e){}
}
function awardCertificate(sid,ex){
  const S=SUBJECTS.find(s=>s.id===sid);
  const cs=profile.certStats[sid+":"+ex]||{correct:0,total:0};
  const acc=cs.total? Math.round((cs.correct/cs.total)*100):0;
  const cert={ id:sid+":"+ex, name:profile.name||"Warrior", code:S.code, title:S.title, icon:S.icon, exam:ex==="mid"?"Midterm":"Finalterm", correct:cs.correct, total:cs.total, acc:acc, grade:gradeOf(acc), date:Date.now(), c1:S.c1, c2:S.c2 };
  const idx=profile.certs.findIndex(c=>c.id===cert.id);
  if(idx>=0){ if(cert.acc>=profile.certs[idx].acc) profile.certs[idx]=cert; }
  else profile.certs.push(cert);
  save();
  setTimeout(()=>viewCertById(cert.id,true), 700);
}

/* ===================== LEADERBOARD ===================== */
function showLeaderboard(){
  sfx.click();
  const body=document.getElementById("lbBody");
  if(!profile.lb.length){ body.innerHTML='<div class="lb-empty">No scores yet — be the first legend! 🚀</div>'; }
  else{
    const rows=profile.lb.map((e,i)=>{
      const subCode=e.sub?e.sub.toUpperCase():"CS601";
      const tag=subCode+"·"+(e.ex==="final"?"F":"M")+(e.level>=4&&e.sub!=="cs601"?"·B":e.level===7&&e.sub==="cs601"?"·B":"·L"+e.level);
      return '<tr'+(e.when>Date.now()-60000?' class="me"':"")+'><td>'+medal(i)+' '+(i+1)+'</td><td>'+escape(e.name)+'</td><td>'+tag+'</td><td><b>'+e.score+'</b></td><td>'+e.acc+'%</td></tr>';
    }).join("");
    body.innerHTML='<table class="lb"><tr><th>#</th><th>Warrior</th><th>Arena</th><th>Score</th><th>Acc</th></tr>'+rows+'</table>';
  }
  openModal("modal-lb");
}
function medal(i){ return i===0?"🥇":i===1?"🥈":i===2?"🥉":"▫️"; }

/* ===================== MISC ===================== */
function toggleMute(){ profile.muted=!profile.muted; save();
  ["muteBtn","muteBtn2","muteBtnMap"].forEach(id=>{ const b=document.getElementById(id); if(b) b.textContent=profile.muted?"🔇":"🔊"; });
  if(!profile.muted) sfx.click();
}
function resetProgress(){
  if(confirm("Reset ALL progress (stars, XP, levels, scores, certificates)? This cannot be undone!")){
    profile.unlocked={}; profile.stars={}; profile.best={}; profile.xp=0; profile.lb=[];
    profile.certs=[]; profile.certStats={};
    save(); sfx.gameover(); showSubjects();
  }
}
document.addEventListener("keydown",e=>{
  const t=e.target;
  /* A focused, enabled button/link fires its OWN click on Enter — skip the
     global handler in that case, otherwise actions double-fire
     (this used to skip a whole question when Next was focused). */
  const activates=!!(t&&(t.tagName==="A"||(t.tagName==="BUTTON"&&!t.disabled)));
  const homeActive=document.getElementById("screen-home").classList.contains("active");
  const quizActive=document.getElementById("screen-quiz").classList.contains("active");
  if(e.key==="Enter" && homeActive && !activates) startJourney();
  if(["1","2","3","4"].includes(e.key) && quizActive && !G.answered && !(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"))){
    const btns=document.querySelectorAll("#optsBox .opt"); const i=+e.key-1; if(btns[i]) btns[i].click();
  }
  if(e.key==="Enter" && G.answered && quizActive && !activates) nextQuestion();
});
/* ===================== MOCK EXAM (VUtes-style midterm) =====================
   Mirrors the VU qb.vu.edu.pk exam room: question on the left, palette +
   submit on the right, 50-minute countdown on top.
   Objective subjects -> 40 MCQs (40 marks). Others -> 14 MCQs + 2 short
   (3 marks) + 2 long (5 marks) = 30 marks. MCQs auto-graded; subjective
   answers are self-checked against a model answer in the result screen. */
const MOCK_OBJECTIVE=["cs101","eng101","pak301","isl202","phy101","mgt301","mgt503","soc101","psy101"];
const MOCK_MINUTES=50;
let MK=null;
const RING_C=276.5;

function showMockSubjects(){
  sfx.click();
  const grid=document.getElementById("mockGrid"); grid.innerHTML="";
  SUBJECTS.filter(S=>!S.exams.mid.placeholder).forEach(S=>{
    const obj=MOCK_OBJECTIVE.includes(S.id);
    const card=document.createElement("div");
    card.className="pick-card"; card.style.setProperty("--c1",S.c1); card.style.setProperty("--c2",S.c2);
    card.innerHTML='<div class="pick-ribbon"></div><div class="exam-tag">'+(obj?"OBJECTIVE":"OBJ + SUBJECTIVE")+'</div>'+
      '<div class="pick-icon">'+S.icon+'</div><div class="pick-code">'+S.code+'</div>'+
      '<div class="pick-title">'+S.title+'</div>'+
      '<div class="pick-sub">'+(obj?"40 MCQs · 40 marks":"14 MCQs + 2 short + 2 long · 30 marks")+' · '+MOCK_MINUTES+' min</div>'+
      '<div style="margin-top:12px"><span class="btn btn-blue" style="pointer-events:none">Open Paper ➜</span></div>';
    card.onclick=()=>prepMock(S.id);
    grid.appendChild(card);
  });
  show("screen-mocksub");
}
function bankQs(ex){ return ex && !ex.placeholder ? ex.lv.flatMap(L=>L.questions) : []; }

/* Build the paper, then show the VUtes Conduct Instructions screen. */
function prepMock(sid){
  ac(); sfx.click();
  const S=SUBJECTS.find(s=>s.id===sid); if(!S) return;
  const obj=MOCK_OBJECTIVE.includes(sid);
  const mid=bankQs(S.exams.mid), fin=bankQs(S.exams.final);
  let items=[];
  if(obj){
    let pool=shuffle([...mid]);
    if(pool.length<40) pool=pool.concat(shuffle([...fin]));
    items=pool.slice(0,40).map(q=>({type:"mcq",q:q[0],opts:shuffle([...q[1]]),ans:q[1][q[2]],why:q[3],marks:1}));
  }else{
    let m=shuffle([...mid]); if(m.length<14) m=m.concat(shuffle([...fin]));
    const mcqs=m.slice(0,14).map(q=>({type:"mcq",q:q[0],opts:shuffle([...q[1]]),ans:q[1][q[2]],why:q[3],marks:1}));
    let rest=m.slice(14); if(rest.length<4) rest=rest.concat(shuffle([...fin]));
    const shorts=rest.slice(0,2).map(q=>({type:"short",q:q[0],ans:q[1][q[2]],why:q[3],marks:3}));
    const longs=rest.slice(2,4).map(q=>({type:"long",q:q[0],ans:q[1][q[2]],why:q[3],marks:5}));
    items=mcqs.concat(shorts,longs);
  }
  if(!items.length){ alert("No questions available for this subject yet."); return; }
  if(MK && MK.timer) clearInterval(MK.timer);
  MK={sid,obj,S,items,idx:0,picks:items.map(()=>null),texts:items.map(()=>""),saved:items.map(()=>false),
      flagged:items.map(()=>false),award:items.map(()=>null),total:items.reduce((a,b)=>a+b.marks,0),
      mcqGot:0,mcqMax:0,started:false,done:false,t0:null,tEnd:0,timer:null};
  document.getElementById("mtStartTime").textContent=fmtClock(new Date());
  document.getElementById("mtTimer").textContent=MOCK_MINUTES+":00";
  document.getElementById("mtAgree").checked=false;
  document.getElementById("btnStartExam").disabled=true;
  show("screen-mockterms");
}
function beginMock(){
  if(!MK||MK.started) return;
  MK.started=true; MK.t0=new Date(); MK.tEnd=Date.now()+MOCK_MINUTES*60000;
  MK.timer=setInterval(mockTick,500);
  document.getElementById("mkCourse").textContent=MK.S.code+" ("+MK.S.title+")";
  document.getElementById("mkLogin").textContent=fmtClock(MK.t0);
  document.getElementById("mkUser").textContent=(profile.name||"GUEST").toUpperCase();
  document.getElementById("mkTotal").textContent=MK.items.length;
  sfx.fanfare(); mockTick(); mockPaint(); show("screen-mock");
}
function fmtClock(d){ let h=d.getHours(), m=d.getMinutes(); const ap=h>=12?"PM":"AM"; h=h%12||12; return h+":"+(m<10?"0":"")+m+" "+ap; }
function mockTick(){
  if(!MK||MK.done||!MK.started) return;
  const left=Math.max(0,MK.tEnd-Date.now());
  const m=Math.floor(left/60000), s=Math.floor((left%60000)/1000);
  document.getElementById("mkTimer").textContent=(m<10?"0":"")+m+":"+(s<10?"0":"")+s;
  const fg=document.getElementById("mkRingFg");
  if(fg) fg.setAttribute("stroke-dashoffset", (RING_C*(1-left/(MOCK_MINUTES*60000))).toFixed(1));
  document.getElementById("mkRingWrap").classList.toggle("low", left<5*60000);
  if(left<=0) mockFinish(true);
}
function mockAttemptedCount(){ return MK.saved.filter(Boolean).length; }
function mockFlaggedCount(){ return MK.flagged.filter(Boolean).length; }
function mockPaint(){
  const it=MK.items[MK.idx];
  document.getElementById("mkQNo").textContent="Question No . "+(MK.idx+1)+" of "+MK.items.length;
  document.getElementById("mkMarks").textContent="Marks: "+it.marks+" (Time 1 Min)";
  document.getElementById("mkFlagBtn").classList.toggle("on", MK.flagged[MK.idx]);
  document.getElementById("mockQText").textContent=it.q;
  const box=document.getElementById("mockOpts"); box.innerHTML="";
  if(it.type==="mcq"){
    it.opts.forEach((o,i)=>{
      const row=document.createElement("div");
      row.className="vt-orow"+(MK.picks[MK.idx]===i?" on":"");
      row.innerHTML='<span class="vt-osq"><i></i></span><span class="vt-otxt"></span>';
      row.querySelector(".vt-otxt").textContent=o;
      row.onclick=()=>{ MK.picks[MK.idx]=i; sfx.click(); mockPaint(); };
      box.appendChild(row);
    });
  }else{
    const ta=document.createElement("textarea");
    ta.rows=it.type==="long"?8:5;
    ta.placeholder="Write your answer here, then press Save...";
    ta.value=MK.texts[MK.idx]||"";
    ta.oninput=()=>{ MK.texts[MK.idx]=ta.value; mockSaveState(); };
    box.appendChild(ta);
  }
  mockSaveState(); mockPal();
}
function mockSaveState(){
  const sb=document.getElementById("mockSaveBtn"); if(!sb||!MK) return;
  const it=MK.items[MK.idx];
  const savable = it.type==="mcq" ? MK.picks[MK.idx]!=null : (MK.texts[MK.idx]||"").trim().length>0;
  sb.disabled=!(savable && !MK.saved[MK.idx]);
}
function mockSave(){
  if(!MK) return;
  MK.saved[MK.idx]=true; sfx.correct();
  streakBanner("💾 Saved — Question "+(MK.idx+1));
  mockPaint();
}
function mockPal(){
  const pal=document.getElementById("mockPal"); pal.innerHTML="";
  MK.items.forEach((it,i)=>{
    const b=document.createElement("button"); b.className="mp2";
    if(MK.saved[i]) b.classList.add("done");
    if(MK.flagged[i]) b.classList.add("flag");
    if(i===MK.idx) b.classList.add("cur");
    b.textContent=(i+1<10?"0":"")+(i+1);
    b.onclick=()=>{ MK.idx=i; sfx.click(); mockPaint(); };
    pal.appendChild(b);
  });
  const att=mockAttemptedCount();
  const pct=Math.round((att/MK.items.length)*100);
  document.getElementById("mkPct").textContent=pct+"%";
  document.getElementById("mkBarFill").style.width=pct+"%";
  document.getElementById("mkAtt").textContent=att;
  document.getElementById("mkFlagged").textContent=mockFlaggedCount();
}
function mockFlag(){
  if(!MK) return;
  MK.flagged[MK.idx]=!MK.flagged[MK.idx];
  sfx.click(); mockPaint();
}
function mockToggleSide(){
  const m=document.getElementById("vtMain");
  m.classList.toggle("noside");
  document.querySelector(".vt-collapse").textContent=m.classList.contains("noside")?"«":"»";
}
function mockJump(i){ if(!MK) return; MK.idx=Math.max(0,Math.min(MK.items.length-1,i)); sfx.click(); mockPaint(); }
function mockFirst(){ mockJump(0); }
function mockLast(){ mockJump(MK.items.length-1); }
function mockNext(){ if(MK.idx<MK.items.length-1){ MK.idx++; sfx.click(); mockPaint(); } }
function mockPrev(){ if(MK.idx>0){ MK.idx--; sfx.click(); mockPaint(); } }
function mockFinishPrompt(){
  const un=MK.items.length-mockAttemptedCount();
  document.getElementById("mockFinInfo").textContent=
    "Attempted questions: "+mockAttemptedCount()+" of "+MK.items.length+(un?"  ("+un+" unattempted)":"")+".";
  document.getElementById("mockFinChk").checked=false;
  document.getElementById("btnMockFin").disabled=true;
  openModal("modal-mockfin");
}
function mockFinish(auto){
  if(!MK||MK.done) return;
  MK.done=true; clearInterval(MK.timer); closeModal("modal-mockfin");
  if(auto) streakBanner("⏰ Time up! Paper auto-submitted.");
  MK.mcqGot=0; MK.mcqMax=0;
  MK.items.forEach((it,i)=>{ if(it.type==="mcq"){ MK.mcqMax+=it.marks; if(MK.picks[i]!=null && it.opts[MK.picks[i]]===it.ans) MK.mcqGot+=it.marks; } });
  buildMockResult();
  show("screen-mockres");
  if(MK.mcqMax && MK.mcqGot/MK.mcqMax>=0.5){ sfx.fanfare(); celebrate(); } else sfx.gameover();
}

function mockSubjMax(){ return MK.items.reduce((a,b)=>a+(b.type!=="mcq"?b.marks:0),0); }
function mockSubjGot(){ return MK.items.reduce((a,b,i)=>a+(b.type!=="mcq"?(MK.award[i]||0):0),0); }
function buildMockResult(){
  const S=SUBJECTS.find(s=>s.id===MK.sid);
  const subjMax=mockSubjMax();
  const got=MK.mcqGot+mockSubjGot();
  const pct=Math.round((got/Math.max(1,MK.total))*100);
  document.getElementById("mrTitle").textContent=S.code+" MIDTERM MOCK — RESULT";
  document.getElementById("mrStats").innerHTML=
    '<div class="stat"><b>'+MK.mcqGot+'/'+MK.mcqMax+'</b><small>MCQ Marks</small></div>'+
    (subjMax?'<div class="stat"><b>'+mockSubjGot()+'/'+subjMax+'</b><small>Subjective (self-checked)</small></div>':'')+
    '<div class="stat"><b>'+got+'/'+MK.total+'</b><small>Total</small></div>'+
    '<div class="stat"><b>'+pct+'%</b><small>Score</small></div>';
  const gr= pct>=80?["A+","🏆"]:pct>=65?["A","🥇"]:pct>=50?["B","🥈"]:pct>=40?["C","🥉"]:["F","📚"];
  document.getElementById("mrGrade").textContent="Grade "+gr[0]+" "+gr[1]+" — "+(pct>=40?"PASS ✅":"FAIL ❌ (40% required)");
  const body=document.getElementById("mrBody"); body.innerHTML="";
  MK.items.forEach((it,i)=>{
    const d=document.createElement("div"); d.className="rv-card";
    const q=document.createElement("div"); q.className="rv-q";
    q.textContent="Q"+(i+1)+" ("+it.marks+" mark"+(it.marks>1?"s":"")+(it.type!=="mcq"?", "+it.type.toUpperCase():"")+")  "+it.q;
    d.appendChild(q);
    if(it.type==="mcq"){
      it.opts.forEach((o,oi)=>{
        const od=document.createElement("div");
        od.className="rv-opt"+(o===it.ans?" right":(MK.picks[i]===oi?" wrong":""));
        od.textContent=o+(o===it.ans?"  ✓":(MK.picks[i]===oi?"  ✕ (your pick)":""));
        d.appendChild(od);
      });
      const ok=MK.picks[i]!=null&&it.opts[MK.picks[i]]===it.ans;
      const w=document.createElement("div"); w.className="rv-why";
      w.textContent=(ok?"✅ +"+it.marks:"❌ 0")+" · 💡 "+it.why; d.appendChild(w);
    }else{
      const ua=document.createElement("div"); ua.className="rv-why";
      ua.textContent="✍️ Your answer: "+((MK.texts[i]||"").trim()||"(not attempted)"); d.appendChild(ua);
      const ma=document.createElement("div"); ma.className="rv-opt right";
      ma.textContent="Model answer: "+it.ans+" — "+it.why; d.appendChild(ma);
      const row=document.createElement("div"); row.className="rv-why"; row.style.marginTop="8px";
      row.innerHTML="<b>Self-check:</b> ";
      const bf=document.createElement("button"); bf.className="btn btn-green";
      bf.style.cssText="padding:6px 12px;font-size:12px;margin:0 6px 6px 0";
      bf.textContent="✅ Award "+it.marks;
      bf.onclick=()=>{ MK.award[i]=it.marks; sfx.correct(); buildMockResult(); };
      const bz=document.createElement("button"); bz.className="btn btn-gray";
      bz.style.cssText="padding:6px 12px;font-size:12px;margin:0 6px 6px 0";
      bz.textContent="❌ 0";
      bz.onclick=()=>{ MK.award[i]=0; sfx.wrong(); buildMockResult(); };
      const st=document.createElement("span");
      st.textContent="(awarded: "+(MK.award[i]==null?"—":MK.award[i])+"/"+it.marks+")";
      row.appendChild(bf); row.appendChild(bz); row.appendChild(st);
      d.appendChild(row);
    }
    body.appendChild(d);
  });
}
function mockExit(){
  if(MK && !MK.done){ MK.done=true; clearInterval(MK.timer); }
  showMockSubjects();
}

/* ===== TOUCH SWIPE on the quiz screen: right = next, left = previous ===== */
(function(){
  let sx=0, sy=0, on=false;
  const el=document.getElementById("screen-quiz");
  if(!el) return;
  el.addEventListener("touchstart",function(e){ const t=e.changedTouches[0]; sx=t.clientX; sy=t.clientY; on=true; },{passive:true});
  el.addEventListener("touchend",function(e){
    if(!on) return; on=false;
    const t=e.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy;
    if(Math.abs(dx)<60 || Math.abs(dy)>Math.abs(dx)*0.8) return;             // ignore taps/vertical scrolls
    if(!document.getElementById("screen-quiz").classList.contains("active")) return;
    if(document.querySelector(".modal-bg.open,.gobalt.open")) return;
    if(dx>0){ if(G.view!=null) stepView(1); else if(G.answered) fbNext(); }  // swipe right -> next
    else    { if(G.view!=null) stepView(-1); else goPrevQuestion(); }        // swipe left  -> previous
  },{passive:true});
})();

/* Modal ergonomics: Escape key or clicking the dark backdrop closes modals */
document.addEventListener("click", function(e){
  const t=e.target;
  if(t && t.classList && (t.classList.contains("modal-bg")||t.classList.contains("gobalt"))) t.classList.remove("open");
});
document.addEventListener("keydown", function(e){
  if(e.key==="Escape") document.querySelectorAll(".modal-bg.open,.gobalt.open").forEach(m=>m.classList.remove("open"));
});

/* ===================== PROGRESS BACKUP (Export / Import) =====================
   Students switch phones or clear browsers — their XP, stars, certs and
   Mistake Vault should travel with them. Export downloads a JSON backup;
   Import restores it on any device. */
function exportProgress(){
  sfx.click();
  try{
    const data=JSON.stringify({app:"AHW Quizverse", v:1, when:Date.now(), profile:profile}, null, 2);
    const blob=new Blob([data],{type:"application/json"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="AHW-Quizverse-Progress.json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),3000);
    streakBanner("📤 Progress exported — file saved to downloads!");
  }catch(e){ streakBanner("❌ Export failed on this browser"); }
}
function importProgress(){
  sfx.click();
  const inp=document.createElement("input");
  inp.type="file"; inp.accept=".json,application/json";
  inp.onchange=()=>{
    const f=inp.files && inp.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=()=>{
      try{
        const obj=JSON.parse(r.result);
        const p=obj.profile||obj;
        if(!p || typeof p!=="object" || typeof (p.xp!=null?p.xp:0)!=="number") throw new Error("bad file");
        if(!confirm("Replace current progress with the imported backup?")) return;
        ["name","xp","muted","vibrate","turbo","unlocked","stars","best","lb","mistakes","totalScore","certs","certStats"].forEach(k=>{ if(p[k]!==undefined) profile[k]=p[k]; });
        if(!Array.isArray(profile.mistakes)) profile.mistakes=[];
        if(!Array.isArray(profile.certs)) profile.certs=[];
        save();
        streakBanner("📥 Progress imported — reloading...");
        setTimeout(()=>location.reload(),900);
      }catch(e){ streakBanner("❌ Invalid progress file"); }
    };
    r.readAsText(f);
  };
  inp.click();
}

/* ===================== PWA: offline + installable ===================== */
if("serviceWorker" in navigator && (location.protocol==="https:"||location.protocol==="http:")){
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}

/* Dev console access — harmless: lets you inspect app state live */
globalThis.AHW={SUBJECTS,profile,getG:()=>G};
