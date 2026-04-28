"use client";

interface ResQLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const SIZES = {
  sm: { icon: 24, text: "text-sm", gap: "gap-1.5" },
  md: { icon: 32, text: "text-lg", gap: "gap-2" },
  lg: { icon: 40, text: "text-xl", gap: "gap-2.5" },
  xl: { icon: 56, text: "text-3xl", gap: "gap-3" },
};

export default function ResQLogo({ size = "md", showText = true, className = "" }: ResQLogoProps) {
  const s = SIZES[size];

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {/* Shield with red cross */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Shield shape */}
        <path
          d="M24 4L6 12V22C6 33.1 13.68 43.42 24 46C34.32 43.42 42 33.1 42 22V12L24 4Z"
          fill="#1A73E8"
        />
        {/* Inner shield highlight */}
        <path
          d="M24 6.5L8.5 13.5V22C8.5 31.85 15.3 41.05 24 43.4C32.7 41.05 39.5 31.85 39.5 22V13.5L24 6.5Z"
          fill="#4285F4"
          opacity="0.3"
        />
        {/* Red cross — vertical bar */}
        <rect x="21" y="14" width="6" height="20" rx="1.5" fill="#D93025" />
        {/* Red cross — horizontal bar */}
        <rect x="14" y="21" width="20" height="6" rx="1.5" fill="#D93025" />
        {/* White inner cross for contrast */}
        <rect x="22" y="15.5" width="4" height="17" rx="1" fill="white" opacity="0.3" />
        <rect x="15.5" y="22" width="17" height="4" rx="1" fill="white" opacity="0.3" />
      </svg>

      {showText && (
        <span
          className={`font-bold tracking-tight ${s.text}`}
          style={{ color: "#1A73E8", fontFamily: "'Outfit', 'Inter', sans-serif" }}
        >
          Res
          <span style={{ color: "#D93025" }}>Q</span>
        </span>
      )}
    </div>
  );
}
