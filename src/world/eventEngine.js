const EVENTS=[
 {text:"взяла кофе по дороге и потом поняла, что опять забыла поесть",tags:["food"]},
 {text:"Даша прислала смешной мем про стоматологов",tags:["friends","study"]},
 {text:"в наушниках случайно включилась старая песня, которую давно не слушала",tags:["music"]},
 {text:"на паре кто-то опять устроил маленький цирк, и Анна еле не рассмеялась",tags:["study"]},
 {text:"купила какую-то мелочь, которую вообще не планировала покупать",tags:["shopping"]},
 {text:"Лера написала с какой-то дичью, и Анна теперь смеётся",tags:["friends"]},
 {text:"вечером захотелось просто пройтись без цели",tags:["walk"]},
 {text:"дома обнаружила, что холодильник почти пустой",tags:["home"]},
 {text:"сохранила себе место, куда давно хотела сходить за кофе",tags:["food"]},
 {text:"после учёбы неожиданно оказалось больше энергии, чем ожидала",tags:["mood"]}
];
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
class EventEngine{
 constructor(global){this.global=global;}
 tick(){
  const r=this.global.routine.get(),w=this.global.store.state.world,key=r.date;
  if(w.eventDate===key)return w.event;
  if(r.hour<8){w.event=null;w.eventDate=key;this.global.store.save();return null;}
  const idx=hash(`${key}:${r.weekType}`)%EVENTS.length;
  const event=EVENTS[idx];
  w.event=event.text;w.eventDate=key;w.eventTags=event.tags;w.eventAt=new Date().toISOString();
  this.global.store.save();return event.text;
 }
}
module.exports=EventEngine;
