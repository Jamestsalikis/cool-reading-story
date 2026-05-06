import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalePop  -  Personalised Bedtime Stories for Kids",
  description: "Bedtime stories written uniquely for your child. Their name, their friends, their adventures  -  invented fresh every time. From just 30¢ a story.",
  openGraph: {
    title: "TalePop  -  Personalised Bedtime Stories for Kids",
    description: "Bedtime stories written uniquely for your child. Their name, their friends, their adventures  -  invented fresh every time. From just 30¢ a story.",
    url: "https://cool-reading-story.vercel.app",
    siteName: "TalePop",
    images: [{ url: "/hero-illustration.png", width: 1536, height: 1024, alt: "TalePop  -  Personalised Bedtime Stories" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TalePop  -  Personalised Bedtime Stories for Kids",
    description: "Bedtime stories written uniquely for your child. From just 30¢ a story.",
    images: ["/hero-illustration.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* TalePop typography: Fredoka = heading font (closest free match to Bambino  -  playful, rounded, hand-drawn character) */}
        {/* Nunito = body font  -  clean, rounded, perfect for bedtime reading */}
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
