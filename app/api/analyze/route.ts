// POST /api/analyze: the model tags moments and writes the story; the note's
// level and wording come from lib/awareness.ts. The transcript is not stored
// or logged.

import { buildNote } from "@/lib/awareness";
import { recordSession } from "@/lib/claude";
import { cleanNames, cleanTurns } from "@/lib/request";
import type { AnalyzeResult } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  let body: { turns?: unknown; names?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const turns = cleanTurns(body.turns);
  if (turns.length === 0) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const recorded = await recordSession({
      turns,
      names: cleanNames(body.names),
    });
    const result: AnalyzeResult = { ...recorded, note: buildNote(recorded) };
    return Response.json(result);
  } catch {
    return Response.json({ error: "analysis_unavailable" }, { status: 503 });
  }
}
