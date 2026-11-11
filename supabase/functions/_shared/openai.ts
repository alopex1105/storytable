// One call shape for both model uses: the OpenAI Responses API with a strict
// JSON schema, so the answer always has the fields the app expects.

declare const Deno: { env: { get(name: string): string | undefined } };

// OPENAI_BASE_URL is only for tests and gateways; the default is OpenAI itself.
const API = `${Deno.env.get("OPENAI_BASE_URL") || "https://api.openai.com/v1"}/responses`;

export const MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-6-astra";

export function hasOpenAI(): boolean {
  return Boolean(Deno.env.get("OPENAI_API_KEY"));
}

export type InputPart =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: string };

export class ModelError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Throws ModelError when the model is unavailable or gives no usable JSON. */
export async function structured<T>(options: {
  system: string;
  user: InputPart[];
  name: string;
  schema: Record<string, unknown>;
  timeoutMs: number;
  /** Overrides the default model, e.g. a faster one for the coach. */
  model?: string;
}): Promise<T> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) throw new ModelError(0, "OPENAI_API_KEY is not set");

  const response = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model || MODEL,
      instructions: options.system,
      input: [{ role: "user", content: options.user }],
      text: {
        format: {
          type: "json_schema",
          name: options.name,
          schema: options.schema,
          strict: true,
        },
      },
      // The conversation is not kept on OpenAI's side either.
      store: false,
    }),
    signal: AbortSignal.timeout(options.timeoutMs),
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (typeof body?.error?.message === "string") message = body.error.message;
    } catch {
      // keep the status line
    }
    throw new ModelError(response.status, message.slice(0, 300));
  }

  const data = await response.json();
  if (data.status !== "completed") {
    throw new ModelError(200, `response ${data.status ?? "unfinished"}`);
  }
  for (const item of data.output ?? []) {
    if (item.type !== "message") continue;
    for (const part of item.content ?? []) {
      if (part.type === "output_text" && typeof part.text === "string") {
        return JSON.parse(part.text) as T;
      }
    }
  }
  throw new ModelError(200, "no text in the response");
}
