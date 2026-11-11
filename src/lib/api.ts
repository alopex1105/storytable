// Calls to the backend: three Supabase Edge Functions (Lovable Cloud) that
// hold the API keys. Until the backend is connected, every call takes its
// fallback: the original photo, the fixed questions, and no analysis.

import { FALLBACK_OPENERS } from "./coach";
import { fallbackNext } from "./questions";
import type {
  AnalyzeResult,
  CoachLine,
  CoachResponse,
  InterviewResponse,
  Level,
  MomentType,
  Names,
  Persona,
  Photo,
  Turn,
} from "./types";

const BASE = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const backendReady = Boolean(BASE && KEY);

async function call<T>(name: string, body: unknown, timeoutMs: number): Promise<T> {
  if (!BASE || !KEY) throw new Error("backend not connected");
  const response = await fetch(`${BASE}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: KEY,
      // New-style project keys are opaque strings, not bearer tokens.
      ...(KEY.startsWith("sb_") ? {} : { Authorization: `Bearer ${KEY}` }),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`${name} failed`);
  return (await response.json()) as T;
}

/** Width over height, so the restored photo keeps the original's shape. */
function imageRatio(src: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.height ? img.width / img.height : 3 / 4);
    img.onerror = () => resolve(3 / 4);
    img.src = src;
  });
}

/** The restored photo as a data URL, or null to carry on with the original. */
export async function restorePhoto(image: string): Promise<string | null> {
  try {
    const ratio = await imageRatio(image);
    const data = await call<{ restoredUrl?: unknown }>("restore", { image, ratio }, 85_000);
    return typeof data.restoredUrl === "string" ? data.restoredUrl : null;
  } catch {
    return null;
  }
}

/** The next question. Falls back to the fixed question for that topic. */
export async function nextQuestion(
  photo: Photo,
  turns: Turn[],
  names: Names,
): Promise<InterviewResponse> {
  const fixed = fallbackNext(turns);
  if ("closing_zh" in fixed) return fixed;
  try {
    const image = photo.restored?.startsWith("data:") ? photo.restored : photo.original;
    const data = await call<InterviewResponse>(
      "interview",
      { photo: image, turns, names },
      25_000,
    );
    if ("question_zh" in data && data.question_zh) return data;
  } catch {
    // fall through to the fixed question
  }
  return fixed;
}

/** Throws when the analysis is unavailable, so the screen can offer a retry. */
export async function analyzeTalk(turns: Turn[], names: Names): Promise<AnalyzeResult> {
  const data = await call<AnalyzeResult>("analyze", { turns, names }, 58_000);
  if (!data.note || !data.story) throw new Error("incomplete analysis");
  return data;
}

/**
 * One rehearsal turn. If the backend cannot answer, the rehearsal ends with
 * the fixed opening lines, so the family member always leaves with three.
 */
export async function coachReply(input: {
  level: Level;
  moments: MomentType[];
  persona: Persona;
  history: CoachLine[];
  names: Names;
}): Promise<CoachResponse> {
  try {
    const data = await call<CoachResponse>("coach", input, 45_000);
    if (typeof data.done === "boolean" && Array.isArray(data.openers)) return data;
  } catch {
    // fall through to the fixed lines
  }
  return {
    reply_zh: "",
    reply_en: "",
    done: true,
    openers: FALLBACK_OPENERS,
    source: "fixed",
  };
}

/** Natural speech for one line, or null to use the browser's own voice. */
export async function speakAudio(text: string): Promise<Blob | null> {
  if (!BASE || !KEY) return null;
  try {
    const response = await fetch(`${BASE}/functions/v1/speak`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: KEY,
        ...(KEY.startsWith("sb_") ? {} : { Authorization: `Bearer ${KEY}` }),
      },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;
    if (!(response.headers.get("content-type") ?? "").startsWith("audio/")) return null;
    return await response.blob();
  } catch {
    return null;
  }
}
