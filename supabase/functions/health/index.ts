// GET health: says whether the two outside services answer, so the backend
// can be checked after the keys are added. It never returns a key or a prompt.

import { json, preflight } from "../_shared/http.ts";
import { hasOpenAI, MODEL, ModelError, structured } from "../_shared/openai.ts";
import { QUESTION_SCHEMA } from "../_shared/prompts.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

async function checkOpenAI(): Promise<string> {
  if (!hasOpenAI()) return "OPENAI_API_KEY is not set";
  try {
    await structured({
      system: "Reply in the requested JSON. Use short test values.",
      user: [{ type: "input_text", text: "Health check." }],
      name: "next_question",
      schema: QUESTION_SCHEMA,
      timeoutMs: 20_000,
    });
    return "ok";
  } catch (error) {
    if (error instanceof ModelError) {
      return `error ${error.status || ""}: ${error.message}`.trim();
    }
    return "error: no answer";
  }
}

async function checkGmi(): Promise<string> {
  const key = Deno.env.get("GMI_API_KEY");
  if (!key) return "GMI_API_KEY is not set";
  try {
    const response = await fetch(
      "https://console.gmicloud.ai/api/v1/ie/requestqueue/apikey/models/bria-fibo-restore",
      {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(10_000),
      },
    );
    return response.ok ? "ok" : `error ${response.status}`;
  } catch {
    return "error: no answer";
  }
}

Deno.serve(async (request) => {
  const early = preflight(request);
  if (early) return early;
  const [openai, gmi] = await Promise.all([checkOpenAI(), checkGmi()]);
  return json({ openai, gmi, model: MODEL });
});
