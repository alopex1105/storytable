// POST restore: send the photo to GMI Cloud, poll for the result, and hand it
// back as a data URL. Any failure returns { fallback: true } so the app
// carries on with the original photo.

import { json, preflight, readBody } from "../_shared/http.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

const QUEUE =
  "https://console.gmicloud.ai/api/v1/ie/requestqueue/apikey/requests";
// GMI's purpose-built restoration model: it takes only the image.
const MODEL = "bria-fibo-restore";
const GIVE_UP_MS = 35_000;
const POLL_MS = 1_500;

const FALLBACK = { restoredUrl: null, fallback: true };

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

Deno.serve(async (request) => {
  const early = preflight(request);
  if (early) return early;

  const key = Deno.env.get("GMI_API_KEY");
  const body = await readBody(request);
  const image = typeof body.image === "string" ? body.image : "";
  if (!key || !image) return json(FALLBACK);

  const headers = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  const deadline = Date.now() + GIVE_UP_MS;
  const left = () => Math.max(1, deadline - Date.now());

  try {
    const submit = await fetch(QUEUE, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: MODEL,
        payload: { image: image.replace(/^data:image\/\w+;base64,/, "") },
      }),
      signal: AbortSignal.timeout(left()),
    });
    if (!submit.ok) return json(FALLBACK);
    const { request_id: id } = await submit.json();
    if (!id) return json(FALLBACK);

    while (Date.now() + POLL_MS < deadline) {
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
      const poll = await fetch(`${QUEUE}/${id}`, {
        headers,
        signal: AbortSignal.timeout(left()),
      });
      if (!poll.ok) continue;
      const job = await poll.json();
      if (job.status === "failed" || job.status === "cancelled") break;
      if (job.status !== "success") continue;

      const url: unknown = job.outcome?.media_urls?.[0]?.url;
      if (typeof url !== "string") break;
      // The result is a short-lived signed URL on another origin. Fetch it
      // here so the browser gets a data URL that needs no second request.
      const picture = await fetch(url, { signal: AbortSignal.timeout(left()) });
      if (!picture.ok) break;
      const type = picture.headers.get("content-type") ?? "image/png";
      const data = toBase64(new Uint8Array(await picture.arrayBuffer()));
      return json({ restoredUrl: `data:${type};base64,${data}`, fallback: false });
    }
  } catch {
    // fall through to the original photo
  }
  return json(FALLBACK);
});
