import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ResQ — AI-Powered Crisis Resource Allocation",
  description: "Real-time disaster resource coordination using Gemini AI, Google Cloud, and Firebase. Connect volunteers to critical needs instantly.",
  keywords: ["disaster response", "resource allocation", "AI", "volunteer coordination", "crisis management", "Google Cloud"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const t = localStorage.getItem('resq-theme');
            if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            }
          } catch(e) {}
        ` }} />
      </head>
      <body className="font-sans bg-background text-foreground antialiased transition-colors duration-300">
        <ThemeProvider>
          <LanguageProvider>
            <Navbar />
            <main>{children}</main>
            <Toaster position="bottom-right" toastOptions={{
              className: "!bg-card !text-foreground !border !border-border !shadow-md3-3",
              style: { borderRadius: "10px", fontSize: "14px" },
              success: { iconTheme: { primary: "var(--brand-green)", secondary: "white" } },
              error: { iconTheme: { primary: "var(--brand-red)", secondary: "white" } },
            }} />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
