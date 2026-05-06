import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalePop — Personalised Bedtime Stories for Kids",
  description: "AI-powered personalised children's stories where your child is the hero. A new tale every day.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* TalePop typography: Fredoka = heading font (closest free match to Bambino — playful, rounded, hand-drawn character) */}
        {/* Nunito = body font — clean, rounded, perfect for bedtime reading */}
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
