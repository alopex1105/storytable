import { Camera } from "lucide-react";
import { useRef, useState } from "react";
import { DEMO_PHOTO, DEMO_PHOTO_RESTORED } from "@/lib/demo";
import { restorePhoto } from "@/lib/api";
import { toResizedDataUrl } from "@/lib/image";
import type { Photo } from "@/lib/types";
import { Actions, Bi, Button, Sample, Title, Working } from "./ui";

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
      <section className="flex flex-1 flex-col pt-8">
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
          onClick={() => cameraRef.current?.click()}
          className="mt-6 flex min-h-56 flex-1 flex-col items-center justify-center gap-3 rounded-card bg-fill transition-transform duration-150 ease-out active:scale-[0.97] active:bg-fill-press"
        >
          <Camera aria-hidden size={40} strokeWidth={1.5} />
          <span className="text-center">
            <span className="block leading-tight font-semibold">拍照</span>
            <span lang="en" className="block text-sm text-sub">
              Take a photo
            </span>
          </span>
        </button>
        <Actions sticky={false}>
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
        </Actions>
      </section>
    );
  }

  if (status === "restoring" || !photo) {
    return (
      <section className="flex flex-1 flex-col pt-8 pb-8">
        {inputs}
        {photo && (
          <img
            src={photo.original}
            alt="原本的照片"
            className="w-full rounded-card"
          />
        )}
        <div className="mt-6">
          <Working
            zh="正在修復照片"
            en="Restoring the photo. This takes about 20 seconds."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col pt-8">
      {inputs}
      {photo.restored ? (
        <>
          <Title zh="照片修好了" en="The photo is restored" />
          <div className="mt-6 grid grid-cols-2 gap-3">
            <figure>
                      <img
                src={photo.original}
                alt="原本的照片"
                className="w-full rounded-tile"
              />
              <figcaption className="mt-2 text-sub">
                原本
                <span lang="en" className="ml-2 text-sm">
                  Before
                </span>
              </figcaption>
            </figure>
            <figure>
                      <img
                src={photo.restored}
                alt="修復後的照片"
                className="w-full rounded-tile"
              />
              <figcaption className="mt-2 font-semibold">
                修復後
                <span lang="en" className="ml-2 text-sm font-normal text-sub">
                  After
                </span>
              </figcaption>
            </figure>
          </div>
          {photo.sampleRestore && (
            <div className="mt-4">
              <Sample zh="示範圖" en="Bundled sample, not a live result" />
            </div>
          )}
        </>
      ) : (
        <>
          <Title
            zh="這次先用原本的照片"
            en="We'll use the original photo this time"
          />
              <img
            src={photo.original}
            alt="原本的照片"
            className="mt-6 w-full rounded-card"
          />
        </>
      )}

      <div className="pt-4" />
      <Actions>
        <Button
          zh="開始聊這張照片"
          en="Start talking about this photo"
          onClick={() => onReady(photo)}
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
    </section>
  );
}
