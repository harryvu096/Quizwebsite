// Bolty's Puzzle Park — Core Game Engine (110 Levels from data/levels.js or data/levels.json)
let LEVELS = (typeof window !== "undefined" && window.BOLTY_LEVELS) ? window.BOLTY_LEVELS : null;
if (LEVELS) {
  console.log("✅ 110 levels embedded", LEVELS.meta);
} else {
  fetch("./data/levels.json").then(r=>r.json()).then(d=>{ LEVELS=d; console.log("✅ 110 levels loaded", d.meta); }).catch(()=> console.warn("Levels.json not found, using procedural fallback"));
}
// Shared Save
const SAVE_KEY = 'bolty_park_v1';
let S = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null') || {
  coins:500, gems:20, hearts:5, xp:0, levelXp:0, curLevel:1,
  screw:{unlocked:50, stars:{}, cur:1}, sort:{unlocked:1, stars:{}, cur:1}, arrow:{unlocked:1, stars:{}, cur:1},
  streak:2, lastLogin: Date.now(), dailyClaimed:false, missions:{screw0:false,sort0:false,boss0:false},
  ownedSkins:['default'], curWorld:'screw', curLvl:1, xpLevel:1
};
function save(){ localStorage.setItem(SAVE_KEY, JSON.stringify(S)); updateHubUI(); }
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2200); }
function vib(p=40){ if(navigator.vibrate) navigator.vibrate(p); }

// Audio (WebAudio beeps — no external files needed for preview)
let audioOn=true, musicOn=true;
function beep(freq=600, dur=0.15, type='sine', vol=0.3){
  if(!audioOn) return;
  try{
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type=type; o.frequency.value=freq; o.connect(g); g.connect(ctx.destination);
    g.gain.value=vol; o.start(); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+dur); o.stop(ctx.currentTime+dur);
  }catch(e){}
}

// Screens
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-bg').forEach(m=> m.addEventListener('click', e=>{ if(e.target===m) m.classList.remove('open'); }));

// Splash loading
let load=0; const loadInt=setInterval(()=>{
  load+= Math.random()*18+6; if(load>=100){ load=100; clearInterval(loadInt); setTimeout(()=>{ showScreen('screen-hub'); updateHubUI(); },400); }
  document.getElementById('loadFill').style.width=load+'%';
  document.getElementById('loadText').textContent='Loading Park... '+Math.floor(load)+'%';
},120);

// Hub UI
function updateHubUI(){
  document.getElementById('hubCoins').textContent=S.coins;
  document.getElementById('hubGems').textContent=S.gems;
  document.getElementById('hubHearts').textContent=S.hearts;
  document.getElementById('lmCoins')&&(document.getElementById('lmCoins').textContent=S.coins);
  document.getElementById('shopCoins')&&(document.getElementById('shopCoins').textContent=S.coins);
  document.getElementById('shopGems')&&(document.getElementById('shopGems').textContent=S.gems);
  // progress
  const sc = Object.keys(S.screw.stars).length, st = Object.keys(S.sort.stars).length, ar = Object.keys(S.arrow.stars).length;
  document.getElementById('progScrew').style.width=(sc/50*100)+'%';
  document.getElementById('progScrewText').textContent=sc+'/50';
  document.getElementById('progSort').style.width=(st/30*100)+'%';
  document.getElementById('progSortText').textContent=st+'/30';
  document.getElementById('progArrow').style.width=(ar/30*100)+'%';
  document.getElementById('progArrowText').textContent=ar+'/30';
  // locks
  const screwMax = Math.max(...Object.keys(S.screw.stars).map(k=>parseInt(k)),0);
  const sortUnlocked = screwMax>=10 || S.sort.unlocked>1;
  const arrowUnlocked = screwMax>=20 || S.arrow.unlocked>1;
  document.getElementById('badgeSort').textContent = sortUnlocked ? '✓ UNLOCKED' : '🔒 Lv 10 or 200💰 unlock';
  document.getElementById('badgeSort').style.background = sortUnlocked?'#10b981':'#475569';
  document.getElementById('badgeArrow').textContent = arrowUnlocked ? '✓ UNLOCKED' : '🔒 Lv 20 or 400💰 unlock';
  document.getElementById('badgeArrow').style.background = arrowUnlocked?'#10b981':'#475569';
  // streak dots
  const row=document.getElementById('streakRow'); if(row){
    row.innerHTML='';
    for(let i=1;i<=7;i++){
      const d=document.createElement('div'); d.className='streak-dot'+(i<=S.streak?' on':'')+(i===S.streak+1?' today':'');
      d.textContent=i<=S.streak?'🔥':i; row.appendChild(d);
    }
  }
}
function claimDaily(){
  if(S.dailyClaimed) return toast('Already claimed! Come tomorrow 🎁');
  const rewards=[50,75,100,150,200,300,500];
  const r=rewards[Math.min(S.streak,6)]||50;
  S.coins+=r; if(S.streak===2) S.gems+=1; S.dailyClaimed=true; S.streak=Math.min(7,S.streak+1);
  save(); toast('🎉 +'+r+' coins claimed! Streak: '+S.streak+' days');
  beep(800,0.2);
  document.getElementById('dailyInfo').textContent='Claimed! Come back tomorrow 🎉';
}
function doSpin(){ openModal('modal-spin'); }
function spinWheel(){
  const wheel=document.getElementById('wheel'); wheel.classList.add('spin');
  setTimeout(()=>{
    wheel.classList.remove('spin');
    const opts=[20,50,100,200,500, '1💎','5💎','JACKPOT 1000💰'];
    const pick=opts[Math.floor(Math.random()*opts.length)];
    document.getElementById('spinResult').textContent='🎉 You won: '+pick;
    if(typeof pick==='number') S.coins+=pick; else if(pick.includes('💎')) S.gems+=parseInt(pick); else S.coins+=1000;
    save(); beep(900,0.3);
  },1200);
}
function showMissions(){
  const body=document.getElementById('missionsBody');
  body.innerHTML=`
    <div class="mission"><div><b>🔩 Clear 5 Screw levels</b><small>${S.missions.screw0?'✓ Done':'0/5'}</small></div><button class="btn btn-green small" onclick="claimMission('screw0')">${S.missions.screw0?'Claimed':'50💰'}</button></div>
    <div class="mission"><div><b>🍕 Serve 3 customers</b><small>${S.missions.sort0?'✓ Done':'0/3'}</small></div><button class="btn btn-orange small" onclick="claimMission('sort0')">${S.missions.sort0?'Claimed':'50💰'}</button></div>
    <div class="mission"><div><b>👑 Beat 1 Boss</b><small>${S.missions.boss0?'✓ Done':'0/1'}</small></div><button class="btn btn-purple small" onclick="claimMission('boss0')">${S.missions.boss0?'Claimed':'100💰+1💎'}</button></div>
  `;
  openModal('modal-missions');
}
function claimMission(k){
  if(S.missions[k]) return toast('Already claimed!');
  S.missions[k]=true;
  if(k==='boss0'){ S.coins+=100; S.gems+=1; } else S.coins+=50;
  save(); toast('🎉 Mission complete!'); showMissions();
}
function openLeaderboard(){
  document.getElementById('lbBody').innerHTML=`
    <div class="mission"><b>1. 🥇 You</b><span>${S.coins} 💰</span></div>
    <div class="mission"><b>2. Ali_Gamer</b><span>2,340 💰</span></div>
    <div class="mission"><b>3. PuzzleQueen</b><span>1,890 💰</span></div>
    <div class="mission"><b>4. BoltyFan99</b><span>1,450 💰</span></div>
  `;
  openModal('modal-leaderboard');
}
function openShop(){ showScreen('screen-shop'); shopTab('skins'); }
function shopTab(tab){
  document.querySelectorAll('.shop-tabs .tab').forEach(t=>t.classList.remove('on'));
  event?.target?.classList.add('on');
  const g=document.getElementById('shopGrid');
  if(tab==='skins'){
    g.innerHTML=`
      <div class="shop-item"><div style="font-size:40px">🤖</div><b>Default Bolty</b><small>Owned</small><button class="btn btn-gray small">Equipped</button></div>
      <div class="shop-item"><div style="font-size:40px">🏴‍☠️</div><b>Pirate Bolty</b><small>200💰</small><button class="btn btn-green small" onclick="buySkin('pirate',200)">Buy</button></div>
      <div class="shop-item"><div style="font-size:40px">👨‍🍳</div><b>Chef Bolty</b><small>300💰</small><button class="btn btn-green small" onclick="buySkin('chef',300)">Buy</button></div>
      <div class="shop-item"><div style="font-size:40px">👑</div><b>King Bolty</b><small>500💰</small><button class="btn btn-green small" onclick="buySkin('king',500)">Buy</button></div>
      <div class="shop-item"><div style="font-size:40px">🥷</div><b>Ninja Bolty</b><small>50💎</small><button class="btn btn-purple small" onclick="buySkinGem('ninja',50)">Buy</button></div>
      <div class="shop-item"><div style="font-size:40px">🦸</div><b>Super Bolty</b><small>100💎</small><button class="btn btn-purple small" onclick="buySkinGem('super',100)">Buy</button></div>
    `;
  } else if(tab==='coins'){
    g.innerHTML=`
      <div class="shop-item"><b>500 Coins</b><small>$0.99</small><button class="btn btn-orange small" onclick="buyIAP('coins_500')">Buy</button></div>
      <div class="shop-item"><b>2,500 Coins</b><small>$4.99</small><button class="btn btn-orange small" onclick="buyIAP('coins_2500')">Buy</button></div>
      <div class="shop-item"><b>7,000 Coins +1k Bonus</b><small>$9.99 BEST VALUE</small><button class="btn btn-green small" onclick="buyIAP('coins_7000')">Buy</button></div>
    `;
  } else if(tab==='gems'){
    g.innerHTML=`
      <div class="shop-item"><b>100 💎</b><small>$0.99</small><button class="btn btn-purple small" onclick="buyIAP('gems_100')">Buy</button></div>
      <div class="shop-item"><b>550 💎</b><small>$4.99</small><button class="btn btn-purple small" onclick="buyIAP('gems_550')">Buy</button></div>
      <div class="shop-item"><b>1,200 💎</b><small>$9.99</small><button class="btn btn-green small" onclick="buyIAP('gems_1200')">Buy</button></div>
    `;
  } else {
    g.innerHTML=`
      <div class="shop-item" style="grid-column:1/-1"><b>🚫 Remove Ads</b><small>No interstitial/banner — Rewarded still available for bonuses</small><div class="price">$2.99</div><button class="btn btn-green" onclick="buyIAP('remove_ads')">Remove Ads — $2.99</button><small style="margin-top:6px">40% players buy this!</small></div>
    `;
  }
}
function buySkin(id,cost){ if(S.coins<cost) return toast('Not enough coins! Play more or watch ad.'); S.coins-=cost; S.ownedSkins.push(id); save(); toast('🎉 Pirate Bolty unlocked!'); beep(900,0.3); }
function buySkinGem(id,cost){ if(S.gems<cost) return toast('Not enough gems!'); S.gems-=cost; S.ownedSkins.push(id); save(); toast('✨ Skin unlocked!'); }
function buyIAP(id){ toast('💳 IAP: '+id+' — Google Play Billing (test mode). In production this opens Play Billing.'); // Simulate
  if(id==='remove_ads'){ S.coins+=500; S.gems+=20; toast('✅ Ads removed! +500 coins bonus'); }
  else if(id.includes('coins')){ S.coins+=500; } else if(id.includes('gems')){ S.gems+=100; }
  save();
}
function openSettings(){ openModal('modal-settings'); }
function showPrivacy(){ toast('Privacy Policy: https://bolty-park.example.com/privacy'); }
function rateUs(){ toast('⭐ Thank you! Opening Play Store...'); }

// Ads simulation
let lastInterstitial=0;
function showAdDemo(type){
  if(type==='banner'){ document.getElementById('bannerAd').style.display='flex'; toast('📢 Banner Ad loaded (AdMob)'); return; }
  toast('📺 Rewarded Ad — +50 coins! (AdMob test)');
  S.coins+=50; save(); beep(700,0.2);
}
function hideBanner(){ document.getElementById('bannerAd').style.display='none'; }
function maybeInterstitial(){
  const now=Date.now();
  if(now - lastInterstitial < 180000) return false; // 3 min rule
  lastInterstitial=now;
  toast('📺 Interstitial Ad (AdMob) — Only on Fail, not on Win ✓');
  return true;
}
function watchAdForHeart(){
  toast('📺 Rewarded Ad watched! +1 Heart ❤️');
  S.hearts=Math.min(5,S.hearts+1); save();
  closeModal('modal-pause');
  retryLevel();
}
function watchAdUnlock(){
  toast('📺 Ad watched! World unlocked for this session!');
  closeModal('modal-unlock');
  // temp unlock
  if(S.curWorld==='sort') S.sort.unlocked=30;
  if(S.curWorld==='arrow') S.arrow.unlocked=30;
  save(); openLevelMap(S.curWorld);
}

// Level Map
function openLevelMap(world){
  S.curWorld=world;
  // check lock
  const screwMax = Math.max(...Object.keys(S.screw.stars).map(k=>parseInt(k)),0);
  if(world==='sort' && screwMax<10 && S.sort.unlocked===1){
    document.getElementById('unlockTitle').textContent='🔒 Sort & Serve Locked';
    document.getElementById('unlockMsg').textContent='Reach Screw Level 10 or pay 200💰 to unlock early!';
    document.getElementById('unlockPayBtn').textContent='Unlock 200💰';
    document.getElementById('unlockPayBtn').onclick=()=>unlockPaySort();
    openModal('modal-unlock'); return;
  }
  if(world==='arrow' && screwMax<20 && S.arrow.unlocked===1){
    document.getElementById('unlockTitle').textContent='🔒 Arrow Escape Locked';
    document.getElementById('unlockMsg').textContent='Reach Screw Level 20 or pay 400💰 to unlock early!';
    document.getElementById('unlockPayBtn').textContent='Unlock 400💰';
    document.getElementById('unlockPayBtn').onclick=()=>unlockPayArrow();
    openModal('modal-unlock'); return;
  }
  showScreen('screen-levelmap');
  const titles={screw:'🔩 Screw Rescue — 50 Levels', sort:'🍕 Sort & Serve — 30 Levels', arrow:'➡️ Arrow Escape — 30 Levels'};
  document.getElementById('lmTitle').textContent=titles[world];
  const grid=document.getElementById('levelGrid'); grid.innerHTML='';
  const total= world==='screw'?50:30;
  const unlocked = S[world].unlocked;
  const stars=S[world].stars;
  for(let i=1;i<=total;i++){
    const d=document.createElement('div');
    const isBoss = i%10===0;
    const isLocked = i>unlocked;
    d.className='lvl'+(isLocked?' locked':'')+(isBoss?' boss':'');
    d.innerHTML= isLocked ? `🔒<small>Lv ${i}</small>` : `<b>${i}</b><small>${isBoss?'👑 BOSS':'Lv '+i}</small><div class="stars">${'⭐'.repeat(stars[i]||0)}${isBoss?'':''}</div>`;
    if(!isLocked) d.onclick=()=> startGame(world,i);
    grid.appendChild(d);
  }
}
function unlockPaySort(){ if(S.coins<200) return toast('Need 200 coins!'); S.coins-=200; S.sort.unlocked=30; save(); closeModal('modal-unlock'); openLevelMap('sort'); toast('✅ Unlocked!'); }
function unlockPayArrow(){ if(S.coins<400) return toast('Need 400 coins!'); S.coins-=400; S.arrow.unlocked=30; save(); closeModal('modal-unlock'); openLevelMap('arrow'); toast('✅ Unlocked!'); }
function goHub(){ showScreen('screen-hub'); updateHubUI(); }
function goLevelMap(){ openLevelMap(S.curWorld); }
function continueNext(){ const w=S.curWorld; const cur=S[w].cur; startGame(w,cur); }

// --- SCREW GAME ENGINE ---
let gTimer=null, gTimeLeft=60, gHearts=3, gSlots=[], gBoxes=[], gUndoStack=[], gLevel=1, gWorld='screw', gMoves=0, gHintsUsed=0;

const COLORS = [
  {id:'red', hex:'#ef4444', bg:'red'}, {id:'blue', hex:'#3b82f6', bg:'blue'},
  {id:'green', hex:'#10b981', bg:'green'}, {id:'yellow', hex:'#facc15', bg:'yellow'},
  {id:'purple', hex:'#a78bfa', bg:'purple'}
];

function getLevelCfg(world, lv){
  if(LEVELS && LEVELS[world]){
    const f=LEVELS[world].find(x=> x.lv===lv);
    if(f){
      if(world==='screw') return {colorCount:f.colors, boxCount:f.boxes, screwsPerBox:f.screwsPerBox, slotCount:f.slots, time:f.time, boss:!!f.boss, reward:f.reward||0, cols:COLORS.slice(0,f.colors), desc:f.desc};
      if(world==='sort') return {colors:f.colors, speed:f.speed, time:f.time, boss:!!f.boss, desc:f.desc};
      if(world==='arrow') return {size:f.size, arrows:f.arrows, time:f.time, boss:!!f.boss, desc:f.desc};
    }
  }
  return null;
}

function genScrewLevel(lv){
  const cfg=getLevelCfg('screw',lv);
  if(cfg){
    const boxes=[];
    for(let b=0;b<cfg.boxCount;b++){
      let boxCols=[];
      for(let s=0;s<cfg.screwsPerBox;s++){
        const c = cfg.cols[Math.floor(Math.random()*cfg.cols.length)];
        boxCols.push(c.id);
      }
      boxes.push({id:b, screws:boxCols, cleared:false, color: cfg.cols[b % cfg.cols.length].id});
    }
    return {boxes, slotCount:cfg.slotCount, time:cfg.time, colorCount:cfg.colorCount, cols:cfg.cols, boss:cfg.boss, desc:cfg.desc};
  }
  // fallback procedural (should not happen)
  let colorCount=2, boxCount=2, screwsPerBox=2, slotCount=3, time=90;
  if(lv<=5){ colorCount=2; boxCount=2; screwsPerBox=2; slotCount=3; time=90; }
  else if(lv<=10){ colorCount=3; boxCount=3; screwsPerBox=2; slotCount=3; time=75; }
  else if(lv<=15){ colorCount=3; boxCount=3; screwsPerBox=3; slotCount=3; time=60; }
  else if(lv<=25){ colorCount=4; boxCount=4; screwsPerBox=2; slotCount=3; time=60; }
  else if(lv<=35){ colorCount=4; boxCount=4; screwsPerBox=3; slotCount=4; time=60; }
  else { colorCount=5; boxCount=5; screwsPerBox=3; slotCount=3; time=50; }
  if(lv%10===0) time+=10;
  const cols = COLORS.slice(0,colorCount);
  const boxes=[];
  for(let b=0;b<boxCount;b++){
    let boxCols=[];
    for(let s=0;s<screwsPerBox;s++){
      const c = cols[Math.floor(Math.random()*cols.length)];
      boxCols.push(c.id);
    }
    boxes.push({id:b, screws:boxCols, cleared:false, color: cols[b % cols.length].id});
  }
  return {boxes, slotCount, time, colorCount, cols};
}

function startGame(world, level){
  S.curWorld=world; S.curLvl=level; S[world].cur=level;
  save();
  if(world==='screw') startScrew(level);
  else if(world==='sort') startSort(level);
  else if(world==='arrow') startArrow(level);
}

function startScrew(level){
  gWorld='screw'; gLevel=level; gHearts=3; gMoves=0; gHintsUsed=0; gUndoStack=[];
  const cfg=genScrewLevel(level);
  gTimeLeft=cfg.time; gSlots = Array(cfg.slotCount).fill(null); gBoxes = cfg.boxes.map(b=>({...b, screws:[...b.screws]}));
  showScreen('screen-game-screw');
  document.getElementById('gLevelName').textContent=(level%10===0?'👑 BOSS ':'')+'Level '+level;
  document.getElementById('gCoins').textContent=S.coins;
  document.getElementById('gHearts').textContent='❤️'.repeat(gHearts);
  document.getElementById('hintText').textContent='';
  renderScrew();
  startTimer('gTimer', ()=> loseGame());
}

function renderScrew(){
  const board=document.getElementById('screwBoard'); board.innerHTML='';
  gBoxes.forEach((box, bi)=>{
    const div=document.createElement('div'); div.className='box'+(box.cleared?' clear':'');
    const title=document.createElement('div'); title.className='box-title';
    const colInfo = COLORS.find(c=>c.id===box.color);
    title.innerHTML=`<i style="background:${colInfo.hex}"></i> ${box.color.toUpperCase()} BOX`;
    div.appendChild(title);
    const screwsWrap=document.createElement('div'); screwsWrap.className='screws';
    box.screws.forEach((col, si)=>{
      const s=document.createElement('div'); s.className='screw '+col;
      s.textContent='🔩'; s.title=col;
      s.onclick=()=> tapScrew(bi,si);
      screwsWrap.appendChild(s);
    });
    if(box.screws.length===0 && !box.cleared) div.appendChild(document.createTextNode(' — Empty — '));
    div.appendChild(screwsWrap);
    board.appendChild(div);
  });
  const slotsEl=document.getElementById('screwSlots'); slotsEl.innerHTML='';
  gSlots.forEach((slot, idx)=>{
    const d=document.createElement('div'); d.className='slot'+(slot?' filled':'');
    if(slot){
      const s=document.createElement('div'); s.className='screw '+slot;
      s.textContent='🔩'; d.appendChild(s);
      d.onclick=()=> tapSlot(idx);
    }
    slotsEl.appendChild(d);
  });
  // check win: all boxes cleared
  if(gBoxes.every(b=> b.cleared || b.screws.length===0)){
    // need to check: if screws left but not matched? actually we clear box when its screws moved correctly
    // For this simplified: if no screws left in any box, win
    if(gBoxes.every(b=> b.screws.length===0)) winGame();
  }
}

function tapScrew(boxIdx, screwIdx){
  const box=gBoxes[boxIdx];
  if(box.cleared) return;
  const color=box.screws[screwIdx];
  // find empty slot
  const emptyIdx=gSlots.findIndex(s=> s===null);
  if(emptyIdx===-1){ toast('Slots full! Tap a slot to return or clear boxes.'); beep(300,0.2,'square'); return; }
  // save undo
  gUndoStack.push(JSON.stringify({boxes:JSON.parse(JSON.stringify(gBoxes)), slots:[...gSlots]}));
  // move screw to slot
  gSlots[emptyIdx]=color;
  box.screws.splice(screwIdx,1);
  gMoves++; vib(30); beep(650,0.12);
  // auto-check if slot has 3 same color -> clear matching box
  checkSlotMatch();
  renderScrew();
  // check if box empty -> cleared
  if(box.screws.length===0 && !box.cleared){
    box.cleared=true; beep(900,0.25); toast('✅ '+box.color+' BOX OPENED!'); confettiBurst();
  }
  renderScrew();
}

function tapSlot(idx){
  if(!gSlots[idx]) return;
  // return screw to a box that needs it or first non-cleared
  const color=gSlots[idx];
  // find box with same color that is not cleared and has space (or most screws)
  let target = gBoxes.find(b=> !b.cleared && b.color===color);
  if(!target) target = gBoxes.find(b=> !b.cleared);
  if(!target) return;
  gUndoStack.push(JSON.stringify({boxes:JSON.parse(JSON.stringify(gBoxes)), slots:[...gSlots]}));
  target.screws.push(color);
  gSlots[idx]=null;
  beep(400,0.1); renderScrew();
}

function checkSlotMatch(){
  // if 3 same color in slots, clear corresponding box and empty slots
  const counts={};
  gSlots.forEach(c=>{ if(c) counts[c]=(counts[c]||0)+1; });
  for(let col in counts){
    if(counts[col]>=3){
      // find box needing this color
      const box=gBoxes.find(b=> !b.cleared && b.color===col);
      if(box){
        // consume 3 slots of this color
        let toRemove=3;
        for(let i=0;i<gSlots.length && toRemove>0;i++){
          if(gSlots[i]===col){ gSlots[i]=null; toRemove--; }
        }
        // if box already empty, just clear; else we keep logic
        if(box.screws.length===0) box.cleared=true;
        beep(1000,0.3); confettiBurst();
        toast('🌟 3x '+col+' matched! Box clearing!');
      }
    }
  }
}

function useHint(){
  if(S.coins<20) return toast('Need 20 coins! Watch ad for 50 coins.');
  S.coins-=20; gHintsUsed++; save();
  // highlight a correct screw
  const box=gBoxes.find(b=> !b.cleared && b.screws.length>0);
  if(box) document.getElementById('hintText').textContent='💡 Try moving a '+box.color+' screw! Box: '+box.color;
  else document.getElementById('hintText').textContent='💡 Almost done! Check slots.';
  beep(700,0.2); setTimeout(()=> document.getElementById('hintText').textContent='',3000);
}
function undoMove(){
  if(gUndoStack.length===0) return toast('Nothing to undo!');
  const prev=JSON.parse(gUndoStack.pop());
  gBoxes=prev.boxes; gSlots=prev.slots; renderScrew(); beep(500,0.1);
}
function shuffleHint(){
  toast('📺 Rewarded Ad — Shuffle! (AdMob)');
  // shuffle screws
  let all=[];
  gBoxes.forEach(b=>{ if(!b.cleared) all.push(...b.screws); b.screws=[]; });
  all.sort(()=>Math.random()-0.5);
  let idx=0;
  gBoxes.forEach(b=>{
    if(!b.cleared && all.length){
      const take=Math.min(2, all.length-idx);
      b.screws = all.slice(idx, idx+take); idx+=take;
    }
  });
  gUndoStack=[]; renderScrew(); S.coins+=10; save();
  beep(600,0.2);
}

// Timer
function startTimer(elId, onEnd){
  clearInterval(gTimer);
  const el=document.getElementById(elId);
  gTimer=setInterval(()=>{
    gTimeLeft--;
    el.textContent='⏱ '+gTimeLeft;
    if(gTimeLeft<=10) el.classList.add('warn');
    else el.classList.remove('warn');
    if(gTimeLeft<=0){ clearInterval(gTimer); onEnd(); }
  },1000);
}
function pauseGame(){ openModal('modal-pause'); clearInterval(gTimer); }
function resumeGame(){ closeModal('modal-pause'); startTimer(gWorld==='screw'?'gTimer':gWorld==='sort'?'sortTimer':'arrowTimer', ()=> loseGame()); }
function toggleMusic(v){ musicOn=v; toast(v?'🎵 Music ON':'🔇 Music OFF'); }
function toggleSfx(v){ audioOn=v; }

// Win / Lose
function winGame(){
  clearInterval(gTimer);
  const timeBonus=Math.max(0, gTimeLeft*2);
  const starCount = gHintsUsed===0 && gTimeLeft>30 ? 3 : gMoves<10 ? 2 : 1;
  const coins = (gWorld==='screw'?20: gWorld==='sort'?15:25) + (gLevel%10===0?20:0) + timeBonus + (starCount===3?10:0);
  S.coins+=coins; S.xp+=10+starCount*5;
  // level stars
  if(!S[gWorld].stars[gLevel] || S[gWorld].stars[gLevel] < starCount) S[gWorld].stars[gLevel]=starCount;
  // unlock next
  if(S[gWorld].unlocked < gLevel+1) S[gWorld].unlocked = gLevel+1;
  S[gWorld].cur=gLevel+1;
  save();
  // update result screen
  document.getElementById('resStars').textContent='⭐'.repeat(starCount)+'☆'.repeat(3-starCount);
  document.getElementById('resCoins').textContent='+'+coins+' 💰 +'+(10+starCount*5)+' XP'+(starCount===3?' 🌟 PERFECT!':'');
  document.getElementById('xpFill').style.width=(S.xp%100)+'%';
  document.getElementById('xpText').textContent='Lv '+(Math.floor(S.xp/100)+1)+' — '+S.xp+' XP';
  confettiBurst(); confettiBurst();
  beep(900,0.4); setTimeout(()=>beep(1100,0.4),200);
  showScreen('screen-win');
}
function loseGame(){
  clearInterval(gTimer);
  gHearts--;
  if(gHearts>0){
    document.getElementById('gHearts').textContent='❤️'.repeat(gHearts);
    toast('💔 Heart lost! '+gHearts+' left');
    gTimeLeft+=5; startTimer('gTimer', ()=> loseGame());
    beep(300,0.4,'square');
  } else {
    maybeInterstitial();
    showScreen('screen-lose');
    beep(200,0.6,'sawtooth');
  }
}
function retryLevel(){ showScreen('screen-game-'+(gWorld==='screw'?'screw':gWorld==='sort'?'sort':'arrow')); if(gWorld==='screw') startScrew(gLevel); else if(gWorld==='sort') startSort(gLevel); else startArrow(gLevel); }
function nextLevel(){
  const total = gWorld==='screw'?50:30;
  if(gLevel>=total) { toast('🎉 World Complete! Try other world!'); goHub(); return; }
  startGame(gWorld, gLevel+1);
}
function buyHeartWithCoins(){
  if(S.coins<100) return toast('Need 100 coins!');
  S.coins-=100; S.hearts=Math.min(5,S.hearts+1); save(); toast('❤️ +1 Heart!'); retryLevel();
}
function crossPromo(){
  const others={screw:'sort', sort:'arrow', arrow:'screw'};
  const next=others[gWorld];
  toast('🎪 Switching to '+(next==='sort'?'Sort & Serve':next==='arrow'?'Arrow Escape':'Screw Rescue')+'!');
  openLevelMap(next);
}

// SORT WORLD
let sortScore=0, sortTimer=null, sortTime=60;
function startSort(level){
  gWorld='sort'; gLevel=level; sortScore=0; sortTime=60;
  showScreen('screen-game-sort');
  document.getElementById('sortLevelName').textContent=(level%10===0?'👑 BOSS ':'')+'Level '+level;
  document.getElementById('sortScore').textContent=sortScore;
  const colors = COLORS.slice(0, Math.min(3+Math.floor(level/10),5));
  // conveyor plates
  const conv=document.getElementById('conveyor'); conv.innerHTML='';
  for(let i=0;i<6;i++){
    const col=colors[Math.floor(Math.random()*colors.length)];
    const p=document.createElement('div'); p.className='plate '+col.id; p.textContent='🍕'; p.dataset.color=col.id; p.draggable=true;
    p.addEventListener('dragstart', e=> e.dataTransfer.setData('color', col.id));
    p.addEventListener('click', ()=> selectPlate(p));
    conv.appendChild(p);
  }
  // tables
  const tables=document.getElementById('tables'); tables.innerHTML='';
  colors.forEach(col=>{
    const t=document.createElement('div'); t.className='table '+col.id; t.dataset.color=col.id;
    t.innerHTML=`<h4>${col.id.toUpperCase()} TABLE</h4><div class="dishes" data-color="${col.id}"></div>`;
    t.addEventListener('dragover', e=> e.preventDefault());
    t.addEventListener('drop', e=> dropPlate(e, t));
    t.addEventListener('click', ()=> { if(selectedPlate) dropPlate({preventDefault:()=>{}}, t); });
    tables.appendChild(t);
  });
  // customers
  document.getElementById('customers').innerHTML=`<div class="cust">🧑 Waiting: ${colors[0].id} 🍕</div><div class="cust">👩 Waiting: ${colors[1].id} 🍕</div>`;
  startTimer('sortTimer', ()=>{
    if(sortScore>=150) winGameSort(); else loseGame();
  });
}
let selectedPlate=null;
function selectPlate(el){
  document.querySelectorAll('.plate').forEach(p=> p.style.outline='');
  selectedPlate=el; el.style.outline='3px solid #7c3aed'; beep(600,0.1);
}
function dropPlate(e, table){
  let col = e.dataTransfer ? e.dataTransfer.getData('color') : (selectedPlate?selectedPlate.dataset.color:null);
  if(!col && selectedPlate) col=selectedPlate.dataset.color;
  if(!col) return;
  const tableCol=table.dataset.color;
  if(col===tableCol){
    const dish=document.createElement('div'); dish.textContent='🍕'; dish.style.fontSize='18px';
    table.querySelector('.dishes').appendChild(dish);
    sortScore+=20; document.getElementById('sortScore').textContent=sortScore;
    beep(800,0.15);
    if(selectedPlate) selectedPlate.remove(); selectedPlate=null;
    // win check: 3 plates per table
    const allDishes=document.querySelectorAll('.dishes');
    let total=0; allDishes.forEach(d=> total+=d.children.length);
    if(total>=9) winGameSort();
    else {
      // add new plate
      const colors=COLORS.slice(0,3);
      const ncol=colors[Math.floor(Math.random()*colors.length)];
      const p=document.createElement('div'); p.className='plate '+ncol.id; p.textContent='🍕'; p.dataset.color=ncol.id; p.draggable=true;
      p.addEventListener('dragstart', ev=> ev.dataTransfer.setData('color', ncol.id));
      p.addEventListener('click', ()=> selectPlate(p));
      document.getElementById('conveyor').appendChild(p);
    }
  } else {
    toast('❌ Wrong table! Try '+col+' table');
    beep(300,0.2,'square'); vib(50);
  }
}
function serveAll(){ if(sortScore>0) winGameSort(); else toast('Serve correct colors first!'); }
function winGameSort(){ clearInterval(gTimer); S.coins+=15+Math.floor(sortScore/10); save(); winGame(); }
function useHintSort(){ if(S.coins<20) return toast('Need 20 coins!'); S.coins-=20; save(); toast('💡 Hint: Look at customer colors above tables!'); beep(700,0.2); }

// ARROW WORLD
let mazeSize=5, mazeData=[], kingPos={x:0,y:0}, exitPos={x:4,y:4};
function startArrow(level){
  gWorld='arrow'; gLevel=level; sortTime= level>20?45:60;
  showScreen('screen-game-arrow');
  document.getElementById('arrowLevelName').textContent=(level%10===0?'👑 BOSS ':'')+'Level '+level;
  document.getElementById('arrowHint').textContent='';
  mazeSize = level<=10?5: level<=20?7:9;
  const mazeEl=document.getElementById('maze'); mazeEl.style.gridTemplateColumns=`repeat(${mazeSize},1fr)`;
  mazeEl.innerHTML='';
  mazeData=[];
  const dirs=['↑','→','↓','←'];
  for(let y=0;y<mazeSize;y++){
    mazeData[y]=[];
    for(let x=0;x<mazeSize;x++){
      const cell=document.createElement('div'); cell.className='cell';
      let type='path';
      if(x===0 && y===0){ type='start'; cell.textContent='🤖'; kingPos={x,y}; }
      else if(x===mazeSize-1 && y===mazeSize-1){ type='exit'; cell.textContent='🏁'; exitPos={x,y}; }
      else if(Math.random()<0.2){ type='wall'; cell.textContent='🧱'; cell.className+=' wall'; }
      else { type='arrow'; const d=dirs[Math.floor(Math.random()*dirs.length)]; cell.textContent=d; cell.className+=' arrow'; cell.dataset.dir=d; cell.onclick=()=> rotateArrow(cell); mazeData[y][x]=d; }
      cell.dataset.x=x; cell.dataset.y=y; cell.dataset.type=type;
      mazeEl.appendChild(cell);
    }
  }
  startTimer('arrowTimer', ()=> loseGame());
}
function rotateArrow(cell){
  const dirs=['↑','→','↓','←']; const cur=cell.textContent; const idx=dirs.indexOf(cur);
  const nxt=dirs[(idx+1)%4]; cell.textContent=nxt; cell.dataset.dir=nxt; beep(600,0.08); vib(20);
}
function kingGo(){
  let x=kingPos.x, y=kingPos.y; let steps=0;
  const visit = setInterval(()=>{
    const dirs={ '↑':[0,-1], '→':[1,0], '↓':[0,1], '←':[-1,0] };
    // find arrow at current pos
    const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
    let dir = cell?cell.dataset.dir:null;
    if(dir && dirs[dir]){
      x+=dirs[dir][0]; y+=dirs[dir][1];
    } else {
      x+=1; // move right if no arrow
    }
    if(x<0||y<0||x>=mazeSize||y>=mazeSize){ clearInterval(visit); toast('💥 Out of bounds! Rotate arrows!'); beep(300,0.4,'square'); return; }
    const ncell=document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
    if(ncell && ncell.classList.contains('wall')){ clearInterval(visit); toast('🧱 Hit wall! Try again'); beep(300,0.4); return; }
    // move king visual
    document.querySelectorAll('.cell').forEach(c=>{ if(c.textContent==='🤖' && c!==document.querySelector('.cell[data-x="0"][data-y="0"]')) c.textContent=c.dataset.dir||''; });
    if(ncell) { if(ncell.dataset.type==='exit'){ ncell.textContent='🤖'; clearInterval(visit); winGame(); confettiBurst(); return; } else if(ncell.classList.contains('arrow')) ncell.textContent='🤖'; }
    steps++; if(steps>20){ clearInterval(visit); toast('🔄 Loop detected! Reset'); }
  },300);
  beep(800,0.2);
}
function resetMaze(){ startArrow(gLevel); }
function useHintArrow(){
  document.getElementById('arrowHint').textContent='💡 Hint: Arrows point where King will go! Make a path to 🏁';
  toast('📺 Ad — Hint shown (Rewarded)'); setTimeout(()=> document.getElementById('arrowHint').textContent='',4000);
}

// Confetti
function confettiBurst(){
  const canvas=document.getElementById('confetti'); const ctx=canvas.getContext('2d');
  canvas.width=window.innerWidth; canvas.height=window.innerHeight;
  const pieces=[];
  for(let i=0;i<60;i++) pieces.push({x:Math.random()*canvas.width, y:-10, vx:(Math.random()-0.5)*8, vy:Math.random()*6+4, r:Math.random()*6+4, c:['#f59e0b','#ec4899','#8b5cf6','#10b981','#facc15'][Math.floor(Math.random()*5)]});
  let f=0; const anim=setInterval(()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=0.3; ctx.fillStyle=p.c; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); });
    f++; if(f>60){ clearInterval(anim); ctx.clearRect(0,0,canvas.width,canvas.height); }
  },16);
}

// Init
updateHubUI();
