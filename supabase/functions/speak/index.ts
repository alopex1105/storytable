// POST speak: turns one short line into natural speech with OpenAI's
// text-to-speech and returns the audio. If it fails, the browser falls back
// to its own built-in voice. Nothing is stored or logged.

import { corsHeaders, json, preflight, readBody } from "../_shared/http.ts";
import { VOICE_STYLE } from "../_shared/prompts.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

Deno.serve(async (request) => {
  const early = preflight(request);
  if (early) return early;

  const key = Deno.env.get("OPENAI_API_KEY");
  const body = await readBody(request);
  const text = typeof body.text === "string" ? body.text.trim().slice(0, 300) : "";
  if (!key || !text) return json({ error: "unavailable" }, 503);

  try {
    const response = await fetch(
      `${Deno.env.get("OPENAI_BASE_URL") || "https://api.openai.com/v1"}/audio/speech`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: Deno.env.get("OPENAI_TTS_MODEL") || "gpt-4o-mini-tts",
          voice: Deno.env.get("OPENAI_TTS_VOICE") || "marin",
          input: text,
          instructions: VOICE_STYLE,
          response_format: "mp3",
        }),
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!response.ok || !response.body) return json({ error: "unavailable" }, 503);
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return json({ error: "unavailable" }, 503);
  }
});
