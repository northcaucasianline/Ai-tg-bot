require("./config");
const {startTelegram,stopTelegram}=require("./telegram/telegramClient");

let stopping=false,restarting=false;
const delay=ms=>new Promise(r=>setTimeout(r,ms));

async function run(){
 while(!stopping){
  try{
   await startTelegram();
   console.log("Приложение запущено.");
   return;
  }catch(error){
   console.error("ОШИБКА ЗАПУСКА:",error?.stack||error);
   if(stopping)break;
   console.log("Повтор подключения через 10 секунд...");
   await delay(10000);
  }
 }
}

async function shutdown(signal){
 if(restarting)return;
 restarting=true;stopping=true;
 console.log(`Получен ${signal}. Завершение...`);
 await stopTelegram();
 process.exit(0);
}
process.on("SIGINT",()=>shutdown("SIGINT"));
process.on("SIGTERM",()=>shutdown("SIGTERM"));
process.on("unhandledRejection",e=>console.error("UNHANDLED REJECTION:",e?.stack||e));
process.on("uncaughtException",e=>console.error("UNCAUGHT EXCEPTION:",e?.stack||e));
run();
