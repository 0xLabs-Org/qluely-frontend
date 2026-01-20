import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Qluely | Undetectable AI Assistant for Meetings & Workflows",
  description:
    "Qluely is an undetectable AI assistant designed for real-time help during meetings, interviews, and work sessions. Invisible on screen recordings and screenshots. Built for speed, privacy, and productivity.",
  keywords: [
    "Qluely",
    "Cluely",
    "undetectable AI assistant",
    "cheating software",
    "AI assistant invisible on screen",
    "screen undetectable AI",
    "AI for meetings",
    "AI interview assistant",
    "hidden AI tool",
    "AI productivity assistant",
  ],

  openGraph: {
    title: "Qluely — Undetectable AI Assistant",
    description:
      "An AI assistant that stays invisible on screen. Get real-time help during meetings, interviews, and work without detection.",
    url: "https://qluely.in",
    siteName: "Qluely",
    images: [
      {
        url: "https://qluely.in/logo.png",
        width: 1200,
        height: 630,
        alt: "Qluely Undetectable AI Assistant",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Qluely — Undetectable AI Assistant",
    description: "Real-time AI help that stays invisible on screen recordings and screenshots.",
    images: ["https://qluely.in/logo.png"],
  },
  robots: { index: true, follow: true },

  alternates: { canonical: "https://qluely.in" },

  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon.ico" },
    ],
    apple: "/icons/apple-touch-icon.png",
    shortcut: "/icons/favicon.ico",
  },
  manifest: "/icons/site.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
