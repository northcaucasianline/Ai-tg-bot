class MemoryEngine {
 constructor(state){this.state=state;}
 getUser(id){id=String(id);if(!this.state.users[id])this.state.users[id]={facts:{},messages:[],summary:"",events:[],openLoops:[],daily:{},temporaryInstruction:null,lastInteraction:null};const u=this.state.users[id];u.facts=u.facts||{};u.messages=u.messages||[];u.events=u.events||[];u.openLoops=u.openLoops||[];u.daily=u.daily||{};return u;}
 addMessage(id,role,text){const u=this.getUser(id);const msg={role:role==="assistant"?"assistant":"user",text:String(text||""),at:new Date().toISOString()};u.messages.push(msg);if(u.messages.length>40)u.messages=u.messages.slice(-40);u.lastInteraction=msg.at;return msg;}
 addFact(id,key,value,confidence=0.8){const u=this.getUser(id);if(!key||value===undefined)return;const c=Number(confidence);if(!Number.isFinite(c)||c<0.85)return;u.facts[String(key)]={value:String(value).slice(0,180),confidence:c,updatedAt:new Date().toISOString()};}
 addEvent(id,text){const u=this.getUser(id);if(!text)return;u.events.push({text:String(text),at:new Date().toISOString()});if(u.events.length>20)u.events=u.events.slice(-20);}
 setSummary(id,summary){this.getUser(id).summary=String(summary||"").slice(0,2000);}
 addOpenLoop(id,text){const u=this.getUser(id);if(!text)return;u.openLoops.push({text:String(text),createdAt:new Date().toISOString(),done:false});u.openLoops=u.openLoops.slice(-8);}
 closeOpenLoop(id,text){const u=this.getUser(id);u.openLoops=u.openLoops.filter(x=>!String(x.text).toLowerCase().includes(String(text||"").toLowerCase()));}
 getContext(id){const u=this.getUser(id),facts={};for(const [k,v] of Object.entries(u.facts)){if(v&&v.value)facts[k]=v.value;}return{facts,summary:u.summary||"",messages:u.messages.slice(-10).map(x=>({role:x.role,text:x.text})),recentEvents:u.events.slice(-3).map(x=>x.text),openLoops:u.openLoops.filter(x=>!x.done).slice(-3).map(x=>x.text),lastInteraction:u.lastInteraction};}
}
module.exports=MemoryEngine;
