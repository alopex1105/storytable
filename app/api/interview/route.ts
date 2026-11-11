// POST /api/interview: the next question. Which of the four topics comes next
// is decided here from the number of turns, never by the model. Any failure
// falls back to the fixed question for that topic.

import { askQuestion } from "@/lib/claude";
import { fallbackNext, TOPICS } from "@/lib/questions";
import { cleanNames, cleanTurns } from "@/lib/request";

export const maxDuration = 60;

export async function POST(request: Request) {
  let body: { photo?: unknown; turns?: unknown; names?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    // an unreadable body still gets the first fixed question
  }
  const turns = cleanTurns(body.turns);
  const names = cleanNames(body.names);
  const fixed = fallbackNext(turns);
  if (fixed.done) return Response.json(fixed);

  try {
    const asked = await askQuestion({
      photo: typeof body.photo === "string" ? body.photo : undefined,
      turns,
      names,
      topic: TOPICS[turns.length],
    });
    if (asked) {
      return Response.json({
        done: false,
        ...asked,
        topic: TOPICS[turns.length],
        source: "model",
      });
    }
  } catch {
    // fall through to the fixed question
  }
  return Response.json({ ...fixed, source: "fixed" });
}
