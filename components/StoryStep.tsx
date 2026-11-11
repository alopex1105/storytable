"use client";

import { Download, Share } from "lucide-react";
import { useRef, useState } from "react";
import type { AnalyzeResult, Names, Photo, Turn } from "@/lib/types";
import { Actions, Bi, Button, Sample, Title, Working } from "./ui";

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
        backgroundColor: getComputedStyle(card.current).backgroundColor,
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
      <section className="flex flex-1 flex-col pt-8">
        <Title
          zh="暫時無法整理，請再試一次"
          en="We couldn't put the story together just now. Please try again."
        />
        <div className="mt-8">
          <Bi
            className="font-semibold"
            zh="剛才的對話，沒有被保存"
            en="The conversation so far. It is not saved."
          />
          <ol className="mt-4 flex flex-col gap-4">
            {turns.map((turn, i) => (
              <li key={i}>
                <p className="text-muted">{turn.q_zh}</p>
                <p>{turn.skipped ? "跳過" : turn.a}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="pt-4" />
        <Actions>
          <Button zh="再試一次" en="Try again" onClick={onRetry} />
        </Actions>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="flex flex-1 flex-col pt-8 pb-8">
        <Working
          zh="正在把故事整理成卡片"
          en="Turning the story into a card"
        />
      </section>
    );
  }

  const { story, recipe } = result;

  return (
    <section className="flex flex-1 flex-col pt-6">
      {/* Card radius 24 with 16 padding, so everything inside is radius 8. */}
      <div
        ref={card}
        className="rounded-card border-hairline border-line bg-surface p-4"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- in-memory data URL */}
        <img
          src={photo.restored ?? photo.original}
          alt="故事裡的照片"
          className="aspect-[5/4] w-full rounded-inner object-cover object-[50%_18%]"
        />
        <div className="px-2 pt-6">
          <h2 className="text-xl font-semibold break-keep [overflow-wrap:anywhere]">
            {story.title_zh}
          </h2>
          <p lang="en" className="mt-1 text-sm text-muted">
            {story.title_en}
          </p>

          <div className="mt-6 text-lg">
            {story.lines_zh.map((line, i) => (
              <p key={i} className="text-pretty">
                {line}
              </p>
            ))}
          </div>
          <p lang="en" className="mt-2 text-sm text-muted">
            {story.lines_en.join(" ")}
          </p>
        </div>

        {recipe.steps_zh.length > 0 && (
          <div className="mt-6 rounded-inner bg-fill p-4">
            <h3 className="font-semibold">
              {recipe.name_zh}
              <span className="ml-2 text-sm font-normal text-muted">
                {names.elder}口述
              </span>
            </h3>
            <ol className="mt-4 flex flex-col gap-3">
              {recipe.steps_zh.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-5 shrink-0 text-muted tabular-nums">
                    {i + 1}
                  </span>
                  <span>
                    {step}
                    <span lang="en" className="block text-sm text-muted">
                      {recipe.steps_en[i]}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <p className="px-2 pt-4 text-sm text-muted">StoryTable 膳心人事</p>
      </div>

      {result.sample && (
        <div className="mt-4">
          <Sample zh="示範資料" en="Sample data, not a live analysis" />
        </div>
      )}

      <div className="pt-4" />
      <Actions sticky={false}>
        <div className={`grid gap-3 ${canShare ? "grid-cols-2" : ""}`}>
          <Button
            variant="secondary"
            zh={saving ? "儲存中" : "下載圖片"}
            en="Download"
            icon={<Download aria-hidden size={24} strokeWidth={1.5} />}
            disabled={saving}
            onClick={download}
          />
          {canShare && (
            <Button
              variant="secondary"
              zh="分享"
              en="Share"
              icon={<Share aria-hidden size={24} strokeWidth={1.5} />}
              onClick={share}
            />
          )}
        </div>
        <Button
          zh={`接下來：給 ${names.child} 的筆記`}
          en={`Next: the note for ${names.child}`}
          onClick={onNext}
        />
      </Actions>
    </section>
  );
}
