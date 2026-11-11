"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEMO_ANSWERS } from "@/lib/demo";
import { fallbackNext, FALLBACK_QUESTIONS } from "@/lib/questions";
import {
  canRecognize,
  createRecognition,
  speak,
  stopSpeaking,
  type Recognition,
} from "@/lib/speech";
import type { InterviewResponse, Names, Photo, Turn } from "@/lib/types";
import { Button, Print, Spinner } from "./ui";

type Question = Extract<InterviewResponse, { done: false }>;

const TOTAL = FALLBACK_QUESTIONS.length;

async function nextQuestion(
  photo: Photo,
  turns: Turn[],
  names: Names,
): Promise<InterviewResponse> {
  try {
    const image =
      photo.restored?.startsWith("data:") ? photo.restored : photo.original;
    const response = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo: image, turns, names }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!response.ok) throw new Error("interview failed");
    const data = (await response.json()) as InterviewResponse;
    if (data.done || data.question_zh) return data;
    throw new Error("empty question");
  } catch {
    return fallbackNext(turns);
  }
}

export function TalkStep({
  photo,
  names,
  demo,
  onDone,
}: {
  photo: Photo;
  names: Names;
  demo: boolean;
  onDone: (turns: Turn[]) => void;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [voice, setVoice] = useState(true);
  const recognition = useRef<Recognition | null>(null);
  const started = useRef(false);

  const say = useCallback((q: Question) => {
    speak([q.ack_zh, q.question_zh].filter(Boolean).join(" "));
  }, []);

  const ask = useCallback(
    async (soFar: Turn[]) => {
      setQuestion(null);
      const next = await nextQuestion(photo, soFar, names);
      if (next.done) {
        speak(next.closing_zh);
        onDone(soFar);
        return;
      }
      setAnswer("");
      setQuestion(next);
      say(next);
    },
    [photo, names, onDone, say],
  );

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    setVoice(canRecognize());
    ask([]);
  }, [ask]);

  useEffect(
    () => () => {
      recognition.current?.abort();
      stopSpeaking();
    },
    [],
  );

  function toggleMic() {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    const rec = createRecognition("zh-TW");
    if (!rec) {
      setVoice(false);
      return;
    }
    // Stop reading the question first, or the microphone hears it.
    stopSpeaking();
    const before = answer ? `${answer} ` : "";
    rec.onresult = (event) => {
      let heard = "";
      for (let i = 0; i < event.results.length; i++) {
        heard += event.results[i][0].transcript;
      }
      setAnswer(before + heard);
    };
    rec.onerror = (event) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        setVoice(false);
      }
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recognition.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
      setVoice(false);
    }
  }

  function submit(skipped: boolean) {
    if (!question) return;
    recognition.current?.abort();
    stopSpeaking();
    setListening(false);
    const turn: Turn = {
      q_zh: question.question_zh,
      q_en: question.question_en,
      a: skipped ? "" : answer.trim(),
      ...(skipped ? { skipped: true } : {}),
    };
    const all = [...turns, turn];
    setTurns(all);
    ask(all);
  }

  const index = turns.length;

  return (
    <section className="-mb-8 flex flex-1 flex-col gap-4 pt-4">
      <div className="flex items-center gap-4">
        <Print
          src={photo.restored ?? photo.original}
          alt="正在聊的照片"
          className="h-28 w-auto shrink-0"
        />
        <div
          className="flex flex-col gap-2"
          role="img"
          aria-label={`第 ${Math.min(index + 1, TOTAL)} 題，共 ${TOTAL} 題`}
        >
          <div className="flex gap-2">
            {Array.from({ length: TOTAL }, (_, i) => (
              <span
                key={i}
                className={`size-4 rounded-full ${
                  i < index
                    ? "bg-accent/45"
                    : i === index
                      ? "bg-accent"
                      : "bg-line"
                }`}
              />
            ))}
          </div>
          <div className="text-lg text-sub">
            第 {Math.min(index + 1, TOTAL)} 題
            <span lang="en" className="block text-sm">
              Question {Math.min(index + 1, TOTAL)} of {TOTAL}
            </span>
          </div>
        </div>
      </div>

      {!question ? (
        <div
          className="flex flex-1 flex-col items-center justify-center gap-4 text-center"
          aria-live="polite"
        >
          <Spinner />
          <div className="text-[22px]">
            正在想下一個問題…
            <span lang="en" className="block text-base text-sub">
              Thinking of the next question…
            </span>
          </div>
        </div>
      ) : (
        <>
          <div aria-live="polite">
            {question.ack_zh && (
              <p className="text-[22px] text-sub">{question.ack_zh}</p>
            )}
            <h2 className="mt-1 font-serif text-[32px] leading-[1.35] font-semibold text-balance">
              {question.question_zh}
            </h2>
            <p lang="en" className="mt-2 text-base leading-snug text-sub">
              {[question.ack_en, question.question_en].filter(Boolean).join(" ")}
            </p>
            <button
              type="button"
              className="mt-2 inline-flex min-h-11 items-center gap-2 text-lg text-accent-deep underline underline-offset-4"
              onClick={() => say(question)}
            >
              <SpeakerIcon /> 再聽一次
              <span lang="en" className="text-sm text-sub no-underline">
                Hear it again
              </span>
            </button>
          </div>

          {voice ? (
            <div className="flex flex-col items-center gap-2 py-1">
              <button
                type="button"
                onClick={toggleMic}
                aria-pressed={listening}
                className={`grid size-24 place-items-center rounded-full text-white transition ${
                  listening ? "mic-live bg-accent-deep" : "bg-accent"
                }`}
              >
                <MicIcon />
                <span className="sr-only">
                  {listening ? "說完了" : "按一下開始說"}
                </span>
              </button>
              <div className="text-center text-[22px] font-semibold">
                {listening ? "我在聽，說完再按一下" : "按一下，開始說"}
                <span lang="en" className="block text-base font-normal text-sub">
                  {listening
                    ? "Listening. Tap again when you finish"
                    : "Tap to talk"}
                </span>
              </div>
            </div>
          ) : (
            <p className="rounded-2xl bg-honey-soft px-4 py-3 text-honey">
              這支手機現在不能用語音，請直接打字。
              <span lang="en" className="block text-base">
                Voice input isn&rsquo;t available here. Please type instead.
              </span>
            </p>
          )}

          <label className="block">
            <span className="sr-only">您的回答</span>
            <textarea
              className="min-h-24 w-full rounded-2xl border-2 border-line bg-card p-4 text-[22px] leading-normal placeholder:text-sub/70"
              placeholder="說的話會出現在這裡，也可以直接打字"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </label>

          {demo && (
            <button
              type="button"
              className="-mt-2 min-h-11 self-start text-base text-accent-deep underline underline-offset-4"
              onClick={() => setAnswer(DEMO_ANSWERS[index] ?? "")}
            >
              填入示範回答 <span lang="en">· Demo answer</span>
            </button>
          )}

          <div className="sticky bottom-0 -mx-5 mt-auto grid grid-cols-[2fr_3fr] gap-3 bg-paper/95 px-5 pt-3 pb-4 backdrop-blur">
            <Button
              variant="secondary"
              zh="跳過這題"
              en="Skip"
              onClick={() => submit(true)}
            />
            <Button
              zh="送出"
              en="Send"
              disabled={!answer.trim()}
              onClick={() => submit(false)}
            />
          </div>
        </>
      )}
    </section>
  );
}

function MicIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M8.5 21h7" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 9.5v5h3.5L12 18V6L7.5 9.5zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
    </svg>
  );
}
