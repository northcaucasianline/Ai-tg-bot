require("dotenv").config();
const config = require("./config");
const Character = require("./core/character");
const readline = require("node:readline");

const character = new Character(config);
const USER_ID = "test-user";

const rl = readline.createInterface({ input:process.stdin, output:process.stdout, prompt:"> " });

console.log(`
=== LOCAL AI TEST ===
Обычный текст = сообщение пользователя.
Команды:
/start
/stop
/status
/mood <настроение>
/warmth <0-100>
/fact <key> <value>
/routine
`);

rl.prompt();
rl.on("line", async line => {
  const text = line.trim();
  if (!text) return rl.prompt();

  try {
    if (text === "/start") character.start();
    else if (text === "/stop") character.stop();
    else if (text === "/status") console.dir(character.status(USER_ID), {depth:null});
    else if (text.startsWith("/mood ")) console.log(character.moods.set(USER_ID, text.slice(6)) ? "OK" : "Неизвестное настроение");
    else if (text.startsWith("/warmth ")) character.relationships.set(USER_ID, {warmth:Number(text.slice(8))});
    else if (text.startsWith("/fact ")) {
      const a = text.slice(6).split(" ");
      character.memory.addFact(USER_ID, a.shift(), a.join(" "));
      character.store.save();
    } else if (text === "/routine") console.log(character.routine.get());
    else {
      const r = await character.processMessage(USER_ID, text);
      console.log("\nAI:", r.text || `[${r.action}]`);
    }
  } catch (e) {
    console.error("ERROR:", e.message);
  }
  rl.prompt();
});
