import { useCallback, useEffect, useState } from "react";
import { CoachStep } from "@/components/storytable/CoachStep";
import { ConsentStep } from "@/components/storytable/ConsentStep";
import { HandoffStep, NoteStep } from "@/components/storytable/NoteStep";
import { PhotoStep } from "@/components/storytable/PhotoStep";
import { StepBar } from "@/components/storytable/StepBar";
import { StoryStep } from "@/components/storytable/StoryStep";
import { SummaryStep } from "@/components/storytable/SummaryStep";
import { TalkStep } from "@/components/storytable/TalkStep";
import { analyzeTalk } from "@/lib/api";
import { buildNote } from "@/lib/awareness";
import { DEMO_NAMES, isDemoScript, SAMPLE_RECORDED } from "@/lib/demo";
import type { AnalyzeResult, Names, Photo, Turn } from "@/lib/types";

type Step =
  | "consent"
  | "photo"
  | "talk"
  | "story"
  | "handoff"
  | "note"
  | "summary"
  | "coach";

const BAR: Record<Step, number> = {
  consent: 0,
  photo: 1,
  talk: 2,
  story: 3,
  handoff: 4,
  note: 4,
  summary: 4,
  coach: 4,
};

// Everything lives in React state: a refresh clears the whole session.
export default function Index() {
  const [step, setStep] = useState<Step>("consent");
  const [demo, setDemo] = useState(false);
  const [names, setNames] = useState<Names>({ elder: "", child: "" });
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const analyze = useCallback(
    async (all: Turn[]) => {
      setFailed(false);
      setResult(null);
      try {
        setResult(await analyzeTalk(all, names));
      } catch {
        if (demo && isDemoScript(all)) {
          setResult({
            ...SAMPLE_RECORDED,
            note: buildNote(SAMPLE_RECORDED),
            sample: true,
          });
        } else {
          setFailed(true);
        }
      }
    },
    [demo, names],
  );

  const finishTalk = useCallback(
    (all: Turn[]) => {
      setTurns(all);
      setStep("story");
      analyze(all);
    },
    [analyze],
  );

  function agree() {
    setNames({
      elder: names.elder.trim() || (demo ? DEMO_NAMES.elder : "長輩"),
      child: names.child.trim() || (demo ? DEMO_NAMES.child : "家人"),
    });
    setStep("photo");
  }

  function restart() {
    setStep("consent");
    setNames({ elder: "", child: "" });
    setPhoto(null);
    setTurns([]);
    setResult(null);
    setFailed(false);
  }

  // The talk and photo screens use two columns on a wide screen.
  const wide = step === "talk" || step === "photo";

  return (
    <div className="flex min-h-dvh flex-col print:block print:min-h-0">
      <StepBar current={BAR[step]} />
      <main
        key={step}
        className={`enter mx-auto flex w-full max-w-[480px] flex-1 flex-col px-5 md:px-8 print:block print:max-w-none print:px-0 ${
          wide ? "md:max-w-[640px] lg:max-w-[1000px]" : "md:max-w-[640px]"
        }`}
      >
      {step === "consent" && (
        <ConsentStep
          names={names}
          onNames={setNames}
          demo={demo}
          onDemo={(on) => {
            setDemo(on);
            if (on) setNames(DEMO_NAMES);
          }}
          onAgree={agree}
        />
      )}
      {step === "photo" && (
        <PhotoStep
          onReady={(picked) => {
            setPhoto(picked);
            setStep("talk");
          }}
        />
      )}
      {step === "talk" && photo && (
        <TalkStep photo={photo} names={names} demo={demo} onDone={finishTalk} />
      )}
      {step === "story" && photo && (
        <StoryStep
          photo={photo}
          names={names}
          turns={turns}
          result={result}
          failed={failed}
          onRetry={() => analyze(turns)}
          onNext={() => setStep("handoff")}
        />
      )}
      {step === "handoff" && (
        <HandoffStep names={names} onOpen={() => setStep("note")} />
      )}
      {step === "note" && result && (
        <NoteStep
          names={names}
          result={result}
          onSummary={() => setStep("summary")}
          onCoach={() => setStep("coach")}
          onRestart={restart}
        />
      )}
      {step === "summary" && result && (
        <SummaryStep
          names={names}
          result={result}
          onBack={() => setStep("note")}
        />
      )}
      {step === "coach" && result && (
        <CoachStep
          names={names}
          result={result}
          onBack={() => setStep("note")}
        />
      )}
      </main>
    </div>
  );
}
