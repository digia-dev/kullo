import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Kullo: satu ruang kerja untuk kerja tim",
    template: "%s | Kullo",
  },
  description: SITE.description,
  applicationName: "Kullo",
  keywords: [
    "manajemen kerja",
    "manajemen proyek",
    "kolaborasi tim",
    "ruang kerja",
    "Kullo",
  ],
  openGraph: {
    title: "Kullo: kerja tim, satu tempat.",
    description: SITE.description,
    url: SITE.url,
    siteName: "Kullo",
    locale: "id_ID",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f1f3f9",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-app-theme="light" suppressHydrationWarning>
      <body>
        {children}
        <Script id="kullo-theme-init" src="/theme-init.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
