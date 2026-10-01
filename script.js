const STORAGE_KEY = "dearMeWellness_vFinal";
const TOTAL = 27; // 6 water + 1 movement + 6 workout + 5 skin + 5 hair + 4 life goals

const workoutPlans = {
  0:{name:"Sunday",focus:"Rest & reset",items:[
    "Gentle walk — 10 min","Full-body stretch — 5 min","Deep breathing — 5 min",
    "Drink water — 2 glasses","Early wind-down — 20 min","Rest without guilt — 100%"
  ]},
  1:{name:"Monday",focus:"Lower body",items:[
    "Squats — 3 × 12 reps","Glute bridges — 3 × 15 reps","Reverse lunges — 2 × 10 each leg",
    "Calf raises — 3 × 15 reps","Lower-body stretch — 5 min","Cool down — 5 min"
  ]},
  2:{name:"Tuesday",focus:"Cardio + core",items:[
    "Brisk walk / dance — 15 min","Marching cardio — 3 × 1 min","Dead bug — 3 × 10 each side",
    "Plank — 3 × 20–30 sec","Core stretch — 5 min","Cool down — 5 min"
  ]},
  3:{name:"Wednesday",focus:"Recovery",items:[
    "Easy walk — 10 min","Full-body stretch — 10 min","Mobility — 5 min",
    "Deep breathing — 5 min","Hydrate — 2 glasses","Early wind-down — 20 min"
  ]},
  4:{name:"Thursday",focus:"Upper body + core",items:[
    "Wall push-ups — 3 × 12 reps","Shoulder taps — 3 × 10 each side","Bird dog — 3 × 10 each side",
    "Plank — 3 × 20–30 sec","Upper-body stretch — 5 min","Cool down — 5 min"
  ]},
  5:{name:"Friday",focus:"Full body",items:[
    "Squats — 3 × 12 reps","Wall push-ups — 3 × 12 reps","Glute bridges — 3 × 15 reps",
    "Marching cardio — 3 × 1 min","Core — 3 × 20–30 sec","Full-body stretch — 5 min"
  ]},
  6:{name:"Saturday",focus:"Cardio",items:[
    "Dance — 15 min","Brisk walk — 15 min","Step-ups — 3 × 10 each leg",
    "Light cardio — 5 min","Full-body stretch — 5 min","Cool down — 5 min"
  ]}
};

const skinItems = ["Morning cleanse","Moisturizer","Sunscreen","Night cleanse","Night moisturizer"];
const hairItems = ["Gentle scalp care","Detangle gently","Avoid unnecessary heat","Shampoo on wash day","Condition lengths"];
const goalsItems = ["Had a proper meal","Took a real break","Did something I enjoy","Spoke kindly to myself"];

const moodMessages = {
  Great:"You deserve this, girl. Keep shining.",
  Good:"There’s a lot more to go. Keep going, girl.",
  Meh:"It’s okay, it happens, my beautiful. Take it easy today.",
  Sad:"A sign to slow down. Things have their own time. Get your beautiful sleep.",
  Tired:"Come on, you’re sooo strong. Rest when you need to — you’ve got this."
};

let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"days":{}}');
let selectedWorkoutDay = new Date().getDay();
let calendarDate = new Date();
let timerInterval = null;
let timerSeconds = 0;

function keyFor(date=new Date()){
  const d = new Date(date);
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function getToday(){
  const key=keyFor();
  if(!state.days[key]) state.days[key]={
    mood:"",
    glasses:0,
    movement:"",
    workout:{},
    skin:Array(skinItems.length).fill(false),
    hair:Array(hairItems.length).fill(false),
    goals:Array(goalsItems.length).fill(false),
    screen:"",
    screenNote:"",
    journal:{happy:"",sad:"",learned:"",proud:"",leave:"",note:""}
  };
  return state.days[key];
}
function save(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
}
function setText(id,value){document.getElementById(id).textContent=value}
function renderDate(){
  setText("todayDate",new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"}));
}
function renderMood(){
  const d=getToday();
  document.querySelectorAll(".mood").forEach(b=>b.classList.toggle("active",b.dataset.mood===d.mood));
  document.getElementById("moodMessage").textContent=d.mood ? moodMessages[d.mood] : "Your check-in is waiting whenever you're ready.";
}
function renderMovement(){
  const d=getToday();
  document.querySelectorAll(".move").forEach(b=>b.classList.toggle("active",b.dataset.movement===d.movement));
}
function renderGlasses(){
  const d=getToday(), wrap=document.getElementById("glasses");
  wrap.innerHTML="";
  for(let i=0;i<6;i++){
    const x=document.createElement("div");
    x.className="glass"+(i<d.glasses?" selected":"");
    x.innerHTML=`<div class="glassicon"></div><span>Glass ${i+1}</span>`;
    x.onclick=()=>{
      d.glasses=(i+1===d.glasses?i:i+1);
      save();renderAll();
    };
    wrap.appendChild(x);
  }
}
function renderCheckList(containerId,items,arrKey){
  const d=getToday(), wrap=document.getElementById(containerId);
  wrap.innerHTML="";
  items.forEach((item,i)=>{
    const label=document.createElement("label");
    label.className="check"+(d[arrKey][i]?" done":"");
    label.innerHTML=`<input type="checkbox" ${d[arrKey][i]?"checked":""}><span>${item}</span>`;
    label.querySelector("input").onchange=e=>{d[arrKey][i]=e.target.checked;save();renderAll()};
    wrap.appendChild(label);
  });
}
function renderGoals(){renderCheckList("goalList",goalsItems,"goals")}
function renderSkin(){renderCheckList("skinList",skinItems,"skin")}
function renderHair(){renderCheckList("hairList",hairItems,"hair")}

function workoutCount(d,day=selectedWorkoutDay){
  const obj=d.workout[String(day)]||{};
  return workoutPlans[day].items.filter((_,i)=>obj[i]).length;
}
function renderWorkout(){
  const d=getToday(), plan=workoutPlans[selectedWorkoutDay];
  const week=document.getElementById("weekButtons");
  week.innerHTML="";
  Object.entries(workoutPlans).forEach(([idx,p])=>{
    const b=document.createElement("button");
    b.className="day-btn"+(+idx===selectedWorkoutDay?" active":"");
    b.textContent=p.name.slice(0,3);
    b.title=p.name;
    b.onclick=()=>{selectedWorkoutDay=+idx;renderWorkout()};
    week.appendChild(b);
  });
  document.getElementById("workoutDayTitle").textContent=plan.name;
  document.getElementById("workoutFocus").textContent=plan.focus;
  const count=workoutCount(d);
  document.getElementById("workoutBadge").textContent=`${count} / 6`;
  const wrap=document.getElementById("workoutList");
  wrap.innerHTML="";
  const obj=d.workout[String(selectedWorkoutDay)]||{};
  plan.items.forEach((item,i)=>{
    const label=document.createElement("label");
    label.className="check"+(obj[i]?" done":"");
    label.innerHTML=`<input type="checkbox" ${obj[i]?"checked":""}><span>${item}</span>`;
    label.querySelector("input").onchange=e=>{
      if(!d.workout[String(selectedWorkoutDay)]) d.workout[String(selectedWorkoutDay)]={};
      d.workout[String(selectedWorkoutDay)][i]=e.target.checked;
      save();renderAll();
    };
    wrap.appendChild(label);
  });
}

function counts(){
  const d=getToday();
  const skin=d.skin.filter(Boolean).length;
  const hair=d.hair.filter(Boolean).length;
  const goals=d.goals.filter(Boolean).length;
  const workout=workoutCount(d, new Date().getDay());
  const movement=d.movement?1:0;
  const total=d.glasses+movement+skin+hair+goals+workout;
  return {water:d.glasses,movement,skin,hair,goals,workout,total};
}
function progress(){
  return Math.round(counts().total/TOTAL*100);
}
function renderProgress(){
  const c=counts(), pct=progress();
  setText("progressNumber",pct+"%");
  document.getElementById("progressFill").style.width=pct+"%";
  setText("recapMovement",getToday().movement||"Not checked yet");
  setText("recapWater",`${c.water} / 6`);
  setText("recapSkin",`${c.skin} / 5`);
  setText("recapHair",`${c.hair} / 5`);
  setText("recapWorkout",`${c.workout} / 6`);
  setText("recapGoals",`${c.goals} / 4`);
  setText("winWater",c.water);
  setText("winCare",c.skin+c.hair);
  setText("winWorkout",c.workout);
  setText("winGoals",c.goals);
  const note=document.getElementById("completeNote");
  if(pct===100){
    note.innerHTML='<div class="complete-note"><span class="star">★</span> You showed up for yourself today. That counts.</div>';
  }else if(pct>0){
    note.innerHTML='<div class="small" style="margin-top:14px">No need to finish everything. Your day is still valid exactly as it was.</div>';
  }else note.innerHTML="";
}
function isComplete(key){
  const d=state.days[key];
  if(!d) return false;
  const water=d.glasses||0;
  const movement=d.movement?1:0;
  const skin=(d.skin||[]).filter(Boolean).length;
  const hair=(d.hair||[]).filter(Boolean).length;
  const goals=(d.goals||[]).filter(Boolean).length;
  const day=new Date(key+"T12:00:00").getDay();
  const workout=(workoutPlans[day].items||[]).filter((_,i)=>d.workout?.[String(day)]?.[i]).length;
  return water+movement+skin+hair+goals+workout===TOTAL;
}
function renderStreak(){
  const today=new Date();
  let completed=0, stars=0, streak=0;
  Object.keys(state.days).forEach(k=>{if(isComplete(k)){completed++;stars++}});
  let cursor=new Date(today);
  while(isComplete(keyFor(cursor))){streak++;cursor.setDate(cursor.getDate()-1)}
  setText("streakCount",streak);
  setText("starCount",stars);
  setText("completedCount",completed);
  setText("streakMessage",isComplete(keyFor())?"Completed ★":"Keep it gentle");
}
function renderScreen(){
  const d=getToday();
  document.querySelectorAll(".screen-btn").forEach(b=>b.classList.toggle("active",b.dataset.screen===d.screen));
  document.getElementById("screenNote").value=d.screenNote||"";
}
function renderJournal(){
  const j=getToday().journal||{};
  ["happy","sad","learned","proud","leave","note"].forEach(id=>{
    const el=document.getElementById(id);
    if(document.activeElement!==el) el.value=j[id]||"";
  });
}

function escapeHTML(value){
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));
}

function formatSavedDate(key){
  const d=new Date(key+"T12:00:00");
  return d.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"});
}

function savedDayProgress(key){
  const d=state.days[key];
  if(!d) return 0;
  const water=d.glasses||0;
  const movement=d.movement?1:0;
  const skin=(d.skin||[]).filter(Boolean).length;
  const hair=(d.hair||[]).filter(Boolean).length;
  const goals=(d.goals||[]).filter(Boolean).length;
  const day=new Date(key+"T12:00:00").getDay();
  const workout=(workoutPlans[day].items||[]).filter((_,i)=>d.workout?.[String(day)]?.[i]).length;
  return Math.round((water+movement+skin+hair+goals+workout)/TOTAL*100);
}

function savedDayJournalHTML(j){
  const labels=[
    ["happy","What made me happy?"],
    ["sad","What made me sad / upset?"],
    ["learned","What did I learn?"],
    ["proud","What am I proud of?"],
    ["leave","What do I want to leave behind?"],
    ["note","A little note to myself"]
  ];
  return labels.map(([key,label])=>`
    <div class="saved-journal-box">
      <strong>${label}</strong>
      <p>${escapeHTML(j?.[key] || "Nothing written.")}</p>
    </div>
  `).join("");
}

function renderSavedDays(){
  const wrap=document.getElementById("savedDaysList");
  if(!wrap) return;
  const keys=Object.keys(state.days)
    .filter(k=>state.days[k]?.saved)
    .sort((a,b)=>b.localeCompare(a));

  if(!keys.length){
    wrap.innerHTML='<div class="saved-empty">Your saved days will appear here after you press “Done — Save Today”.</div>';
    return;
  }

  wrap.innerHTML=keys.map((key,index)=>{
    const d=state.days[key];
    const dayNum=new Date(key+"T12:00:00").getDay();
    const workout=workoutCount(d,dayNum);
    const skin=(d.skin||[]).filter(Boolean).length;
    const hair=(d.hair||[]).filter(Boolean).length;
    const goals=(d.goals||[]).filter(Boolean).length;
    const pct=savedDayProgress(key);
    return `
      <div class="saved-day">
        <button class="saved-day-head" type="button" data-saved-toggle="${escapeHTML(key)}">
          <span><strong>${escapeHTML(formatSavedDate(key))}</strong><br>
          <span>${d.mood || "Mood not selected"} · ${pct}% complete</span></span>
          <span class="saved-arrow">${index===0 ? "⌃" : "⌄"}</span>
        </button>
        <div class="saved-detail${index===0 ? " open" : ""}" id="saved-${escapeHTML(key)}">
          <div class="saved-summary">
            <div class="saved-stat">Water<b>${d.glasses||0}/6</b></div>
            <div class="saved-stat">Movement<b>${escapeHTML(d.movement||"—")}</b></div>
            <div class="saved-stat">Workout<b>${workout}/6</b></div>
            <div class="saved-stat">Skin<b>${skin}/5</b></div>
            <div class="saved-stat">Hair<b>${hair}/5</b></div>
            <div class="saved-stat">Little things<b>${goals}/4</b></div>
          </div>
          <div class="small">Screen time: ${escapeHTML(d.screen||"Not selected")}</div>
          ${d.screenNote ? `<div class="small" style="margin-top:5px">Screen note: ${escapeHTML(d.screenNote)}</div>` : ""}
          <div class="saved-journal">${savedDayJournalHTML(d.journal)}</div>
        </div>
      </div>
    `;
  }).join("");

  wrap.querySelectorAll("[data-saved-toggle]").forEach(btn=>{
    btn.onclick=()=>{
      const key=btn.dataset.savedToggle;
      const detail=document.getElementById("saved-"+key);
      const isOpen=detail.classList.toggle("open");
      btn.querySelector(".saved-arrow").textContent=isOpen?"⌃":"⌄";
    };
  });
}


document.getElementById("exportData").onclick=()=>{
  const backup={
    app:"Dear Me.",
    version:5,
    exportedAt:new Date().toISOString(),
    days:state.days
  };
  const blob=new Blob([JSON.stringify(backup,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  const stamp=new Date().toISOString().slice(0,10);
  a.href=url;
  a.download=`dear-me-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  document.getElementById("dataMessage").textContent="Backup downloaded. Keep it somewhere safe.";
};

document.getElementById("importData").addEventListener("change",async e=>{
  const file=e.target.files[0];
  if(!file) return;
  try{
    const text=await file.text();
    const backup=JSON.parse(text);
    if(!backup || backup.app!=="Dear Me." || !backup.days || typeof backup.days!=="object"){
      throw new Error("Invalid backup");
    }
    const replaceAll=confirm("Restore this backup? Choose OK to replace the current Dear Me records with the backup.");
    if(!replaceAll){
      document.getElementById("dataMessage").textContent="Import cancelled.";
      e.target.value="";
      return;
    }
    state={days:backup.days};
    save();
    renderAll();
    document.getElementById("dataMessage").textContent="Your Dear Me records were restored successfully.";
  }catch(err){
    document.getElementById("dataMessage").textContent="That file doesn't look like a Dear Me backup.";
  }
  e.target.value="";
});

function renderAll(){
  renderMood();renderMovement();renderGlasses();renderSkin();renderHair();renderGoals();
  renderWorkout();renderProgress();renderStreak();renderScreen();renderJournal();renderSavedDays();renderCalendar();
  const saved=getToday().saved;
  const btn=document.getElementById("saveToday");
  if(btn){ btn.textContent=saved ? "✓ Saved for Today" : "Done — Save Today"; btn.classList.toggle("saved",!!saved); }
  const msg=document.getElementById("saveMessage");
  if(msg) msg.textContent=saved ? "Saved for today. You can come back to this record anytime." : "";
}

document.querySelectorAll(".mood").forEach(b=>b.onclick=()=>{
  getToday().mood=b.dataset.mood;save();renderMood();
});
document.querySelectorAll(".move").forEach(b=>b.onclick=()=>{
  getToday().movement=b.dataset.movement;save();renderAll();
});
document.querySelectorAll(".screen-btn").forEach(b=>b.onclick=()=>{
  getToday().screen=b.dataset.screen;save();renderScreen();
});
document.getElementById("screenNote").addEventListener("input",e=>{
  getToday().screenNote=e.target.value;save();
});
["happy","sad","learned","proud","leave","note"].forEach(id=>{
  document.getElementById(id).addEventListener("input",e=>{
    getToday().journal[id]=e.target.value;save();
  });
});

document.getElementById("sleepBtn").onclick=()=>{
  const val=document.getElementById("wakeTime").value;
  if(!val){document.getElementById("sleepResult").textContent="Choose your wake-up time first.";return}
  const [h,m]=val.split(":").map(Number);
  const base=new Date();base.setHours(h,m,0,0);
  const options=[9,8,7].map(hours=>{
    const t=new Date(base.getTime()-hours*60*60*1000);
    return `${hours}h sleep → ${t.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}`;
  });
  document.getElementById("sleepResult").innerHTML=options.join("<br>");
};

function updateBirthday(){
  const now=new Date();
  let next=new Date(now.getFullYear(),10,13,0,0,0);
  if(next<=now) next=new Date(now.getFullYear()+1,10,13,0,0,0);
  const diff=next-now;
  setText("bdDays",Math.floor(diff/86400000));
  setText("bdHours",Math.floor(diff/3600000)%24);
  setText("bdMinutes",Math.floor(diff/60000)%60);
  setText("bdSeconds",Math.floor(diff/1000)%60);
}

function renderCalendar(){
  const y=calendarDate.getFullYear(), m=calendarDate.getMonth();
  setText("calTitle",calendarDate.toLocaleDateString(undefined,{month:"long",year:"numeric"}));
  const wrap=document.getElementById("calendar");wrap.innerHTML="";
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(d=>{
    const el=document.createElement("div");el.className="weekday";el.textContent=d;wrap.appendChild(el);
  });
  const first=new Date(y,m,1).getDay();
  const days=new Date(y,m+1,0).getDate();
  const prevDays=new Date(y,m,0).getDate();
  for(let i=0;i<first;i++){
    const el=document.createElement("div");el.className="cal-day muted";el.textContent=prevDays-first+i+1;wrap.appendChild(el);
  }
  for(let d=1;d<=days;d++){
    const el=document.createElement("div");el.className="cal-day";
    const k=keyFor(new Date(y,m,d));
    if(k===keyFor()) el.classList.add("today");
    if(isComplete(k)) el.classList.add("completed");
    el.textContent=d;wrap.appendChild(el);
  }
  const totalCells=first+days;
  const remaining=(7-totalCells%7)%7;
  for(let i=1;i<=remaining;i++){
    const el=document.createElement("div");el.className="cal-day muted";el.textContent=i;wrap.appendChild(el);
  }
}
document.getElementById("prevMonth").onclick=()=>{calendarDate.setMonth(calendarDate.getMonth()-1);renderCalendar()};
document.getElementById("nextMonth").onclick=()=>{calendarDate.setMonth(calendarDate.getMonth()+1);renderCalendar()};


document.getElementById("saveToday").onclick=()=>{
  const key=keyFor();
  const d=getToday();
  d.savedAt=new Date().toISOString();
  d.saved=true;
  state.days[key]=d;
  save();
  renderAll();
  document.getElementById("saveMessage").textContent="Saved for today. You can come back to this record anytime.";
  document.getElementById("saveToday").textContent="✓ Saved for Today";
  document.getElementById("saveToday").classList.add("saved");
};

document.getElementById("resetToday").onclick=()=>{
  const button=document.getElementById("resetToday");
  button.classList.add("saved");
  setTimeout(()=>button.classList.remove("saved"),180);

  if(!confirm("Reset everything you recorded for today?")) return;

  delete state.days[keyFor()];
  save();

  // Reset the currently visible UI immediately.
  document.querySelectorAll(".mood,.move,.screen-btn,.day-btn,.glass,.goal,.exercise,.timer-control")
    .forEach(el=>el.classList.remove("active","selected","checked"));
  document.querySelectorAll('input[type="checkbox"]').forEach(el=>el.checked=false);

  document.querySelectorAll("textarea").forEach(el=>el.value="");
  document.getElementById("screenNote").value="";
  ["happy","sad","learned","proud","leave","note"].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.value="";
  });

  const saveBtn=document.getElementById("saveToday");
  if(saveBtn){
    saveBtn.textContent="Done — Save Today";
    saveBtn.classList.remove("saved");
  }
  const saveMsg=document.getElementById("saveMessage");
  if(saveMsg) saveMsg.textContent="";

  renderAll();
};

function setTimerButton(name){
  document.querySelectorAll(".timer-control").forEach(b=>b.classList.remove("selected"));
  const el=document.getElementById(name);
  if(el) el.classList.add("selected");
}

function startTimer(){
  if(timerSeconds<=0){
    const mins=parseInt(document.getElementById("timerMinutes").value,10);
    if(!mins || mins<1){
      document.getElementById("timerDisplay").textContent="Enter minutes";
      document.getElementById("timerStatus").textContent="Add a few minutes first.";
      return;
    }
    timerSeconds=mins*60;
  }
  clearInterval(timerInterval);
  setTimerButton("startTimer");
  document.getElementById("timerStatus").textContent="You're moving. Keep going at your own pace.";
  updateTimer();
  timerInterval=setInterval(()=>{
    timerSeconds--;
    updateTimer();
    if(timerSeconds<=0){
      clearInterval(timerInterval);
      timerInterval=null;
      timerSeconds=0;
      setTimerButton("startTimer");
      document.getElementById("timerDisplay").textContent="Done ♡";
      document.getElementById("timerStatus").textContent="You did it. Nice work.";
    }
  },1000);
}

function pauseTimer(){
  if(!timerSeconds) return;
  clearInterval(timerInterval);
  timerInterval=null;
  setTimerButton("pauseTimer");
  document.getElementById("timerStatus").textContent="Paused. Come back when you're ready.";
}

function resetTimer(){
  clearInterval(timerInterval);
  timerInterval=null;
  timerSeconds=0;
  setTimerButton("resetTimer");
  document.getElementById("timerDisplay").textContent="00:00";
  document.getElementById("timerStatus").textContent="Reset. Ready when you are.";
}

document.getElementById("startTimer").onclick=startTimer;
document.getElementById("pauseTimer").onclick=pauseTimer;
document.getElementById("resetTimer").onclick=resetTimer;
document.getElementById("resetTimer2").onclick=resetTimer;

function updateTimer(){
  const m=String(Math.floor(timerSeconds/60)).padStart(2,"0");
  const s=String(timerSeconds%60).padStart(2,"0");
  document.getElementById("timerDisplay").textContent=`${m}:${s}`;
}

renderDate();
renderAll();
updateBirthday();
setInterval(updateBirthday,1000);
