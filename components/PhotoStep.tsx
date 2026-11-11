"use client";

import { useRef, useState } from "react";
import { DEMO_PHOTO, DEMO_PHOTO_RESTORED } from "@/lib/demo";
import { toResizedDataUrl } from "@/lib/image";
import type { Photo } from "@/lib/types";
import { Bi, Button, Print, Spinner, Tag } from "./ui";

type Status = "idle" | "restoring" | "done" | "error";

export function PhotoStep({ onReady }: { onReady: (photo: Photo) => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [photo, setPhoto] = useState<Photo | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);

  async function restore(source: Blob, isDemo: boolean) {
    setStatus("restoring");
    let original: string;
    try {
      original = await toResizedDataUrl(source);
    } catch {
      setStatus("error");
      return;
    }
    setPhoto({ original, restored: null });

    let restored: string | null = null;
    try {
      const response = await fetch("/api/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: original }),
        signal: AbortSignal.timeout(40_000),
      });
      const data = await response.json();
      if (typeof data.restoredUrl === "string") restored = data.restoredUrl;
    } catch {
      // keep going with the original photo
    }

    if (!restored && isDemo) {
      setPhoto({ original, restored: DEMO_PHOTO_RESTORED, sampleRestore: true });
    } else {
      setPhoto({ original, restored });
    }
    setStatus("done");
  }

  async function useDemoPhoto() {
    try {
      const response = await fetch(DEMO_PHOTO);
      await restore(await response.blob(), true);
    } catch {
      setStatus("error");
    }
  }

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) restore(file, false);
  }

  const inputs = (
    <>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onPick}
      />
      <input
        ref={libraryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPick}
      />
    </>
  );

  if (status === "idle" || status === "error") {
    return (
      <section className="flex flex-1 flex-col gap-6 pt-6">
        {inputs}
        <Bi
          className="font-serif text-[32px] leading-tight font-semibold"
          enClassName="font-sans"
          zh="選一張老照片"
          en="Choose an old photo"
        />
        <Bi
          className="text-[22px]"
          zh="有人、有地點、有一桌菜的照片最好聊。"
          en="Photos with people, a place and a table of food are the easiest to talk about."
        />
        {status === "error" && (
          <p
            role="alert"
            className="rounded-2xl bg-honey-soft px-4 py-3 text-honey"
          >
            這張照片打不開，請換一張試試。
            <span lang="en" className="block text-base">
              We couldn&rsquo;t open that photo. Please try another one.
            </span>
          </p>
        )}
        <div className="mt-auto flex flex-col gap-3">
          <Button
            zh="拍照"
            en="Take a photo"
            icon={<CameraIcon />}
            onClick={() => cameraRef.current?.click()}
          />
          <Button
            variant="secondary"
            zh="從相簿選"
            en="Choose from library"
            onClick={() => libraryRef.current?.click()}
          />
          <Button
            variant="secondary"
            zh="用示範照片"
            en="Use the demo photo"
            onClick={useDemoPhoto}
          />
        </div>
      </section>
    );
  }

  const restoring = status === "restoring";

  return (
    <section className="flex flex-1 flex-col gap-5 pt-6">
      {inputs}
      <div aria-live="polite">
        {restoring ? (
          <Bi
            className="font-serif text-[30px] leading-tight font-semibold"
            enClassName="font-sans"
            zh="正在修復照片…"
            en="Restoring the photo… about 20 seconds"
          />
        ) : photo?.restored ? (
          <Bi
            className="font-serif text-[30px] leading-tight font-semibold"
            enClassName="font-sans"
            zh="照片修好了"
            en="The photo is restored"
          />
        ) : (
          <Bi
            className="font-serif text-[30px] leading-tight font-semibold"
            enClassName="font-sans"
            zh="這次先用原本的照片"
            en="We'll use the original photo this time"
          />
        )}
      </div>

      {photo && photo.restored ? (
        <div className="grid grid-cols-2 gap-3">
          <figure>
            <Print src={photo.original} alt="原本的照片" className="w-full" />
            <figcaption className="mt-2 text-center text-lg">
              原本
              <span lang="en" className="block text-sm text-sub">
                Before
              </span>
            </figcaption>
          </figure>
          <figure>
            <Print src={photo.restored} alt="修復後的照片" className="w-full" />
            <figcaption className="mt-2 text-center text-lg font-semibold">
              修復後
              <span lang="en" className="block text-sm font-normal text-sub">
                After
              </span>
            </figcaption>
          </figure>
        </div>
      ) : (
        photo && (
          <div className="relative mx-auto w-3/4">
            <Print
              src={photo.original}
              alt="原本的照片"
              className={`w-full ${restoring ? "opacity-60" : ""}`}
            />
            {restoring && (
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid size-16 place-items-center rounded-full bg-card shadow-lg">
                  <Spinner />
                </span>
              </span>
            )}
          </div>
        )
      )}

      {photo?.sampleRestore && (
        <p className="text-center text-base text-sub">
          <Tag>示範圖</Tag>{" "}
          <span lang="en">Bundled sample, not a live result</span>
        </p>
      )}

      {!restoring && photo && (
        <div className="mt-auto flex flex-col gap-3">
          <Button
            zh="開始聊這張照片"
            en="Start talking about this photo"
            onClick={() => onReady(photo)}
          />
          <Button
            variant="quiet"
            zh="換一張照片"
            en="Choose a different photo"
            onClick={() => {
              setPhoto(null);
              setStatus("idle");
            }}
          />
        </div>
      )}
    </section>
  );
}

function CameraIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1.2-1.8h6.2L16.3 6h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
      <circle cx="12" cy="12.5" r="3.4" />
    </svg>
  );
}
