const state = {
  turn: 1, playerHp: 100, enemyHp: 100, selected: null,
  playerPos: 22, enemyPos: 2, gameOver: false
};

const chips = [
  {id:"sword", name:"ソード", icon:"⚔", desc:"前方1マス / 40ダメージ", dmg:40},
  {id:"shot", name:"ショット", icon:"➤", desc:"前方3マス / 20ダメージ", dmg:20},
  {id:"shield", name:"シールド", icon:"◇", desc:"次の被ダメージ50%軽減", shield:true},
  {id:"dash", name:"ダッシュ", icon:"➜", desc:"前方2マス移動", move:2},
  {id:"recover", name:"リカバー", icon:"✚", desc:"HPを30回復", heal:30},
  {id:"overblade", name:"オーバーブレード", icon:"✦", desc:"次の攻撃 +50", dmg:50, special:true}
];

const field = document.getElementById("field");
const chipsEl = document.getElementById("chips");
const message = document.getElementById("message");
const logEl = document.getElementById("log");

function addLog(t){ logEl.innerHTML = t + "<br>" + logEl.innerHTML; }

function renderField(){
  field.innerHTML="";
  for(let i=0;i<25;i++){
    const c=document.createElement("div");
    c.className="cell";
    if(i===state.playerPos)c.classList.add("player");
    if(i===state.enemyPos)c.classList.add("enemy");
    c.dataset.pos=i;
    if(i===state.enemyPos){
      c.addEventListener("click",()=>targetEnemy());
      c.addEventListener("dblclick",()=>targetEnemy());
    }
    if(i===state.playerPos){
      const u=document.createElement("div"); u.className="unit player";
      const img=document.createElement("img"); img.src="./ren-idle.svg"; img.alt="REN";
      img.onerror=()=>{img.style.display="none";u.textContent="REN"};
      u.appendChild(img); c.appendChild(u);
    }
    if(i===state.enemyPos){
      const u=document.createElement("div"); u.className="unit enemy"; u.textContent="CPU";
      c.appendChild(u);
    }
    field.appendChild(c);
  }
}

function renderChips(){
  chipsEl.innerHTML="";
  chips.forEach(ch=>{
    const b=document.createElement("button");
    b.className="chip"+(state.selected?.id===ch.id?" selected":"");
    b.innerHTML=`<div class="icon">${ch.icon}</div><div class="chip-name">${ch.name}</div><div class="chip-desc">${ch.desc}</div>`;
    b.addEventListener("click",()=>selectChip(ch));
    chipsEl.appendChild(b);
  });
}

function selectChip(ch){
  state.selected=ch;
  document.getElementById("selectedLabel").textContent=ch.name;
  message.textContent = ch.dmg || ch.heal ? "敵をタップして使用" : "このチップを使用";
  renderChips();
}

function targetEnemy(){
  if(state.gameOver) return;
  if(!state.selected){
    message.textContent="先にチップを選択してください";
    return;
  }
  useSelected(state.selected);
}

function useSelected(ch){
  if(ch.heal){
    state.playerHp=Math.min(100,state.playerHp+ch.heal);
    addLog(`リカバー：HPを${ch.heal}回復。`);
  } else if(ch.shield){
    state.shield=true;
    addLog("シールド：次の被ダメージを50%軽減。");
  } else if(ch.move){
    const row=Math.floor(state.playerPos/5), col=state.playerPos%5;
    const eRow=Math.floor(state.enemyPos/5), eCol=state.enemyPos%5;
    const dir=col<eCol?1:col>eCol?-1:0;
    const next=Math.max(0,Math.min(4,col+dir*ch.move));
    state.playerPos=row*5+next;
    addLog("ダッシュ：2マス移動。");
  } else if(ch.dmg){
    const bonus=ch.special?50:0;
    const damage=ch.dmg+bonus;
    state.enemyHp=Math.max(0,state.enemyHp-damage);
    addLog(`${ch.name}：CPUに${damage}ダメージ。`);
    if(ch.special) addLog("オーバーブレード効果発動。");
    if(state.enemyHp<=0){ endBattle(true); return; }
  }
  state.selected=null;
  document.getElementById("selectedLabel").textContent="NO CHIP";
  renderChips(); renderField(); updateHud();
  cpuTurn();
}

function cpuTurn(){
  setTimeout(()=>{
    if(state.gameOver)return;
    let damage=15;
    if(state.shield){damage=Math.ceil(damage/2);state.shield=false;addLog("シールドでダメージ半減。");}
    state.playerHp=Math.max(0,state.playerHp-damage);
    addLog(`CPUの攻撃：${damage}ダメージ。`);
    state.turn++;
    updateHud(); renderField();
    if(state.playerHp<=0) endBattle(false);
  },350);
}

function updateHud(){
  document.getElementById("playerHpText").textContent=`HP ${state.playerHp} / 100`;
  document.getElementById("enemyHpText").textContent=`HP ${state.enemyHp} / 100`;
  document.getElementById("playerHpBar").style.width=state.playerHp+"%";
  document.getElementById("enemyHpBar").style.width=state.enemyHp+"%";
  document.getElementById("turnText").textContent=`TURN ${String(state.turn).padStart(2,"0")}`;
}

function endBattle(win){
  state.gameOver=true;
  const result=document.getElementById("result");
  result.classList.remove("hidden");
  document.getElementById("resultTitle").textContent=win?"VICTORY":"DEFEAT";
  document.querySelector(".result-sub").textContent=win?"ENEMY DATA PURGED.":"SWEEPER SYSTEM OFFLINE.";
}

function reset(){
  Object.assign(state,{turn:1,playerHp:100,enemyHp:100,selected:null,playerPos:22,enemyPos:2,gameOver:false,shield:false});
  document.getElementById("result").classList.add("hidden");
  document.getElementById("selectedLabel").textContent="NO CHIP";
  addLog("リマッチ：バトル開始。");
  renderField();renderChips();updateHud();
}
document.getElementById("rematch").addEventListener("click",reset);
document.getElementById("titleBtn").addEventListener("click",reset);

renderField();renderChips();updateHud();
