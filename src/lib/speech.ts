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

function synth(): SpeechSynthesis | null {
  return typeof window !== "undefined" && "speechSynthesis" in window
    ? window.speechSynthesis
    : null;
}

// Browsers can drop an utterance that nothing refers to before it is spoken.
let current: SpeechSynthesisUtterance | null = null;
let primed = false;

/** The most natural zh-TW voice this device offers, if any. */
function pickVoice(engine: SpeechSynthesis): SpeechSynthesisVoice | undefined {
  const voices = engine
    .getVoices()
    .filter((v) => v.lang.replace("_", "-").toLowerCase() === "zh-tw");
  const score = (v: SpeechSynthesisVoice) =>
    (/premium|enhanced|natural|siri/i.test(v.name) ? 2 : 0) +
    (/google/i.test(v.name) ? 1 : 0);
  return voices.sort((a, b) => score(b) - score(a))[0];
}

/**
 * Call from a tap. Phones only let a page speak once an utterance has
 * started inside a user gesture, and the questions arrive later, after a
 * network call. One real syllable at zero volume does it; an empty or
 * blank utterance can stall the speech queue in some browsers.
 */
export function primeSpeech() {
  const engine = synth();
  if (!engine || primed) return;
  primed = true;
  try {
    const quiet = new SpeechSynthesisUtterance("嗯");
    quiet.lang = "zh-TW";
    quiet.volume = 0;
    quiet.rate = 2;
    current = quiet;
    engine.speak(quiet);
  } catch {
    // reading aloud is optional
  }
}

export function stopSpeaking() {
  const engine = synth();
  if (engine && (engine.speaking || engine.pending)) engine.cancel();
}

/** Reads text aloud. Resolves when it finishes, or at once if unsupported. */
export function speak(text: string, lang = "zh-TW"): Promise<void> {
  return new Promise((resolve) => {
    const engine = synth();
    if (!text || !engine) {
      resolve();
      return;
    }
    try {
      const busy = engine.speaking || engine.pending;
      if (busy) engine.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      utterance.volume = 1;
      const voice = pickVoice(engine);
      if (voice) utterance.voice = voice;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      current = utterance;
      // Speaking straight after a cancel is dropped by some browsers.
      if (busy) setTimeout(() => engine.speak(utterance), 120);
      else engine.speak(utterance);
    } catch {
      resolve();
    }
  });
}
