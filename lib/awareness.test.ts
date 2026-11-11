import { describe, expect, it } from "vitest";
import { buildNote, levelFor } from "./awareness";
import { SAMPLE_RECORDED } from "./demo";
import type { Confidence, Moment, MomentType } from "./types";

function m(
  type: MomentType,
  confidence: Confidence = "medium",
  turn = 1,
): Moment {
  return {
    type,
    turn,
    quote: "那個…那個…",
    why_zh: "停頓了幾次。",
    why_en: "Paused several times.",
    confidence,
  };
}

describe("levelFor", () => {
  it("is 0 with no moments", () => {
    expect(levelFor([], false)).toBe(0);
  });

  it("ignores low-confidence moments", () => {
    expect(levelFor([m("naming", "low"), m("sequence", "low")], false)).toBe(0);
  });

  it("is 1 with one or two moments", () => {
    expect(levelFor([m("naming")], false)).toBe(1);
    expect(levelFor([m("naming"), m("sequence")], false)).toBe(1);
  });

  it("is 1 with many moments of a single type", () => {
    expect(
      levelFor([m("naming"), m("naming"), m("naming"), m("naming")], false),
    ).toBe(1);
  });

  it("is 2 with three or more moments of at least two types", () => {
    expect(
      levelFor([m("naming"), m("word_finding"), m("sequence")], false),
    ).toBe(2);
    expect(levelFor([m("naming"), m("naming"), m("time_place")], false)).toBe(2);
  });

  it("caps the level at 1 when hearing may be the cause", () => {
    expect(
      levelFor([m("naming"), m("word_finding"), m("sequence")], true),
    ).toBe(1);
  });
});

describe("buildNote", () => {
  const all = [
    buildNote({ moments: [], possible_hearing_issue: false }),
    buildNote({ moments: [m("naming", "high")], possible_hearing_issue: false }),
    buildNote({
      moments: [m("naming"), m("time_place", "high", 2), m("sequence", "medium", 4)],
      possible_hearing_issue: false,
    }),
    buildNote({
      moments: [m("repetition"), m("naming"), m("sequence")],
      possible_hearing_issue: true,
    }),
  ];

  it("uses the fixed wording for each level", () => {
    expect(all[0].level).toBe(0);
    expect(all[0].summary_zh).toContain("沒有看到特別需要留意");
    expect(all[1].level).toBe(1);
    expect(all[1].summary_zh).toContain("放在心上");
    expect(all[2].level).toBe(2);
    expect(all[2].summary_zh).toContain("家庭醫師或神經內科");
  });

  it("adds the hearing sentence only when flagged", () => {
    expect(all[3].level).toBe(1);
    expect(all[3].text_zh).toContain("檢查聽力");
    expect(all[2].text_zh).not.toContain("檢查聽力");
  });

  it("always carries the disclaimer, the reminder and both phone numbers", () => {
    for (const note of all) {
      expect(note.text_zh).toContain("這不是診斷");
      expect(note.text_zh).toContain("四週後");
      expect(note.text_zh).toContain("0800-474-580");
      expect(note.text_zh).toContain("1966");
      expect(note.text_en).toContain("This is not a diagnosis");
    }
  });

  it("never says 失智, and says 診斷 only inside 這不是診斷", () => {
    for (const note of all) {
      expect(note.text_zh).not.toContain("失智");
      expect(note.text_zh.replaceAll("這不是診斷", "")).not.toContain("診斷");
    }
  });

  it("replaces a model explanation that uses a blocked word", () => {
    const note = buildNote({
      moments: [
        { ...m("naming", "high"), why_zh: "可能是失智的徵兆", why_en: "A sign of dementia" },
      ],
      possible_hearing_issue: false,
    });
    expect(note.items[0].why_zh).toBe("叫不出熟人或東西的名字");
    expect(note.items[0].why_en).not.toMatch(/dementia/i);
    expect(note.text_zh).not.toContain("失智");
  });

  it("lists each counted moment with its quote and warning-sign numbers", () => {
    const note = all[2];
    expect(note.items).toHaveLength(3);
    expect(note.items.map((i) => i.signs)).toEqual([[6], [4], [2, 3]]);
    expect(note.text_zh).toContain("十大警訊第 2、3 項");
  });

  it("gives level 2 for the demo script", () => {
    expect(buildNote(SAMPLE_RECORDED).level).toBe(2);
  });
});
