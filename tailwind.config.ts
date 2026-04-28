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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 6px)",
        xl: "var(--radius-button)",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        "md3-1": "0 1px 2px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.12)",
        "md3-2": "0 2px 4px rgba(0,0,0,0.08), 0 3px 6px rgba(0,0,0,0.12)",
        "md3-3": "0 4px 8px rgba(0,0,0,0.08), 0 6px 12px rgba(0,0,0,0.12)",
        "md3-4": "0 8px 16px rgba(0,0,0,0.08), 0 12px 24px rgba(0,0,0,0.12)",
        "md3-hover": "0 4px 8px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.14)",
        "glow-blue": "0 0 20px rgba(59, 130, 246, 0.25)",
        "glow-red": "0 0 20px rgba(239, 68, 68, 0.25)",
        "glow-green": "0 0 20px rgba(34, 197, 94, 0.25)",
      },
      transitionTimingFunction: {
        google: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        google: "200ms",
      },
      keyframes: {
        "fade-in-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "pulse-glow": { "0%, 100%": { boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.4)" }, "50%": { boxShadow: "0 0 0 12px rgba(59, 130, 246, 0)" } },
        "count-up": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "gradient-shift": { "0%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" }, "100%": { backgroundPosition: "0% 50%" } },
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
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
