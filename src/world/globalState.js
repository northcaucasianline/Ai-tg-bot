class GlobalState{
 constructor(store,routine){this.store=store;this.routine=routine;if(!store.state.world)store.state.world={};const w=store.state.world;w.moodState=w.moodState||{name:"спокойное",energy:70,social:70,irritation:0,lastUpdatedAt:null};}
 sync(){
  const r=this.routine.get(),w=this.store.state.world,m=w.moodState;
  w.activity=r.activity;w.phone=r.phone;w.energy=Math.round((m.energy+r.energy)/2);w.social=Math.round((m.social+r.social)/2);
  if(r.status==="offline")w.mood="сонное";else w.mood=m.name;
  return w;
 }
 get(){this.sync();const r=this.routine.get(),w=this.store.state.world,m=w.moodState;return{timezone:"Europe/Moscow",routine:r,activity:r.activity,phone:r.phone,mood:w.mood,energy:w.energy,social:w.social,irritation:m.irritation||0,event:w.event||null,eventAt:w.eventAt||null};}
 setEvent(text){this.store.state.world.event=String(text||"");this.store.state.world.eventAt=new Date().toISOString();this.store.save();}
}
module.exports=GlobalState;
