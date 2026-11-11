import {
  DISCLAIMER,
  HEARING,
  HOTLINES,
  LEVEL_LABEL,
  REMINDER,
  SIGNS,
  SIGNS_LINK,
} from "@/lib/awareness";
import type { AnalyzeResult, Names } from "@/lib/types";
import { Actions, Bi, Button, Sample, Stack, Title, Two } from "./ui";

export function HandoffStep({
  names,
  onOpen,
}: {
  names: Names;
  onOpen: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col pt-8">
      <div className="mt-auto pb-4">
        <Title
          zh={`請把手機交給 ${names.child}`}
          en={`Please hand the phone to ${names.child}`}
        />
      </div>
      <Actions>
        <Button
          zh={`我是 ${names.child}`}
          en={`I'm ${names.child}`}
          onClick={onOpen}
        />
      </Actions>
    </section>
  );
}

export function NoteStep({
  names,
  result,
  onSummary,
  onCoach,
  onRestart,
}: {
  names: Names;
  result: AnalyzeResult;
  onSummary: () => void;
  onCoach: () => void;
  onRestart: () => void;
}) {
  const { note } = result;

  return (
    <section className="flex flex-1 flex-col pt-8">
      <Title
        zh="覺察筆記"
        en={`Awareness Note, for ${names.child} only`}
      />

      <div className="mt-8">
        <Bi
          className="text-lg font-semibold"
          zh={LEVEL_LABEL[note.level].zh}
          en={LEVEL_LABEL[note.level].en}
        />
        <Bi
          className="mt-4 leading-[1.75]"
          zh={note.summary_zh}
          en={note.summary_en}
        />
        {note.hearing && (
          <Bi className="mt-4" zh={HEARING.zh} en={HEARING.en} />
        )}
        <Bi
          className="mt-4 font-semibold"
          zh={DISCLAIMER.zh}
          en={DISCLAIMER.en}
        />
      </div>

      {note.items.length > 0 && (
        <div className="mt-12">
          <Bi
            className="font-semibold"
            zh="可以留意的片段"
            en="Moments worth noticing"
          />
          <div className="mt-4 flex flex-col gap-3">
            {note.items.map((item, i) => (
              <article
                key={i}
                className="rounded-card border-hairline border-line bg-surface p-5"
              >
                <p className="text-sm text-sub">
                  <Two zh={`第 ${item.turn} 題`} en={`Question ${item.turn}`} />
                </p>
                <blockquote className="mt-2 text-lg">「{item.quote}」</blockquote>
                <Bi
                  className="mt-4 font-semibold"
                  zh={item.label_zh}
                  en={item.label_en}
                />
                <Bi className="mt-2" zh={item.why_zh} en={item.why_en} />
                <ul className="mt-4 flex flex-col gap-2 text-sm text-sub">
                  {item.signs.map((sign) => (
                    <li key={sign}>
                      <Stack
                        zh={`十大警訊第 ${sign} 項：${SIGNS[sign].zh}`}
                        en={`Warning sign ${sign}: ${SIGNS[sign].en}`}
                      />
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12">
        <Bi
          className="font-semibold"
          zh="接下來可以做的"
          en="What you can do next"
        />
        <Bi className="mt-4" zh={REMINDER.zh} en={REMINDER.en} />
        <ul className="mt-4 flex flex-col gap-3">
          {HOTLINES.map((line) => (
            <li key={line.tel}>
              <a
                href={`tel:${line.tel.replace(/-/g, "")}`}
                className="flex min-h-16 items-center justify-between gap-3 rounded-full bg-fill px-6 transition-colors duration-150 hover:bg-fill-hover active:bg-fill-press"
              >
                <span className="leading-tight">
                  <Stack zh={line.zh} en={line.en} />
                </span>
                <span className="font-semibold tabular-nums">{line.tel}</span>
              </a>
            </li>
          ))}
        </ul>
        <a
          href={SIGNS_LINK.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block underline underline-offset-4"
        >
          <Stack zh={SIGNS_LINK.zh} en={SIGNS_LINK.en} />
        </a>
      </div>

      {result.sample && (
        <div className="mt-8">
          <Sample zh="示範資料" en="Sample data, not a live analysis" />
        </div>
      )}

      <div className="pt-8" />
      <Actions sticky={false}>
        <Button
          zh="看診前摘要"
          en="Doctor summary"
          onClick={onSummary}
        />
        {note.level > 0 && (
          <Button
            variant="secondary"
            zh="練習怎麼開口"
            en="Practice the conversation"
            onClick={onCoach}
          />
        )}
        <Button
          variant="secondary"
          zh="結束並清除"
          en="Finish and clear everything"
          onClick={onRestart}
        />
      </Actions>
    </section>
  );
}
