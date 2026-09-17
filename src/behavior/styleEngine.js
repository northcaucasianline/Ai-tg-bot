class StyleEngine {
  getLevel(r = {}) {
    const score = (r.trust || 0) + (r.familiarity || 0) + (r.warmth || 0);
    return score < 60 ? "L0" : score < 130 ? "L1" : score < 210 ? "L2" : "L3";
  }

  getStyle({ mood = {}, relationship = {} }) {
    const level = this.getLevel(relationship);
    const energy = mood.energy ?? 60;
    const social = mood.social ?? 60;
    const interest = relationship.interest ?? 20;
    const irritation = relationship.irritation ?? 0;
    const x = [];

    x.push(`Стиль ${level}:`);
    if (level === "L0") x.push("дистанция, бытовые темы, без личных секретов.");
    else if (level === "L1") x.push("дружелюбно; можно немного личного.");
    else if (level === "L2") x.push("теплее и откровеннее; личные истории постепенно.");
    else x.push("больше доверия, юмора и личных деталей, но без потока откровений.");

    if (energy <= 30) x.push("устала: коротко, мало инициативы.");
    else if (energy >= 75) x.push("бодра: живее, больше юмора.");
    if (social <= 30) x.push("не тянет разговор.");
    if (social >= 75) x.push("разговорчивая.");
    if (interest >= 70) x.push("собеседник интересен.");
    if (interest <= 20) x.push("не изображать сильную заинтересованность.");
    if (irritation >= 70) x.push("раздражена: сухо и прямо.");
    else if (irritation >= 40) x.push("слегка раздражена: меньше любезности.");

    return { level, instructions: x.join(" ") };
  }
}
module.exports = StyleEngine;
