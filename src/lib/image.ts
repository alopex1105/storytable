const LONG_SIDE = 1024;
const QUALITY = 0.85;

/**
 * Turn a picked file into a JPEG data URL: EXIF orientation applied, long side
 * at most 1024 px. The photo only ever lives in memory.
 */
export async function toResizedDataUrl(source: Blob): Promise<string> {
  let bitmap: ImageBitmap | HTMLImageElement;
  try {
    bitmap = await createImageBitmap(source, {
      imageOrientation: "from-image",
    });
  } catch {
    bitmap = await loadImage(source);
  }
  const scale = Math.min(1, LONG_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);
  if ("close" in bitmap) bitmap.close();
  return canvas.toDataURL("image/jpeg", QUALITY);
}

function loadImage(source: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("could not read image"));
    };
    img.src = url;
  });
}
