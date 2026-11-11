export type Names = { elder: string; child: string };

export type Turn = { q_zh: string; q_en: string; a: string; skipped?: boolean };

export type Topic = "people" | "time_place" | "food" | "recipe";

/** What /api/interview returns. */
export type InterviewResponse =
  | {
      done: false;
      ack_zh: string;
      ack_en: string;
      question_zh: string;
      question_en: string;
      topic: Topic;
    }
  | { done: true; closing_zh: string; closing_en: string };

export type MomentType =
  | "naming"
  | "word_finding"
  | "time_place"
  | "sequence"
  | "repetition";

export type Confidence = "low" | "medium" | "high";

export type Moment = {
  type: MomentType;
  turn: number;
  quote: string;
  why_zh: string;
  why_en: string;
  confidence: Confidence;
};

/** What the model records about one conversation. It never sets a level. */
export type Recorded = {
  moments: Moment[];
  possible_hearing_issue: boolean;
  story: {
    title_zh: string;
    title_en: string;
    lines_zh: string[];
    lines_en: string[];
  };
  recipe: { name_zh: string; steps_zh: string[]; steps_en: string[] };
};

export type NoteItem = {
  type: MomentType;
  turn: number;
  quote: string;
  why_zh: string;
  why_en: string;
  label_zh: string;
  label_en: string;
  signs: number[];
};

export type Level = 0 | 1 | 2;

export type Note = {
  level: Level;
  items: NoteItem[];
  summary_zh: string;
  summary_en: string;
  hearing: boolean;
  /** The whole note as plain text, for sharing. */
  text_zh: string;
  text_en: string;
};

export type AnalyzeResult = Recorded & { note: Note; sample?: boolean };

export type Photo = {
  original: string;
  restored: string | null;
  /** True when the restored image is the bundled demo one, not a live result. */
  sampleRestore?: boolean;
};

// --- Conversation coach (for the family member, after the note) ---

export type Persona = "denies" | "worries" | "annoyed";

export type CoachLine = { role: "child" | "elder"; text: string; text_en?: string };

export type Opener = { zh: string; en: string };

/** What the coach function returns for one turn. */
export type CoachResponse = {
  reply_zh: string;
  reply_en: string;
  done: boolean;
  openers: Opener[];
  source: "model" | "fixed";
};
