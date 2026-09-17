const persona=require("../persona/persona"),Store=require("../database/store"),MemoryEngine=require("../memory/memoryEngine"),RelationshipEngine=require("../relationships/relationshipEngine"),MoodEngine=require("../behavior/moodEngine"),RoutineEngine=require("../behavior/routineEngine"),AIEngine=require("../ai/aiEngine"),SecretEngine=require("../ai/secretEngine"),GlobalState=require("../world/globalState"),EventEngine=require("../world/eventEngine"),StatsEngine=require("../stats/statsEngine");
class Character{
 constructor(config){
  this.config=config;this.persona=persona;this.store=new Store();this.memory=new MemoryEngine(this.store.state);this.relationships=new RelationshipEngine(this.store);this.moods=new MoodEngine(this.store);this.routine=new RoutineEngine();this.world=new GlobalState(this.store,this.routine);this.events=new EventEngine(this.world);this.secrets=new SecretEngine(this.store.state);this.stats=new StatsEngine(this.store,this.routine);this.ai=new AIEngine({persona,memory:this.memory,relationships:this.relationships,moods:this.moods,routine:this.routine,world:this.world,secrets:this.secrets});
 }
 isRunning(id){return this.store.state.global.running&&!this.store.state.global.pausedUsers[String(id)]}
 async processMessage(userId,message,opts={}){
  if(!this.isRunning(userId))return{action:"ignore",reason:"paused"};
  const started=Date.now(),r=this.routine.get(),world=this.world.get();
  this.store.state.global.metrics.messages++;
  if(r.status==="offline")this.store.state.global.metrics.nightMessages++;
  this.memory.addMessage(userId,"user",message);
  this.relationships.registerMessage(userId,message);
  this.moods.syncWithRoutine(r);
  const event=this.events.tick();if(event)this.memory.addEvent(userId,`Глобально: ${event}`);

  const result=await this.ai.generate(userId,message);

  // Глобальный stop во время запроса не коммитит сгенерированный ответ в память.
  if(!this.isRunning(userId))return{action:"ignore",reason:"stopped"};

  if(result.action==="reply"){
   this.memory.addMessage(userId,"assistant",result.text);
   this.relationships.change(userId,{familiarity:0.5,interest:0.7,trust:0.3,warmth:0.4});
   for(const c of(result.memoryCandidates||[]).slice(0,3)){
    const confidence=Number(c.confidence);
    // Факты из модели считаем кандидатами, а не истиной: низкая уверенность не сохраняется.
    if(c?.key&&c?.value&&Number.isFinite(confidence)&&confidence>=0.85&&String(c.value).length<=180)
      this.memory.addFact(userId,c.key,c.value,confidence);
   }
   this.store.state.global.metrics.replies++;
  }else this.store.state.global.metrics.ignored++;
  const m=this.store.state.global.metrics;m.responseCount=(m.responseCount||0)+1;m.avgResponseMs=Math.round(((m.avgResponseMs||0)*(m.responseCount-1)+(Date.now()-started))/m.responseCount);m.lastMessageAt=new Date().toISOString();
  this.store.save();return result;
 }
 pause(id){this.store.state.global.pausedUsers[String(id)]=true;this.store.save();}
 resume(id){delete this.store.state.global.pausedUsers[String(id)];this.store.save();}
 stop(){this.store.state.global.running=false;this.store.save();}
 start(){this.store.state.global.running=true;this.store.save();}
 status(id){return{userId:String(id),running:this.isRunning(id),globalRunning:this.store.state.global.running,paused:!!this.store.state.global.pausedUsers[String(id)],persona:{name:this.persona.name,age:this.persona.age,city:this.persona.city,university:this.persona.university,faculty:this.persona.faculty},world:this.world.get(),relationship:this.relationships.get(id),mood:this.moods.get(id),memory:this.memory.getContext(id),stats:this.stats.user(id)};}
 globalStats(){return this.stats.global();}
 allInfo(id){return id?this.status(id):{persona:this.persona,world:this.world.get(),stats:this.globalStats(),users:Object.keys(this.store.state.users||{}).length,paused:Object.keys(this.store.state.global.pausedUsers||{})};}
}
module.exports=Character;
