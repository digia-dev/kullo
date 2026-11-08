import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Kullo — Satu ruang kerja untuk seluruh pekerjaan tim",
    template: "%s | Kullo",
  },
  description: SITE.description,
  applicationName: "Kullo",
  keywords: [
    "work management",
    "manajemen proyek",
    "kolaborasi tim",
    "workspace",
    "Kullo",
  ],
  openGraph: {
    title: "Kullo — Work Together. Move Forward.",
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
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
