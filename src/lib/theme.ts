// Light or dark. Follows the device until the person picks one; the choice is
// the only thing this app keeps on the device.

export type Theme = "light" | "dark";

const KEY = "storytable-theme";

export function currentTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) =>
      meta.setAttribute("content", theme === "dark" ? "#262624" : "#f8f6f2"),
    );
}

export function setTheme(theme: Theme) {
  apply(theme);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // the choice simply will not be remembered
  }
}

/** Restores an earlier choice. Call before the first render. */
export function initTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") apply(saved);
  } catch {
    // follow the device
  }
}
