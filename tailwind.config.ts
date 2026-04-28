import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Google brand colors for direct use
        google: {
          blue: "#1A73E8",
          "blue-light": "#4285F4",
          "blue-hover": "#1765CC",
          red: "#D93025",
          "red-light": "#EA4335",
          green: "#188038",
          "green-light": "#34A853",
          yellow: "#F29900",
          "yellow-light": "#FBBC04",
          grey: {
            50: "#F8F9FA",
            100: "#F1F3F4",
            200: "#E8EAED",
            300: "#DADCE0",
            400: "#BDC1C6",
            500: "#9AA0A6",
            600: "#80868B",
            700: "#5F6368",
            800: "#3C4043",
            900: "#202124",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",          // 12px — cards
        md: "calc(var(--radius) - 4px)", // 8px — inputs
        sm: "calc(var(--radius) - 6px)", // 6px — small elements
        xl: "var(--radius-button)",    // 24px — buttons, pills
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        "md3-1": "0 1px 2px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.12)",
        "md3-2": "0 2px 4px rgba(0,0,0,0.08), 0 3px 6px rgba(0,0,0,0.12)",
        "md3-3": "0 4px 8px rgba(0,0,0,0.08), 0 6px 12px rgba(0,0,0,0.12)",
        "md3-4": "0 8px 16px rgba(0,0,0,0.08), 0 12px 24px rgba(0,0,0,0.12)",
        "md3-hover": "0 4px 8px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.14)",
        "google-blue": "0 2px 8px rgba(26, 115, 232, 0.25)",
        "google-red": "0 2px 8px rgba(217, 48, 37, 0.25)",
        "google-green": "0 2px 8px rgba(24, 128, 56, 0.25)",
      },
      transitionTimingFunction: {
        google: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        google: "200ms",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(26, 115, 232, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(26, 115, 232, 0)" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "fade-in": "fade-in 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "pulse-glow": "pulse-glow 2s infinite",
        "count-up": "count-up 500ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "gradient-shift": "gradient-shift 6s ease infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
