// POST restore: repair and colorize the photo on GMI Cloud and hand it back as
// a data URL. First choice is an image-editing model that removes damage and
// adds colour; if it fails, GMI's plain restoration model is tried; if that
// fails too, { fallback: true } lets the app carry on with the original.

import { json, preflight, readBody } from "../_shared/http.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

const QUEUE =
  "https://console.gmicloud.ai/api/v1/ie/requestqueue/apikey/requests";
const EDIT_MODEL = "gemini-3.1-flash-image";
const PLAIN_MODEL = "bria-fibo-restore";
const GIVE_UP_MS = 70_000;
const POLL_MS = 1_500;

const PROMPT =
  "Restore this old family photo. Remove scratches, creases, dust and stains, recover faded detail and gently sharpen. Colorize it with natural, period-appropriate colours. Keep every person's face, expression, pose, clothing and the background exactly as they are; do not add, remove or redraw anything.";

const RATIOS: Record<string, number> = {
  "1:1": 1,
  "3:2": 3 / 2,
  "2:3": 2 / 3,
  "3:4": 3 / 4,
  "4:3": 4 / 3,
  "4:5": 4 / 5,
  "5:4": 5 / 4,
  "9:16": 9 / 16,
  "16:9": 16 / 9,
};

function nearestRatio(ratio: number): string {
  let best = "3:4";
  let distance = Infinity;
  for (const [name, value] of Object.entries(RATIOS)) {
    const d = Math.abs(Math.log(value / ratio));
    if (d < distance) {
      best = name;
      distance = d;
    }
  }
  return best;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

type Job = {
  request_id?: string;
  status?: string;
  outcome?: {
    media_urls?: { url?: string }[];
    candidates?: {
      content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] };
    }[];
  };
};

/** Runs one GMI job to the end and returns the picture as a data URL, or null. */
async function run(
  key: string,
  model: string,
  payload: Record<string, unknown>,
  deadline: number,
): Promise<string | null> {
  const headers = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  const left = () => Math.max(1, deadline - Date.now());

  const submit = await fetch(QUEUE, {
    method: "POST",
    headers,
    body: JSON.stringify({ model, payload }),
    signal: AbortSignal.timeout(left()),
  });
  if (!submit.ok) return null;
  let job: Job = await submit.json();

  // Some models answer in the first reply; others are queued and polled.
  while (job.status !== "success") {
    if (job.status === "failed" || job.status === "cancelled") return null;
    if (!job.request_id || Date.now() + POLL_MS >= deadline) return null;
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    const poll = await fetch(`${QUEUE}/${job.request_id}`, {
      headers,
      signal: AbortSignal.timeout(left()),
    });
    if (poll.ok) job = { request_id: job.request_id, ...(await poll.json()) };
  }

  for (const candidate of job.outcome?.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      const inline = part.inlineData;
      if (inline?.data) {
        return `data:${inline.mimeType ?? "image/png"};base64,${inline.data}`;
      }
    }
  }

  const url = job.outcome?.media_urls?.[0]?.url;
  if (typeof url !== "string") return null;
  // A short-lived signed URL on another origin: fetch it here so the browser
  // gets a data URL that needs no second request.
  const picture = await fetch(url, { signal: AbortSignal.timeout(left()) });
  if (!picture.ok) return null;
  const type = picture.headers.get("content-type") ?? "image/png";
  return `data:${type};base64,${toBase64(new Uint8Array(await picture.arrayBuffer()))}`;
}

Deno.serve(async (request) => {
  const early = preflight(request);
  if (early) return early;

  const key = Deno.env.get("GMI_API_KEY");
  const body = await readBody(request);
  const image = typeof body.image === "string" ? body.image : "";
  const match = /^data:(image\/\w+);base64,(.+)$/.exec(image);
  if (!key || !match) return json({ restoredUrl: null, fallback: true });

  const [, mimeType, data] = match;
  const ratio =
    typeof body.ratio === "number" && body.ratio > 0.2 && body.ratio < 5
      ? body.ratio
      : 3 / 4;
  const deadline = Date.now() + GIVE_UP_MS;

  const attempts: [string, Record<string, unknown>][] = [
    [
      EDIT_MODEL,
      {
        contents: [
          {
            role: "user",
            parts: [{ inlineData: { mimeType, data } }, { text: PROMPT }],
          },
        ],
        aspect_ratio: nearestRatio(ratio),
        image_size: "1K",
        image_output_format: "jpeg",
      },
    ],
    [PLAIN_MODEL, { image: data }],
  ];

  for (const [model, payload] of attempts) {
    try {
      const restoredUrl = await run(key, model, payload, deadline);
      if (restoredUrl) return json({ restoredUrl, fallback: false, model });
    } catch {
      // try the next model, or fall back to the original photo
    }
    if (Date.now() + 20_000 > deadline) break;
  }
  return json({ restoredUrl: null, fallback: true });
});
