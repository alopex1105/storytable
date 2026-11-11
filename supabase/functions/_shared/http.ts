// Shared plumbing for the edge functions: CORS, JSON replies, and shaping
// untrusted request bodies. Nothing here writes to a database, a file or a log.

import type { Names, Turn } from "./types.ts";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function preflight(request: Request): Response | null {
  return request.method === "OPTIONS"
    ? new Response(null, { headers: corsHeaders })
    : null;
}

export async function readBody(
  request: Request,
): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? body : {};
  } catch {
    return {};
  }
}

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

export function transcript(turns: Turn[]): string {
  return turns
    .map(
      (t, i) =>
        `Q${i + 1}: ${t.q_zh}\nA${i + 1}: ${t.skipped || !t.a ? "[skipped]" : t.a}`,
    )
    .join("\n\n");
}
