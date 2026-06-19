import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.talepopstories.com"),
  title: {
    default: "Personalised Bedtime Stories for Kids | TalePop",
    template: "%s | TalePop"
  },
  description: "Personalised bedtime stories and children's books written around your child — their name, interests, best friend and pet in every story. Ages 3–10. Start with 1 free story.",
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
    description: "Personalised bedtime stories and children's books written around your child — their name, interests, best friend and pet in every story. Ages 3–10. Start with 1 free story.",
    url: "https://www.talepopstories.com",
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
    description: "Personalised bedtime stories starring your child. Their name, interests and friends woven into every story. Ages 3–10. Start with 1 free story.",
    images: ["/hero-scene.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" }
  },
  alternates: {
    canonical: "https://www.talepopstories.com"
  },
  verification: {
    google: "_F1GWblpMkTCzwHOCrtI8XnyHSAv3b9VIZ-t5jWie9U"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Fredoka:wght@400;500;600;700&family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
