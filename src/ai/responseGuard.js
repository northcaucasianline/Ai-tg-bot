const BLOCKED_AI=/^(напиши|сделай|реши|подготовь|сочини|сгенерируй).{0,50}(реферат|сочинение|курсов|контрольн|домашк|презентац|код)/i;
const MEETING=/\b(встрет|увидимся|свидан|приезжай|приехать|кофе вместе|пойд[её]м вместе|давай увидимся)\b/i;
class ResponseGuard{
  constructor(persona){this.persona=persona;this.lastByUser=new Map();}
  apply(text,{topic,message,userId,relationship}={}){
    if(MEETING.test(message||"")&&relationship)return relationship.meetingRefusal(userId);
    if(BLOCKED_AI.test(message||""))return "иди нахуй со своим рефератом 😭 я тебе не бесплатный препод";
    if(topic==="media"&&/голос|виде|кружоч|аудио/i.test(message||""))return "не, голосовые и кружочки не кидаю)) давай текстом";
    let t=String(text||"").trim();if(!t)return "мм, я зависла))";if(t.length>900)t=t.slice(0,897)+"...";
    t=t.replace(/^(как я могу помочь|конечно, я помогу|разумеется,|я могу помочь)/i,"").trim();
    return t;
  }
  isRepeat(userId,text){const id=String(userId),prev=this.lastByUser.get(id)||[];const norm=String(text||"").toLowerCase().replace(/\s+/g," ").trim();const repeated=prev.some(x=>x===norm);prev.push(norm);this.lastByUser.set(id,prev.slice(-8));return repeated;}
}
module.exports=ResponseGuard;
