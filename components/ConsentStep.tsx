"use client";

import { useState } from "react";
import type { Names } from "@/lib/types";
import { Bi, Button } from "./ui";

export function ConsentStep({
  names,
  onNames,
  demo,
  onDemo,
  onAgree,
}: {
  names: Names;
  onNames: (names: Names) => void;
  demo: boolean;
  onDemo: (on: boolean) => void;
  onAgree: () => void;
}) {
  const [declined, setDeclined] = useState(false);
  const child = names.child.trim() || "家人";
  const childEn = names.child.trim() || "your family";

  if (declined) {
    return (
      <section className="flex flex-1 flex-col justify-center gap-8 py-10">
        <Bi
          className="font-serif text-[32px] leading-snug font-semibold"
          enClassName="font-sans"
          zh="沒關係，改天再聊。"
          en="That's all right. We can talk another day."
        />
        <Button
          variant="secondary"
          zh="回到開始"
          en="Back to start"
          onClick={() => setDeclined(false)}
        />
      </section>
    );
  }

  return (
    <section className="-mb-8 flex flex-1 flex-col gap-5 pt-5">
      <Bi
        className="font-serif text-[34px] leading-tight font-semibold"
        enClassName="font-sans"
        zh="一起看一張老照片"
        en="Let's look at an old photo together"
      />

      <div className="rounded-3xl border border-line bg-card p-5">
        <p className="text-[21px] leading-[1.7]">
          我們會一起看一張老照片，聽您說說當時的故事。AI
          會幫忙修復照片、把故事整理成卡片，也會留意說話時的一些變化，整理成只給{" "}
          <strong className="font-semibold text-accent-deep">{child}</strong>{" "}
          看的筆記。照片和錄音都不會被保存。
        </p>
        <p lang="en" className="mt-3 text-base leading-normal text-sub">
          We&rsquo;ll look at an old photo together and listen to your story. AI
          will help restore the photo and turn the story into a card. It will
          also notice some changes in how you speak and put them in a note only{" "}
          {childEn} will see. The photo and the recording are not saved.
        </p>
      </div>

      <fieldset className="grid grid-cols-2 gap-3">
        <legend className="mb-2 text-base text-sub">
          由家人填寫 <span lang="en">· Filled in by family</span>
        </legend>
        <label className="block">
          <span className="block text-lg font-medium">怎麼稱呼長輩</span>
          <span lang="en" className="block text-sm text-sub">
            Name for the storyteller
          </span>
          <input
            className="mt-1.5 h-14 w-full rounded-xl border-2 border-line bg-card px-4 text-[22px]"
            placeholder="爸爸"
            value={names.elder}
            onChange={(e) => onNames({ ...names, elder: e.target.value })}
            maxLength={12}
          />
        </label>
        <label className="block">
          <span className="block text-lg font-medium">誰來看筆記</span>
          <span lang="en" className="block text-sm text-sub">
            Who reads the note
          </span>
          <input
            className="mt-1.5 h-14 w-full rounded-xl border-2 border-line bg-card px-4 text-[22px]"
            placeholder="Amy"
            value={names.child}
            onChange={(e) => onNames({ ...names, child: e.target.value })}
            maxLength={12}
          />
        </label>
      </fieldset>

      <label className="flex items-center gap-2 text-base text-sub">
        <input
          type="checkbox"
          className="size-5 accent-(--color-accent)"
          checked={demo}
          onChange={(e) => onDemo(e.target.checked)}
        />
        示範模式 <span lang="en">· Demo mode (fictional family)</span>
      </label>

      <div className="sticky bottom-0 -mx-5 mt-auto grid grid-cols-[2fr_3fr] gap-3 bg-paper/95 px-5 pt-3 pb-4 backdrop-blur">
        <Button
          variant="secondary"
          zh="先不要"
          en="Not now"
          onClick={() => setDeclined(true)}
        />
        <Button zh="好，我們開始" en="Yes, let's begin" onClick={onAgree} />
      </div>
    </section>
  );
}
