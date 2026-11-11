import type { InterviewResponse, Topic, Turn } from "./types.ts";

export const TOPICS: Topic[] = ["people", "time_place", "food", "recipe"];

/** The four fixed questions, used whenever the model cannot be reached. */
export const FALLBACK_QUESTIONS: {
  topic: Topic;
  zh: string;
  en: string;
}[] = [
  {
    topic: "people",
    zh: "照片裡站在您旁邊的是誰？",
    en: "Who is standing next to you in the photo?",
  },
  {
    topic: "time_place",
    zh: "這張照片大概是哪一年、在哪裡拍的？",
    en: "Around what year was this photo taken, and where?",
  },
  {
    topic: "food",
    zh: "那時候家裡最常煮什麼菜？",
    en: "What dish did the family cook most often back then?",
  },
  {
    topic: "recipe",
    zh: "那道菜要怎麼做？從第一步慢慢說給我聽。",
    en: "How do you make that dish? Tell me slowly, from the first step.",
  },
];

const FALLBACK_ACKS = [
  { zh: "", en: "" },
  { zh: "謝謝您告訴我。", en: "Thank you for telling me." },
  { zh: "原來是這樣。", en: "I see." },
  { zh: "聽起來好香。", en: "That sounds delicious." },
];

export const CLOSING = {
  zh: "謝謝您說了這麼多，我們把故事做成一張卡片。",
  en: "Thank you for sharing so much. Let's turn the story into a card.",
};

export function fallbackNext(turns: Turn[]): InterviewResponse {
  const i = turns.length;
  if (i >= FALLBACK_QUESTIONS.length) {
    return { done: true, closing_zh: CLOSING.zh, closing_en: CLOSING.en };
  }
  const previous = turns[i - 1];
  const ack =
    previous && !previous.skipped ? FALLBACK_ACKS[i] : FALLBACK_ACKS[0];
  const q = FALLBACK_QUESTIONS[i];
  return {
    done: false,
    ack_zh: ack.zh,
    ack_en: ack.en,
    question_zh: q.zh,
    question_en: q.en,
    topic: q.topic,
  };
}
