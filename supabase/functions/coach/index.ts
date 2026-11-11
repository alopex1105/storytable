// POST coach: one turn of a rehearsal. The model plays the parent; after the
// family member's fourth line it also gives three opening lines. If the model
// is unavailable, or says a word it must not, fixed lines are returned, so
// three usable opening lines always come out. Nothing is stored or logged.

import {
  COACH_BLOCKED,
  COACH_SCHEMA,
  COACH_TURNS,
  coachSystem,
  FALLBACK_OPENERS,
  PERSONAS,
} from "../_shared/coach.ts";
import { LEVEL_LABEL, TYPE_INFO } from "../_shared/awareness.ts";
import { cleanNames, json, preflight, readBody } from "../_shared/http.ts";
import { structured } from "../_shared/openai.ts";
import type {
  CoachLine,
  CoachResponse,
  Level,
  MomentType,
  Opener,
  Persona,
} from "../_shared/types.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

// A neutral line keeps the rehearsal going when a model reply is dropped.
const fixed = (done: boolean): CoachResponse => ({
  reply_zh: done ? "" : "嗯，你再說說看。",
  reply_en: done ? "" : "Hmm. Tell me more.",
  done,
  openers: done ? FALLBACK_OPENERS : [],
  source: "fixed",
});

function cleanHistory(value: unknown): CoachLine[] {
  if (!Array.isArray(value)) return [];
  return value.slice(-2 * COACH_TURNS).flatMap((raw) => {
    const line = (raw ?? {}) as Record<string, unknown>;
    const text = typeof line.text === "string" ? line.text.slice(0, 500).trim() : "";
    if (!text || (line.role !== "child" && line.role !== "elder")) return [];
    return [{ role: line.role, text }];
  });
}

Deno.serve(async (request) => {
  const early = preflight(request);
  if (early) return early;

  const body = await readBody(request);
  const history = cleanHistory(body.history);
  const said = history.filter((line) => line.role === "child").length;
  if (said === 0 || history[history.length - 1].role !== "child") {
    return json({ error: "bad_request" }, 400);
  }
  const done = said >= COACH_TURNS;

  const persona: Persona =
    typeof body.persona === "string" && body.persona in PERSONAS
      ? (body.persona as Persona)
      : "denies";
  const level: Level = body.level === 2 ? 2 : body.level === 1 ? 1 : 0;
  // Only the kinds of moments are sent, never the person's own words.
  const kinds = Array.isArray(body.moments)
    ? [...new Set(body.moments.filter((m) => typeof m === "string" && m in TYPE_INFO))]
        .map((m) => TYPE_INFO[m as MomentType].label_en)
    : [];
  const names = cleanNames(body.names);

  const background = [
    `A recent friendly chat about an old photo left the child with this impression: "${LEVEL_LABEL[level].en}".`,
    kinds.length ? `Things noticed: ${kinds.join("; ")}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const talk = history
    .map((line) => `${line.role === "child" ? names.child : names.elder}: ${line.text}`)
    .join("\n");

  try {
    const answer = await structured<{
      reply_zh: string;
      reply_en: string;
      openers: Opener[];
    }>({
      system: coachSystem({ ...names, persona, background }),
      user: [
        {
          type: "input_text",
          text: `${talk}\n\n${
            done
              ? "This is the last turn. Reply as the parent, then give exactly three opening lines in openers."
              : `This is turn ${said} of ${COACH_TURNS}. Reply as the parent. Leave openers empty.`
          }`,
        },
      ],
      name: "coach_turn",
      schema: COACH_SCHEMA,
      timeoutMs: 40_000,
      model: Deno.env.get("OPENAI_MODEL_FAST") || undefined,
    });

    const reply_zh = String(answer.reply_zh ?? "").trim();
    const reply_en = String(answer.reply_en ?? "").trim();
    if (!reply_zh || COACH_BLOCKED.test(reply_zh + reply_en)) {
      return json(fixed(done));
    }

    const openers = (Array.isArray(answer.openers) ? answer.openers : [])
      .map((o) => ({ zh: String(o?.zh ?? "").trim(), en: String(o?.en ?? "").trim() }))
      .filter((o) => o.zh && !COACH_BLOCKED.test(o.zh + o.en))
      .slice(0, 3);

    const response: CoachResponse = {
      reply_zh,
      reply_en,
      done,
      openers: done ? (openers.length === 3 ? openers : FALLBACK_OPENERS) : [],
      source: "model",
    };
    return json(response);
  } catch {
    return json(fixed(true));
  }
});
