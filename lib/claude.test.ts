import { describe, expect, it } from "vitest";
import { ELDER_BLOCKED, groundMoments } from "./claude";
import { DEMO_ANSWERS, SAMPLE_RECORDED } from "./demo";
import type { Moment, Turn } from "./types";

const turns: Turn[] = DEMO_ANSWERS.map((a, i) => ({
  q_zh: `問題 ${i + 1}`,
  q_en: `Question ${i + 1}`,
  a,
}));

const moment = (quote: string, turn: number): Moment => ({
  type: "naming",
  turn,
  quote,
  why_zh: "",
  why_en: "",
  confidence: "high",
});

describe("groundMoments", () => {
  it("keeps moments whose quote was really said", () => {
    expect(groundMoments(SAMPLE_RECORDED.moments, turns)).toHaveLength(3);
  });

  it("ignores punctuation and spacing differences", () => {
    const kept = groundMoments([moment("她叫...哎呀, 一時想不起來", 1)], turns);
    expect(kept).toHaveLength(1);
  });

  it("drops a quote the person never said", () => {
    expect(groundMoments([moment("我忘記她的名字了", 1)], turns)).toEqual([]);
  });

  it("points a moment at the answer that holds the quote", () => {
    const kept = groundMoments([moment("再加醬油", 2)], turns);
    expect(kept[0].turn).toBe(4);
  });
});

describe("ELDER_BLOCKED", () => {
  it("catches the words the storyteller must never see", () => {
    for (const word of ["失智", "測驗", "診斷", "答錯"]) {
      expect(ELDER_BLOCKED.test(`這是一個${word}`)).toBe(true);
    }
    expect(ELDER_BLOCKED.test("照片裡站在您旁邊的是誰？")).toBe(false);
  });
});
