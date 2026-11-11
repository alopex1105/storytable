// POST analyze: the model tags moments and writes the story; the note's level
// and wording come from _shared/awareness.ts. The transcript is not stored or
// logged.

import { buildNote } from "../_shared/awareness.ts";
import { ELDER_BLOCKED, groundMoments } from "../_shared/ground.ts";
import {
  cleanNames,
  cleanTurns,
  json,
  preflight,
  readBody,
  transcript,
} from "../_shared/http.ts";
import { structured } from "../_shared/openai.ts";
import { ANALYSIS_SYSTEM, RECORD_SCHEMA } from "../_shared/prompts.ts";
import type { Recorded } from "../_shared/types.ts";

declare const Deno: {
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

const list = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((v) => String(v)) : [];

Deno.serve(async (request) => {
  const early = preflight(request);
  if (early) return early;

  const body = await readBody(request);
  const turns = cleanTurns(body.turns);
  if (turns.length === 0) return json({ error: "bad_request" }, 400);
  const names = cleanNames(body.names);

  try {
    const raw = await structured<Recorded>({
      system: ANALYSIS_SYSTEM,
      user: [
        {
          type: "input_text",
          text: `The storyteller is called ${names.elder}. Transcript:\n\n${transcript(turns)}`,
        },
      ],
      name: "record_session",
      schema: RECORD_SCHEMA,
      timeoutMs: 50_000,
    });

    const recorded: Recorded = {
      moments: groundMoments(raw.moments, turns),
      possible_hearing_issue: raw.possible_hearing_issue === true,
      story: {
        title_zh: String(raw.story?.title_zh ?? "").trim(),
        title_en: String(raw.story?.title_en ?? "").trim(),
        lines_zh: list(raw.story?.lines_zh).slice(0, 3),
        lines_en: list(raw.story?.lines_en).slice(0, 3),
      },
      recipe: {
        name_zh: String(raw.recipe?.name_zh ?? "").trim(),
        steps_zh: list(raw.recipe?.steps_zh),
        steps_en: list(raw.recipe?.steps_en),
      },
    };

    // The story card is shown to the whole family, storyteller included.
    const shown = [
      recorded.story.title_zh,
      ...recorded.story.lines_zh,
      recorded.recipe.name_zh,
      ...recorded.recipe.steps_zh,
    ].join("");
    if (!recorded.story.title_zh || recorded.story.lines_zh.length === 0) {
      throw new Error("empty story");
    }
    if (ELDER_BLOCKED.test(shown.replace(/記憶/g, ""))) {
      throw new Error("blocked word in story");
    }

    return json({ ...recorded, note: buildNote(recorded) });
  } catch {
    return json({ error: "analysis_unavailable" }, 503);
  }
});
