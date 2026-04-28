"use client";

import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

interface ResQLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  /** When true, renders text in plain white (dark) / black (light) instead of brand colors */
  mono?: boolean;
}

const SIZES = {
  sm: { icon: 28, text: "text-sm", gap: "gap-1.5", radius: "rounded-lg" },
  md: { icon: 36, text: "text-lg", gap: "gap-2", radius: "rounded-xl" },
  lg: { icon: 44, text: "text-xl", gap: "gap-2.5", radius: "rounded-xl" },
  xl: { icon: 60, text: "text-3xl", gap: "gap-3", radius: "rounded-2xl" },
};

export default function ResQLogo({ size = "md", showText = true, className = "", mono = false }: ResQLogoProps) {
  const s = SIZES[size];
  const { theme } = useTheme();

  const monoColor = theme === "dark" ? "#FFFFFF" : "#18181B";
  const textColor = mono ? monoColor : "var(--brand-blue)";
  const qColor = mono ? monoColor : "var(--brand-red)";

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <Image
        src="/images/resq-logo.png"
        alt="ResQ Logo"
        width={s.icon}
        height={s.icon}
        className={`${s.radius} object-contain`}
        priority
      />

      {showText && (
        <span
          className={`font-bold tracking-tight ${s.text}`}
          style={{ color: textColor, fontFamily: "'Outfit', 'Inter', sans-serif" }}
        >
          Res
          <span style={{ color: qColor }}>Q</span>
        </span>
      )}
    </div>
  );
}
