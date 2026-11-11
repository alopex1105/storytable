import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { currentTheme, setTheme, type Theme } from "@/lib/theme";

const STEPS = [
  { zh: "同意", en: "Consent" },
  { zh: "照片", en: "Photo" },
  { zh: "聊聊", en: "Talk" },
  { zh: "故事", en: "Story" },
  { zh: "筆記", en: "Note" },
];

/**
 * The top bar: frosted, always in view, with the step, progress and the
 * light/dark switch. `frame` is the same width class the page below uses, so
 * the bar's edges line up with the content.
 */
export function StepBar({ current, frame }: { current: number; frame: string }) {
  const step = STEPS[current];
  const [theme, setShown] = useState<Theme>(() => currentTheme());

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setShown(next);
  }

  return (
    <header className="bar-glass-top sticky top-0 z-20 pt-[env(safe-area-inset-top)] print:hidden">
      <div className={`mx-auto w-full px-5 pt-2 pb-3 md:px-8 ${frame}`}>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold">StoryTable 膳心人事</span>
          <span className="flex items-center gap-2">
            <span className="text-sub">
              {step.zh}
              <span lang="en" className="ml-2">
                {step.en}
              </span>
            </span>
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === "dark" ? "切換成淺色" : "切換成深色"}
              title={theme === "dark" ? "Switch to light" : "Switch to dark"}
              className="-mr-2 grid size-10 place-items-center rounded-full transition-[transform,background-color] duration-150 ease-out hover:bg-fill active:scale-[0.94] active:bg-fill-press"
            >
              {theme === "dark" ? (
                <Sun aria-hidden size={20} strokeWidth={1.5} />
              ) : (
                <Moon aria-hidden size={20} strokeWidth={1.5} />
              )}
            </button>
          </span>
        </div>
        <ol
          className="mt-1 grid grid-cols-5 gap-1"
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
