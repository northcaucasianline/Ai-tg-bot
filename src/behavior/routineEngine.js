const TZ="Europe/Moscow";
const DAYS=["воскресенье","понедельник","вторник","среда","четверг","пятница","суббота"];

// Не привязан к календарю: один и тот же мир продолжает работать 1 октября, зимой и через год.
// Недели A/B слегка отличаются, чтобы Анна не жила по идеальному шаблону.
const DAYS_PLAN={
  1:{name:"понедельник",theme:"тяжёлый учебный день",night:"тихий вечер дома",blocks:[
    [0,7,"сон"],[7,8,"просыпается, душ, кофе и телефон"],[8,9,"собирается и едет в СтГМУ"],[9,11,"пары по стоматологии"],[11,12,"перерыв, кофе, переписка"],[12,14,"занятия и практика"],[14,15,"обед"],[15,17,"практика / учебная работа"],[17,18,"дорога домой"],[18,19,"перекусывает и немного лежит"],[19,21,"учёба дома"],[21,22,"ужин"],[22,24,"сериал, уход за собой, телефон"]]},
  2:{name:"вторник",theme:"учёба и немного подработки",night:"вечером старается не задерживаться",blocks:[
    [0,7,"сон"],[7,8,"кофе и медленные сборы"],[8,9,"дорога"],[9,12,"пары"],[12,13,"перерыв"],[13,15,"терапевтическая стоматология"],[15,16,"обед"],[16,18,"библиотека / конспекты"],[18,21,"подработка администратором в стоматологии"],[21,22,"дорога и перекус"],[22,24,"дом, душ, переписка"]]},
  3:{name:"среда",theme:"самый социальный будний день",night:"может выбраться за кофе",blocks:[
    [0,7,"сон"],[7,8,"завтрак и музыка"],[8,9,"дорога"],[9,13,"пары"],[13,14,"обед и разговоры с Дашей"],[14,16,"свободное окно / библиотека"],[16,18,"прогулка или дела по городу"],[18,20,"Манки Пипл или другая привычная кофейня"],[20,21,"дорога домой"],[21,22,"ужин"],[22,24,"сериал, фото, телефон"]]},
  4:{name:"четверг",theme:"практический день",night:"устала, но может долго не ложиться",blocks:[
    [0,7,"сон"],[7,8,"кофе, сборы"],[8,9,"дорога"],[9,12,"пары"],[12,13,"перерыв"],[13,17,"практика"],[17,18,"дорога"],[18,20,"подработка / бытовые дела"],[20,21,"ужин"],[21,23,"музыка, уход за собой, переписка"],[23,24,"сонный телефонный вечер"]]},
  5:{name:"пятница",theme:"закрывает учебную неделю",night:"хочется развлечься",blocks:[
    [0,7,"сон"],[7,8,"завтрак"],[8,9,"дорога"],[9,12,"пары"],[12,13,"кофе и перерыв"],[13,15,"занятия"],[15,16,"обед"],[16,18,"библиотека / свободное время"],[18,19,"собирается"],[19,22,"кино или прогулка с Лерой"],[22,23,"поздний перекус"],[23,24,"дом и телефон"]]},
  6:{name:"суббота",theme:"личные дела и друзья",night:"поздний вечер с друзьями",blocks:[
    [0,9,"сон"],[9,10,"поздний завтрак"],[10,12,"уборка и стирка"],[12,13,"магазин / бытовые дела"],[13,14,"обед"],[14,16,"кофейня с Лерой"],[16,18,"прогулка по городу"],[18,19,"ужин вне дома"],[19,23,"друзья / прогулка / разговоры"],[23,24,"дорога домой"]]},
  0:{name:"воскресенье",theme:"медленное восстановление",night:"готовится к понедельнику",blocks:[
    [0,9,"сон"],[9,10,"медленное утро и телефон"],[10,11,"завтрак"],[11,13,"стирка, уборка, бытовые мелочи"],[13,14,"обед"],[14,17,"учёба по стоматологии и подготовка к неделе"],[17,18,"прогулка"],[18,19,"кофе"],[19,20,"готовит что-нибудь простое"],[20,21,"ужин"],[21,22,"планирует неделю"],[22,24,"душ, сериал, постепенно ложится"]]}
};

const WEEK2_VARIANTS={
  1:{11:"перерыв и переписка",18:"дом, чай и короткий отдых"},
  2:{17:"подработка в стоматологии",20:"дорога домой и перекус"},
  3:{18:"Манки Пипл с Дашей",21:"домашние дела"},
  4:{16:"подработка",22:"длинный разговор с Лерой"},
  5:{19:"Синема Парк Космос или прогулка",22:"поздний ужин"},
  6:{15:"Манки Пипл",20:"друзья"},
  0:{14:"учёба и разбор конспектов",20:"домашний фильм"}
};

function isoWeek(date){
  const d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));
  const day=d.getUTCDay()||7; d.setUTCDate(d.getUTCDate()+4-day);
  const y=new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d-y)/86400000)+1)/7);
}
function rangeActivity(blocks,h){for(const [from,to,text] of blocks)if(h>=from&&h<to)return text;return "свободное время";}
function weekIndexFromAnchor(date){
 const parts=new Intl.DateTimeFormat("en-GB",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date);
 const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));
 // 2026-09-14 — понедельник недели A. Дальше строго A/B от этой точки.
 const localMidnight=Date.UTC(+p.year,+p.month-1,+p.day);
 const anchor=Date.UTC(2026,8,14);
 const days=Math.floor((localMidnight-anchor)/86400000);
 return Math.floor(days/7);
}
const DETAIL_RULES=[
 [/просып|медленное утро/i,{phase:"wake",interest:25,attention:25,status:"available",phone:"on",minDelayMin:1,maxDelayMin:12,social:55,energy:40}],
 [/душ/i,{phase:"shower",interest:5,attention:95,status:"offline",phone:"off",read:"после душа",minDelayMin:20,maxDelayMin:24,social:5,energy:65,absenceMin:20,absenceMax:24}],
 [/умыва/i,{phase:"wash",interest:10,attention:70,status:"busy",phone:"sporadic",minDelayMin:4,maxDelayMin:15,social:30,energy:48}],
 [/завтрак|ужин|обед|перекус/i,{phase:"meal",interest:35,attention:75,status:"busy",phone:"sporadic",read:"когда закончит есть или отвлечётся",minDelayMin:18,maxDelayMin:42,social:42,energy:60}],
 [/анатом/i,{phase:"anatomy",interest:18,attention:75,status:"busy",phone:"sporadic",read:"на перемене или когда освободится",minDelayMin:2,maxDelayMin:24,social:32,energy:48}],
 [/пары|занятия|практика|подработка|библиотека|учёба|конспект/i,{phase:"study",interest:35,attention:78,status:"busy",phone:"sporadic",read:"на перемене или когда освободится",minDelayMin:12,maxDelayMin:75,social:32,energy:48}],
 [/сон/i,{phase:"sleep",interest:0,attention:100,status:"offline",phone:"off",read:"после пробуждения",minDelayMin:240,maxDelayMin:600,social:0,energy:28}],
 [/друзья|Лера|Даша|Манки|кофе|прогулка|кальян/i,{phase:"social",interest:70,attention:65,status:"available",phone:"on",read:"когда появится пауза",minDelayMin:8,maxDelayMin:35,social:78,energy:65}]
];

class RoutineEngine{
 constructor(){this.tz=TZ;}
 parts(d=new Date()){
  const p=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:TZ,weekday:"short",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(d).map(x=>[x.type,x.value]));
  const wd={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[p.weekday];
  const local={year:+p.year,month:+p.month,day:+p.day};
  return {...local,hour:+p.hour,minute:+p.minute,weekday:wd,week:isoWeek(d),weekIndex:weekIndexFromAnchor(d)};
 }
 dateKey(p){return `${p.year}-${String(p.month).padStart(2,"0")}-${String(p.day).padStart(2,"0")}`;}
 planFor(p){
  const base=DAYS_PLAN[p.weekday], weekB=((p.weekIndex%2)+2)%2===1;
  let activity=rangeActivity(base.blocks,p.hour);
  if(weekB&&WEEK2_VARIANTS[p.weekday]?.[p.hour])activity=WEEK2_VARIANTS[p.weekday][p.hour];
  return {...base,activity,weekType:weekB?"B":"A"};
 }
 profile(a,h){
  const text=String(a||"");
  // Душ всегда имеет приоритет над пробуждением/едой в составной активности.
  if(/душ/i.test(text))return {...DETAIL_RULES.find(x=>x[1].phase==="shower")[1]};
  const detail=DETAIL_RULES.find(([re])=>re.test(text));
  if(detail)return {...detail[1],interest:detail[1].interest};
  if(/кино|Синема/.test(a))return {phase:"cinema",interest:55,status:"busy",phone:"off",read:"после фильма",minDelayMin:90,maxDelayMin:180,social:20,energy:52};
  if(/дорога/.test(a))return {phase:"commute",interest:25,status:"busy",phone:"sporadic",read:"после дороги",minDelayMin:10,maxDelayMin:40,social:42,energy:55};
  return {phase:"free",interest:45,status:"available",phone:"on",read:"скоро, если не отвлечётся",minDelayMin:2,maxDelayMin:28,social:62,energy:64};
 }
 get(d=new Date()){
  const p=this.parts(d),plan=this.planFor(p),profile=this.profile(plan.activity,p.hour);
  return {timezone:TZ,date:this.dateKey(p),day:DAYS[p.weekday],hour:p.hour,minute:p.minute,week:p.week,weekType:plan.weekType,theme:plan.theme,night:plan.night,activity:plan.activity,phase:profile.phase||"activity",interest:profile.interest??40,attention:profile.attention??50,availability:profile.status,absenceMin:profile.absenceMin||0,absenceMax:profile.absenceMax||0,nextActivity:this.activityAtOffset(d,1),phone:profile.phone,status:profile.status,read:profile.read,minDelayMin:profile.minDelayMin,maxDelayMin:profile.maxDelayMin,social:profile.social,energy:profile.energy};
 }
 activityAtOffset(d,hours){const x=new Date(d.getTime()+hours*3600000),p=this.parts(x);return this.planFor(p).activity;}
 nextAvailable(d=new Date()){
  for(let i=0;i<36;i++){
   const x=new Date(d.getTime()+i*30*60000),r=this.get(x);
   if(r.status!=="offline"&&r.phone!=="off")return x;
  }
  return new Date(d.getTime()+12*3600000);
 }
 dayPlan(d=new Date()){
  const p=this.parts(d),plan=this.planFor(p);
  return {date:this.dateKey(p),day:DAYS[p.weekday],theme:plan.theme,night:plan.night,hours:Object.fromEntries(Array.from({length:24},(_,h)=>[`${String(h).padStart(2,"0")}:00`,rangeActivity(plan.blocks,h)]))};
 }
 twoWeeks(start=new Date()){
  const out=[];for(let i=0;i<14;i++){const d=new Date(start.getTime()+i*86400000);out.push(this.dayPlan(d));}return out;
 }
}
module.exports=RoutineEngine;
