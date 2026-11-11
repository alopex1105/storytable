"use client";

import { useRef, useState } from "react";
import type { AnalyzeResult, Names, Photo, Turn } from "@/lib/types";
import { Bi, Button, Spinner, Tag } from "./ui";

export function StoryStep({
  photo,
  names,
  turns,
  result,
  failed,
  onRetry,
  onNext,
}: {
  photo: Photo;
  names: Names;
  turns: Turn[];
  result: AnalyzeResult | null;
  failed: boolean;
  onRetry: () => void;
  onNext: () => void;
}) {
  const card = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  async function download() {
    if (!card.current) return;
    setSaving(true);
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(card.current, {
        pixelRatio: 2,
        backgroundColor: "#fffdf8",
      });
      const link = document.createElement("a");
      link.href = url;
      link.download = "storytable.png";
      link.click();
    } catch {
      // the card stays on screen; a screenshot still works
    } finally {
      setSaving(false);
    }
  }

  async function share() {
    if (!result) return;
    try {
      await navigator.share({
        title: result.story.title_zh,
        text: [result.story.title_zh, ...result.story.lines_zh].join("\n"),
      });
    } catch {
      // the person closed the share sheet
    }
  }

  if (failed) {
    return (
      <section className="flex flex-1 flex-col gap-5 pt-6">
        <Bi
          className="font-serif text-[30px] leading-tight font-semibold"
          enClassName="font-sans"
          zh="暫時無法整理，請再試一次"
          en="We couldn't put the story together just now. Please try again."
        />
        <Button zh="再試一次" en="Try again" onClick={onRetry} />
        <div className="rounded-3xl border border-line bg-card p-5">
          <Bi
            className="text-lg font-semibold"
            zh="剛才的對話（沒有被保存）"
            en="The conversation so far (not saved)"
          />
          <ol className="mt-3 flex flex-col gap-3">
            {turns.map((turn, i) => (
              <li key={i}>
                <div className="text-lg text-sub">{turn.q_zh}</div>
                <div>{turn.skipped ? "（跳過）" : turn.a}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  if (!result) {
    return (
      <section
        className="flex flex-1 flex-col items-center justify-center gap-5 text-center"
        aria-live="polite"
      >
        <Spinner />
        <Bi
          className="font-serif text-[28px] leading-snug font-semibold"
          enClassName="font-sans"
          zh="正在把故事整理成卡片…"
          en="Turning the story into a card…"
        />
      </section>
    );
  }

  const { story, recipe } = result;

  return (
    <section className="flex flex-1 flex-col gap-5 pt-5">
      <div
        ref={card}
        className="overflow-hidden rounded-3xl border border-line bg-card shadow-[0_8px_24px_rgb(43_36_32/0.10)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- in-memory data URLs */}
        <img
          src={photo.restored ?? photo.original}
          alt="故事裡的照片"
          className="aspect-[5/4] w-full object-cover object-[50%_18%]"
        />
        <div className="p-6">
          <h2 className="font-serif text-[30px] leading-tight font-semibold break-keep [overflow-wrap:anywhere]">
            {story.title_zh}
          </h2>
          <p lang="en" className="mt-1 text-base text-sub">
            {story.title_en}
          </p>

          <div className="mt-5 border-l-4 border-accent pl-4">
            {story.lines_zh.map((line, i) => (
              <p key={i} className="font-serif text-[22px] leading-[1.7] text-pretty">
                {line}
              </p>
            ))}
            <p lang="en" className="mt-2 text-base leading-relaxed text-sub">
              {story.lines_en.join(" ")}
            </p>
          </div>

          {recipe.steps_zh.length > 0 && (
            <div className="mt-6 rounded-2xl bg-accent-soft p-5">
              <h3 className="text-[22px] font-semibold">
                {recipe.name_zh}
                <span className="ml-2 text-base font-normal text-sub">
                  {names.elder}口述 <span lang="en">· as told</span>
                </span>
              </h3>
              <ol className="mt-3 flex flex-col gap-2.5">
                {recipe.steps_zh.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-accent text-base font-semibold text-white">
                      {i + 1}
                    </span>
                    <span>
                      {step}
                      <span
                        lang="en"
                        className="block text-base leading-snug text-sub"
                      >
                        {recipe.steps_en[i]}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <p className="mt-5 text-center text-sm text-sub">
            StoryTable 膳心人事
          </p>
        </div>
      </div>

      {result.sample && (
        <p className="text-center text-base text-sub">
          <Tag>示範資料</Tag>{" "}
          <span lang="en">Sample data, not a live analysis</span>
        </p>
      )}

      <div className={`grid gap-3 ${canShare ? "grid-cols-2" : ""}`}>
        <Button
          variant="secondary"
          zh={saving ? "儲存中…" : "下載圖片"}
          en="Download image"
          disabled={saving}
          onClick={download}
        />
        {canShare && (
          <Button variant="secondary" zh="分享" en="Share" onClick={share} />
        )}
      </div>
      <Button
        zh={`接下來：給 ${names.child} 的筆記`}
        en={`Next: the note for ${names.child}`}
        onClick={onNext}
      />
    </section>
  );
}
