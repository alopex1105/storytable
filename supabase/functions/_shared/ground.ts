// Checks on what the model wrote before any of it reaches a screen.

import type { Moment, Turn } from "./types.ts";

/** Words the storyteller must never be shown. */
export const ELDER_BLOCKED = /失智|記憶|測驗|對錯|答錯|診斷|阿茲海默/;

const loose = (s: string) => s.replace(/[\s\p{P}\p{S}]/gu, "");

/**
 * Keeps only moments whose quote really appears in an answer, and points each
 * at the answer it came from. A quote the person never said is never shown.
 */
export function groundMoments(moments: Moment[], turns: Turn[]): Moment[] {
  const answers = turns.map((t) => loose(t.a));
  const grounded: Moment[] = [];
  for (const moment of moments ?? []) {
    const quote = loose(String(moment.quote ?? ""));
    if (quote.length < 2) continue;
    const said = (i: number) => i >= 0 && Boolean(answers[i]?.includes(quote));
    const claimed = moment.turn - 1;
    const index = said(claimed) ? claimed : answers.findIndex((_, i) => said(i));
    if (index < 0) continue;
    grounded.push({ ...moment, turn: index + 1 });
  }
  return grounded;
}
