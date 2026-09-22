import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      id="theme-toggle-button"
      aria-label={`Switch to ${isLight ? "dark" : "light"} theme`}
      title={`Current: ${isLight ? "Light (IIUI Green & White)" : "Dark Theme"} - Click to toggle`}
      className={`relative inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
        isLight
          ? "bg-white/95 hover:bg-white text-emerald-900 border border-emerald-300 shadow-md ring-1 ring-emerald-500/20"
          : "bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-amber-500/20 shadow-sm"
      } ${className}`}
    >
      <div className="relative flex items-center justify-center w-4 h-4">
        {isLight ? (
          <Sun className="h-4 w-4 text-emerald-700 transition-transform duration-300 rotate-0" />
        ) : (
          <Moon className="h-4 w-4 text-amber-300 transition-transform duration-300 rotate-0" />
        )}
      </div>

      {showLabel && (
        <span className="text-[11px] font-semibold tracking-wide uppercase text-emerald-950">
          {isLight ? "Light Mode" : "Dark Mode"}
        </span>
      )}

      {/* Mini Active Indicator dot */}
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isLight ? "bg-emerald-600 animate-pulse" : "bg-amber-400"
        }`}
      />
    </button>
  );
}
