import type { ButtonHTMLAttributes, ReactNode } from "react";
import { usePair } from "@/lib/lang";

/** A screen title: Chinese first, English under it. */
export function Title({ zh, en }: { zh: ReactNode; en: ReactNode }) {
  const [main, sub, subLang] = usePair()(zh, en);
  return (
    <div>
      <h1 className="text-xl font-semibold text-balance">{main}</h1>
      <p lang={subLang} className="mt-1 text-sm text-sub">
        {sub}
      </p>
    </div>
  );
}

/** Body text with its English under it. */
export function Bi({
  zh,
  en,
  className = "",
}: {
  zh: ReactNode;
  en: ReactNode;
  className?: string;
}) {
  const [main, sub, subLang] = usePair()(zh, en);
  return (
    <div className={className}>
      <p>{main}</p>
      <p lang={subLang} className="mt-1 text-sm font-normal text-sub">
        {sub}
      </p>
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  zh: string;
  en: string;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
  /** Shows a spinner in place of the icon and blocks further taps. */
  loading?: boolean;
};

export function Button({
  zh,
  en,
  variant = "primary",
  icon,
  loading = false,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  const [main, sub, subLang] = usePair()(zh, en);
  const look =
    variant === "primary"
      ? "bg-ink text-bg hover:opacity-90 disabled:bg-fill disabled:text-sub disabled:opacity-100"
      : "bg-fill text-ink hover:bg-fill-hover active:bg-fill-press disabled:text-sub disabled:hover:bg-fill";
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`flex min-h-14 w-full items-center justify-center gap-3 rounded-full px-6 py-2 text-center transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:active:scale-100 ${look} ${className}`}
      {...rest}
    >
      {loading ? <Spinner inherit /> : icon}
      <span>
        <span className="block leading-tight font-semibold">{main}</span>
        <span lang={subLang} className="block text-sm opacity-70">
          {sub}
        </span>
      </span>
    </button>
  );
}

/**
 * The action area. On a phone it sticks to the bottom as a frosted bar so the
 * main button is always in reach; on wider screens it sits under the content.
 */
export function Actions({
  children,
  sticky = true,
  columns = false,
}: {
  children: ReactNode;
  sticky?: boolean;
  columns?: boolean;
}) {
  return (
    <div
      className={`-mx-5 mt-auto px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] print:hidden md:static md:mx-0 md:mt-10 md:px-0 md:pt-0 md:pb-12 ${
        sticky ? "bar-glass sticky bottom-0 z-10" : ""
      }`}
    >
      <div
        className={
          columns
            ? "grid grid-cols-[2fr_3fr] gap-3 md:grid-cols-2"
            : "flex flex-col gap-3 md:flex-row-reverse md:[&>*]:flex-1"
        }
      >
        {children}
      </div>
    </div>
  );
}

export function Spinner({ inherit = false }: { inherit?: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-block size-6 shrink-0 animate-spin rounded-full border-2 ${
        inherit
          ? "border-current border-t-transparent opacity-70"
          : "border-line-strong border-t-ink"
      }`}
    />
  );
}

/** A line that says what the app is doing right now. */
export function Working({ zh, en }: { zh: string; en: string }) {
  return (
    <div className="flex items-start gap-4" aria-live="polite">
      <span className="mt-1">
        <Spinner />
      </span>
      <Bi zh={zh} en={en} />
    </div>
  );
}

/** Marks bundled sample content so it is never mistaken for a live result. */
export function Sample({ zh, en }: { zh: string; en: string }) {
  const [main, sub, subLang] = usePair()(zh, en);
  return (
    <p className="text-sm text-sub">
      {main}
      <span lang={subLang} className="ml-2">
        {sub}
      </span>
    </p>
  );
}

/** A short inline pair: the leading language, then the other, muted. */
export function Two({ zh, en }: { zh: ReactNode; en: ReactNode }) {
  const [main, sub, subLang] = usePair()(zh, en);
  return (
    <>
      {main}
      <span lang={subLang} className="ml-2 text-sm font-normal text-sub">
        {sub}
      </span>
    </>
  );
}

/** A stacked pair inside something else: leading line, then a small line. */
export function Stack({ zh, en }: { zh: ReactNode; en: ReactNode }) {
  const [main, sub, subLang] = usePair()(zh, en);
  return (
    <>
      <span className="block">{main}</span>
      <span lang={subLang} className="block text-sm font-normal text-sub">
        {sub}
      </span>
    </>
  );
}

/** An on/off switch with its label beside it. */
export function Switch({
  on,
  onChange,
  zh,
  en,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
  zh: string;
  en: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={zh}
        onClick={() => onChange(!on)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-150 ease-out ${
          on ? "bg-ink" : "bg-line-strong"
        }`}
      >
        <span
          className={`absolute top-1 left-1 size-6 rounded-full transition-[transform,background-color] duration-150 ease-out ${
            on ? "translate-x-6 bg-bg" : "bg-white"
          }`}
        />
      </button>
      <span>
        <Two zh={zh} en={en} />
      </span>
    </label>
  );
}
