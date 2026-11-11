// POST /api/interview: the next question. Which of the four topics comes next
// is decided here from the number of turns, never by the model.

import { fallbackNext } from "@/lib/questions";
import type { Turn } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  let turns: Turn[] = [];
  try {
    const body = await request.json();
    if (Array.isArray(body?.turns)) turns = body.turns;
  } catch {
    // an unreadable body still gets the first fixed question
  }
  // TODO(19:50): ask Claude for a question about this photo; the four fixed
  // questions stay as the fallback.
  return Response.json({ ...fallbackNext(turns), source: "fixed" });
}
