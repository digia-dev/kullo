import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kullo — Satu ruang kerja untuk seluruh pekerjaan tim",
    short_name: "Kullo",
    description:
      "Proyek, tugas, chat, dokumen, kalender, dan persetujuan dalam satu workspace.",
    start_url: "/app/dashboard",
    display: "standalone",
    background_color: "#f4f5f7",
    theme_color: "#0c66e4",
    lang: "id",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
