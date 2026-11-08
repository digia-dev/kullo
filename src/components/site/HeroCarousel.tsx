"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { ApprovalArt, WorkspaceArt } from "./HeroArt";

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia(MOTION_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

type Slide = {
  id: string;
  theme: "dark" | "light";
  title: string;
  body: string;
  cta: { label: string; href: string };
  secondary?: { label: string; href: string };
  art: () => React.ReactElement;
};

const SLIDES: Slide[] = [
  {
    id: "workspace",
    theme: "dark",
    title: "Satu ruang kerja. Semua alur kerja.",
    body:
      "Kullo menyatukan orang, pekerjaan, proyek, dokumen, chat, dan persetujuan. Semua tahu apa yang harus dikerjakan, dan apa yang sedang terjadi.",
    cta: { label: "Coba Kullo gratis", href: "/daftar" },
    art: WorkspaceArt,
  },
  {
    id: "approvals",
    theme: "light",
    title: "Dari pengajuan sampai keputusan, tanpa berpindah aplikasi",
    body:
      "Permintaan cuti, reimbursement, dan pembelian melewati aturan persetujuan Anda sendiri. Setiap keputusan tercatat lengkap: siapa, kapan, dengan catatan apa.",
    cta: { label: "Lihat alur persetujuan", href: "/produk/approvals" },
    art: ApprovalArt,
  },
];

const INTERVAL = 7000;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const next = useCallback(() => setIndex((value) => (value + 1) % SLIDES.length), []);
  const prev = useCallback(() => setIndex((value) => (value - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused || reduced) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") next();
    }, INTERVAL);
    return () => window.clearInterval(timer);
  }, [paused, reduced, next]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement !== sectionRef.current) return;
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev]);

  const slide = SLIDES[index];
  const Art = slide.art;
  const dark = slide.theme === "dark";

  return (
    <section
      ref={sectionRef}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Sorotan Kullo"
      style={{ outlineOffset: -2 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setPaused(false);
      }}
    >
      <div className="hero-slide" data-theme={slide.theme}>
        <div className="hero-art" aria-hidden={false}>
          <Art />
        </div>
        <div className="shell">
          <div className="hero-slide-copy">
            <h1
              className="market-h1"
              style={{ color: dark ? "#f4fafd" : "#0e1726", marginBottom: 16 }}
            >
              {slide.title}
            </h1>
            <p
              style={{
                color: dark ? "rgba(244,250,253,.86)" : "#2c3648",
                fontSize: 16,
                lineHeight: 1.6,
                maxWidth: 560,
                margin: 0,
                marginBottom: 28,
              }}
            >
              {slide.body}
            </p>
            <Link
              href={slide.cta.href}
              className={dark ? "btn btn-light btn-lg" : "btn btn-primary btn-lg"}
            >
              {slide.cta.label}
            </Link>
            <p
              className="sr-only"
              aria-live="polite"
            >
              Slide {index + 1} dari {SLIDES.length}: {slide.title}
            </p>
          </div>
        </div>
      </div>

      <div className="shell">
        <div className="hero-controls">
          <button
            type="button"
            className="hero-arrow"
            onClick={prev}
            disabled={index === 0}
            aria-label="Sorotan sebelumnya"
          >
            <ChevronLeft size={22} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }} className="hero-center">
            <div className="hero-bars" data-paused={paused || reduced}>
              {SLIDES.map((item, barIndex) => (
                <button
                  key={item.id}
                  type="button"
                  className="hero-bar"
                  aria-current={barIndex === index}
                  aria-label={`Sorotan ${barIndex + 1}: ${item.title}`}
                  onClick={() => setIndex(barIndex)}
                />
              ))}
            </div>
            <button
              type="button"
              className="hero-arrow"
              style={{ width: 34, height: 34, borderRadius: 8 }}
              aria-pressed={paused || reduced}
              aria-label={paused || reduced ? "Putar sorotan otomatis" : "Jeda sorotan otomatis"}
              onClick={() => setPaused((value) => !value)}
            >
              {paused || reduced ? <Play size={15} /> : <Pause size={15} />}
            </button>
          </div>

          <button
            type="button"
            className="hero-arrow"
            onClick={next}
            disabled={index === SLIDES.length - 1}
            aria-label="Sorotan berikutnya"
            style={{ justifySelf: "end" }}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}
