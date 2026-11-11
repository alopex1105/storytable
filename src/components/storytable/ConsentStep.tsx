import { useState } from "react";
import type { Names } from "@/lib/types";
import { useLang } from "@/lib/lang";
import { Actions, Button, Stack, Switch, Title, Two } from "./ui";

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
  const { lang } = useLang();
  const child = names.child.trim() || "家人";
  const childEn = names.child.trim() || "your family";

  if (declined) {
    return (
      <section className="flex flex-1 flex-col pt-8">
        <div className="mt-auto">
          <Title
            zh="沒關係，改天再聊。"
            en="That's all right. We can talk another day."
          />
        </div>
        <div className="-mx-5 px-5 pt-8 pb-6">
          <Button
            variant="secondary"
            zh="回到開始"
            en="Back to start"
            onClick={() => setDeclined(false)}
          />
        </div>
      </section>
    );
  }

  const zh = (
    <>
      我們會一起看一張老照片，聽您說說當時的故事。AI
      會幫忙修復照片、把故事整理成卡片，也會留意說話時的一些變化，整理成只給{" "}
      <strong className="font-semibold">{child}</strong>{" "}
      看的筆記。照片和錄音都不會被保存。
    </>
  );
  const en = (
    <>
      We&rsquo;ll look at an old photo together and listen to your story. AI
      will help restore the photo and turn the story into a card. It will also
      notice some changes in how you speak and put them in a note only{" "}
      <strong className="font-semibold">{childEn}</strong> will see. The photo
      and the recording are not saved.
    </>
  );
  const lead = lang === "en" ? en : zh;

  const input =
    "mt-2 h-14 w-full rounded-full border-hairline border-line-strong bg-surface px-5 transition-[border-color,box-shadow] duration-150 placeholder:text-sub hover:border-sub focus:border-ink focus:shadow-[0_0_0_1px_var(--sand-12)] focus-visible:outline-none";

  return (
    <section className="flex flex-1 flex-col pt-8">
      <Title zh="一起看一張老照片" en="Let's look at an old photo together" />

      <p lang={lead === en ? "en" : undefined} className="mt-6 leading-[1.75]">
        {lead}
      </p>
      <p lang={lead === en ? undefined : "en"} className="mt-3 text-sm text-sub">
        {lead === en ? zh : en}
      </p>

      <fieldset className="mt-8">
        <legend className="text-sm text-sub">
          <Two zh="由家人填寫" en="Filled in by family" />
        </legend>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-sm font-semibold">
              <Stack zh="怎麼稱呼長輩" en="Storyteller" />
            </span>
            <input
              className={input}
              placeholder="爸爸"
              aria-description="Name for the storyteller"
              value={names.elder}
              onChange={(e) => onNames({ ...names, elder: e.target.value })}
              maxLength={12}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold">
              <Stack zh="誰來看筆記" en="Who reads the note" />
            </span>
            <input
              className={input}
              placeholder="Amy"
              aria-description="Who reads the note"
              value={names.child}
              onChange={(e) => onNames({ ...names, child: e.target.value })}
              maxLength={12}
            />
          </label>
        </div>
      </fieldset>

      <div className="mt-6 mb-4">
        <Switch
          on={demo}
          onChange={onDemo}
          zh="示範模式"
          en="Demo mode with a fictional family"
        />
      </div>

      <Actions columns>
        <Button
          variant="secondary"
          zh="先不要"
          en="Not now"
          onClick={() => setDeclined(true)}
        />
        <Button zh="好，我們開始" en="Yes, let's begin" onClick={onAgree} />
      </Actions>
    </section>
  );
}
