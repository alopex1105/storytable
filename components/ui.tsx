import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Chinese first, English under it. */
export function Bi({
  zh,
  en,
  className = "",
  enClassName = "",
}: {
  zh: ReactNode;
  en: ReactNode;
  className?: string;
  enClassName?: string;
}) {
  return (
    <div className={className}>
      <div>{zh}</div>
      <div
        lang="en"
        className={`mt-1 text-base leading-snug font-normal text-sub ${enClassName}`}
      >
        {en}
      </div>
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  zh: string;
  en: string;
  variant?: "primary" | "secondary" | "quiet";
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
  const look = {
    primary:
      "bg-accent text-white shadow-[0_2px_0_var(--color-accent-deep)] active:translate-y-px active:shadow-none disabled:bg-line disabled:text-sub disabled:shadow-none",
    secondary:
      "border-2 border-line bg-card text-ink active:bg-accent-soft disabled:text-sub",
    quiet: "text-sub underline underline-offset-4 active:text-ink",
  }[variant];
  const enLook = {
    primary: "text-white/85",
    secondary: "text-sub",
    quiet: "text-sub",
  }[variant];
  return (
    <button
      type="button"
      className={`flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl px-5 py-3 text-center transition ${look} ${className}`}
      {...rest}
    >
      {icon}
      <span>
        <span className="block text-[22px] leading-tight font-semibold">
          {zh}
        </span>
        <span
          lang="en"
          className={`mt-0.5 block text-sm leading-tight ${rest.disabled ? "text-sub" : enLook}`}
        >
          {en}
        </span>
      </span>
    </button>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block size-7 animate-spin rounded-full border-[3px] border-accent/25 border-t-accent ${className}`}
    />
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-honey-soft px-3 py-0.5 text-sm font-medium text-honey">
      {children}
    </span>
  );
}

/** A photo shown like a print: white border, soft shadow. */
export function Print({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- in-memory data URLs
    <img
      src={src}
      alt={alt}
      className={`block rounded-sm border-[6px] border-white bg-white object-cover shadow-[0_6px_18px_rgb(43_36_32/0.18)] ${className}`}
    />
  );
}
