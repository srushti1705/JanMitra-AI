import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "JanMitra AI – Your Intelligent Government Companion",
  description: "A production-ready, AI-powered civic platform providing seamless citizen-to-government interaction, complaint tracking, and automated assistance.",
  keywords: ["JanMitra AI", "Civic Platform", "Government Companion", "AI Assistant", "Issue Reporting", "Complaint Tracker"],
  authors: [{ name: "JanMitra AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
