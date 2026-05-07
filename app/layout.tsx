import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cool-reading-story.vercel.app"),
  title: {
    default: "TalePop - Personalised Bedtime Stories for Kids | AI Story Generator",
    template: "%s | TalePop"
  },
  description: "Create personalised bedtime stories starring your child. TalePop writes unique AI-powered stories using your child's name, interests, best friend and pet. Ages 3-10. Start with 2 free stories - no credit card needed.",
  keywords: [
    "personalised bedtime stories",
    "personalised children's stories",
    "AI bedtime story generator",
    "custom kids stories",
    "personalised kids books",
    "bedtime story app",
    "AI story for children",
    "unique bedtime stories",
    "children's story generator",
    "personalised books for kids",
    "bedtime reading app",
    "kids personalised book"
  ],
  authors: [{ name: "TalePop" }],
  creator: "TalePop",
  publisher: "TalePop",
  applicationName: "TalePop",
  category: "Children's Education",
  openGraph: {
    title: "TalePop - Personalised Bedtime Stories for Kids",
    description: "Create personalised bedtime stories starring your child. Their name, interests, best friend and pet woven into a unique AI-written adventure. Ages 3-10. 2 free stories to start.",
    url: "https://cool-reading-story.vercel.app",
    siteName: "TalePop",
    images: [
      {
        url: "/hero-scene.jpg",
        width: 1448,
        height: 1086,
        alt: "TalePop - Personalised bedtime stories for children aged 3 to 10"
      }
    ],
    type: "website",
    locale: "en_AU"
  },
  twitter: {
    card: "summary_large_image",
    title: "TalePop - Personalised Bedtime Stories for Kids",
    description: "AI-written bedtime stories starring your child. Their name, interests and friends in every story. Ages 3-10. 2 free stories to start.",
    images: ["/hero-scene.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" }
  },
  alternates: {
    canonical: "https://cool-reading-story.vercel.app"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
