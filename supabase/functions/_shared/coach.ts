// The conversation coach: a family member rehearses how to suggest a check-up.
// The fixed opening lines below are what the app shows whenever the model is
// unavailable or says something it should not, so three lines always come out.

import type { Opener, Persona } from "./types.ts";

export const COACH_TURNS = 4;

export const PERSONAS: Record<
  Persona,
  { zh: string; en: string; brief: string }
> = {
  denies: {
    zh: "覺得自己沒事",
    en: "Says nothing is wrong",
    brief:
      "brushes it off and insists everything is fine (\"我好得很\", \"人老了都這樣\")",
  },
  worries: {
    zh: "會擔心、會害怕",
    en: "Gets worried",
    brief:
      "becomes anxious and afraid of what a doctor might say, asks worried questions",
  },
  annoyed: {
    zh: "會不耐煩",
    en: "Gets annoyed",
    brief:
      "gets irritated at being fussed over and tries to change the subject",
  },
};

export const FALLBACK_OPENERS: Opener[] = [
  {
    zh: "我最近想去做個健康檢查，我們一起去好不好？",
    en: "I've been meaning to get a health check-up. Shall we go together?",
  },
  {
    zh: "上次聽您講老照片的故事好開心。我想多陪您，也想一起去給醫師看看，比較安心。",
    en: "I loved hearing your stories about the old photo. I want more time with you, and seeing a doctor together would put my mind at ease.",
  },
  {
    zh: "不是您怎麼了，是我們年紀都到了，定期檢查一下，我陪您去。",
    en: "It's not that something is wrong. We're both at the age for regular check-ups, and I'll go with you.",
  },
];

/** Labels and disease names the coach must never say. */
export const COACH_BLOCKED =
  /失智|癡呆|痴呆|阿茲海默|診斷|dementia|alzheimer|diagnos/i;

export function coachSystem(input: {
  elder: string;
  child: string;
  persona: Persona;
  background: string;
}): string {
  return `You help an adult child rehearse a hard conversation: suggesting to an older parent that the two of them see a doctor together. The child is called ${input.child}. The child calls the parent ${input.elder}.

You play the parent. Speak Taiwanese Mandarin in Traditional Chinese, like a real parent in their seventies talking to their own child: short and natural, one to three sentences.

How the parent reacts in this rehearsal: ${PERSONAS[input.persona].brief}.

Background for you only (the parent does not know any of this): ${input.background}

Rules:
- Stay kind underneath, whatever the reaction. Never insult, mock or shout.
- Never use or accept medical labels. Do not say 失智, 癡呆, 阿茲海默, 診斷, dementia or Alzheimer's, and do not name any disease.
- React to what the child actually said. If the child is gentle and specific, talks about their own feelings, or suggests going together, soften a little each turn. If the child labels, lectures or pressures, push back in character.
- By the last turn, lean toward agreeing to a health check-up together.
- reply_zh is the parent's line. reply_en is its English translation.
- openers stays an empty list until the message says this is the last turn. On the last turn, write exactly three opening lines the child could really use with this parent, in the child's voice: warm, concrete, no labels, no blame, each steering toward both of them getting a health check-up together. Give zh and en for each.`;
}

export const COACH_SCHEMA = {
  type: "object",
  properties: {
    reply_zh: { type: "string" },
    reply_en: { type: "string" },
    openers: {
      type: "array",
      items: {
        type: "object",
        properties: { zh: { type: "string" }, en: { type: "string" } },
        required: ["zh", "en"],
        additionalProperties: false,
      },
    },
  },
  required: ["reply_zh", "reply_en", "openers"],
  additionalProperties: false,
};
