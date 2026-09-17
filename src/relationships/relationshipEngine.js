class RelationshipEngine {
  constructor(store) { this.store = store; }
  get(id) {
    id = String(id);
    if (!this.store.state.relationships[id]) {
      this.store.state.relationships[id] = {
        stage: "незнакомец", warmth: 20, trust: 10, interest: 20,
        familiarity: 5, respect: 50, irritation: 0, lastChangeAt: null,
        lastTopic: null, meetingAttempts: 0, boundariesRespected: 0
      };
    }
    return this.store.state.relationships[id];
  }
  change(id, delta) {
    const r = this.get(id);
    for (const [k, v] of Object.entries(delta)) {
      if (typeof r[k] === "number") r[k] = Math.max(0, Math.min(100, r[k] + v));
    }
    r.lastChangeAt = new Date().toISOString();
    this.updateStage(id);
    return r;
  }
  set(id, values) {
    const r = this.get(id);
    for (const [k, v] of Object.entries(values)) {
      if (k === "stage") r.stage = String(v);
      else if (typeof v === "number") r[k] = Math.max(0, Math.min(100, v));
    }
    this.updateStage(id);
    return r;
  }
  updateStage(id) {
    const r = this.get(id);
    const score = r.warmth * .35 + r.trust * .3 + r.interest * .2 + r.familiarity * .15 - r.irritation * .25;
    if (score < 22) r.stage = "незнакомец";
    else if (score < 38) r.stage = "знакомый";
    else if (score < 55) r.stage = "приятное общение";
    else if (score < 72) r.stage = "близкое общение";
    else r.stage = "очень близкое общение";
  }
  registerMessage(id, message) {
    const t = String(message || "").toLowerCase();
    const meeting = /встрет|увидимся|приезжай|приехать|свидан|кофе вместе|пойд[её]м вместе/.test(t);
    const pushy = /давай встреч|ты должна|я приеду к тебе|скажи адрес|где жив[её]шь/.test(t);
    const r = this.get(id);
    r.lastTopic = meeting ? "meeting" : r.lastTopic;
    if (meeting) r.meetingAttempts++;
    if (pushy) this.change(id, { respect: -2, irritation: 4 });
    else this.change(id, { familiarity: 1, interest: 1, trust: 0.5, warmth: 0.5 });
    return { meeting, pushy, relationship: r };
  }
  meetingRefusal(id) {
    const r = this.get(id);
    if (r.stage === "незнакомец" || r.stage === "знакомый") return "не сейчас, я занята";
    if (r.stage === "приятное общение") return "может когда-нибудь потом, я пока не хочу встречаться))";
    if (r.stage === "близкое общение") return "не сейчас, милый. мне и так нравится наше общение здесь";
    return "может когда-нибудь позже, милый, но встречаться я всё равно не буду обещать";
  }
}
module.exports = RelationshipEngine;
