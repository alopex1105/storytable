// Reads a line aloud. First choice is the natural voice from the backend;
// if that is unavailable, the browser's built-in voice is used instead.

import { speakAudio } from "./api";
import { primeSpeech, speak, stopSpeaking } from "./speech";

// An empty WAV. Playing it inside a tap lets the phone play real audio later.
const SILENT =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

let player: HTMLAudioElement | null = null;
let turn = 0;
const cache = new Map<string, string>();

function getPlayer(): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;
  player ??= new Audio();
  return player;
}

/** Call from a tap, before any line needs to be read. */
export function primeVoice() {
  primeSpeech();
  const audio = getPlayer();
  if (!audio) return;
  try {
    audio.src = SILENT;
    audio.play().catch(() => {});
  } catch {
    // reading aloud is optional
  }
}

export function stopVoice() {
  turn++;
  player?.pause();
  stopSpeaking();
}

/** Reads the text aloud. A newer call, or stopVoice(), cancels an older one. */
export async function sayAloud(text: string): Promise<void> {
  if (!text) return;
  stopVoice();
  const mine = turn;

  let url = cache.get(text);
  if (!url) {
    const audio = await speakAudio(text);
    if (mine !== turn) return;
    if (audio) {
      url = URL.createObjectURL(audio);
      cache.set(text, url);
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
