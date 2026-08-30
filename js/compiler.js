/* ======================================================================
   AHW QUIZVERSE - C++ LAB v2 (mini-IDE) (c) 2026 AHW Quizverse / All VU Students.
   - Multi-file tabs (main.cpp + headers), open several files at once
   - Real compile+run: Judge0 CE (GCC 14) -> Wandbox (GCC 14) -> CORS-proxy
     fallbacks -> Piston (self-host support via Settings)
   - Settings: C++ standard, -O0/-O2, -Wall, custom API URL, font size, theme
   - .cpp download / open / auto-save, snippets, VU challenges with XP
   ====================================================================== */

/* Build self-heal: agar index.html aur compiler.js ke versions mix ho jayen
   (stale cache), ek dafa auto-reload kar ke fresh pair le lo. */
const AHW_BUILD="ahw8";
(function(){
  try{
    const b=document.body ? document.body.getAttribute("data-build") : null;
    if(b!==AHW_BUILD && !sessionStorage.getItem("ahw_resync")){
      sessionStorage.setItem("ahw_resync","1");
      setTimeout(function(){ location.reload(); }, 50);
    }
    if(b===AHW_BUILD) sessionStorage.removeItem("ahw_resync");
  }catch(e){}
})();
/* ---------------- state ---------------- */
if (!profile.cppSolved || typeof profile.cppSolved !== "object") profile.cppSolved = {};
if (!profile.cppSettings || typeof profile.cppSettings !== "object")
  profile.cppSettings = { std:"c++17", opt:"-O0", warn:false, customUrl:"", fontSize:13.5, light:false };
const CPP_XP = { Easy: 10, Medium: 15, Hard: 25 };

let CPP_FILES = [{ name:"main.cpp", code:"" }];
let CPP_CUR = 0;
let CPP_ACTIVE = null;
let CPP_LAST_VIA = "—";

function cppFlags(){
  const s = profile.cppSettings;
  return ("-std=" + s.std + " " + (s.opt||"-O0") + (s.warn ? " -Wall" : "")).trim();
}
function cppPersist(){
  try{ localStorage.setItem("ahw_cpp_files", JSON.stringify(CPP_FILES));
       localStorage.setItem("ahw_cpp_cur", String(CPP_CUR)); }catch(e){}
}
function cppLoadPersisted(){
  try{
    const f = localStorage.getItem("ahw_cpp_files");
    if(f){ const arr = JSON.parse(f); if(Array.isArray(arr) && arr.length && arr[0].name) CPP_FILES = arr; }
    CPP_CUR = Math.min(CPP_FILES.length-1, parseInt(localStorage.getItem("ahw_cpp_cur")||"0",10)||0);
  }catch(e){}
  if(!CPP_FILES[CPP_CUR]) CPP_CUR = 0;
}

/* ---------------- editor core ---------------- */
function cppEscape(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function cppHighlight(src){
  const re=/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(\"(?:[^\"\\\n]|\\.)*\"|'(?:[^'\\\n]|\\.)*')|(^ *#[a-z]+)|\b(int|float|double|char|bool|void|long|short|unsigned|signed|class|struct|public|private|protected|virtual|override|template|typename|namespace|using|new|delete|return|if|else|for|while|do|switch|case|break|continue|default|const|static|this|true|false|nullptr|include|iostream|fstream|sstream|iomanip|string|vector|cin|cout|endl|main)\b|(\b\d+(\.\d+)?\b)/gm;
  return cppEscape(src).replace(re, function(m, com, str, pre, kw, num){
    if(com) return '<span class="tk-c">'+m+'</span>';
    if(str) return '<span class="tk-s">'+m+'</span>';
    if(pre) return '<span class="tk-p">'+m+'</span>';
    if(kw)  return '<span class="tk-k">'+m+'</span>';
    if(num) return '<span class="tk-n">'+m+'</span>';
    return m;
  });
}
function cppCaret(){
  const ta=document.getElementById("cedCode"); if(!ta) return {ln:1,col:1};
  const upto=ta.value.slice(0, ta.selectionStart||0).split("\n");
  return { ln: upto.length, col: upto[upto.length-1].length+1 };
}
function cppStatus(){
  const el=document.getElementById("cppStatus"); if(!el) return;
  const c=cppCaret(), s=profile.cppSettings;
  el.innerHTML = "🔧 " + CPP_LAST_VIA + " · " + AHW_BUILD + " &nbsp;·&nbsp; " + s.std.toUpperCase() + " " + s.opt + (s.warn?" -Wall":"") +
    " &nbsp;·&nbsp; Ln " + c.ln + ", Col " + c.col + " &nbsp;·&nbsp; " + CPP_FILES.length + " file(s)";
}
function cppEditorSync(){
  const ta=document.getElementById("cedCode"), pre=document.getElementById("cedHl"), gut=document.getElementById("cedGutter");
  if(!ta) return;
  CPP_FILES[CPP_CUR].code = ta.value;
  pre.innerHTML = cppHighlight(ta.value) + "\n";
  gut.textContent = ta.value.split("\n").map((_,i)=>i+1).join("\n");
  pre.scrollTop = ta.scrollTop; gut.scrollTop = ta.scrollTop;
  const rb=document.getElementById("cppRunBtn"); if(rb) rb.disabled = !ta.value.trim();
  cppPersist(); cppStatus();
}
function cppRenderTabs(){
  const wrap=document.getElementById("cppTabs"); if(!wrap) return;
  wrap.innerHTML="";
  CPP_FILES.forEach((f,i)=>{
    const t=document.createElement("div");
    t.className="ide-tab"+(i===CPP_CUR?" on":"");
    t.innerHTML='<span class="ide-tabname"></span>'+(CPP_FILES.length>1?'<span class="ide-tabx" title="Close">✕</span>':"");
    t.querySelector(".ide-tabname").textContent=f.name;
    t.onclick=()=>{ if(i!==CPP_CUR){ CPP_CUR=i; cppLoadCurrent(); } };
    const x=t.querySelector(".ide-tabx");
    if(x) x.onclick=(e)=>{ e.stopPropagation(); CPP_FILES.splice(i,1); CPP_CUR=Math.max(0,Math.min(CPP_CUR, CPP_FILES.length-1)); if(!CPP_FILES.length) CPP_FILES=[{name:"main.cpp",code:""}]; cppRenderTabs(); cppLoadCurrent(); };
    wrap.appendChild(t);
  });
}
function cppLoadCurrent(){
  const ta=document.getElementById("cedCode");
  ta.value = CPP_FILES[CPP_CUR].code;
  cppRenderTabs(); cppEditorSync(); cppApplyTheme();
}
function cppApplyTheme(){
  const s=profile.cppSettings;
  const w=document.querySelector(".ced-wrap"); if(w) w.classList.toggle("light", !!s.light);
  ["cedCode","cedHl","cedGutter"].forEach(id=>{ const e=document.getElementById(id); if(e) e.style.fontSize=s.fontSize+"px"; });
}
function cppSetCode(code, fname){
  let i = CPP_FILES.findIndex(f=>f.name===fname);
  if(i<0){ CPP_FILES.push({name:fname, code:code}); i=CPP_FILES.length-1; }
  else CPP_FILES[i].code = code;
  CPP_CUR=i; cppLoadCurrent();
}

/* ---------------- files: new / open(multi) / download ---------------- */
function cppNewFile(){
  const n = prompt("New file name:", "file"+(CPP_FILES.length+1)+".cpp");
  if(!n) return;
  let name=n.trim(); if(!/\.(cpp|cc|c|h|hpp|txt)$/i.test(name)) name+=".cpp";
  if(CPP_FILES.some(f=>f.name===name)){ alert("This file is already open."); return; }
  CPP_FILES.push({name:name, code:""}); CPP_CUR=CPP_FILES.length-1;
  cppRenderTabs(); cppLoadCurrent(); sfx.click();
}
function cppOpenFiles(){
  const inp=document.createElement("input");
  inp.type="file"; inp.multiple=true; inp.accept=".cpp,.cc,.c,.h,.hpp,.txt";
  inp.onchange=()=>{
    const files=[...(inp.files||[])]; if(!files.length) return;
    let pending=files.length;
    files.forEach(f=>{
      const r=new FileReader();
      r.onload=()=>{ 
        let i=CPP_FILES.findIndex(x=>x.name===f.name);
        if(i<0){ CPP_FILES.push({name:f.name, code:String(r.result)}); }
        else CPP_FILES[i].code=String(r.result);
        if(--pending===0){ CPP_CUR=CPP_FILES.length-1; cppRenderTabs(); cppLoadCurrent();
          streakBanner("📂 "+files.length+" file(s) opened — switch tabs to edit them!"); }
      };
      r.readAsText(f);
    });
  };
  inp.click();
}
let SAVE_BLOB_URL=null;
function cleanCppName(n){
  let name=String(n||"").trim().replace(/[^\w.\-]+/g,"_");
  if(!name) name="program";
  if(!/\.(cpp|cc|c|h|hpp)$/i.test(name)) name+=".cpp";
  return name;
}
function prepareSaveLink(name){
  const f=CPP_FILES[CPP_CUR];
  try{ if(SAVE_BLOB_URL) URL.revokeObjectURL(SAVE_BLOB_URL); }catch(e){}
  SAVE_BLOB_URL=URL.createObjectURL(new Blob([f.code],{type:"text/x-c++src"}));
  const a=document.getElementById("saveLink");
  if(a){ a.href=SAVE_BLOB_URL; a.download=name; }
}
function cppDownload(){
  /* rename dialog: user naam likhe, phir download — exact wahi .cpp file */
  const f=CPP_FILES[CPP_CUR];
  document.getElementById("saveName").value=cleanCppName(f.name);
  prepareSaveLink(cleanCppName(f.name));
  openModal("modal-cppsave");
  sfx.click();
}
function saveCppNow(){
  const name=cleanCppName(document.getElementById("saveName").value);
  prepareSaveLink(name);
  const f=CPP_FILES[CPP_CUR];
  try{
    const file=new File([f.code], name, {type:"text/plain"});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      navigator.share({files:[file], title:name})
        .then(()=>{ streakBanner("💾 "+name+" saved!"); sfx.correct(); })
        .catch(()=>blobDownload(f.code,name));
      return;
    }
  }catch(e){}
  blobDownload(f.code,name);
}
function blobDownload(code,name){
  const blob=new Blob([code],{type:"text/x-c++src"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob); a.download=name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),3000);
  streakBanner("💾 Download shuru — extension ghalat aaye to rename .cpp karein, ya long-press link / Copy use karein");
  sfx.click();
}
function cppCopyCode(){
  const f=CPP_FILES[CPP_CUR];
  const done=()=>streakBanner("📋 Code copied — paste in any editor & save as .cpp");
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(f.code).then(done).catch(()=>{ fallbackCopy(f.code); done(); });
      return;
    }
  }catch(e){}
  fallbackCopy(f.code); done();
}
function cppToggleStdin(){
  const w=document.getElementById("cppStdinWrap");
  w.style.display = w.style.display==="none" ? "" : "none";
}

/* ---------------- settings ---------------- */
function cppSettings(){
  const s=profile.cppSettings;
  document.getElementById("setStd").value=s.std;
  document.getElementById("setOpt").value=s.opt;
  document.getElementById("setWarn").checked=!!s.warn;
  document.getElementById("setCustom").value=s.customUrl||"";
  document.getElementById("setFs").value=s.fontSize;
  document.getElementById("setFsVal").textContent=s.fontSize;
  document.getElementById("setLight").checked=!!s.light;
  openModal("modal-cppset");
}
function cppSaveSettings(){
  const s=profile.cppSettings;
  s.std=document.getElementById("setStd").value;
  s.opt=document.getElementById("setOpt").value;
  s.warn=document.getElementById("setWarn").checked;
  s.customUrl=(document.getElementById("setCustom").value||"").trim().replace(/\/+$/,"");
  s.fontSize=parseFloat(document.getElementById("setFs").value)||13.5;
  s.light=document.getElementById("setLight").checked;
  save(); cppApplyTheme(); cppStatus(); closeModal("modal-cppset");
  streakBanner("⚙️ Settings saved: "+s.std.toUpperCase()+" "+s.opt+(s.warn?" -Wall":""));
}

/* ======================================================================
   COMPILER PROVIDERS — modern resilient chain
   1) custom Piston URL (settings)  2) Judge0 CE direct  3) Wandbox direct
   4) Judge0 via CORS proxy  5) Wandbox via CORS proxy  6) emkc Piston
   ====================================================================== */
function jfetch(url, opts, ms){
  opts = opts || {};
  try{ opts.signal = AbortSignal.timeout(ms || 20000); }catch(e){}
  return fetch(url, opts);
}
async function runGodbolt(filesArr, stdin){
  if(filesArr.length>1) throw new Error("single-file only");
  const ids=["g142","g141","g132"];
  let last="no gcc id";
  for(const id of ids){
    const r=await jfetch("https://godbolt.org/api/compiler/"+id+"/compile",{method:"POST",
      headers:{"Content-Type":"application/json","Accept":"application/json"},
      body:JSON.stringify({source:filesArr[0].code,
        options:{userArguments:cppFlags(), execArgs:stdin||"", compilerOptions:{}},
        filters:{execute:true}})},15000);
    if(!r.ok){ last="HTTP "+r.status; continue; }
    const j=await r.json();
    if(j && (j.code!==undefined || j.execResult)){
      const ex=j.execResult||{};
      const compErr=(j.code!==0 && !ex.stdout && (j.stderr||""))? (Array.isArray(j.stderr)?j.stderr.join("\n"):j.stderr) : "";
      return { via:"Compiler Explorer · "+id, compileErr:compErr,
        stdout:ex.stdout||j.stdout||"", stderr:ex.stderr||"", code:ex.code!=null?ex.code:(j.code===0?0:1) };
    }
    last="bad response";
  }
  throw new Error(last);
}
const CORS_PROXIES = [
  u => "https://corsproxy.io/?url=" + encodeURIComponent(u),
  u => "https://api.allorigins.win/raw?url=" + encodeURIComponent(u)
];
let J0_LANG = null;
async function j0Pick(){
  if(J0_LANG) return J0_LANG;
  const r=await jfetch("https://ce.judge0.com/languages");
  if(!r.ok) throw new Error("HTTP "+r.status);
  const L=await r.json();
  J0_LANG = (L.find(l=>/C\+\+ \(GCC 1[4-9]/.test(l.name)) || L.find(l=>/C\+\+ \(GCC/.test(l.name)) || L.find(l=>l.name.indexOf("C++")===0) || {}).id || 54;
  return J0_LANG;
}
function mainAndExtras(){
  let mi = CPP_CUR;
  if(!/\.cpp$/i.test(CPP_FILES[mi].name)) mi = CPP_FILES.findIndex(f=>/\.cpp$/i.test(f.name));
  if(mi<0) mi=0;
  return { main: CPP_FILES[mi], extras: CPP_FILES.filter((_,i)=>i!==mi) };
}
async function runPistonAt(base, filesArr, stdin){
  const rr=await jfetch(base+"/api/v2/piston/runtimes");
  if(!rr.ok) throw new Error("runtimes HTTP "+rr.status);
  const list=await rr.json();
  const hit=list.find(x=>x.language==="c++"||(x.aliases||[]).includes("g++"));
  if(!hit) throw new Error("no C++ runtime");
  const r=await jfetch(base+"/api/v2/piston/execute",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({language:"c++",version:hit.version,
      files:filesArr.map(f=>({name:f.name,content:f.code})),
      stdin:stdin||"", compile_flags:cppFlags().split(" ")})});
  if(!r.ok) throw new Error("HTTP "+r.status);
  const j=await r.json();
  if(j.message) throw new Error(j.message);
  return { via:"Piston · g++ "+hit.version, compileErr:(j.compile&&j.compile.stderr)||"",
    stdout:(j.run&&j.run.stdout)||"", stderr:(j.run&&j.run.stderr)||"", code:j.run?j.run.code:1 };
}
async function runJudge0(filesArr, stdin, base){
  base = base || "https://ce.judge0.com";
  const lid = await j0Pick();
  const { main, extras } = (()=>{ const m=filesArr[0]; return { main:m, extras:filesArr.slice(1) }; })();
  const body = { source_code: main.code, language_id: lid, stdin: stdin||"", compiler_options: cppFlags() };
  if(extras.length) body.additional_files = extras.map(f=>({name:f.name,content:f.code}));
  const r=await jfetch(base+"/submissions?wait=true&base64_encoded=false",{method:"POST",
    headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)});
  if(r.status===429) throw new Error("rate-limit 429");
  if(!r.ok) throw new Error("HTTP "+r.status);
  const j=await r.json();
  return { via:"Judge0 · GCC 14", compileErr:j.compile_output||"", stdout:j.stdout||"",
    stderr:j.stderr||"", code:(j.status&&j.status.id===3)?0:1, statusDesc:j.status?j.status.description:"" };
}
async function runWandbox(filesArr, stdin, base){
  base = base || "https://wandbox.org";
  const names=["gcc-14.2.0","gcc-14.1.0","gcc-head"];
  let last="unreachable";
  const { main, extras } = (()=>{ const m=filesArr[0]; return { main:m, extras:filesArr.slice(1) }; })();
  for(const c of names){
    const body={compiler:c, code:main.code, stdin:stdin||"", compiler_option:cppFlags(), options:"", save:false};
    if(extras.length){ body.files={}; extras.forEach(f=>body.files[f.name]=f.code); }
    const r=await jfetch(base+"/api/compile.json",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    if(!r.ok){ last="HTTP "+r.status; continue; }
    const j=await r.json();
    if(j && ("status" in j || "compiler_message" in j || "program_message" in j))
      return { via:"Wandbox · "+c, compileErr:j.compiler_message||"", stdout:j.program_message||"", stderr:j.stderr||"", code:(j.status!=null&&parseInt(j.status,10)===0)?0:1 };
    last="bad response";
  }
  throw new Error(last);
}
function cppRunClick(){
  const code=CPP_FILES[CPP_CUR].code;
  const needs=/\bcin\b|\bscanf\b|\bgetchar\b/.test(code);
  const wrap=document.getElementById("cppStdinWrap");
  if(needs && wrap.style.display==="none"){
    wrap.style.display=""; 
    const t=document.getElementById("cppStdin"); if(t) t.focus();
    streakBanner("⌨️ This program reads input — type it in the Input box, then press Run again.");
    return;
  }
  cppRun();
}
async function cppRun(){
  const stdin=document.getElementById("cppStdin").value;
  const out=document.getElementById("cppOut");
  const { main, extras } = mainAndExtras();
  const filesArr=[main, ...extras];
  if(!main.code.trim()) return;
  out.className="cpp-out run"; out.textContent="⏳ Racing compilers — the fastest one wins...";
  const S=profile.cppSettings;
  const jobs=[];
  if(S.customUrl) jobs.push(()=>runPistonAt(S.customUrl, filesArr, stdin));
  jobs.push(()=>runWandbox(filesArr, stdin));
  jobs.push(()=>runJudge0(filesArr, stdin));
  jobs.push(()=>runGodbolt(filesArr, stdin));
  jobs.push(()=>runJudge0(filesArr, stdin, CORS_PROXIES[0]("https://ce.judge0.com")));
  jobs.push(()=>runWandbox(filesArr, stdin, CORS_PROXIES[0]("https://wandbox.org")));
  jobs.push(()=>runPistonAt("https://emkc.org", filesArr, stdin));
  const t0=Date.now();
  let result=null, errs=[];
  try{
    result = await Promise.any(jobs.map(async fn=>{
      const r=await fn();
      r.via += "  ⚡ " + ((Date.now()-t0)/1000).toFixed(1) + "s";
      return r;
    }));
  }catch(e){
    errs = (e && e.errors) ? e.errors.map(x=>"• "+x.message) : [String(e)];
  }
  if(!result){
    out.className="cpp-out err";
    out.textContent="❌ Sab compilers fail (internet/CORS/rate-limit):\n"+errs.slice(0,7).join("\n")+
      "\n\n💡 Tip: set your own free Piston server URL in Settings for fast, reliable compiles.";
    return;
  }
  CPP_LAST_VIA=result.via;
  let txt="🔧 "+result.via+"  ·  "+S.std.toUpperCase()+" "+S.opt+(S.warn?" -Wall":"")+"\n──────────────────────────────\n";
  if(result.compileErr) txt+="❌ COMPILE ERROR:\n"+result.compileErr+"\n";
  if(result.stdout) txt+="✅ OUTPUT:\n"+result.stdout;
  if(result.stderr) txt+=(result.stdout?"\n":"")+"⚠️ STDERR:\n"+result.stderr+"\n";
  if(!result.stdout && !result.stderr && !result.compileErr) txt+="(no output — the program printed nothing)";
  if(result.statusDesc) txt+="\n\n[status: "+result.statusDesc+"]";
  out.className="cpp-out "+(result.compileErr?"err":"ok");
  out.textContent=txt;
  cppStatus();
  cppChallengeCheck(result.stdout||"", !!result.compileErr);
}

/* ---------------- challenge auto-check ---------------- */
function normOut(s){ return s.split("\n").map(l=>l.replace(/\s+$/,"")).join("\n").trim(); }
function cppChallengeCheck(stdout, hadCompileErr){
  if(!CPP_ACTIVE || hadCompileErr) return;
  if(normOut(stdout)===normOut(CPP_ACTIVE.expected)){
    const first=!profile.cppSolved[CPP_ACTIVE.id];
    profile.cppSolved[CPP_ACTIVE.id]=true; save();
    if(first){
      const xp=CPP_XP[CPP_ACTIVE.diff]||10;
      profile.xp+=xp; save();
      streakBanner("🏆 Challenge PASSED! +"+xp+" XP ("+CPP_ACTIVE.title+")");
      sfx.fanfare(); celebrate(); buzz([60,40,120]);
    } else { streakBanner("✅ Challenge PASSED (already solved)"); sfx.correct(); }
    cppRenderChallenges();
  }
}

/* ---------------- VU CHALLENGES (handout-based, exact-output specs) ---- */
const CPP_CHALLENGES = [
{ id:"c1", course:"CS201", diff:"Easy", title:"First Program — Hello VU",
  task:"Print EXACTLY these two lines (no extra spaces):\nAssalam o Alaikum, VU!\nCS201: my C++ journey starts here!",
  stdin:"", expected:"Assalam o Alaikum, VU!\nCS201: my C++ journey starts here!",
  hint:"Use cout << \"text\" << endl; for each line.",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    // print the two lines here\n\n    return 0;\n}\n" },
{ id:"c2", course:"CS201", diff:"Easy", title:"Sum of Two Numbers",
  task:"Read two integers (space separated) and print: Sum = X\nExample: input '7 8' -> output 'Sum = 15'",
  stdin:"7 8", expected:"Sum = 15",
  hint:"cin >> a >> b; then cout << \"Sum = \" << a+b;",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int a, b;\n    cin >> a >> b;\n    // print Sum in the exact format\n\n    return 0;\n}\n" },
{ id:"c3", course:"CS201", diff:"Easy", title:"Even or Odd",
  task:"Read one integer. Print 'Even' if it is even, otherwise 'Odd' (single word only).",
  stdin:"8", expected:"Even", hint:"if (n % 2 == 0) ...",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int n;\n    cin >> n;\n\n    return 0;\n}\n" },
{ id:"c4", course:"CS201", diff:"Easy", title:"Table Generator (for loop)",
  task:"Read a number n and print its table from 1 to 10. Each line format:\n5 x 1 = 5 ... 5 x 10 = 50",
  stdin:"5", expected:"5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n5 x 10 = 50",
  hint:"for(int i=1;i<=10;i++) cout << n << \" x \" << i << \" = \" << n*i << endl;",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int n;\n    cin >> n;\n    // write the for loop here\n\n    return 0;\n}\n" },
{ id:"c5", course:"CS201", diff:"Medium", title:"Factorial (loop practice)",
  task:"Read n and print: Factorial = X  (e.g. 5 -> Factorial = 120)",
  stdin:"5", expected:"Factorial = 120",
  hint:"Use long long; start with result = 1 and keep multiplying.",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int n;\n    cin >> n;\n    long long fact = 1;\n    // write the loop here\n\n    return 0;\n}\n" },
{ id:"c6", course:"CS201", diff:"Easy", title:"Max of Three (if-else)",
  task:"Read three numbers and print: Max = X",
  stdin:"3 9 4", expected:"Max = 9", hint:"Use nested if-else or && conditions.",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int a, b, c;\n    cin >> a >> b >> c;\n\n    return 0;\n}\n" },
{ id:"c7", course:"CS201", diff:"Medium", title:"Reverse a Number (while loop)",
  task:"Read a number and print its reverse: Reversed = X  (1234 -> Reversed = 4321)",
  stdin:"1234", expected:"Reversed = 4321", hint:"rev = rev*10 + n%10; n /= 10; while(n>0)",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int n;\n    cin >> n;\n    int rev = 0;\n\n    return 0;\n}\n" },
{ id:"c8", course:"CS201", diff:"Medium", title:"Swap with POINTERS",
  task:"Read two numbers and swap them using POINTERS (& and *).\nOutput format (2 lines):\nBefore: 3 5\nAfter: 5 3",
  stdin:"3 5", expected:"Before: 3 5\nAfter: 5 3", hint:"void swap(int*, int*); call: swap(&a,&b);",
  starter:"#include <iostream>\nusing namespace std;\n\nvoid swap(int *x, int *y){\n    // implement the pointer swap here\n}\n\nint main(){\n    int a, b;\n    cin >> a >> b;\n    cout << \"Before: \" << a << \" \" << b << endl;\n    // call swap here\n    // print the After line\n    return 0;\n}\n" },
{ id:"c9", course:"CS201", diff:"Medium", title:"Array Average (2 decimals)",
  task:"Read n, then n numbers. Print: Average = X.XX (exactly 2 decimals).\nInput: 3\\n4 6 8 -> Average = 6.00",
  stdin:"3\n4 6 8", expected:"Average = 6.00",
  hint:"#include <iomanip> ; cout << fixed << setprecision(2)",
  starter:"#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main(){\n    int n;\n    cin >> n;\n    int arr[100];\n    // input + sum + average\n\n    return 0;\n}\n" },
{ id:"c10", course:"CS201", diff:"Medium", title:"Prime Checker",
  task:"Read n; print 'Prime' if it is prime, otherwise 'Not Prime'.",
  stdin:"7", expected:"Prime", hint:"Loop from 2 to n/2; if any divisor is found, it is not prime.",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int n;\n    cin >> n;\n\n    return 0;\n}\n" },
{ id:"o1", course:"CS304", diff:"Easy", title:"Constructor & Destructor",
  task:"Create a class whose constructor 'Constructor called' and destructor prints 'Destructor called'. Create an object in main.\nExact output:\nConstructor called\nDestructor called",
  stdin:"", expected:"Constructor called\nDestructor called",
  hint:"class Demo { public: Demo(){...} ~Demo(){...} };",
  starter:"#include <iostream>\nusing namespace std;\n\nclass Demo{\npublic:\n    // constructor & destructor here\n};\n\nint main(){\n    // create the object here\n    return 0;\n}\n" },
{ id:"o2", course:"CS304", diff:"Medium", title:"Class + Grade Logic",
  task:"Input: name marks (e.g. 'Ali 84'). Use a Student class and print:\nName: Ali, Grade: A\nGrade rule: >=80 A, >=65 B, >=50 C, else F.",
  stdin:"Ali 84", expected:"Name: Ali, Grade: A",
  hint:"Keep string name; int marks; and a member function grade() inside the class.",
  starter:"#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Student{\n    string name;\n    int marks;\npublic:\n    // write setData / show here\n};\n\nint main(){\n\n    return 0;\n}\n" },
{ id:"o3", course:"CS304", diff:"Medium", title:"Inheritance — Areas",
  task:"Base class Shape with derived Rectangle + Circle. Input: w h r (e.g. 4 5 3).\nPrint (2 decimals, pi = 3.14):\nRectangle Area = 20.00\nCircle Area = 28.26",
  stdin:"4 5 3", expected:"Rectangle Area = 20.00\nCircle Area = 28.26",
  hint:"Each derived class implements its own area() — simple inheritance.",
  starter:"#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nclass Shape{ public: virtual void area(){} };\n// derive Rectangle & Circle here\n\nint main(){\n    // read w h r and create the objects\n    return 0;\n}\n" },
{ id:"o4", course:"CS304", diff:"Hard", title:"Operator Overloading (+)",
  task:"Complex class (real, imag). overload operator+.\nInput: 2 3 4 5  ->  print: Sum = 6+8i",
  stdin:"2 3 4 5", expected:"Sum = 6+8i",
  hint:"Complex operator+(Complex c){ return Complex(real+c.real, imag+c.imag); }",
  starter:"#include <iostream>\nusing namespace std;\n\nclass Complex{\n    int re, im;\npublic:\n    Complex(int r=0,int i=0):re(r),im(i){}\n    // overload operator+ here\n    void show(){ cout << \"Sum = \" << re << \"+\" << im << \"i\" << endl; }\n};\n\nint main(){\n    // read 4 numbers, create 2 objects, call sum.show()\n    return 0;\n}\n" },
{ id:"o5", course:"CS304", diff:"Medium", title:"Function Templates",
  task:"Write a template function myMax that returns the max of two values. Input: 12 7 -> print: Max = 12",
  stdin:"12 7", expected:"Max = 12",
  hint:"template <class T> T myMax(T a, T b){ return (a>b)?a:b; }",
  starter:"#include <iostream>\nusing namespace std;\n\n// template function here\n\nint main(){\n    int a, b;\n    cin >> a >> b;\n    return 0;\n}\n" },
{ id:"o6", course:"CS304", diff:"Hard", title:"Polymorphism (virtual)",
  task:"Call the Cat and Dog sounds through base Animal* pointers (virtual function).\nExact output:\nMeow!\nWoof!",
  stdin:"", expected:"Meow!\nWoof!",
  hint:"Declare virtual void sound() in the base; then base* ptr = &cat; ptr->sound();",
  starter:"#include <iostream>\nusing namespace std;\n\nclass Animal{ public: /* virtual sound */ };\n// Cat, Dog classes\n\nint main(){\n    // call through base pointers here\n    return 0;\n}\n" },
{ id:"d1", course:"CS301", diff:"Medium", title:"Stack (array) — Push/Pop",
  task:"First line: n operations. '1 x' = push x, '2' = pop (print the popped value; print 'Empty' if the stack is empty).\nInput:\n5\n1 10\n1 20\n2\n1 30\n2\nOutput:\n20\n30",
  stdin:"5\n1 10\n1 20\n2\n1 30\n2", expected:"20\n30",
  hint:"int top=-1; push: arr[++top]=x; pop: arr[top--].",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int n;\n    cin >> n;\n    int st[100]; int top=-1;\n    // process the operations here\n    return 0;\n}\n" },
{ id:"d2", course:"CS301", diff:"Medium", title:"Linked List — Insert at Head",
  task:"Read n values, insert each new value at the HEAD, then print the list:\nInput: 3\\n1 2 3 -> List: 3 2 1",
  stdin:"3\n1 2 3", expected:"List: 3 2 1",
  hint:"struct Node{int d; Node* n;}; head = newNode -> head.",
  starter:"#include <iostream>\nusing namespace std;\n\nstruct Node{ int data; Node* next; };\n\nint main(){\n    Node* head = nullptr;\n    // insert at head, then print\n    return 0;\n}\n" },
{ id:"d3", course:"CS301", diff:"Medium", title:"Binary Search",
  task:"Sorted array input: first n, then n sorted numbers, then the key.\nPrint 'Found at index i' (0-based) if found, otherwise 'Not found'.\nInput: 5\\n1 3 5 7 9\\n7 -> Found at index 3",
  stdin:"5\n1 3 5 7 9\n7", expected:"Found at index 3",
  hint:"low=0, high=n-1; mid=(low+high)/2 compare karte jayen.",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int n; cin >> n;\n    int a[100];\n    // input, key, binary search\n    return 0;\n}\n" },
{ id:"d4", course:"CS301", diff:"Hard", title:"Queue — Enqueue/Dequeue",
  task:"'1 x' = enqueue, '2' = dequeue (print the value; print 'Empty' if empty).\nInput:\n4\n1 5\n1 7\n2\n2\nOutput:\n5\n7",
  stdin:"4\n1 5\n1 7\n2\n2", expected:"5\n7", hint:"front/rear indices; dequeue: q[front++].",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int q[100]; int front=0, rear=0;\n    // operations\n    return 0;\n}\n" }
];

/* ---------------- SNIPPETS ---------------- */
const CPP_SNIPPETS = [
{ name:"Menu-driven program", code:"\n// VU assignment classic: menu-driven program\nint choice;\ndo{\n    cout << \"\\n1. Option A\\n2. Option B\\n0. Exit\\nEnter choice: \";\n    cin >> choice;\n    switch(choice){\n        case 1: cout << \"Option A selected\" << endl; break;\n        case 2: cout << \"Option B selected\" << endl; break;\n        case 0: cout << \"Bye!\" << endl; break;\n        default: cout << \"Invalid choice\" << endl;\n    }\n}while(choice != 0);\n" },
{ name:"Class skeleton", code:"\nclass Student{\nprivate:\n    string name;\n    int rollNo;\n    float marks;\npublic:\n    Student(){ name=\"\"; rollNo=0; marks=0; }\n    Student(string n, int r, float m){ name=n; rollNo=r; marks=m; }\n    void show() const{\n        cout << name << \" (\" << rollNo << \") marks: \" << marks << endl;\n    }\n};\n" },
{ name:"Header file example (utils.h)", code:"\n// paste this code into a separate file utils.h (New File 📄)\n#ifndef UTILS_H\n#define UTILS_H\n#include <iostream>\nusing namespace std;\n\ninline int square(int x){ return x*x; }\ninline void greet(){ cout << \"Hello from utils.h!\" << endl; }\n#endif\n" },
{ name:"File write + read", code:"\n#include <fstream>\nofstream out(\"data.txt\");\nout << \"Hello from AHW C++ Lab\" << endl;\nout.close();\nifstream in(\"data.txt\");\nstring line;\nwhile(getline(in, line)) cout << line << endl;\nin.close();\n" },
{ name:"Pointer basics", code:"\nint x = 42;\nint *p = &x;\ncout << \"Value: \" << *p << endl;\ncout << \"Address: \" << p << endl;\n*p = 99;\ncout << \"New value: \" << x << endl;\n" },
{ name:"2D array print", code:"\nint mat[2][3] = {{1,2,3},{4,5,6}};\nfor(int i=0;i<2;i++){\n    for(int j=0;j<3;j++) cout << mat[i][j] << \" \";\n    cout << endl;\n}\n" }
];

/* ---------------- challenges UI ---------------- */
function cppRenderChallenges(){
  const wrap=document.getElementById("cppChips"); if(!wrap) return;
  const cur=wrap.dataset.filter||"all";
  const list=document.getElementById("cppChList"); list.innerHTML="";
  CPP_CHALLENGES.filter(c=>cur==="all"||c.course===cur).forEach(c=>{
    const done=!!profile.cppSolved[c.id];
    const d=document.createElement("div");
    d.className="cpp-ch"+(CPP_ACTIVE&&CPP_ACTIVE.id===c.id?" active":"");
    d.innerHTML='<div class="cpp-ch-top"><b>'+c.course+'</b><span class="cpp-diff '+c.diff.toLowerCase()+'">'+c.diff+'</span>'+(done?'<span class="cpp-done">✅</span>':"")+'</div>'+
      '<div class="cpp-ch-title">'+c.title+'</div>'+
      '<div class="cpp-ch-task">'+c.task.replace(/\n/g,"<br>")+'</div>'+
      '<div class="cpp-ch-btns"><button class="btn btn-blue" style="padding:8px 14px;font-size:12px">📥 Load in Editor</button>'+
      '<button class="btn btn-gray" style="padding:8px 14px;font-size:12px">💡 Hint</button></div>'+
      '<div class="cpp-hint" style="display:none">💡 '+c.hint+'</div>';
    const btns=d.querySelectorAll("button");
    btns[0].onclick=()=>{ CPP_ACTIVE=c; sfx.click();
      cppSetCode(c.starter, c.course.toLowerCase()+"_"+c.id+".cpp");
      document.getElementById("cppStdin").value=c.stdin;
      document.getElementById("cppStdinWrap").style.display=c.stdin?"":"none";
      streakBanner("🎯 Loaded: "+c.title+" — solve & Run!");
      cppRenderChallenges(); window.scrollTo({top:0,behavior:"smooth"});
    };
    btns[1].onclick=()=>{ const h=d.querySelector(".cpp-hint"); h.style.display=h.style.display==="none"?"":"none"; };
    list.appendChild(d);
  });
}
function cppFilter(f, el){
  const wrap=document.getElementById("cppChips");
  wrap.dataset.filter=f;
  wrap.querySelectorAll(".chip").forEach(c=>c.classList.remove("on"));
  el.classList.add("on");
  cppRenderChallenges();
}
function cppSnippets(){
  const body=document.getElementById("cppSnipBody"); body.innerHTML="";
  CPP_SNIPPETS.forEach(s=>{
    const d=document.createElement("div"); d.className="cpp-ch";
    d.innerHTML='<div class="cpp-ch-title">'+s.name+'</div><div class="cpp-ch-btns"><button class="btn btn-purple" style="padding:8px 14px;font-size:12px">➕ Insert in current file</button></div>';
    d.querySelector("button").onclick=()=>{
      const ta=document.getElementById("cedCode");
      const pos=ta.selectionStart!=null?ta.selectionStart:ta.value.length;
      ta.value=ta.value.slice(0,pos)+s.code+ta.value.slice(pos);
      cppEditorSync(); closeModal("modal-cppsnip");
      streakBanner("➕ Snippet inserted: "+s.name);
    };
    body.appendChild(d);
  });
  openModal("modal-cppsnip");
}

/* ---------------- boot ---------------- */
function showCppLab(){
  sfx.click();
  cppLoadPersisted();
  if(!CPP_FILES[CPP_CUR].code)
    CPP_FILES[CPP_CUR].code='#include <iostream>\nusing namespace std;\n\nint main(){\n    cout << "Assalam o Alaikum, VU!" << endl;\n    return 0;\n}\n';
  cppRenderTabs(); cppLoadCurrent(); cppRenderChallenges();
  show("screen-cpp");
}
document.addEventListener("DOMContentLoaded", function(){
  const ta=document.getElementById("cedCode"); if(!ta) return;
  ta.addEventListener("input", cppEditorSync);
  ta.addEventListener("scroll", function(){
    document.getElementById("cedHl").scrollTop=ta.scrollTop;
    document.getElementById("cedHl").scrollLeft=ta.scrollLeft;
    document.getElementById("cedGutter").scrollTop=ta.scrollTop;
  });
  ta.addEventListener("keyup", cppStatus);
  ta.addEventListener("click", cppStatus);
  ta.addEventListener("keydown", function(e){
    if(e.key==="Tab"){ e.preventDefault();
      const s=ta.selectionStart;
      ta.value=ta.value.slice(0,s)+"    "+ta.value.slice(ta.selectionEnd);
      ta.selectionStart=ta.selectionEnd=s+4; cppEditorSync();
    }
  });
});
