// POST interview: the next question. Which of the four topics comes next is
// decided here from the number of turns, never by the model. Any failure
// falls back to the fixed question for that topic.

import { ELDER_BLOCKED } from "../_shared/ground.ts";
import {
  cleanNames,
  cleanTurns,
  json,
  preflight,
  readBody,
  transcript,
} from "../_shared/http.ts";
import { type InputPart, structured } from "../_shared/openai.ts";
import {
  interviewSystem,
  QUESTION_SCHEMA,
  TOPIC_BRIEF,
} from "../_shared/prompts.ts";
import { fallbackNext, TOPICS } from "../_shared/questions.ts";

declare const Deno: {
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

type Asked = {
  ack_zh: string;
  ack_en: string;
  question_zh: string;
  question_en: string;
};

const IMAGE = /^data:image\/(?:jpeg|png|webp|gif);base64,/;

Deno.serve(async (request) => {
  const early = preflight(request);
  if (early) return early;

  const body = await readBody(request);
  const turns = cleanTurns(body.turns);
  const names = cleanNames(body.names);
  const fixed = fallbackNext(turns);
  if ("closing_zh" in fixed) return json(fixed);

  const topic = TOPICS[turns.length];
  const previous = turns[turns.length - 1];
  const photo =
    typeof body.photo === "string" &&
    IMAGE.test(body.photo) &&
    body.photo.length < 6_000_000
      ? body.photo
      : null;

  const text = [
    `這是第 ${turns.length + 1} 題，主題：${TOPIC_BRIEF[topic]}`,
    turns.length
      ? `前面的問答：\n${transcript(turns)}`
      : "這是第一題，還沒有前面的問答，ack_zh 和 ack_en 留空字串。",
    previous && (previous.skipped || !previous.a)
      ? "他跳過了上一題，ack_zh 和 ack_en 留空字串。"
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const user: InputPart[] = [
    ...(photo ? [{ type: "input_image" as const, image_url: photo }] : []),
    { type: "input_text", text },
  ];

  try {
    const asked = await structured<Asked>({
      system: interviewSystem(names.elder),
      user,
      name: "next_question",
      schema: QUESTION_SCHEMA,
      timeoutMs: 20_000,
    });
    const question = String(asked.question_zh ?? "").trim();
    const ack = String(asked.ack_zh ?? "").trim();
    if (question && question.length <= 60 && !ELDER_BLOCKED.test(ack + question)) {
      return json({
        done: false,
        ack_zh: ack,
        ack_en: String(asked.ack_en ?? "").trim(),
        question_zh: question,
        question_en: String(asked.question_en ?? "").trim(),
        topic,
        source: "model",
      });
    }
  } catch {
    // fall through to the fixed question
  }
  return json({ ...fixed, source: "fixed" });
});
