// Shapes untrusted request bodies into the types the server works with.

import type { Names, Turn } from "./types";

const text = (value: unknown, max: number): string =>
  typeof value === "string" ? value.slice(0, max) : "";

export function cleanTurns(value: unknown): Turn[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 4).map((raw) => {
    const turn = (raw ?? {}) as Record<string, unknown>;
    const a = text(turn.a, 2000);
    return {
      q_zh: text(turn.q_zh, 200),
      q_en: text(turn.q_en, 300),
      a,
      ...(turn.skipped === true || !a ? { skipped: true } : {}),
    };
  });
}

export function cleanNames(value: unknown): Names {
  const names = (value ?? {}) as Record<string, unknown>;
  return {
    elder: text(names.elder, 12).trim() || "長輩",
    child: text(names.child, 12).trim() || "家人",
  };
}
