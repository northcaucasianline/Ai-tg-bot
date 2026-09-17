class MoodEngine {
  constructor(store) {
    this.store = store;
    this.moods = [
      ["спокойное",70,70],["весёлое",90,95],["сонное",30,35],["уставшее",25,25],
      ["заинтересованное",75,85],["задумчивое",55,50],["раздражённое",45,25],["игривое",82,88]
    ];
  }
  getGlobal() {
    const w = this.store.state.world;
    if (!w.moodState) w.moodState = { name: "спокойное", energy: 70, social: 70, irritation: 0, lastUpdatedAt: new Date().toISOString() };
    return w.moodState;
  }
  get(id) {
    const g = this.getGlobal();
    return { name: g.name, energy: g.energy, social: g.social, irritation: g.irritation };
  }
  set(id,name) {
    const m=this.moods.find(x=>x[0]===name); if(!m) return false;
    this.store.state.world.moodState={name:m[0],energy:m[1],social:m[2],irritation:name==="раздражённое"?35:0,lastUpdatedAt:new Date().toISOString()};
    return true;
  }
  nudgeGlobal(d={}) {
    const m=this.getGlobal();
    for(const k of ["energy","social","irritation"]) if(typeof d[k]==="number") m[k]=Math.max(0,Math.min(100,m[k]+d[k]));
    m.lastUpdatedAt=new Date().toISOString();
    return m;
  }
  syncWithRoutine(routine) {
    const m=this.getGlobal();
    if(routine.status === "offline") { m.name="сонное"; m.energy=Math.min(m.energy,35); m.social=Math.min(m.social,20); }
    else if(routine.activity.includes("экзам") || routine.activity.includes("практика")) { m.energy=Math.min(m.energy,60); }
    else if(routine.activity.includes("кафе") || routine.activity.includes("Лера") || routine.activity.includes("друзья")) { m.social=Math.max(m.social,70); }
    m.lastUpdatedAt=new Date().toISOString();
    return m;
  }
}
module.exports = MoodEngine;
