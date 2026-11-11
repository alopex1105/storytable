const STEPS = [
  { zh: "同意", en: "Consent" },
  { zh: "照片", en: "Photo" },
  { zh: "聊聊", en: "Talk" },
  { zh: "故事", en: "Story" },
  { zh: "筆記", en: "Note" },
];

export function StepBar({ current }: { current: number }) {
  const step = STEPS[current];
  return (
    <header className="pt-4 print:hidden">
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
        className="mt-3 grid grid-cols-5 gap-1"
        aria-label={`第 ${current + 1} 步，共 ${STEPS.length} 步：${step.zh}`}
      >
        {STEPS.map((s, i) => (
          <li
            key={s.en}
            className={`h-1 rounded-full ${i <= current ? "bg-ink" : "bg-fill-press"}`}
          />
        ))}
      </ol>
    </header>
  );
}
