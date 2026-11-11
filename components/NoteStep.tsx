"use client";

import {
  DISCLAIMER,
  HEARING,
  HOTLINES,
  LEVEL_LABEL,
  REMINDER,
  SIGNS,
  SIGNS_LINK,
} from "@/lib/awareness";
import type { AnalyzeResult, Level, Names } from "@/lib/types";
import { Bi, Button, Tag } from "./ui";

export function HandoffStep({
  names,
  onOpen,
}: {
  names: Names;
  onOpen: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col justify-center gap-10 py-10 text-center">
      <Bi
        className="font-serif text-[36px] leading-snug font-semibold"
        enClassName="font-sans text-lg"
        zh={
          <>
            請把手機交給
            <br />
            {names.child}
          </>
        }
        en={`Please hand the phone to ${names.child}`}
      />
      <Button
        zh={`我是 ${names.child}`}
        en={`I'm ${names.child}`}
        onClick={onOpen}
      />
    </section>
  );
}

const LEVEL_LOOK: Record<Level, string> = {
  0: "bg-leaf-soft text-leaf",
  1: "bg-honey-soft text-honey",
  2: "bg-accent-soft text-accent-deep",
};

export function NoteStep({
  names,
  result,
  onRestart,
}: {
  names: Names;
  result: AnalyzeResult;
  onRestart: () => void;
}) {
  const { note } = result;

  return (
    <section className="flex flex-1 flex-col gap-5 pt-5">
      <div>
        <p className="text-base text-sub">
          只給 {names.child} 看 <span lang="en">· For {names.child} only</span>
        </p>
        <Bi
          className="mt-1 font-serif text-[32px] leading-tight font-semibold"
          enClassName="font-sans"
          zh="覺察筆記"
          en="Awareness Note"
        />
      </div>

      <div className="rounded-3xl border border-line bg-card p-5">
        <p
          className={`rounded-2xl px-4 py-2.5 text-[22px] leading-tight font-semibold ${LEVEL_LOOK[note.level]}`}
        >
          {LEVEL_LABEL[note.level].zh}
          <span lang="en" className="mt-0.5 block text-base font-normal">
            {LEVEL_LABEL[note.level].en}
          </span>
        </p>
        <Bi
          className="mt-3 text-[21px] leading-[1.7]"
          enClassName="leading-relaxed"
          zh={note.summary_zh}
          en={note.summary_en}
        />
        {note.hearing && (
          <Bi
            className="mt-4 border-t border-line pt-4"
            zh={HEARING.zh}
            en={HEARING.en}
          />
        )}
        <p className="mt-4 rounded-xl bg-paper px-4 py-3 text-center text-[22px] font-semibold">
          {DISCLAIMER.zh}
          <span lang="en" className="block text-base font-normal text-sub">
            {DISCLAIMER.en}
          </span>
        </p>
      </div>

      {note.items.length > 0 && (
        <div className="flex flex-col gap-3">
          <Bi
            className="text-[22px] font-semibold"
            zh="可以留意的片段"
            en="Moments worth noticing"
          />
          {note.items.map((item, i) => (
            <article
              key={i}
              className="rounded-3xl border border-line bg-card p-5"
            >
              <p className="text-base text-sub">
                第 {item.turn} 題 <span lang="en">· Question {item.turn}</span>
              </p>
              <blockquote className="mt-2 border-l-4 border-accent pl-4 font-serif text-[23px] leading-[1.6]">
                「{item.quote}」
              </blockquote>
              <Bi
                className="mt-3 font-semibold"
                zh={item.label_zh}
                en={item.label_en}
              />
              <Bi className="mt-2" zh={item.why_zh} en={item.why_en} />
              <ul className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
                {item.signs.map((sign) => (
                  <li key={sign} className="flex gap-3">
                    <span className="mt-0.5 grid h-8 shrink-0 place-items-center rounded-full bg-accent-soft px-3 text-base font-semibold text-accent-deep">
                      警訊 {sign}
                    </span>
                    <span className="text-lg">
                      {SIGNS[sign].zh}
                      <span
                        lang="en"
                        className="block text-base leading-snug text-sub"
                      >
                        Warning sign {sign}: {SIGNS[sign].en}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-line bg-card p-5">
        <Bi
          className="text-[22px] font-semibold"
          zh="接下來可以做的"
          en="What you can do next"
        />
        <ul className="mt-3 flex flex-col gap-4">
          <li>
            <Bi zh={REMINDER.zh} en={REMINDER.en} />
          </li>
          {HOTLINES.map((line) => (
            <li key={line.tel}>
              <a
                href={`tel:${line.tel.replaceAll("-", "")}`}
                className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border-2 border-line px-4 py-2"
              >
                <span>
                  {line.zh}
                  <span lang="en" className="block text-base text-sub">
                    {line.en}
                  </span>
                </span>
                <span className="text-[22px] font-semibold text-accent-deep tabular-nums">
                  {line.tel}
                </span>
              </a>
            </li>
          ))}
          <li>
            <a
              href={SIGNS_LINK.url}
              target="_blank"
              rel="noreferrer"
              className="text-accent-deep underline underline-offset-4"
            >
              {SIGNS_LINK.zh}
              <span lang="en" className="block text-base text-sub">
                {SIGNS_LINK.en}
              </span>
            </a>
          </li>
        </ul>
      </div>

      {result.sample && (
        <p className="text-center text-base text-sub">
          <Tag>示範資料</Tag>{" "}
          <span lang="en">Sample data, not a live analysis</span>
        </p>
      )}

      <Button
        variant="secondary"
        zh="結束並清除"
        en="Finish and clear everything"
        onClick={onRestart}
      />
    </section>
  );
}
