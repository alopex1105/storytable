import type {
  Level,
  Moment,
  MomentType,
  Note,
  NoteItem,
  Recorded,
} from "./types.ts";

// Safety-critical: the model only tags moments. The level and every word of
// the note that is not a quote come from this file.

export const TYPE_INFO: Record<
  MomentType,
  { label_zh: string; label_en: string; signs: number[] }
> = {
  naming: {
    label_zh: "叫不出熟人或東西的名字",
    label_en: "Trouble naming a familiar person or thing",
    signs: [6],
  },
  word_finding: {
    label_zh: "說到一半找不到常用字",
    label_en: "Searching for a common word mid-sentence",
    signs: [6],
  },
  repetition: {
    label_zh: "同一件事重複講",
    label_en: "Repeating the same thing",
    signs: [6],
  },
  time_place: {
    label_zh: "把熟悉的事放錯年代或地點",
    label_en: "Mixing up when or where something happened",
    signs: [4],
  },
  sequence: {
    label_zh: "食譜步驟順序錯、漏掉或重複",
    label_en: "Recipe steps out of order, missing or repeated",
    signs: [2, 3],
  },
};

/** The Alzheimer's Association warning signs this app maps to. */
export const SIGNS: Record<number, { zh: string; en: string }> = {
  2: {
    zh: "計畫事情或解決問題有困難",
    en: "Challenges in planning or solving problems",
  },
  3: {
    zh: "熟悉的事情做起來有困難",
    en: "Difficulty completing familiar tasks",
  },
  4: { zh: "對時間或地點感到混淆", en: "Confusion with time or place" },
  6: {
    zh: "說話或書寫時用字出現新的困難",
    en: "New problems with words in speaking or writing",
  },
};

export const LEVEL_TEXT: Record<Level, { zh: string; en: string }> = {
  0: {
    zh: "這次聊天沒有看到特別需要留意的地方。記憶的變化要看長期，四週後再聊一張照片。",
    en: "Nothing in this conversation stood out. Memory changes show over time; talk about another photo in four weeks.",
  },
  1: {
    zh: "這次有一兩個片段可以放在心上（如下）。偶爾想不起來很常見，重點是有沒有越來越多。四週後再聊一次，比較看看。",
    en: "One or two moments are worth keeping in mind (below). Occasional slips are common; what matters is whether they increase. Talk again in four weeks and compare.",
  },
  2: {
    zh: "這次有幾個片段和常見的早期警訊相似（如下）。這不代表生病，但值得找時間和家庭醫師或神經內科聊聊，帶著這份紀錄去會更清楚。",
    en: "Several moments resemble common early warning signs (below). This does not mean illness, but it is worth talking with a family doctor or neurologist; bring this note along.",
  },
};

export const LEVEL_LABEL: Record<Level, { zh: string; en: string }> = {
  0: { zh: "沒有特別需要留意的", en: "Nothing stood out" },
  1: { zh: "可以放在心上", en: "Worth keeping in mind" },
  2: { zh: "值得和醫師聊聊", en: "Worth a talk with a doctor" },
};

export const HEARING = {
  zh: "有些狀況可能和聽力有關，也可以帶他檢查聽力。",
  en: "Some of this may be related to hearing; a hearing check is also worth doing.",
};

export const DISCLAIMER = {
  zh: "這不是診斷。",
  en: "This is not a diagnosis.",
};

export const REMINDER = {
  zh: "四週後再聊一張照片。",
  en: "Talk about another photo in four weeks.",
};

// The official helpline name contains a word this app never shows, so the
// label here is shortened on purpose.
export const HOTLINES = [
  { zh: "關懷專線", en: "Care helpline", tel: "0800-474-580" },
  { zh: "長照專線", en: "Long-term care line", tel: "1966" },
];

export const SIGNS_LINK = {
  zh: "阿茲海默症協會：十大警訊（英文）",
  en: "Alzheimer's Association: 10 warning signs",
  url: "https://www.alz.org/alzheimers-dementia/10_signs",
};

const BLOCKED = /失智|診斷|阿茲海默|dementia|alzheimer|diagnos/i;

function counted(moments: Moment[]): Moment[] {
  return moments.filter(
    (m) =>
      (m.confidence === "medium" || m.confidence === "high") &&
      m.type in TYPE_INFO,
  );
}

export function levelFor(moments: Moment[], hearingIssue: boolean): Level {
  const kept = counted(moments);
  const types = new Set(kept.map((m) => m.type));
  let level: Level = 0;
  if (kept.length >= 3 && types.size >= 2) level = 2;
  else if (kept.length >= 1) level = 1;
  if (hearingIssue && level > 1) level = 1;
  return level;
}

export function buildNote(
  rec: Pick<Recorded, "moments" | "possible_hearing_issue">,
): Note {
  const hearing = rec.possible_hearing_issue === true;
  const level = levelFor(rec.moments ?? [], hearing);

  const items: NoteItem[] = counted(rec.moments ?? []).map((m) => {
    const info = TYPE_INFO[m.type];
    // The explanation is model-written. If it uses a word the note must not
    // contain, fall back to the fixed description of the moment type.
    const safe = !BLOCKED.test(m.why_zh) && !BLOCKED.test(m.why_en);
    return {
      type: m.type,
      turn: m.turn,
      quote: m.quote,
      why_zh: safe ? m.why_zh : info.label_zh,
      why_en: safe ? m.why_en : info.label_en,
      label_zh: info.label_zh,
      label_en: info.label_en,
      signs: info.signs,
    };
  });

  const zh: string[] = [LEVEL_TEXT[level].zh];
  const en: string[] = [LEVEL_TEXT[level].en];
  for (const it of items) {
    const signs = it.signs.join("、");
    zh.push(`・第 ${it.turn} 題「${it.quote}」：${it.label_zh}（十大警訊第 ${signs} 項）`);
    en.push(
      `- Question ${it.turn}, "${it.quote}": ${it.label_en} (warning sign ${it.signs.join(" and ")})`,
    );
  }
  if (hearing) {
    zh.push(HEARING.zh);
    en.push(HEARING.en);
  }
  if (!LEVEL_TEXT[level].zh.includes("四週後")) {
    zh.push(REMINDER.zh);
    en.push(REMINDER.en);
  }
  zh.push(DISCLAIMER.zh);
  en.push(DISCLAIMER.en);
  zh.push(HOTLINES.map((h) => `${h.zh} ${h.tel}`).join("　"));
  en.push(HOTLINES.map((h) => `${h.en} ${h.tel}`).join(" · "));
  zh.push(`${SIGNS_LINK.zh} ${SIGNS_LINK.url}`);
  en.push(`${SIGNS_LINK.en} ${SIGNS_LINK.url}`);

  return {
    level,
    items,
    summary_zh: LEVEL_TEXT[level].zh,
    summary_en: LEVEL_TEXT[level].en,
    hearing,
    text_zh: zh.join("\n"),
    text_en: en.join("\n"),
  };
}
