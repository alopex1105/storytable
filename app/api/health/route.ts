// GET /api/health: says whether the two outside services answer, so a fresh
// deployment can be checked from a phone. It never returns a key or a prompt.

import Anthropic from "@anthropic-ai/sdk";
import { connection } from "next/server";
import { askQuestion, hasClaude } from "@/lib/claude";

export const maxDuration = 60;

async function checkClaude(): Promise<string> {
  if (!hasClaude()) return "ANTHROPIC_API_KEY is not set";
  try {
    const asked = await askQuestion({
      turns: [],
      names: { elder: "長輩", child: "家人" },
      topic: "people",
    });
    return asked ? "ok" : "answered, but the answer was not usable";
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return `error ${error.status ?? ""}: ${error.message}`.slice(0, 300);
    }
    return `error: ${error instanceof Error ? error.name : "unknown"}`;
  }
}

async function checkGmi(): Promise<string> {
  const key = process.env.GMI_API_KEY;
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

export async function GET() {
  await connection();
  const [claude, gmi] = await Promise.all([checkClaude(), checkGmi()]);
  return Response.json({
    claude,
    gmi,
    model: process.env.MODEL || "claude-sonnet-5-5",
  });
}
