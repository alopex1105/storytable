const STEPS = [
  { zh: "同意", en: "Consent" },
  { zh: "照片", en: "Photo" },
  { zh: "聊聊", en: "Talk" },
  { zh: "故事", en: "Story" },
  { zh: "筆記", en: "Note" },
];

export function StepBar({ current }: { current: number }) {
  return (
    <ol
      className="grid grid-cols-5 gap-1.5"
      aria-label={`第 ${current + 1} 步，共 5 步`}
    >
      {STEPS.map((step, i) => {
        const state = i < current ? "done" : i === current ? "now" : "next";
        return (
          <li key={step.en} aria-current={state === "now" ? "step" : undefined}>
            <div
              className={`h-1.5 rounded-full ${
                state === "next" ? "bg-line" : "bg-accent"
              } ${state === "done" ? "opacity-45" : ""}`}
            />
            <div
              className={`mt-1.5 text-center text-[15px] leading-tight ${
                state === "now" ? "font-semibold text-ink" : "text-sub"
              }`}
            >
              {step.zh}
              <span lang="en" className="block text-[11px] font-normal text-sub">
                {step.en}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
