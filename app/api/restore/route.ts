// POST /api/restore: send the photo to GMI Cloud, poll for the result, and
// hand it back as a data URL. Any failure returns { fallback: true } so the
// app carries on with the original photo. Nothing is written to disk or logs.

export const maxDuration = 60;

const QUEUE =
  "https://console.gmicloud.ai/api/v1/ie/requestqueue/apikey/requests";
const MODEL = "seededit-3-0-i2i-250628";
const PROMPT =
  "Restore this old family photo: remove scratches, dust and fading, sharpen faces gently, colorize naturally. Keep every person, pose and background unchanged.";
const GIVE_UP_MS = 25_000;
const POLL_MS = 1_500;

const FALLBACK = { restoredUrl: null, fallback: true };

export async function POST(request: Request) {
  const key = process.env.GMI_API_KEY;
  let image = "";
  try {
    const body = await request.json();
    if (typeof body?.image === "string") image = body.image;
  } catch {
    return Response.json(FALLBACK);
  }
  if (!key || !image) return Response.json(FALLBACK);

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
        payload: {
          image: image.replace(/^data:image\/\w+;base64,/, ""),
          prompt: PROMPT,
          add_watermark: false,
          response_format: "url",
        },
      }),
      signal: AbortSignal.timeout(left()),
    });
    if (!submit.ok) return Response.json(FALLBACK);
    const { request_id: id } = await submit.json();
    if (!id) return Response.json(FALLBACK);

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
      // here so the browser gets a same-origin data URL it can also export.
      const picture = await fetch(url, { signal: AbortSignal.timeout(left()) });
      if (!picture.ok) break;
      const type = picture.headers.get("content-type") ?? "image/jpeg";
      const data = Buffer.from(await picture.arrayBuffer()).toString("base64");
      return Response.json({
        restoredUrl: `data:${type};base64,${data}`,
        fallback: false,
      });
    }
  } catch {
    // fall through to the original photo
  }
  return Response.json(FALLBACK);
}
