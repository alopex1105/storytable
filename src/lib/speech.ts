// Thin wrappers over the browser's built-in speech APIs (zh-TW).

type RecognitionEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

export type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function canRecognize(): boolean {
  return recognitionCtor() !== null;
}

export function createRecognition(lang = "zh-TW"): Recognition | null {
  const Ctor = recognitionCtor();
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = lang;
  rec.interimResults = true;
  rec.continuous = false;
  return rec;
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/** Reads text aloud. Resolves when it finishes, or at once if unsupported. */
export function speak(text: string, lang = "zh-TW"): Promise<void> {
  return new Promise((resolve) => {
    if (
      !text ||
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      resolve();
      return;
    }
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      const voice = synth
        .getVoices()
        .find((v) => v.lang.replace("_", "-").toLowerCase() === "zh-tw");
      if (voice) utterance.voice = voice;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      synth.speak(utterance);
    } catch {
      resolve();
    }
  });
}
