import { Printer } from "lucide-react";
import { useState } from "react";
import {
  DISCLAIMER,
  HEARING,
  LEVEL_LABEL,
  SIGNS,
} from "@/lib/awareness";
import type { AnalyzeResult, Names } from "@/lib/types";
import { Actions, Button } from "./ui";

// One A4 page for the doctor. Built from what is already on the note plus
// what the family types here. No model call, and nothing leaves the phone.

function Box({
  zh,
  en,
  value,
  onChange,
}: {
  zh: string;
  en: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block break-inside-avoid">
      <span className="font-semibold">{zh}</span>
      <span lang="en" className="ml-2 text-sm text-sub">
        {en}
      </span>
      <textarea
        className="mt-2 block min-h-24 w-full rounded-inner border-hairline border-line-strong bg-surface p-3 transition-[border-color,box-shadow] duration-150 hover:border-sub focus:border-ink focus:shadow-[0_0_0_1px_var(--sand-12)] focus-visible:outline-none print:min-h-[20mm]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function SummaryStep({
  names,
  result,
  onBack,
}: {
  names: Names;
  result: AnalyzeResult;
  onBack: () => void;
}) {
  const [observations, setObservations] = useState("");
  const [medicines, setMedicines] = useState("");
  const [questions, setQuestions] = useState("");
  const { note } = result;
  const today = new Date().toLocaleDateString("sv-SE");

  return (
    <section className="flex flex-1 flex-col pt-8 print:pt-0">
      <div className="print-sheet flex flex-col gap-6 md:rounded-card md:border-hairline md:border-line md:bg-surface md:p-10 print:gap-4 print:border-0 print:p-0">
        <div>
          <h1 className="text-xl font-semibold">看診前摘要</h1>
          <p lang="en" className="mt-1 text-sm text-sub">
            Summary for the doctor, from a StoryTable conversation
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-3">
          <div>
            <dt className="text-sm text-sub">稱呼 Called</dt>
            <dd className="font-semibold">{names.elder}</dd>
          </div>
          <div>
            <dt className="text-sm text-sub">日期 Date</dt>
            <dd className="font-semibold tabular-nums">{today}</dd>
          </div>
          <div>
            <dt className="text-sm text-sub">整理者 By</dt>
            <dd className="font-semibold">{names.child}</dd>
          </div>
        </dl>

        <div className="break-inside-avoid">
          <p className="font-semibold">
            {LEVEL_LABEL[note.level].zh}
            <span lang="en" className="ml-2 text-sm font-normal text-sub">
              {LEVEL_LABEL[note.level].en}
            </span>
          </p>
          <p className="mt-1">{note.summary_zh}</p>
          <p lang="en" className="mt-1 text-sm text-sub">
            {note.summary_en}
          </p>
          {note.hearing && (
            <p className="mt-1">
              {HEARING.zh}
              <span lang="en" className="block text-sm text-sub">
                {HEARING.en}
              </span>
            </p>
          )}
        </div>

        {note.items.length > 0 && (
          <div>
            <p className="font-semibold">
              對話裡的片段
              <span lang="en" className="ml-2 text-sm font-normal text-sub">
                Moments from the conversation, in the person&rsquo;s own words
              </span>
            </p>
            <ol className="mt-2 flex flex-col gap-3 print:gap-2">
              {note.items.map((item, i) => (
                <li
                  key={i}
                  className="break-inside-avoid border-t-hairline border-line pt-3 print:pt-2"
                >
                  <p>
                    <span className="mr-2 text-sm text-sub tabular-nums">
                      第 {item.turn} 題 Q{item.turn}
                    </span>
                    「{item.quote}」
                  </p>
                  <p className="mt-1 text-sm">
                    {item.label_zh}
                    <span lang="en" className="ml-2 text-sub">
                      {item.label_en}
                    </span>
                  </p>
                  <p className="text-sm text-sub">
                    {item.signs
                      .map((sign) => `十大警訊第 ${sign} 項 ${SIGNS[sign].zh}`)
                      .join("；")}
                    <span lang="en" className="block">
                      {item.signs
                        .map((sign) => `Warning sign ${sign}: ${SIGNS[sign].en}`)
                        .join("; ")}
                    </span>
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}

        <Box
          zh="家人平常的觀察"
          en="What the family has noticed, and since when"
          value={observations}
          onChange={setObservations}
        />
        <Box
          zh="目前用藥"
          en="Current medicines"
          value={medicines}
          onChange={setMedicines}
        />
        <Box
          zh="想問醫師的問題"
          en="Questions for the doctor"
          value={questions}
          onChange={setQuestions}
        />

        <p className="font-semibold">
          {DISCLAIMER.zh}
          <span lang="en" className="ml-2 text-sm font-normal text-sub">
            {DISCLAIMER.en} It records one conversation and what the family
            noticed.
          </span>
        </p>

        {result.sample && (
          <p className="text-sm text-sub">
            示範資料
            <span lang="en" className="ml-2">
              Sample data, not a live analysis
            </span>
          </p>
        )}
      </div>

      <div className="pt-6" />
      <Actions sticky={false}>
        <Button
          zh="列印或存成 PDF"
          en="Print or save as PDF"
          icon={<Printer aria-hidden size={24} strokeWidth={1.5} />}
          onClick={() => window.print()}
        />
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
