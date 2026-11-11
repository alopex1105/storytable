import { Mic, Square, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DEMO_ANSWERS } from "@/lib/demo";
import { nextQuestion } from "@/lib/api";
import { FALLBACK_QUESTIONS } from "@/lib/questions";
import {
  canRecognize,
  createRecognition,
  primeSpeech,
  speak,
  stopSpeaking,
  type Recognition,
} from "@/lib/speech";
import type { InterviewResponse, Names, Photo, Turn } from "@/lib/types";
import { Actions, Bi, Button, Working } from "./ui";

type Question = Extract<InterviewResponse, { done: false }>;

const TOTAL = FALLBACK_QUESTIONS.length;

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
  const wanted = useRef(false);
  const latest = useRef("");

  useEffect(() => {
    latest.current = answer;
  }, [answer]);

  const say = useCallback((q: Question) => {
    speak([q.ack_zh, q.question_zh].filter(Boolean).join(" "));
  }, []);

  const ask = useCallback(
    async (soFar: Turn[]) => {
      setQuestion(null);
      const next = await nextQuestion(photo, soFar, names);
      if ("closing_zh" in next) {
        speak(next.closing_zh);
        onDone(soFar);
        return;
      }
      setAnswer("");
      setQuestion(next);
      window.scrollTo(0, 0);
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
      wanted.current = false;
      recognition.current?.abort();
      stopSpeaking();
    },
    [],
  );

  // The browser's recognition stops at every pause, and older adults pause
  // often. Keep starting it again until the person taps the button to stop.
  function listen(first: boolean) {
    const rec = createRecognition("zh-TW");
    const giveUp = () => {
      wanted.current = false;
      setListening(false);
      // If it never started, voice is not usable here; offer typing instead.
      if (first) setVoice(false);
    };
    if (!rec) {
      giveUp();
      return;
    }
    const before = latest.current ? `${latest.current} ` : "";
    rec.onresult = (event) => {
      let heard = "";
      for (let i = 0; i < event.results.length; i++) {
        heard += event.results[i][0].transcript;
      }
      setAnswer(before + heard);
    };
    rec.onerror = (event) => {
      if (event.error !== "no-speech" && event.error !== "aborted") giveUp();
    };
    rec.onend = () => {
      if (wanted.current) listen(false);
      else setListening(false);
    };
    recognition.current = rec;
    try {
      rec.start();
    } catch {
      giveUp();
    }
  }

  function toggleMic() {
    if (listening) {
      wanted.current = false;
      recognition.current?.stop();
      return;
    }
    // Stop reading the question first, or the microphone hears it.
    stopSpeaking();
    wanted.current = true;
    setListening(true);
    listen(true);
  }

  function submit(skipped: boolean) {
    if (!question) return;
    primeSpeech();
    wanted.current = false;
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
  const number = Math.min(index + 1, TOTAL);

  return (
    <section className="flex flex-1 flex-col pt-6 lg:grid lg:grid-cols-[5fr_6fr] lg:items-start lg:gap-12 lg:pt-10">
      <div className="flex items-end justify-between gap-4 lg:sticky lg:top-28 lg:flex-col lg:items-stretch">
          <img
          src={photo.restored ?? photo.original}
          alt="正在聊的照片"
          className="h-32 w-auto rounded-tile lg:h-auto lg:w-full lg:rounded-card"
        />
        <div
          className="flex flex-col items-end gap-2 lg:flex-row-reverse lg:items-center lg:justify-between"
          role="img"
          aria-label={`第 ${number} 題，共 ${TOTAL} 題`}
        >
          <span className="text-sm text-sub tabular-nums">
            {number} / {TOTAL}
          </span>
          <span className="flex gap-2">
            {Array.from({ length: TOTAL }, (_, i) => (
              <span
                key={i}
                className={`size-2 rounded-full ${i <= index ? "bg-ink" : "bg-fill-press"}`}
              />
            ))}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col lg:min-h-[28rem]">
      {!question ? (
        <div className="mt-8 pb-8 lg:mt-0">
          <Working zh="正在想下一個問題" en="Thinking of the next question" />
        </div>
      ) : (
        <>
          <div key={question.question_zh} className="enter mt-6 lg:mt-0" aria-live="polite">
            {question.ack_zh && <p className="text-sub">{question.ack_zh}</p>}
            <h2 className="text-xl font-semibold text-balance">
              {question.question_zh}
            </h2>
            <p lang="en" className="mt-2 text-sm text-sub">
              {[question.ack_en, question.question_en].filter(Boolean).join(" ")}
            </p>
          </div>

          <button
            type="button"
            className="mt-4 inline-flex h-12 items-center gap-2 self-start rounded-full bg-fill px-4 transition-[transform,background-color] duration-150 ease-out hover:bg-fill-hover active:scale-[0.97] active:bg-fill-press"
            onClick={() => say(question)}
          >
            <Volume2 aria-hidden size={24} strokeWidth={1.5} />
            <span>再聽一次</span>
            <span lang="en" className="text-sm text-sub">
              Hear it again
            </span>
          </button>

          {voice ? (
            <div className="mt-8 flex items-center gap-4">
              <button
                type="button"
                onClick={toggleMic}
                aria-pressed={listening}
                aria-label={listening ? "說完了" : "按一下開始說"}
                className={`relative isolate grid size-24 shrink-0 place-items-center rounded-full transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] ${
                  listening
                    ? "mic-live bg-live text-white"
                    : "bg-ink text-bg hover:opacity-90"
                }`}
              >
                {listening ? (
                  <Square aria-hidden size={32} strokeWidth={1.5} />
                ) : (
                  <Mic aria-hidden size={40} strokeWidth={1.5} />
                )}
              </button>
              <Bi
                className="font-semibold"
                zh={listening ? "我在聽，說完再按一下" : "按一下，開始說"}
                en={
                  listening
                    ? "Listening. Tap again when you finish."
                    : "Tap to talk"
                }
              />
            </div>
          ) : (
            <Bi
              className="mt-8"
              zh="這支手機現在不能用語音，請直接打字。"
              en="Voice input isn't available here. Please type instead."
            />
          )}

          <label className="mt-6 block">
            <span className="sr-only">您的回答</span>
            <textarea
              className="block min-h-28 w-full rounded-card border-hairline border-line-strong bg-surface p-4 transition-colors duration-150 placeholder:text-sub hover:border-sub focus:border-ink"
              placeholder="說的話會出現在這裡，也可以直接打字"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </label>

          {demo && (
            <button
              type="button"
              className="mt-2 min-h-12 self-start text-sm underline underline-offset-4"
              onClick={() => setAnswer(DEMO_ANSWERS[index] ?? "")}
            >
              填入示範回答
              <span lang="en" className="ml-2 text-sub">
                Fill in the demo answer
              </span>
            </button>
          )}

          <div className="pt-2" />
          <Actions columns>
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
          </Actions>
        </>
      )}
      </div>
    </section>
  );
}
