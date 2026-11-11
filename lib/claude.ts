// Server only. The two Claude calls: write the next question, and record
// what happened in the conversation. Neither decides the note's level.

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { ANALYSIS_SYSTEM, interviewSystem, TOPIC_BRIEF } from "./prompts";
import type { Names, Recorded, Topic, Turn } from "./types";

const MODEL = process.env.MODEL || "claude-sonnet-5-5";

/** Words the storyteller must never be shown. */
export const ELDER_BLOCKED = /失智|記憶|測驗|對錯|答錯|診斷|阿茲海默/;

let client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  client ??= new Anthropic({ maxRetries: 1 });
  return client;
}

export function hasClaude(): boolean {
  return getClient() !== null;
}

const QuestionSchema = z.object({
  ack_zh: z.string(),
  ack_en: z.string(),
  question_zh: z.string(),
  question_en: z.string(),
});

export type AskedQuestion = z.infer<typeof QuestionSchema>;

type ImageType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

function parseDataUrl(
  url: string | undefined,
): { media_type: ImageType; data: string } | null {
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/.exec(
    url ?? "",
  );
  if (!match || match[2].length > 6_000_000) return null;
  return { media_type: match[1] as ImageType, data: match[2] };
}

function transcript(turns: Turn[]): string {
  return turns
    .map(
      (t, i) =>
        `Q${i + 1}: ${t.q_zh}\nA${i + 1}: ${t.skipped || !t.a ? "[skipped]" : t.a}`,
    )
    .join("\n\n");
}

/** Returns null when the model is unavailable or the result is unusable. */
export async function askQuestion(input: {
  photo?: string;
  turns: Turn[];
  names: Names;
  topic: Topic;
}): Promise<AskedQuestion | null> {
  const anthropic = getClient();
  if (!anthropic) return null;

  const number = input.turns.length + 1;
  const previous = input.turns[input.turns.length - 1];
  const image = parseDataUrl(input.photo);
  const text = [
    `這是第 ${number} 題，主題：${TOPIC_BRIEF[input.topic]}`,
    input.turns.length
      ? `前面的問答：\n${transcript(input.turns)}`
      : "這是第一題，還沒有前面的問答，ack_zh 和 ack_en 留空字串。",
    previous && (previous.skipped || !previous.a)
      ? "他跳過了上一題，ack_zh 和 ack_en 留空字串。"
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await anthropic.messages.parse(
    {
      model: MODEL,
      max_tokens: 2048,
      system: interviewSystem(input.names.elder),
      output_config: {
        effort: "low",
        format: zodOutputFormat(QuestionSchema),
      },
      messages: [
        {
          role: "user",
          content: [
            ...(image
              ? [
                  {
                    type: "image" as const,
                    source: { type: "base64" as const, ...image },
                  },
                ]
              : []),
            { type: "text" as const, text },
          ],
        },
      ],
    },
    { timeout: 15_000 },
  );

  const asked = response.parsed_output;
  if (response.stop_reason !== "end_turn" || !asked) return null;
  const question = asked.question_zh.trim();
  if (!question || question.length > 60) return null;
  if (ELDER_BLOCKED.test(`${asked.ack_zh}${question}`)) return null;
  return {
    ack_zh: asked.ack_zh.trim(),
    ack_en: asked.ack_en.trim(),
    question_zh: question,
    question_en: asked.question_en.trim(),
  };
}

const RecordSchema = z.object({
  moments: z.array(
    z.object({
      type: z.enum([
        "naming",
        "word_finding",
        "time_place",
        "sequence",
        "repetition",
      ]),
      turn: z.number().int(),
      quote: z.string(),
      why_zh: z.string(),
      why_en: z.string(),
      confidence: z.enum(["low", "medium", "high"]),
    }),
  ),
  possible_hearing_issue: z.boolean(),
  story: z.object({
    title_zh: z.string(),
    title_en: z.string(),
    lines_zh: z.array(z.string()),
    lines_en: z.array(z.string()),
  }),
  recipe: z.object({
    name_zh: z.string(),
    steps_zh: z.array(z.string()),
    steps_en: z.array(z.string()),
  }),
});

const loose = (s: string) => s.replace(/[\s\p{P}\p{S}]/gu, "");

/**
 * Keeps only moments whose quote really appears in an answer, and points each
 * at the answer it came from. A quote the person never said is never shown.
 */
export function groundMoments(
  moments: Recorded["moments"],
  turns: Turn[],
): Recorded["moments"] {
  const answers = turns.map((t) => loose(t.a));
  const grounded: Recorded["moments"] = [];
  for (const moment of moments) {
    const quote = loose(moment.quote);
    if (quote.length < 2) continue;
    const said = (i: number) => i >= 0 && answers[i]?.includes(quote);
    const claimed = moment.turn - 1;
    const index = said(claimed)
      ? claimed
      : answers.findIndex((_, i) => said(i));
    if (index < 0) continue;
    grounded.push({ ...moment, turn: index + 1 });
  }
  return grounded;
}

/** Throws when the model is unavailable or the result is unusable. */
export async function recordSession(input: {
  turns: Turn[];
  names: Names;
}): Promise<Recorded> {
  const anthropic = getClient();
  if (!anthropic) throw new Error("no model");

  const response = await anthropic.messages.parse(
    {
      model: MODEL,
      max_tokens: 8192,
      system: ANALYSIS_SYSTEM,
      output_config: {
        effort: "medium",
        format: zodOutputFormat(RecordSchema),
      },
      messages: [
        {
          role: "user",
          content: `The storyteller is called ${input.names.elder}. Transcript:\n\n${transcript(input.turns)}`,
        },
      ],
    },
    { timeout: 45_000 },
  );

  const recorded = response.parsed_output;
  if (response.stop_reason !== "end_turn" || !recorded) {
    throw new Error("no usable analysis");
  }

  const story = {
    ...recorded.story,
    lines_zh: recorded.story.lines_zh.slice(0, 3),
    lines_en: recorded.story.lines_en.slice(0, 3),
  };
  const shown = [
    story.title_zh,
    ...story.lines_zh,
    recorded.recipe.name_zh,
    ...recorded.recipe.steps_zh,
  ].join("");
  if (!story.title_zh || story.lines_zh.length === 0) {
    throw new Error("empty story");
  }
  if (ELDER_BLOCKED.test(shown.replace(/記憶/g, ""))) {
    throw new Error("blocked word in story");
  }

  return {
    moments: groundMoments(recorded.moments, input.turns),
    possible_hearing_issue: recorded.possible_hearing_issue,
    story,
    recipe: recorded.recipe,
  };
}
