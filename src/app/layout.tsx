import type { Metadata, Viewport } from "next";
import ModeStyleInjector from "@/components/ModeStyleInjector";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#425C47",
};
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TravelGuide — Guides de voyage personnalisés dès 3€",
  description:
    "Recevez dès 3€ un guide de voyage ultra-personnalisé généré par IA en PDF. Itinéraire, restaurants, activités — en 3j, 7j, 14j ou 1 mois.",
  openGraph: {
    title: "TravelGuide — Guides de voyage dès 3€",
    description:
      "Recevez dès 3€ un guide de voyage ultra-personnalisé généré par IA en PDF. Itinéraire, restaurants, activités — en 3j, 7j, 14j ou 1 mois.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        {/* Blocking script: sets data-mode BEFORE first paint — eliminates theme flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{var m=localStorage.getItem('tgai_mode');if(m)document.documentElement.dataset.mode=m;}catch(e){}` }} />
        <script
          src="https://phospho-nanocorp-prod--nanocorp-api-fastapi-app.modal.run/analytics/v1.js?c=1f94361e-26a6-4bdd-9160-643b7eb82c53"
          defer
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden"><ModeStyleInjector />{children}</body>
    </html>
  );
}
