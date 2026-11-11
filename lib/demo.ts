import type { Names, Recorded, Turn } from "./types";

// Everyone in the demo is fictional: Mr. Chen, 78, and his daughter Amy, 42.

export const DEMO_NAMES: Names = { elder: "爸爸", child: "Amy" };

export const DEMO_PHOTO = "/demo/old-photo.jpg";
export const DEMO_PHOTO_RESTORED = "/demo/old-photo-restored.jpg";

export const DEMO_ANSWERS = [
  "這是我…那個…那個每天煮飯給我們吃的…她叫…哎呀，一時想不起來。",
  "我們結婚那年，1975 年，在台南。",
  "滷肉，她滷肉最好吃。",
  "五花肉切塊，下鍋炒一炒，加醬油，再加冰糖，然後…再加醬油，加水滷一個小時。",
];

export function isDemoScript(turns: Turn[]): boolean {
  return (
    turns.length === DEMO_ANSWERS.length &&
    turns.every((t, i) => t.a === DEMO_ANSWERS[i])
  );
}

/**
 * What the analysis is expected to record for the demo script. Shown, marked
 * as sample data, only in demo mode when the live analysis is unavailable.
 */
export const SAMPLE_RECORDED: Recorded = {
  moments: [
    {
      type: "naming",
      turn: 1,
      quote: "她叫…哎呀，一時想不起來。",
      why_zh: "說得出是每天煮飯的人，但叫不出太太的名字。",
      why_en: "He describes his wife but cannot say her name.",
      confidence: "high",
    },
    {
      type: "word_finding",
      turn: 1,
      quote: "這是我…那個…那個每天煮飯給我們吃的…",
      why_zh: "想說「太太」時停了幾次，改用描述帶過。",
      why_en:
        "He pauses several times looking for the word “wife” and describes her instead.",
      confidence: "medium",
    },
    {
      type: "sequence",
      turn: 4,
      quote: "加醬油，再加冰糖，然後…再加醬油",
      why_zh: "「加醬油」這個步驟說了兩次。",
      why_en: "The soy sauce step is given twice.",
      confidence: "medium",
    },
  ],
  possible_hearing_issue: false,
  story: {
    title_zh: "1975 年，台南的滷肉香",
    title_en: "1975, Tainan, and the smell of braised pork",
    lines_zh: [
      "1975 年，我們在台南結婚。",
      "她每天煮飯給全家人吃，",
      "滷肉是她最拿手的一道。",
    ],
    lines_en: [
      "In 1975 we got married in Tainan.",
      "She cooked for the whole family every day,",
      "and her braised pork was the best.",
    ],
  },
  recipe: {
    name_zh: "家傳滷肉",
    steps_zh: [
      "五花肉切塊",
      "下鍋炒一炒",
      "加醬油",
      "加冰糖",
      "再加醬油",
      "加水滷一個小時",
    ],
    steps_en: [
      "Cut the pork belly into chunks",
      "Stir-fry in the pot",
      "Add soy sauce",
      "Add rock sugar",
      "Add soy sauce again",
      "Add water and braise for one hour",
    ],
  },
};
