import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { coachReply } from "@/lib/api";
import { COACH_TURNS, PERSONAS } from "@/lib/coach";
import type {
  AnalyzeResult,
  CoachLine,
  Names,
  Opener,
  Persona,
} from "@/lib/types";
import { Actions, Bi, Button, Title, Working } from "./ui";

// The family member rehearses how to suggest a check-up. The model plays the
// parent for four turns, then three opening lines are shown. Nothing is kept.

export function CoachStep({
  names,
  result,
  onBack,
}: {
  names: Names;
  result: AnalyzeResult;
  onBack: () => void;
}) {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [lines, setLines] = useState<CoachLine[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [openers, setOpeners] = useState<Opener[] | null>(null);
  const [fixed, setFixed] = useState(false);

  const said = lines.filter((line) => line.role === "child").length;

  function reset() {
    setPersona(null);
    setLines([]);
    setDraft("");
    setOpeners(null);
    setFixed(false);
  }

  async function send() {
    const text = draft.trim();
    if (!text || !persona || busy) return;
    const history: CoachLine[] = [...lines, { role: "child", text }];
    setLines(history);
    setDraft("");
    setBusy(true);
    const answer = await coachReply({
      level: result.note.level,
      moments: [...new Set(result.note.items.map((item) => item.type))],
      persona,
      history: history.map(({ role, text }) => ({ role, text })),
      names,
    });
    setBusy(false);
    if (answer.reply_zh) {
      setLines([
        ...history,
        { role: "elder", text: answer.reply_zh, text_en: answer.reply_en },
      ]);
    }
    if (answer.done) {
      setOpeners(answer.openers);
      setFixed(answer.source === "fixed");
    }
    window.scrollTo(0, document.body.scrollHeight);
  }

  if (!persona) {
    return (
      <section className="flex flex-1 flex-col pt-8">
        <Title zh="練習怎麼開口" en="Practice the conversation" />
        <Bi
          className="mt-6"
          zh={`先選${names.elder}可能的反應，再試著說說看。`}
          en={`Pick how ${names.elder} might react, then try saying it.`}
        />
        <div className="mt-6 flex flex-col gap-3">
          {(Object.keys(PERSONAS) as Persona[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setPersona(key)}
              className="flex min-h-16 items-center justify-between gap-3 rounded-card bg-fill px-5 py-4 text-left transition-[transform,background-color] duration-150 ease-out hover:bg-fill-hover active:scale-[0.98] active:bg-fill-press"
            >
              <span>
                <span className="block font-semibold">{PERSONAS[key].zh}</span>
                <span lang="en" className="block text-sm text-sub">
                  {PERSONAS[key].en}
                </span>
              </span>
              <ChevronRight
                aria-hidden
                size={24}
                strokeWidth={1.5}
                className="shrink-0 text-sub"
              />
            </button>
          ))}
        </div>
        <div className="pt-6" />
        <Actions sticky={false}>
          <Button
            variant="secondary"
            zh="回到筆記"
            en="Back to the note"
            onClick={onBack}
          />
        </Actions>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col pt-8">
      <div className="flex items-end justify-between gap-4">
        <Title zh="練習怎麼開口" en={PERSONAS[persona].en} />
        {!openers && (
          <span className="shrink-0 text-sm text-sub tabular-nums">
            {Math.min(said + (busy ? 0 : 1), COACH_TURNS)} / {COACH_TURNS}
          </span>
        )}
      </div>

      <ol className="mt-6 flex flex-col gap-3" aria-live="polite">
        {lines.map((line, i) =>
          line.role === "child" ? (
            <li
              key={i}
              className="max-w-[85%] self-end rounded-card bg-ink px-4 py-3 text-bg"
            >
              {line.text}
            </li>
          ) : (
            <li
              key={i}
              className="max-w-[85%] self-start rounded-card bg-fill px-4 py-3"
            >
              <span className="block text-sm text-sub">{names.elder}</span>
              {line.text}
              {line.text_en && (
                <span lang="en" className="mt-1 block text-sm text-sub">
                  {line.text_en}
                </span>
              )}
            </li>
          ),
        )}
      </ol>

      {busy && (
        <div className="mt-4">
          <Working
            zh={`${names.elder}正在想怎麼回`}
            en="Thinking of a reply"
          />
        </div>
      )}

      {openers ? (
        <>
          <div className="mt-8">
            <Bi
              className="font-semibold"
              zh="三句可以直接用的開場白"
              en="Three opening lines you can use"
            />
            {fixed && (
              <Bi
                className="mt-2"
                zh="現在沒辦法對練，先給你三句常用的說法。"
                en="The practice partner isn't available right now. Here are three lines that often work."
              />
            )}
            <ol className="mt-4 flex flex-col gap-3">
              {openers.map((opener, i) => (
                <li
                  key={i}
                  className="rounded-card border-hairline border-line bg-surface p-5"
                >
                  <p className="text-lg">「{opener.zh}」</p>
                  <p lang="en" className="mt-2 text-sm text-sub">
                    {opener.en}
                  </p>
                </li>
              ))}
            </ol>
          </div>
          <div className="pt-6" />
          <Actions sticky={false}>
            <Button zh="再練一次" en="Practice again" onClick={reset} />
            <Button
              variant="secondary"
              zh="回到筆記"
              en="Back to the note"
              onClick={onBack}
            />
          </Actions>
        </>
      ) : (
        <>
          <label className="mt-6 block">
            <span className="sr-only">你想說的話</span>
            <textarea
              className="block min-h-28 w-full rounded-card border-hairline border-line-strong bg-surface p-4 transition-[border-color,box-shadow] duration-150 placeholder:text-sub hover:border-sub focus:border-ink focus:shadow-[0_0_0_1px_var(--sand-12)] focus-visible:outline-none"
              placeholder={`對${names.elder}說說看，例如：我想跟您聊一件事`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={busy}
            />
          </label>
          <div className="pt-2" />
          <Actions columns>
            <Button
              variant="secondary"
              zh="回到筆記"
              en="Back"
              onClick={onBack}
            />
            <Button
              zh="說出口"
              en="Say it"
              disabled={!draft.trim() || busy}
              onClick={send}
            />
          </Actions>
        </>
      )}
    </section>
  );
}
