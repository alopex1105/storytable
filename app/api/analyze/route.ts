// POST /api/analyze: the model tags moments and writes the story; the note's
// level and wording come from lib/awareness.ts. The transcript is not stored.

export const maxDuration = 60;

export async function POST() {
  // TODO(20:40): call Claude with the analysis prompt, then buildNote().
  return Response.json({ error: "analysis_unavailable" }, { status: 503 });
}
