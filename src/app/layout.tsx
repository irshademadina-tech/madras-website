import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Amiri_Quran, Scheherazade_New } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const amiriQuran = Amiri_Quran({
  variable: "--font-amiri-quran",
  subsets: ["arabic"],
  weight: "400",
});

const scheherazade = Scheherazade_New({
  variable: "--font-scheherazade",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Madrasah Irshad-e-Madina — Online Quran School for UK, USA & Canada",
    template: "%s | Madrasah Irshad-e-Madina",
  },
  description:
    "Structured, one-to-one Qur'an and Islamic learning with qualified teachers, daily revision and full parent visibility. Since 2011, from Lahore to the world.",
  keywords: [
    "online quran school",
    "quran teacher",
    "quran classes for kids",
    "tajweed",
    "nazra",
    "qaida",
    "hifz",
    "islamic studies for children",
    "UK USA Canada",
  ],
  openGraph: {
    title: "Madrasah Irshad-e-Madina — Online Quran School",
    description:
      "One-to-one Qur'an learning with qualified teachers, daily revision and full parent visibility. Book a free assessment.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1b5e4a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${amiriQuran.variable} ${scheherazade.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
