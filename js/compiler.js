/* ======================================================================
   AHW QUIZVERSE - C++ LAB (c) 2026 AHW Quizverse / All VU Students.
   Online C++ compiler for VU students (CS201 / CS301 / CS304).
   - Real compile+run via free Piston API (emkc.org) - no key needed
   - Editor with line numbers + syntax highlighting
   - .cpp download / open / auto-save
   - VU handout-based challenges with AUTO-CHECK + XP rewards
   ====================================================================== */

const CPP_XP = { Easy: 10, Medium: 15, Hard: 25 };
if (!profile.cppSolved || typeof profile.cppSolved !== "object") profile.cppSolved = {};

/* ---------------- VU CHALLENGES (handout-based, exact-output specs) --- */
const CPP_CHALLENGES = [
/* ---------- CS201 ---------- */
{ id:"c1", course:"CS201", diff:"Easy", title:"First Program — Hello VU",
  task:"Print EXACTLY these two lines (no extra spaces):\nAssalam-o-Alaikum, VU!\nCS201 se C++ ka safar shuru!",
  stdin:"", expected:"Assalam-o-Alaikum, VU!\nCS201 se C++ ka safar shuru!",
  hint:"cout << \"text\" << endl; do lines print karne ke liye.",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    // yahan 2 lines print karein\n\n    return 0;\n}\n" },
{ id:"c2", course:"CS201", diff:"Easy", title:"Sum of Two Numbers",
  task:"Do integers input lein (space separated) aur print karein: Sum = X\nExample: input '7 8' -> output 'Sum = 15'",
  stdin:"7 8", expected:"Sum = 15",
  hint:"cin >> a >> b; phir cout << \"Sum = \" << a+b;",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int a, b;\n    cin >> a >> b;\n    // Sum print karein exact format mein\n\n    return 0;\n}\n" },
{ id:"c3", course:"CS201", diff:"Easy", title:"Even or Odd",
  task:"Ek integer input lein. Agar even ho to print 'Even' warna 'Odd' (sirf ek lafz).",
  stdin:"8", expected:"Even",
  hint:"if (n % 2 == 0) ...",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int n;\n    cin >> n;\n\n    return 0;\n}\n" },
{ id:"c4", course:"CS201", diff:"Easy", title:"Table Generator (for loop)",
  task:"Ek number n input lein aur table 1 se 10 tak print karein, har line ka format:\n5 x 1 = 5 ... 5 x 10 = 50",
  stdin:"5", expected:"5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n5 x 10 = 50",
  hint:"for(int i=1;i<=10;i++) cout << n << \" x \" << i << \" = \" << n*i << endl;",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int n;\n    cin >> n;\n    // for loop likhein\n\n    return 0;\n}\n" },
{ id:"c5", course:"CS201", diff:"Medium", title:"Factorial (loop practice)",
  task:"n input lein aur print karein: Factorial = X  (e.g. 5 -> Factorial = 120)",
  stdin:"5", expected:"Factorial = 120",
  hint:"long long use karein; result = 1 se start kar ke multiply karte jayen.",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int n;\n    cin >> n;\n    long long fact = 1;\n    // loop likhein\n\n    return 0;\n}\n" },
{ id:"c6", course:"CS201", diff:"Easy", title:"Max of Three (if-else)",
  task:"Teen numbers input lein, print karein: Max = X",
  stdin:"3 9 4", expected:"Max = 9",
  hint:"Nested if-else ya && conditions use karein.",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int a, b, c;\n    cin >> a >> b >> c;\n\n    return 0;\n}\n" },
{ id:"c7", course:"CS201", diff:"Medium", title:"Reverse a Number (while loop)",
  task:"Ek number input lein, uska ulta print karein: Reversed = X  (1234 -> Reversed = 4321)",
  stdin:"1234", expected:"Reversed = 4321",
  hint:"rev = rev*10 + n%10; n /= 10; while(n>0)",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int n;\n    cin >> n;\n    int rev = 0;\n\n    return 0;\n}\n" },
{ id:"c8", course:"CS201", diff:"Medium", title:"Swap with POINTERS",
  task:"Do numbers input lein aur POINTERS (& and *) use kar ke swap karein.\nOutput format (2 lines):\nBefore: 3 5\nAfter: 5 3",
  stdin:"3 5", expected:"Before: 3 5\nAfter: 5 3",
  hint:"void swap(int*, int*); call: swap(&a,&b);",
  starter:"#include <iostream>\nusing namespace std;\n\nvoid swap(int *x, int *y){\n    // pointer swap likhein\n}\n\nint main(){\n    int a, b;\n    cin >> a >> b;\n    cout << \"Before: \" << a << \" \" << b << endl;\n    // swap call karein\n    // After print karein\n    return 0;\n}\n" },
{ id:"c9", course:"CS201", diff:"Medium", title:"Array Average (2 decimals)",
  task:"Pehle n, phir n numbers input lein. Print karein: Average = X.XX (exactly 2 decimals).\nInput: 3\\n4 6 8 -> Average = 6.00",
  stdin:"3\n4 6 8", expected:"Average = 6.00",
  hint:"#include <iomanip> ; cout << fixed << setprecision(2)",
  starter:"#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main(){\n    int n;\n    cin >> n;\n    int arr[100];\n    // input + sum + average\n\n    return 0;\n}\n" },
{ id:"c10", course:"CS201", diff:"Medium", title:"Prime Checker",
  task:"n input lein; prime ho to 'Prime' warna 'Not Prime' print karein.",
  stdin:"7", expected:"Prime",
  hint:"2 se n/2 tak loop; koi divisor mile to not prime.",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int n;\n    cin >> n;\n\n    return 0;\n}\n" },
/* ---------- CS304 (OOP) ---------- */
{ id:"o1", course:"CS304", diff:"Easy", title:"Constructor & Destructor",
  task:"Ek class banayen jis ka constructor 'Constructor called' aur destructor 'Destructor called' print kare. main mein object banayen.\nExact output:\nConstructor called\nDestructor called",
  stdin:"", expected:"Constructor called\nDestructor called",
  hint:"class Demo { public: Demo(){...} ~Demo(){...} };",
  starter:"#include <iostream>\nusing namespace std;\n\nclass Demo{\npublic:\n    // constructor & destructor\n};\n\nint main(){\n    // object banayen\n    return 0;\n}\n" },
{ id:"o2", course:"CS304", diff:"Medium", title:"Class + Grade Logic",
  task:"Input: name marks (e.g. 'Ali 84'). Class Student use karein aur print karein:\nName: Ali, Grade: A\nGrade rule: >=80 A, >=65 B, >=50 C, warna F.",
  stdin:"Ali 84", expected:"Name: Ali, Grade: A",
  hint:"class ke andar string name; int marks; member function grade() rakhein.",
  starter:"#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Student{\n    string name;\n    int marks;\npublic:\n    // setData / show likhein\n};\n\nint main(){\n\n    return 0;\n}\n" },
{ id:"o3", course:"CS304", diff:"Medium", title:"Inheritance — Areas",
  task:"Base class Shape aur derived Rectangle + Circle. Input: w h r (e.g. 4 5 3).\nPrint (2 decimals, pi = 3.14):\nRectangle Area = 20.00\nCircle Area = 28.26",
  stdin:"4 5 3", expected:"Rectangle Area = 20.00\nCircle Area = 28.26",
  hint:"Har derived class mein apna area() — simple inheritance.",
  starter:"#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nclass Shape{ public: virtual void area(){} };\n// Rectangle & Circle derive karein\n\nint main(){\n    // input w h r, objects banayen\n    return 0;\n}\n" },
{ id:"o4", course:"CS304", diff:"Hard", title:"Operator Overloading (+)",
  task:"Complex class (real, imag). operator+ overload karein.\nInput: 2 3 4 5  ->  print: Sum = 6+8i",
  stdin:"2 3 4 5", expected:"Sum = 6+8i",
  hint:"Complex operator+(Complex c){ return Complex(real+c.real, imag+c.imag); }",
  starter:"#include <iostream>\nusing namespace std;\n\nclass Complex{\n    int re, im;\npublic:\n    Complex(int r=0,int i=0):re(r),im(i){}\n    // operator+ overload karein\n    void show(){ cout << \"Sum = \" << re << \"+\" << im << \"i\" << endl; }\n};\n\nint main(){\n    // 4 numbers input, 2 objects, sum.show()\n    return 0;\n}\n" },
{ id:"o5", course:"CS304", diff:"Medium", title:"Function Templates",
  task:"Template function myMax likhein jo do values ka max de. Input: 12 7 -> print: Max = 12",
  stdin:"12 7", expected:"Max = 12",
  hint:"template <class T> T myMax(T a, T b){ return (a>b)?a:b; }",
  starter:"#include <iostream>\nusing namespace std;\n\n// template function yahan\n\nint main(){\n    int a, b;\n    cin >> a >> b;\n    return 0;\n}\n" },
{ id:"o6", course:"CS304", diff:"Hard", title:"Polymorphism (virtual)",
  task:"Base Animal* pointers se Cat aur Dog ka sound call karein (virtual function).\nExact output:\nMeow!\nWoof!",
  stdin:"", expected:"Meow!\nWoof!",
  hint:"virtual void sound() base mein; base* ptr = &cat; ptr->sound();",
  starter:"#include <iostream>\nusing namespace std;\n\nclass Animal{ public: /* virtual sound */ };\n// Cat, Dog classes\n\nint main(){\n    // base pointers se call karein\n    return 0;\n}\n" },
/* ---------- CS301 (Data Structures) ---------- */
{ id:"d1", course:"CS301", diff:"Medium", title:"Stack (array) — Push/Pop",
  task:"Pehli line n operations. '1 x' = push x, '2' = pop (pop value print karein; khali ho to 'Empty').\nInput:\n5\n1 10\n1 20\n2\n1 30\n2\nOutput:\n20\n30",
  stdin:"5\n1 10\n1 20\n2\n1 30\n2", expected:"20\n30",
  hint:"int top=-1; push: arr[++top]=x; pop: arr[top--].",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int n;\n    cin >> n;\n    int st[100]; int top=-1;\n    // operations loop\n    return 0;\n}\n" },
{ id:"d2", course:"CS301", diff:"Medium", title:"Linked List — Insert at Head",
  task:"n values input lein, har nayi value HEAD par insert karein, phir list print karein:\nInput: 3\\n1 2 3 -> List: 3 2 1",
  stdin:"3\n1 2 3", expected:"List: 3 2 1",
  hint:"struct Node{int d; Node* n;}; head = newNode -> head.",
  starter:"#include <iostream>\nusing namespace std;\n\nstruct Node{ int data; Node* next; };\n\nint main(){\n    Node* head = nullptr;\n    // insert at head, phir print\n    return 0;\n}\n" },
{ id:"d3", course:"CS301", diff:"Medium", title:"Binary Search",
  task:"Sorted array input: pehle n, phir n sorted numbers, phir key.\nKey mile to 'Found at index i' (0-based), warna 'Not found'.\nInput: 5\\n1 3 5 7 9\\n7 -> Found at index 3",
  stdin:"5\n1 3 5 7 9\n7", expected:"Found at index 3",
  hint:"low=0, high=n-1; mid=(low+high)/2 compare karte jayen.",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int n; cin >> n;\n    int a[100];\n    // input, key, binary search\n    return 0;\n}\n" },
{ id:"d4", course:"CS301", diff:"Hard", title:"Queue — Enqueue/Dequeue",
  task:"'1 x' = enqueue, '2' = dequeue (value print; khali ho to 'Empty').\nInput:\n4\n1 5\n1 7\n2\n2\nOutput:\n5\n7",
  stdin:"4\n1 5\n1 7\n2\n2", expected:"5\n7",
  hint:"front/rear indices; dequeue: q[front++].",
  starter:"#include <iostream>\nusing namespace std;\n\nint main(){\n    int q[100]; int front=0, rear=0;\n    // operations\n    return 0;\n}\n" }
];

/* ---------------- SNIPPETS (one-tap VU assignment patterns) ---------- */
const CPP_SNIPPETS = [
{ name:"Menu-driven program", code:"\n// VU assignment classic: menu-driven program\nint choice;\ndo{\n    cout << \"\\n1. Option A\\n2. Option B\\n0. Exit\\nEnter choice: \";\n    cin >> choice;\n    switch(choice){\n        case 1: cout << \"Option A selected\" << endl; break;\n        case 2: cout << \"Option B selected\" << endl; break;\n        case 0: cout << \"Bye!\" << endl; break;\n        default: cout << \"Invalid choice\" << endl;\n    }\n}while(choice != 0);\n" },
{ name:"Class skeleton", code:"\nclass Student{\nprivate:\n    string name;\n    int rollNo;\n    float marks;\npublic:\n    Student(){ name=\"\"; rollNo=0; marks=0; }          // default ctor\n    Student(string n, int r, float m){ name=n; rollNo=r; marks=m; }\n    void show() const{\n        cout << name << \" (\" << rollNo << \") marks: \" << marks << endl;\n    }\n};\n" },
{ name:"File write + read", code:"\n#include <fstream>\n// file mein likho\nofstream out(\"data.txt\");\nout << \"Hello from AHW C++ Lab\" << endl;\nout.close();\n// file se parho\nifstream in(\"data.txt\");\nstring line;\nwhile(getline(in, line)) cout << line << endl;\nin.close();\n" },
{ name:"Pointer basics", code:"\nint x = 42;\nint *p = &x;\ncout << \"Value: \" << *p << endl;\ncout << \"Address: \" << p << endl;\n*p = 99;\ncout << \"New value: \" << x << endl;\n" },
{ name:"2D array print", code:"\nint mat[2][3] = {{1,2,3},{4,5,6}};\nfor(int i=0;i<2;i++){\n    for(int j=0;j<3;j++) cout << mat[i][j] << \" \";\n    cout << endl;\n}\n" }
];

/* ---------------- EDITOR (line numbers + highlighting) ---------------- */
function cppEscape(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function cppHighlight(src){
  const re=/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(\"(?:[^\"\\\n]|\\.)*\"|'(?:[^'\\\n]|\\.)*')|(^ *#[a-z]+)|\b(int|float|double|char|bool|void|long|short|unsigned|signed|class|struct|public|private|protected|virtual|override|template|typename|namespace|using|new|delete|return|if|else|for|while|do|switch|case|break|continue|default|const|static|this|true|false|nullptr|include|iostream|fstream|iomanip|string|cin|cout|endl|main)\b|(\b\d+(\.\d+)?\b)/gm;
  return cppEscape(src).replace(re, function(m, com, str, pre, kw, num){
    if(com) return '<span class="tk-c">'+m+'</span>';
    if(str) return '<span class="tk-s">'+m+'</span>';
    if(pre) return '<span class="tk-p">'+m+'</span>';
    if(kw)  return '<span class="tk-k">'+m+'</span>';
    if(num) return '<span class="tk-n">'+m+'</span>';
    return m;
  });
}
function cppEditorSync(){
  const ta=document.getElementById("cedCode"), pre=document.getElementById("cedHl"), gut=document.getElementById("cedGutter");
  if(!ta) return;
  pre.innerHTML = cppHighlight(ta.value) + "\n";
  const lines = ta.value.split("\n").length;
  gut.textContent = Array.from({length:lines}, (_,i)=>i+1).join("\n");
  pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft;
  gut.scrollTop = ta.scrollTop;
  try{ localStorage.setItem("ahw_cpp_code", ta.value); }catch(e){}
  cppSaveState();
}
function cppSetCode(code, fname){
  const ta=document.getElementById("cedCode");
  ta.value = code;
  if(fname) document.getElementById("cppFileName").value = fname;
  cppEditorSync();
}
function cppSaveState(){
  const b=document.getElementById("cppRunBtn");
  if(b) b.disabled = !document.getElementById("cedCode").value.trim();
}

/* ---------------- PISTON RUNNER ---------------- */
let CPP_RUNTIME_VER = null;
async function cppRuntimeVersion(){
  if(CPP_RUNTIME_VER) return CPP_RUNTIME_VER;
  const r = await fetch("https://emkc.org/api/v2/piston/runtimes");
  const list = await r.json();
  const hit = list.find(x => x.language==="c++" || (x.aliases||[]).includes("c++") || (x.aliases||[]).includes("g++") || x.language==="cpp");
  CPP_RUNTIME_VER = hit ? hit.version : "12.1.0";
  return CPP_RUNTIME_VER;
}
async function cppRun(){
  const code = document.getElementById("cedCode").value;
  const stdin = document.getElementById("cppStdin").value;
  const out = document.getElementById("cppOut");
  if(!code.trim()) return;
  out.className = "cpp-out run"; out.textContent = "⏳ Compiling & running on remote C++ (g++) server...";
  try{
    const ver = await cppRuntimeVersion();
    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ language:"c++", version:ver, files:[{ name:"main.cpp", content:code }], stdin:stdin, args:[] })
    });
    const j = await res.json();
    let txt = "";
    if(j.compile && j.compile.stderr) txt += "❌ COMPILE ERROR:\n" + j.compile.stderr + "\n";
    if(j.run){
      if(j.run.stdout) txt += (txt? "\n":"") + "✅ OUTPUT:\n" + j.run.stdout;
      if(j.run.stderr) txt += (txt? "\n":"") + "⚠️ RUNTIME STDERR:\n" + j.run.stderr;
      if(!j.run.stdout && !j.run.stderr) txt += "(koi output nahi — program ne kuch print nahi kiya)";
      txt += "\n\n[exit code: " + j.run.code + "]";
      out.className = "cpp-out " + ((j.compile && j.compile.stderr) ? "err" : "ok");
      cppChallengeCheck(j.run.stdout || "", !!((j.compile && j.compile.stderr)));
    } else {
      txt += "❌ " + (j.message || "Execution failed — API busy, dobara try karein.");
      out.className = "cpp-out err";
    }
    out.textContent = txt;
  }catch(e){
    out.className = "cpp-out err";
    out.textContent = "❌ Internet connection ya API masla: " + e.message + "\n(Compiler ke liye internet zaroori hai — dobara try karein)";
  }
}

/* ---------------- CHALLENGES UI + AUTO CHECK ---------------- */
let CPP_ACTIVE = null;
function normOut(s){ return s.split("\n").map(l=>l.replace(/\s+$/,"")).join("\n").trim(); }
function cppChallengeCheck(stdout, hadCompileErr){
  if(!CPP_ACTIVE || hadCompileErr) return;
  if(normOut(stdout) === normOut(CPP_ACTIVE.expected)){
    const first = !profile.cppSolved[CPP_ACTIVE.id];
    profile.cppSolved[CPP_ACTIVE.id] = true; save();
    if(first){
      const xp = CPP_XP[CPP_ACTIVE.diff] || 10;
      profile.xp += xp; save();
      streakBanner("🏆 Challenge PASSED! +" + xp + " XP (" + CPP_ACTIVE.title + ")");
      sfx.fanfare(); celebrate(); buzz([60,40,120]);
    } else {
      streakBanner("✅ Challenge PASSED (already solved)");
      sfx.correct();
    }
    cppRenderChallenges();
  }
}
function cppRenderChallenges(){
  const wrap = document.getElementById("cppChips");
  const cur = wrap.dataset.filter || "all";
  const list = document.getElementById("cppChList"); list.innerHTML = "";
  CPP_CHALLENGES.filter(c => cur==="all" || c.course===cur).forEach(c=>{
    const done = !!profile.cppSolved[c.id];
    const d = document.createElement("div");
    d.className = "cpp-ch" + (CPP_ACTIVE && CPP_ACTIVE.id===c.id ? " active" : "");
    d.innerHTML = '<div class="cpp-ch-top"><b>'+c.course+'</b><span class="cpp-diff '+c.diff.toLowerCase()+'">'+c.diff+'</span>'+(done?'<span class="cpp-done">✅</span>':"")+'</div>'+
      '<div class="cpp-ch-title">'+c.title+'</div>'+
      '<div class="cpp-ch-task">'+c.task.replace(/\n/g,"<br>")+'</div>'+
      '<div class="cpp-ch-btns"><button class="btn btn-blue" style="padding:8px 14px;font-size:12px">📥 Load in Editor</button>'+
      '<button class="btn btn-gray cpp-hintbtn" style="padding:8px 14px;font-size:12px">💡 Hint</button></div>'+
      '<div class="cpp-hint" style="display:none">💡 '+c.hint+'</div>';
    const [loadBtn, hintBtn] = d.querySelectorAll("button");
    loadBtn.onclick = ()=>{ CPP_ACTIVE=c; sfx.click();
      cppSetCode(c.starter, c.course.toLowerCase()+"_"+c.id+".cpp");
      document.getElementById("cppStdin").value = c.stdin;
      document.getElementById("cppStdinWrap").style.display = c.stdin ? "" : "none";
      streakBanner("🎯 Loaded: " + c.title + " — solve & Run!");
      cppRenderChallenges();
      window.scrollTo({top:0,behavior:"smooth"});
    };
    hintBtn.onclick = ()=>{ const h=d.querySelector(".cpp-hint"); h.style.display = h.style.display==="none" ? "" : "none"; };
    list.appendChild(d);
  });
}
function cppFilter(f, el){
  const wrap=document.getElementById("cppChips");
  wrap.dataset.filter = f;
  wrap.querySelectorAll(".chip").forEach(c=>c.classList.remove("on"));
  el.classList.add("on");
  cppRenderChallenges();
}

/* ---------------- FILES: download / open / snippets ---------------- */
function cppDownload(){
  const code=document.getElementById("cedCode").value;
  let name=(document.getElementById("cppFileName").value||"program.cpp").trim();
  if(!/\.cpp$/i.test(name)) name += ".cpp";
  const blob=new Blob([code], {type:"text/plain"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob); a.download=name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),3000);
  streakBanner("💾 Downloaded " + name + " — assignment ready!");
  sfx.click();
}
function cppOpenFile(){
  const inp=document.createElement("input");
  inp.type="file"; inp.accept=".cpp,.c,.h,.txt,.cc";
  inp.onchange=()=>{ const f=inp.files && inp.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=()=>{ cppSetCode(r.result, f.name); CPP_ACTIVE=null;
      streakBanner("📂 Opened " + f.name + " — edit & run!"); };
    r.readAsText(f);
  };
  inp.click();
}
function cppToggleStdin(){
  const w=document.getElementById("cppStdinWrap");
  w.style.display = w.style.display==="none" ? "" : "none";
}
function cppSnippets(){
  const m=document.getElementById("modal-cppsnip");
  const body=document.getElementById("cppSnipBody"); body.innerHTML="";
  CPP_SNIPPETS.forEach(s=>{
    const d=document.createElement("div"); d.className="cpp-ch";
    d.innerHTML='<div class="cpp-ch-title">'+s.name+'</div><div class="cpp-ch-btns"><button class="btn btn-purple" style="padding:8px 14px;font-size:12px">➕ Insert at cursor/end</button></div>';
    d.querySelector("button").onclick=()=>{
      const ta=document.getElementById("cedCode");
      const pos=ta.selectionStart!=null?ta.selectionStart:ta.value.length;
      ta.value=ta.value.slice(0,pos)+s.code+ta.value.slice(pos);
      cppEditorSync(); closeModal("modal-cppsnip");
      streakBanner("➕ Snippet inserted: " + s.name);
    };
    body.appendChild(d);
  });
  openModal("modal-cppsnip");
}

/* ---------------- SCREEN BOOT ---------------- */
function showCppLab(){
  sfx.click();
  const ta=document.getElementById("cedCode");
  let savedCode=null, savedName=null;
  try{ savedCode=localStorage.getItem("ahw_cpp_code"); savedName=localStorage.getItem("ahw_cpp_name"); }catch(e){}
  if(savedCode!=null && !ta.value) { ta.value=savedCode; if(savedName) document.getElementById("cppFileName").value=savedName; }
  if(!ta.value) ta.value='#include <iostream>\nusing namespace std;\n\nint main(){\n    cout << "Assalam-o-Alaikum, VU!" << endl;\n    return 0;\n}\n';
  cppEditorSync();
  cppRenderChallenges();
  show("screen-cpp");
}
document.addEventListener("DOMContentLoaded", function(){
  const ta=document.getElementById("cedCode");
  if(!ta) return;
  ta.addEventListener("input", cppEditorSync);
  ta.addEventListener("scroll", function(){
    document.getElementById("cedHl").scrollTop=ta.scrollTop;
    document.getElementById("cedHl").scrollLeft=ta.scrollLeft;
    document.getElementById("cedGutter").scrollTop=ta.scrollTop;
  });
  ta.addEventListener("keydown", function(e){           // Tab = 4 spaces
    if(e.key==="Tab"){ e.preventDefault();
      const s=ta.selectionStart;
      ta.value=ta.value.slice(0,s)+"    "+ta.value.slice(ta.selectionEnd);
      ta.selectionStart=ta.selectionEnd=s+4; cppEditorSync();
    }
  });
  const fn=document.getElementById("cppFileName");
  if(fn) fn.addEventListener("input", function(){ try{ localStorage.setItem("ahw_cpp_name", fn.value); }catch(e){} });
});
