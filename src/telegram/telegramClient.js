require("../config");
const{TelegramClient}=require("telegram"),{StringSession}=require("telegram/sessions"),{NewMessage}=require("telegram/events"),{Api}=require("telegram/tl"),Character=require("../core/character"),config=require("../config");
const MessageQueue=require("../world/messageQueue");
const apiId=Number(process.env.TELEGRAM_API_ID),apiHash=process.env.TELEGRAM_API_HASH,sessionString=process.env.TELEGRAM_SESSION;
const OWNER_ID=String(process.env.OWNER_TELEGRAM_ID||"").trim();
if(!apiId||!apiHash||!sessionString)throw Error("Не заполнены TELEGRAM_API_ID/TELEGRAM_API_HASH/TELEGRAM_SESSION");
const client=new TelegramClient(new StringSession(sessionString),apiId,apiHash,{connectionRetries:5,retryDelay:1000,timeout:15,proxy:process.env.TELEGRAM_PROXY_HOST?{socksType:5,ip:process.env.TELEGRAM_PROXY_HOST,port:Number(process.env.TELEGRAM_PROXY_PORT||1080)}:undefined}),character=new Character(config),queue=new MessageQueue(character.store),sleep=ms=>new Promise(r=>setTimeout(r,ms)),random=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
function uid(e){return String(e.message.senderId?.value??"")} function txt(e){return e.message.message||""}
function admin(raw){const a=raw.trim().match(/^\/anna(?:\s+([\s\S]*))?$/i);if(!a)return null;const p=(a[1]||"").trim().split(/\s+/),cmd=(p.shift()||"help").toLowerCase(),id=p[0];
 if(cmd==="help")return"/anna stats [id] · info ID · pause ID · resume ID · stop · start · mood ID название · set ID key value · send ID текст · routine · status · users · all [id]";
 if(cmd==="stats")return JSON.stringify(id?character.stats.user(id):character.globalStats(),null,2);
 if(cmd==="status")return JSON.stringify({world:character.world.get(),stats:character.globalStats()},null,2);
 if(cmd==="users")return JSON.stringify({users:Object.keys(character.store.state.users||{}),paused:Object.keys(character.store.state.global.pausedUsers||{})},null,2);
 if(cmd==="all")return JSON.stringify(character.allInfo(id),null,2);
 if(cmd==="routine")return JSON.stringify(character.routine.twoWeeks(),null,2);
 if(cmd==="stop"){character.stop();return"Анна глобально остановлена."} if(cmd==="start"){character.start();return"Анна глобально запущена."}
 if(!id)return"Нужен Telegram user ID.";
 if(cmd==="info")return JSON.stringify(character.status(id),null,2);
 if(cmd==="pause"){character.pause(id);return`Диалог ${id} на паузе.`} if(cmd==="resume"){character.resume(id);return`Диалог ${id} возобновлён.`}
 if(cmd==="mood"){const ok=character.moods.set(id,p.slice(1).join(" "));character.store.save();return ok?"Глобальное настроение изменено.":"Неизвестное настроение."}
 if(cmd==="set"){const key=p[1],value=p.slice(2).join(" ");if(!key||!value)return"/anna set ID key value";character.memory.addFact(id,key,value);character.store.save();return"Сохранено."}
 if(cmd==="send"){const m=p.slice(1).join(" ");if(!m)return"/anna send ID текст";return client.sendMessage(Number(id),{message:m}).then(()=>"Отправлено.")}
 return"Неизвестная команда. /anna help";
}
async function typing(peer,signal){while(!signal.stopped){try{await client.invoke(new Api.messages.SetTyping({peer,action:new Api.SendMessageTypingAction({})}))}catch{}await sleep(4000)}}
async function deliver(item){
 const from=String(item.userId),sender=await client.getEntity(Number(from));
 if(!character.isRunning(from))return;
 const current=character.routine.get();
 if(current.phase==="shower"||current.phase==="sleep"||current.status==="offline"||current.phone==="off")return;

 // Идемпотентность: после успешной генерации сохраняем результат в очереди.
 // Повторная доставка использует тот же текст, а не вызывает модель заново.
 let out=item.aiResult;
 if(!out){
  out=await character.processMessage(from,item.text);
  if(out.action==="reply"&&out.text){
   item.aiResult={action:"reply",text:out.text,topic:out.topic};
   queue.persist();
  }else{
   item.aiResult={action:out.action||"ignore",text:out.text||"",topic:out.topic};
   queue.persist();
  }
 }
 if(config.dryRun||out.action!=="reply"||!out.text){
  item.sentAt=new Date().toISOString();queue.persist();queue.remove(item.id);return;
 }

 // Отдельно отмечаем подтверждённую отправку. При обычном сетевом сбое генерация уже не повторится.
 const sent=await client.sendMessage(sender,{message:out.text});
 item.sentMessageId=String(sent?.id||"");item.sentAt=new Date().toISOString();queue.persist();queue.remove(item.id);
}
async function handle(e){
 const from=uid(e),msg=txt(e);if(!from||!msg.trim())return;
 const incoming=e.message.out===false;
 if(OWNER_ID&&from===OWNER_ID&&!incoming){const r=await admin(msg);if(r)await client.sendMessage("me",{message:String(r)});return;}
 if(!incoming||(/^\/anna\b/i.test(msg))|| (OWNER_ID&&from===OWNER_ID)||!character.isRunning(from))return;
 const entry=queue.enqueue({userId:String(from),text:msg,telegramMessageId:String(e.message.id||"")});
 character.store.state.global.metrics.queued=(character.store.state.global.metrics.queued||0)+1;character.store.save();
 queue.startScheduler(deliver,character.routine,id=>character.isRunning(id));
}

async function startTelegram(){await client.connect();const me=await client.getMe();console.log(`Telegram подключён: ${me.id} @${me.username||""}`);console.log(`OWNER_TELEGRAM_ID: ${OWNER_ID||"не задан"}`);console.log("Анна: расписание, память, отношения, персистентная очередь сообщений");
 queue.startScheduler(deliver,character.routine,id=>character.isRunning(id));
 client.addEventHandler(handle,new NewMessage({incoming:true}));
 client.addEventHandler(handle,new NewMessage({outgoing:true}));
 return client}
async function stopTelegram(){queue.stopScheduler();try{await client.disconnect()}catch(e){console.error(e.message)}}
async function sendMessage(userId,text){return client.sendMessage(userId,{message:text})}
module.exports={client,character,queue,startTelegram,stopTelegram,sendMessage};
