const STEPS = [
  { zh: "同意", en: "Consent" },
  { zh: "照片", en: "Photo" },
  { zh: "聊聊", en: "Talk" },
  { zh: "故事", en: "Story" },
  { zh: "筆記", en: "Note" },
];

/** The top bar: frosted, always in view, with the step and progress. */
export function StepBar({ current }: { current: number }) {
  const step = STEPS[current];
  return (
    <header className="bar-glass-top sticky top-0 z-20 pt-[env(safe-area-inset-top)] print:hidden">
      <div className="mx-auto w-full max-w-[480px] px-5 pt-3 pb-3 md:max-w-[1000px] md:px-8">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold">StoryTable 膳心人事</span>
          <span className="text-sub">
            {step.zh}
            <span lang="en" className="ml-2">
              {step.en}
            </span>
          </span>
        </div>
        <ol
          className="mt-2 grid grid-cols-5 gap-1"
          aria-label={`第 ${current + 1} 步，共 ${STEPS.length} 步：${step.zh}`}
        >
          {STEPS.map((s, i) => (
            <li
              key={s.en}
              className={`h-1 rounded-full transition-colors duration-300 ease-out ${
                i <= current ? "bg-ink" : "bg-fill-press"
              }`}
            />
          ))}
        </ol>
      </div>
    </header>
  );
}
