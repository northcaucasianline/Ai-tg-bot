class StatsEngine{
 constructor(store,routine){this.store=store;this.routine=routine;}
 global(){const s=this.store.state,g=s.global.metrics||{};const users=Object.keys(s.users||{});return{running:s.global.running,users:users.length,pausedUsers:Object.keys(s.global.pausedUsers||{}),messages:g.messages||0,replies:g.replies||0,ignored:g.ignored||0,queued:g.queued||0,nightMessages:g.nightMessages||0,avgResponseMs:g.avgResponseMs||0,lastMessageAt:g.lastMessageAt||null,now:this.routine.get(),topUsers:users.map(id=>({id,messages:(s.users[id].messages||[]).filter(x=>x.role==="user").length,lastInteraction:s.users[id].lastInteraction||null})).sort((a,b)=>b.messages-a.messages).slice(0,10)}}
 user(id){id=String(id);const u=this.store.state.users?.[id]||{};return{messages:(u.messages||[]).filter(x=>x.role==="user").length,assistantMessages:(u.messages||[]).filter(x=>x.role==="assistant").length,facts:u.facts||{},summary:u.summary||"",openLoops:u.openLoops||[],relationship:this.store.state.relationships?.[id]||null,lastInteraction:u.lastInteraction||null}}
}
module.exports=StatsEngine;
