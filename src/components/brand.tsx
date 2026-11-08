import Link from "next/link";

export function KulloMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="9" fill="var(--accent)" />
      <path
        d="M10.5 8.5v15M10.5 16.2l7.4-7.7M12.2 14.4l6.8 9.1"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="23.4" cy="9.6" r="2.1" fill="#fff" opacity=".92" />
    </svg>
  );
}

export function Brand({
  href = "/",
  compact = false,
}: {
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link href={href} className="brand" aria-label="Kullo — beranda">
      <KulloMark className="brand-mark" />
      {!compact && <span>Kullo</span>}
    </Link>
  );
}
