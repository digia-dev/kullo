import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  lede,
  actions,
  tone = "soft",
  id,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  actions?: Array<{ label: string; href: string; variant?: "primary" | "outline" }>;
  tone?: "soft" | "plain" | "ink";
  id?: string;
}) {
  const background =
    tone === "soft"
      ? "linear-gradient(180deg, #f5f7ff 0%, #ffffff 100%)"
      : tone === "ink"
        ? "linear-gradient(135deg,#151d3c 0%,#223a86 60%,#365fd1 100%)"
        : "transparent";
  const ink = tone === "ink" ? "#f4fafd" : "var(--text)";
  const ledeColor = tone === "ink" ? "rgba(244,250,253,.86)" : "var(--text-muted)";

  return (
    <section
      id={id}
      style={{
        background,
        borderBottom: tone === "plain" ? "1px solid var(--border)" : undefined,
        padding: tone === "plain" ? "44px 0 36px" : "56px 0 44px",
      }}
    >
      <div className="shell">
        {eyebrow && (
          <p className="eyebrow" style={{ marginBottom: 12, color: tone === "ink" ? "#a9bdfb" : undefined }}>
            {eyebrow}
          </p>
        )}
        <h1 className="market-h1" style={{ color: ink, maxWidth: "20ch", marginBottom: 16 }}>
          {title}
        </h1>
        {lede && (
          <p className="market-lede" style={{ color: ledeColor, maxWidth: "62ch", marginBottom: actions?.length ? 26 : 0 }}>
            {lede}
          </p>
        )}
        {actions?.length ? (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {actions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={cn(
                  "btn btn-lg",
                  action.variant === "outline"
                    ? tone === "ink"
                      ? "btn-outline"
                      : "btn-outline"
                    : tone === "ink"
                      ? "btn-light"
                      : "btn-primary",
                )}
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  lede,
  align = "left",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
}) {
  return (
    <header
      style={{
        maxWidth: "72ch",
        marginBottom: 28,
        textAlign: align === "center" ? "center" : "left",
        marginInline: align === "center" ? "auto" : undefined,
      }}
    >
      {eyebrow && (
        <p className="eyebrow" style={{ marginBottom: 10 }}>
          {eyebrow}
        </p>
      )}
      <h2 id={id} className="market-h2" style={{ marginBottom: 12 }}>
        {title}
      </h2>
      {lede && <p className="market-lede" style={{ margin: 0 }}>{lede}</p>}
    </header>
  );
}
