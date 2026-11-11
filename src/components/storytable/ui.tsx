import type { ButtonHTMLAttributes, ReactNode } from "react";

/** A screen title: Chinese first, English under it. */
export function Title({ zh, en }: { zh: ReactNode; en: ReactNode }) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-balance">{zh}</h1>
      <p lang="en" className="mt-1 text-sm text-sub">
        {en}
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
  return (
    <div className={className}>
      <p>{zh}</p>
      <p lang="en" className="mt-1 text-sm font-normal text-sub">
        {en}
      </p>
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  zh: string;
  en: string;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
};

export function Button({
  zh,
  en,
  variant = "primary",
  icon,
  className = "",
  ...rest
}: ButtonProps) {
  const look =
    variant === "primary"
      ? "bg-ink text-bg disabled:bg-fill disabled:text-sub"
      : "bg-fill text-ink active:bg-fill-press disabled:text-sub";
  return (
    <button
      type="button"
      className={`flex min-h-16 w-full items-center justify-center gap-3 rounded-full px-6 py-2 text-center transition-transform duration-150 ease-out active:scale-[0.97] disabled:active:scale-100 ${look} ${className}`}
      {...rest}
    >
      {icon}
      <span>
        <span className="block leading-tight font-semibold">{zh}</span>
        <span lang="en" className="block text-sm opacity-70">
          {en}
        </span>
      </span>
    </button>
  );
}

/** The bottom action area. Sticky so the main button is always in reach. */
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
      className={`-mx-5 mt-auto bg-bg px-5 pt-4 pb-6 print:hidden ${sticky ? "sticky bottom-0" : ""}`}
    >
      <div
        className={
          columns ? "grid grid-cols-[2fr_3fr] gap-3" : "flex flex-col gap-3"
        }
      >
        {children}
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block size-6 shrink-0 animate-spin rounded-full border-2 border-line-strong border-t-ink"
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
  return (
    <p className="text-sm text-sub">
      {zh}
      <span lang="en" className="ml-2">
        {en}
      </span>
    </p>
  );
}
