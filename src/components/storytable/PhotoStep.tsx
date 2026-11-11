import { Camera, ChevronsLeftRight, ImagePlus } from "lucide-react";
import { useRef, useState } from "react";
import { restorePhoto } from "@/lib/api";
import { DEMO_PHOTO, DEMO_PHOTO_RESTORED } from "@/lib/demo";
import { toResizedDataUrl } from "@/lib/image";
import { primeVoice } from "@/lib/voice";
import type { Photo } from "@/lib/types";
import { Actions, Bi, Button, Sample, Title, Working } from "./ui";

type Status = "idle" | "restoring" | "done" | "error";

/** Drag the handle to compare the photo before and after. */
function Compare({ before, after }: { before: string; after: string }) {
  const [split, setSplit] = useState(50);
  return (
    <div className="relative overflow-hidden rounded-card select-none">
      <img src={after} alt="修復後的照片" className="block w-full" />
      <img
        src={before}
        alt="原本的照片"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
      />
      <span className="chip-glass absolute top-3 left-3 rounded-full px-3 py-1 text-sm">
        原本 Before
      </span>
      <span className="chip-glass absolute top-3 right-3 rounded-full px-3 py-1 text-sm">
        修復後 After
      </span>
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white"
        style={{ left: `${split}%` }}
      >
        <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#1f1e1b] shadow-md">
          <ChevronsLeftRight aria-hidden size={24} strokeWidth={1.5} />
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={split}
        onChange={(e) => setSplit(Number(e.target.value))}
        aria-label="左右拖曳，比較修復前後"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

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

    const restored = await restorePhoto(original);

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

  // A phone opens the camera; a computer opens the file picker.
  function openMain() {
    const touch = window.matchMedia?.("(pointer: coarse)").matches;
    (touch ? cameraRef : libraryRef).current?.click();
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
      <section className="flex flex-1 flex-col pt-8 lg:mx-auto lg:w-full lg:max-w-[640px]">
        {inputs}
        <Title zh="選一張老照片" en="Choose an old photo" />
        {status === "error" && (
          <Bi
            className="mt-4"
            zh="這張照片打不開，請換一張。"
            en="We couldn't open that photo. Please try another one."
          />
        )}
        <button
          type="button"
          onClick={openMain}
          className="mt-6 flex max-h-96 min-h-56 flex-1 flex-col items-center justify-center gap-3 rounded-card border-hairline border-dashed border-line-strong bg-surface transition-[transform,background-color] duration-150 ease-out hover:bg-fill active:scale-[0.98] active:bg-fill-hover"
        >
          <span className="[@media(pointer:fine)]:hidden">
            <Camera aria-hidden size={40} strokeWidth={1.5} />
          </span>
          <span className="[@media(pointer:coarse)]:hidden">
            <ImagePlus aria-hidden size={40} strokeWidth={1.5} />
          </span>
          <span className="text-center [@media(pointer:fine)]:hidden">
            <span className="block leading-tight font-semibold">拍照</span>
            <span lang="en" className="block text-sm text-sub">
              Take a photo
            </span>
          </span>
          <span className="text-center [@media(pointer:coarse)]:hidden">
            <span className="block leading-tight font-semibold">選一張照片</span>
            <span lang="en" className="block text-sm text-sub">
              Choose a photo from this computer
            </span>
          </span>
        </button>
        <Actions sticky={false}>
          <Button
            variant="secondary"
            className="[@media(pointer:fine)]:hidden"
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
        </Actions>
      </section>
    );
  }

  if (status === "restoring" || !photo) {
    return (
      <section className="flex flex-1 flex-col pt-8 pb-8 lg:mx-auto lg:w-full lg:max-w-[640px]">
        {inputs}
        {photo && (
          <img
            src={photo.original}
            alt="原本的照片"
            className="mx-auto w-full max-w-[520px] rounded-card"
          />
        )}
        <div className="mt-6">
          <Working
            zh="正在修復照片"
            en="Restoring the photo. This takes about half a minute."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col pt-8 lg:grid lg:grid-cols-[6fr_5fr] lg:items-start lg:gap-12 lg:pt-10">
      {inputs}
      <div className="order-2 mt-6 lg:order-1 lg:mt-0">
        {photo.restored ? (
          <Compare before={photo.original} after={photo.restored} />
        ) : (
          <img
            src={photo.original}
            alt="原本的照片"
            className="w-full rounded-card"
          />
        )}
      </div>

      <div className="order-1 flex flex-col lg:order-2 lg:min-h-full">
        {photo.restored ? (
          <>
            <Title zh="照片修好了" en="The photo is restored" />
            <Bi
              className="mt-4 text-sub"
              zh="左右拖曳比較。修復後的照片由 AI 重繪，細節可能和原本略有不同。"
              en="Drag to compare. The restored photo is redrawn by AI, so small details may differ from the original."
            />
          </>
        ) : (
          <Title
            zh="這次先用原本的照片"
            en="We'll use the original photo this time"
          />
        )}
        {photo.sampleRestore && (
          <div className="mt-4">
            <Sample zh="示範圖" en="Bundled sample, not a live result" />
          </div>
        )}
        <div className="mt-8 hidden flex-col gap-3 lg:flex">
          <Button
            className="md:w-full"
            zh="開始聊這張照片"
            en="Start talking about this photo"
            onClick={() => {
              primeVoice();
              onReady(photo);
            }}
          />
          <Button
            className="md:w-full"
            variant="secondary"
            zh="換一張照片"
            en="Choose a different photo"
            onClick={() => {
              setPhoto(null);
              setStatus("idle");
            }}
          />
        </div>
      </div>

      <div className="order-3 mt-auto pt-4 lg:hidden">
        <Actions>
          <Button
            zh="開始聊這張照片"
            en="Start talking about this photo"
            onClick={() => {
              primeVoice();
              onReady(photo);
            }}
          />
          <Button
            variant="secondary"
            zh="換一張照片"
            en="Choose a different photo"
            onClick={() => {
              setPhoto(null);
              setStatus("idle");
            }}
          />
        </Actions>
      </div>
    </section>
  );
}
