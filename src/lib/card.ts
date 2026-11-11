// Draws the story card onto a canvas so it can be saved or shared as one
// image. Done by hand, with no extra library, and entirely in the browser.

import type { Recorded } from "./types";

const W = 1080;
const PAD = 64;
const INNER = W - PAD * 2;
const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang TC", "Microsoft JhengHei", "Noto Sans CJK TC", "Noto Sans TC", sans-serif';
const INK = "#21201c";
const SUB = "#63635e";
const FILL = "#f1f0ef";
const SURFACE = "#ffffff";

type Line = {
  text: string;
  size: number;
  weight?: number;
  color?: string;
  gap: number; // space above this paragraph
  indent?: number;
  prefix?: string; // drawn in the indent, e.g. a step number
  panel?: boolean; // sits on the recipe panel
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("could not load the photo"));
    img.src = src;
  });
}

/** Breaks text to a width: Latin by word, Chinese by character. */
function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const tokens = text.match(/[⺀-鿿＀-￯]|[^\s⺀-鿿＀-￯]+\s*|\s+/g) ?? [];
  const rows: string[] = [];
  let row = "";
  for (const token of tokens) {
    if (row && ctx.measureText((row + token).trimEnd()).width > width) {
      rows.push(row.trimEnd());
      row = token.trimStart();
    } else {
      row += token;
    }
  }
  if (row.trim()) rows.push(row.trimEnd());
  return rows;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function renderCard(input: {
  photo: string;
  story: Recorded["story"];
  recipe: Recorded["recipe"];
  elder: string;
}): Promise<Blob> {
  const photo = await loadImage(input.photo);
  const photoH = Math.round((INNER * 4) / 5);

  const lines: Line[] = [
    { text: input.story.title_zh, size: 64, weight: 600, gap: 56 },
    { text: input.story.title_en, size: 30, color: SUB, gap: 12 },
    ...input.story.lines_zh.map((text, i) => ({ text, size: 46, gap: i ? 14 : 48 })),
    { text: input.story.lines_en.join(" "), size: 30, color: SUB, gap: 20 },
  ];
  const steps = input.recipe.steps_zh;
  if (steps.length) {
    lines.push({
      text: `${input.recipe.name_zh}　${input.elder}口述`,
      size: 40,
      weight: 600,
      gap: 96,
      panel: true,
    });
    steps.forEach((text, i) => {
      lines.push({ text, size: 40, gap: 28, indent: 64, prefix: String(i + 1), panel: true });
      const en = input.recipe.steps_en[i];
      if (en) lines.push({ text: en, size: 28, color: SUB, gap: 6, indent: 64, panel: true });
    });
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  const font = (line: Line) => `${line.weight ?? 400} ${line.size}px ${FONT}`;

  // Pass 1: wrap and measure.
  type Placed = Line & { rows: string[]; y: number };
  const placed: Placed[] = [];
  let y = PAD + photoH;
  let panelTop = 0;
  for (const line of lines) {
    if (!line.text) continue;
    ctx.font = font(line);
    const width = INNER - (line.panel ? 80 : 16) - (line.indent ?? 0);
    const rows = wrap(ctx, line.text, width);
    y += line.gap;
    if (line.panel && !panelTop) panelTop = y - 40;
    placed.push({ ...line, rows, y });
    y += rows.length * Math.round(line.size * 1.4);
  }
  const panelBottom = panelTop ? y + 40 : 0;
  const footerY = (panelBottom || y) + 56;
  const height = footerY + 28 + PAD;

  // Pass 2: draw.
  canvas.width = W;
  canvas.height = height;
  ctx.fillStyle = SURFACE;
  ctx.fillRect(0, 0, W, height);

  ctx.save();
  roundRect(ctx, PAD, PAD, INNER, photoH, 24);
  ctx.clip();
  const scale = Math.max(INNER / photo.width, photoH / photo.height);
  const drawW = photo.width * scale;
  const drawH = photo.height * scale;
  ctx.drawImage(photo, PAD + (INNER - drawW) / 2, PAD - (drawH - photoH) * 0.18, drawW, drawH);
  ctx.restore();

  if (panelTop) {
    ctx.fillStyle = FILL;
    roundRect(ctx, PAD, panelTop, INNER, panelBottom - panelTop, 24);
    ctx.fill();
  }

  ctx.textBaseline = "top";
  for (const line of placed) {
    ctx.font = font(line);
    const x = PAD + (line.panel ? 40 : 8) + (line.indent ?? 0);
    const rowH = Math.round(line.size * 1.4);
    if (line.prefix) {
      ctx.fillStyle = SUB;
      ctx.fillText(line.prefix, x - (line.indent ?? 0), line.y);
    }
    ctx.fillStyle = line.color ?? INK;
    line.rows.forEach((row, i) => ctx.fillText(row, x, line.y + i * rowH));
  }

  ctx.font = `400 28px ${FONT}`;
  ctx.fillStyle = SUB;
  ctx.fillText("StoryTable 膳心人事", PAD + 8, footerY);

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("could not make the image"))),
      "image/png",
    ),
  );
}
