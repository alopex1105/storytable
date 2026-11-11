// Which language leads. Chinese first by default; English first puts the
// English line large and the Chinese line small under it.

import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "zh" | "en";

const KEY = "storytable-lang";

function initial(): Lang {
  try {
    const asked = new URLSearchParams(window.location.search).get("lang");
    if (asked === "en" || asked === "zh") return asked;
    if (localStorage.getItem(KEY) === "en") return "en";
  } catch {
    // fall through to Chinese first
  }
  return "zh";
}

const Context = createContext<{ lang: Lang; toggle: () => void }>({
  lang: "zh",
  toggle: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initial);
  const toggle = () =>
    setLang((now) => {
      const next: Lang = now === "en" ? "zh" : "en";
      try {
        localStorage.setItem(KEY, next);
      } catch {
        // the choice simply will not be remembered
      }
      return next;
    });
  return <Context.Provider value={{ lang, toggle }}>{children}</Context.Provider>;
}

export function useLang() {
  return useContext(Context);
}

/**
 * Orders a Chinese/English pair: [leading, secondary, the secondary's lang].
 */
export function usePair() {
  const { lang } = useLang();
  return function pair<T>(zh: T, en: T): [T, T, Lang] {
    return lang === "en" ? [en, zh, "zh"] : [zh, en, "en"];
  };
}
