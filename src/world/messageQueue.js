const crypto=require("crypto");

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

class MessageQueue{
 constructor(store,opts={}){
  this.store=store;
  this.running=new Set();
  this.items=this.store?.state?.global?.messageQueue||[];
  if(this.store)this.store.state.global.messageQueue=this.items;
  this.pollMs=opts.pollMs||30000;
  this.maxAvailabilityWaitMs=opts.maxAvailabilityWaitMs||15*60*1000;
  this.timer=null;
  this.processor=null;
  this.routine=null;
  this.isRunning=null;
 }
 enqueue(item){
  const entry={
   id:item.id||crypto.randomUUID(),
   createdAt:new Date().toISOString(),
   status:"queued",
   attempts:0,
   ...item
  };
  this.items.push(entry);this.persist();return entry;
 }
 persist(){if(this.store){this.store.state.global.messageQueue=this.items;this.store.save();}}
 remove(id){this.items=this.items.filter(x=>x.id!==id);this.persist();}
 pendingFor(userId){return this.items.filter(x=>String(x.userId)===String(userId)&&x.status==="queued");}
 queuedUsers(){return [...new Set(this.items.filter(x=>x.status==="queued").map(x=>String(x.userId)))];}

 async waitUntilAvailable(routine){
  const deadline=Date.now()+this.maxAvailabilityWaitMs;
  while(Date.now()<deadline){
   const r=routine.get();
   if(r.status!=="offline"&&r.phone!=="off")return r;
   const next=routine.nextAvailable(new Date());
   const ms=Math.max(5000,Math.min(Math.max(1000,next-Date.now()),60000,deadline-Date.now()));
   await sleep(ms);
  }
  return null;
 }

 async drain(userId,processor,routine,isRunning){
  const id=String(userId);
  if(this.running.has(id))return;
  this.running.add(id);
  try{
   while(isRunning(userId)){
    const item=this.pendingFor(userId)[0];
    if(!item)break;

    const available=await this.waitUntilAvailable(routine);
    if(!available)break; // scheduler попробует снова позже, без вечного ожидания

    if(!isRunning(userId))break;
    item.status="processing";item.attempts=(item.attempts||0)+1;item.lastAttemptAt=new Date().toISOString();this.persist();

    try{
     await processor(item);
     // processor удаляет item только после подтверждённой отправки.
     if(this.items.some(x=>x.id===item.id&&x.status==="processing")){
      item.status="sent";item.sentAt=new Date().toISOString();this.persist();this.remove(item.id);
     }
    }catch(e){
     item.lastError=String(e?.message||e);
     if(item.attempts>=3){
      item.status="failed";item.failedAt=new Date().toISOString();this.persist();
      // Не блокируем остальные сообщения пользователя: failed — отдельный dead-letter.
      continue;
     }
     item.status="queued";this.persist();
     await sleep(Math.min(60000,2000*item.attempts));
    }
   }
  }finally{this.running.delete(id);}
 }

 startScheduler(processor,routine,isRunning){
  this.processor=processor;this.routine=routine;this.isRunning=isRunning;
  if(this.timer)return;
  this.timer=setInterval(()=>this.resumeQueued().catch(e=>console.error("QUEUE SCHEDULER ERROR:",e.message)),this.pollMs);
  this.resumeQueued().catch(e=>console.error("QUEUE RESTORE ERROR:",e.message));
 }
 stopScheduler(){if(this.timer){clearInterval(this.timer);this.timer=null;}}
 async resumeQueued(){
  if(!this.processor||!this.routine||!this.isRunning)return;
  for(const id of this.queuedUsers()){
   if(this.isRunning(id))this.drain(id,this.processor,this.routine,this.isRunning).catch(e=>console.error("QUEUE ERROR",e.message));
  }
 }
}
module.exports=MessageQueue;
