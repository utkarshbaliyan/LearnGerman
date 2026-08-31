"use client";

import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "leselaut:theme";

export function ThemeToggle() {
  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* The selected theme still applies for this visit. */ }
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle light and dark mode"
      title="Toggle light and dark mode"
    >
      <Moon className="theme-icon-light" aria-hidden="true" />
      <Sun className="theme-icon-dark" aria-hidden="true" />
      <span>Theme</span>
    </button>
  );
}
