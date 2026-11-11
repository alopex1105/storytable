// Reads a line aloud. First choice is the natural voice from the backend;
// if that is unavailable, the browser's built-in voice is used instead.

import { speakAudio } from "./api";
import { primeSpeech, speak, stopSpeaking } from "./speech";

let player: HTMLAudioElement | null = null;
let primed = false;
let turn = 0;
// Once the backend voice has failed, go straight to the built-in voice so a
// tap on "hear it again" speaks at once instead of waiting on the network.
let natural = true;
const cache = new Map<string, string>();

function getPlayer(): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;
  player ??= new Audio();
  return player;
}

/** A twentieth of a second of real silence, as a WAV the browser can decode. */
function silence(): string {
  const samples = 400;
  const bytes = new Uint8Array(44 + samples);
  const view = new DataView(bytes.buffer);
  const text = (at: number, s: string) =>
    [...s].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
  text(0, "RIFF");
  view.setUint32(4, 36 + samples, true);
  text(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true);
  view.setUint32(28, 8000, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  text(36, "data");
  view.setUint32(40, samples, true);
  bytes.fill(128, 44);
  return URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
}

/**
 * Call from a tap, before any line needs to be read. Phones only allow sound
 * that was first started by the person's own tap.
 */
export function primeVoice() {
  primeSpeech();
  if (primed) return;
  primed = true;
  const audio = getPlayer();
  if (!audio) return;
  try {
    audio.src = silence();
    audio.play().catch(() => {});
  } catch {
    // reading aloud is optional
  }
}

export function stopVoice() {
  turn++;
  if (player && !player.paused) player.pause();
  stopSpeaking();
}

/** Reads the text aloud. A newer call, or stopVoice(), cancels an older one. */
export async function sayAloud(text: string): Promise<void> {
  if (!text) return;
  stopVoice();
  const mine = turn;

  let url = cache.get(text);
  if (!url && natural) {
    const audio = await speakAudio(text);
    if (mine !== turn) return;
    if (audio) {
      url = URL.createObjectURL(audio);
      cache.set(text, url);
    } else {
      natural = false;
    }
  }

  const audio = getPlayer();
  if (url && audio) {
    try {
      audio.src = url;
      await audio.play();
      return;
    } catch {
      // fall through to the built-in voice
    }
  }
  if (mine === turn) await speak(text);
}
