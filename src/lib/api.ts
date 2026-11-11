// Calls to the backend: three Supabase Edge Functions (Lovable Cloud) that
// hold the API keys. Until the backend is connected, every call takes its
// fallback: the original photo, the fixed questions, and no analysis.

import { fallbackNext } from "./questions";
import type { AnalyzeResult, InterviewResponse, Names, Photo, Turn } from "./types";

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
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`${name} failed`);
  return (await response.json()) as T;
}

/** The restored photo as a data URL, or null to carry on with the original. */
export async function restorePhoto(image: string): Promise<string | null> {
  try {
    const data = await call<{ restoredUrl?: unknown }>("restore", { image }, 50_000);
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
