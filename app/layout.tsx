import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

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

import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "ResQ — AI-Powered Crisis Resource Allocation",
  description: "Real-time disaster resource coordination using Gemini AI, Google Cloud, and Firebase. Connect volunteers to critical needs instantly.",
  keywords: ["disaster response", "resource allocation", "AI", "volunteer coordination", "crisis management", "Google Cloud"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans bg-[#F8F9FA] text-[#202124] antialiased">
        <LanguageProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#202124",
              border: "1px solid #DADCE0",
              borderRadius: "12px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.08), 0 3px 6px rgba(0,0,0,0.12)",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#188038", secondary: "#fff" } },
            error: { iconTheme: { primary: "#D93025", secondary: "#fff" } },
          }} />
        </LanguageProvider>
      </body>
    </html>
  );
}
