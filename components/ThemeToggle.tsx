"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="relative h-9 w-16 rounded-full bg-muted border border-border flex items-center transition-google hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Track icons */}
      <Sun className="absolute left-1.5 h-3.5 w-3.5 text-amber-500 transition-opacity duration-200" style={{ opacity: isDark ? 0.3 : 0 }} />
      <Moon className="absolute right-1.5 h-3.5 w-3.5 text-blue-400 transition-opacity duration-200" style={{ opacity: isDark ? 0 : 0.3 }} />

      {/* Thumb */}
      <span
        className={`absolute top-0.5 h-8 w-8 rounded-full bg-card border border-border shadow-md3-1 flex items-center justify-center transition-all duration-300 ease-google ${
          isDark ? "left-[calc(100%-2.125rem)]" : "left-0.5"
        }`}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-blue-400" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" />
        )}
      </span>
    </button>
  );
}
