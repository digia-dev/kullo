import { cn } from "@/lib/utils";

export function KulloMark({
  size = 26,
  tile = "var(--accent)",
  glyph = "#ffffff",
  className,
  title,
}: {
  size?: number;
  tile?: string;
  glyph?: string;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label={title ?? "Kullo"}
      className={cn("brand-mark", className)}
      style={{ width: size, height: size }}
    >
      <title>{title ?? "Kullo"}</title>
      <rect width="32" height="32" rx="9" fill={tile} />
      <g stroke={glyph} strokeWidth="4.4" strokeLinecap="round" fill="none">
        <path d="M10.4 7.6 V24.4" />
        <path d="M16.2 16 L23.4 8.6" />
        <path d="M16.2 16 L23.4 23.4" />
      </g>
      <circle cx="25.6" cy="24.4" r="2.6" fill="#f5a524" />
    </svg>
  );
}

export function KulloLogo({
  size = 26,
  wordSize = 19,
  href = "/",
  tile = "var(--accent)",
  glyph = "#ffffff",
  text = "var(--text)",
}: {
  size?: number;
  wordSize?: number;
  href?: string;
  tile?: string;
  glyph?: string;
  text?: string;
}) {
  return (
    <a href={href} className="brand" aria-label="Kullo, ke beranda" style={{ color: text }}>
      <KulloMark size={size} tile={tile} glyph={glyph} />
      <span style={{ fontSize: wordSize, letterSpacing: "-0.04em", fontWeight: 700 }}>Kullo</span>
    </a>
  );
}
