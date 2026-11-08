export type CardVariant = "board" | "chat" | "docs" | "approvals" | "calendar" | "report";

const TINTS: Record<CardVariant, { from: string; to: string; accent: string }> = {
  board: { from: "#eef2fe", to: "#dfe7fb", accent: "#365fd1" },
  chat: { from: "#f4effa", to: "#e6dcf6", accent: "#7a3d9e" },
  docs: { from: "#edf7f2", to: "#d9eee4", accent: "#18794e" },
  approvals: { from: "#fdf6ea", to: "#f8ead0", accent: "#8a5a10" },
  calendar: { from: "#eef2fe", to: "#e6ecfb", accent: "#365fd1" },
  report: { from: "#eef4fb", to: "#dce9f6", accent: "#0f6f7a" },
};

export function CardArt({ variant, label }: { variant: CardVariant; label: string }) {
  const tint = TINTS[variant];
  const gradId = `card-${variant}`;
  const shadowId = `cardshadow-${variant}`;

  return (
    <svg
      viewBox="0 0 480 270"
      role="img"
      aria-label={label}
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="480" y2="270" gradientUnits="userSpaceOnUse">
          <stop stopColor={tint.from} />
          <stop offset="1" stopColor={tint.to} />
        </linearGradient>
        <filter id={shadowId} x="-30%" y="-30%" width="170%" height="170%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#1b2b63" floodOpacity="0.18" />
        </filter>
      </defs>
      <rect width="480" height="270" fill={`url(#${gradId})`} />
      <circle cx="410" cy="52" r="88" fill="#ffffff" opacity="0.35" />
      <circle cx="52" cy="238" r="70" fill="#ffffff" opacity="0.3" />

      {variant === "board" && (
        <g filter={`url(#${shadowId})`}>
          <rect x="48" y="42" width="384" height="196" rx="14" fill="#ffffff" />
          <rect x="68" y="62" width="120" height="10" rx="5" fill={tint.accent} opacity="0.9" />
          <rect x="352" y="60" width="60" height="16" rx="8" fill="#eef2fe" />
          {[0, 1, 2].map((col) => (
            <g key={col} transform={`translate(${66 + col * 118} 92)`}>
              <rect width="104" height="130" rx="10" fill="#f2f4f9" />
              <rect x="10" y="12" width="54" height="7" rx="3.5" fill="#8b93ab" />
              {[0, 1].map((card) => (
                <g key={card} transform={`translate(8 ${28 + card * 46})`}>
                  <rect width="88" height="38" rx="8" fill="#ffffff" stroke="#e4e8f2" />
                  <rect x="9" y="9" width="54" height="6" rx="3" fill="#4b5470" />
                  <rect x="9" y="21" width="34" height="5" rx="2.5" fill="#a3aabc" />
                  <circle cx="74" cy="26" r="7" fill={col === 1 ? "#18794e" : tint.accent} opacity="0.85" />
                </g>
              ))}
            </g>
          ))}
        </g>
      )}

      {variant === "chat" && (
        <g filter={`url(#${shadowId})`}>
          <rect x="60" y="34" width="360" height="204" rx="14" fill="#ffffff" />
          <rect x="60" y="34" width="132" height="204" rx="14" fill="#f7f8fc" />
          <rect x="60" y="34" width="14" height="204" fill="#f7f8fc" />
          {[0, 1, 2, 3].map((row) => (
            <g key={row} transform={`translate(78 ${62 + row * 34})`}>
              <circle cx="8" cy="8" r="8" fill={row === 1 ? tint.accent : "#d8dcea"} />
              <rect x="24" y="5" width={row === 1 ? 66 : 78} height="6" rx="3" fill={row === 1 ? tint.accent : "#a9afc2"} opacity="0.75" />
            </g>
          ))}
          <g transform="translate(210 60)">
            <rect width="196" height="46" rx="12" fill="#f2f4f9" />
            <rect x="14" y="13" width="150" height="7" rx="3.5" fill="#66708a" />
            <rect x="14" y="27" width="104" height="7" rx="3.5" fill="#9aa1b6" />
          </g>
          <g transform="translate(176 120)">
            <rect width="230" height="52" rx="12" fill="#eef2fe" />
            <rect x="14" y="14" width="184" height="7" rx="3.5" fill={tint.accent} opacity="0.75" />
            <rect x="14" y="30" width="128" height="7" rx="3.5" fill={tint.accent} opacity="0.45" />
            <g transform="translate(176 34)">
              <rect width="40" height="16" rx="8" fill="#ffffff" />
              <text x="20" y="12" textAnchor="middle" fontSize="9" fill={tint.accent} fontWeight="700">
                👍 3
              </text>
            </g>
          </g>
          <rect x="210" y="186" width="196" height="34" rx="10" fill="#ffffff" stroke="#e4e8f2" strokeDasharray="5 5" />
        </g>
      )}

      {variant === "docs" && (
        <g filter={`url(#${shadowId})`}>
          <rect x="46" y="38" width="388" height="204" rx="14" fill="#ffffff" />
          <rect x="46" y="38" width="146" height="204" rx="14" fill="#f7faf9" />
          <rect x="46" y="38" width="14" height="204" fill="#f7faf9" />
          {[0, 1, 2, 3].map((row) => (
            <g key={row} transform={`translate(66 ${64 + row * 36})`}>
              <path d="M0 2h12l4 4v10H0z" fill={row === 1 ? tint.accent : "#cfe0d8"} opacity="0.9" />
              <rect x="26" y="6" width={row === 1 ? 84 : 72} height="7" rx="3.5" fill={row === 1 ? tint.accent : "#94a49c"} opacity="0.8" />
            </g>
          ))}
          <g transform="translate(212 58)">
            <rect width="204" height="164" rx="10" fill="#ffffff" stroke="#e4eae7" />
            <rect x="16" y="18" width="118" height="9" rx="4.5" fill="#1b1b1a" opacity="0.8" />
            <rect x="16" y="42" width="172" height="6" rx="3" fill="#dfe5e2" />
            <rect x="16" y="56" width="158" height="6" rx="3" fill="#dfe5e2" />
            <rect x="16" y="70" width="132" height="6" rx="3" fill="#dfe5e2" />
            <g transform="translate(16 96)">
              <rect width="86" height="22" rx="6" fill="#e9f7f0" />
              <text x="43" y="15" textAnchor="middle" fontSize="10" fontWeight="700" fill={tint.accent}>
                v3 · 1.2 MB
              </text>
            </g>
            <rect x="16" y="134" width="172" height="1" fill="#eef1f0" />
            <rect x="16" y="146" width="110" height="6" rx="3" fill="#dfe5e2" />
          </g>
        </g>
      )}

      {variant === "approvals" && (
        <g filter={`url(#${shadowId})`}>
          <rect x="54" y="34" width="372" height="206" rx="14" fill="#ffffff" />
          <rect x="54" y="34" width="372" height="42" rx="14" fill="#ffffff" />
          <rect x="54" y="62" width="372" height="14" fill="#ffffff" />
          <rect x="74" y="46" width="126" height="10" rx="5" fill="#1b1b1a" opacity="0.8" />
          <rect x="336" y="44" width="72" height="18" rx="9" fill="#fdf4e3" />
          <g transform="translate(74 92)">
            <rect width="332" height="46" rx="10" fill="#f7f9fc" />
            <circle cx="26" cy="23" r="14" fill="#e7edff" />
            <rect x="50" y="14" width="140" height="8" rx="4" fill="#4b5470" />
            <rect x="50" y="28" width="92" height="7" rx="3.5" fill="#a3aabc" />
            <g transform="translate(232 13)">
              <rect width="86" height="20" rx="10" fill="#e9f7f0" />
              <text x="43" y="14" textAnchor="middle" fontSize="10" fontWeight="700" fill="#18794e">
                Disetujui
              </text>
            </g>
          </g>
          <g transform="translate(74 148)">
            <rect width="332" height="46" rx="10" fill="#f7f9fc" />
            <circle cx="26" cy="23" r="14" fill="#fdf1de" />
            <rect x="50" y="14" width="128" height="8" rx="4" fill="#4b5470" />
            <rect x="50" y="28" width="76" height="7" rx="3.5" fill="#a3aabc" />
            <g transform="translate(232 13)">
              <rect width="86" height="20" rx="10" fill="#fdf4e3" />
              <text x="43" y="14" textAnchor="middle" fontSize="10" fontWeight="700" fill="#8a5a10">
                Menunggu
              </text>
            </g>
          </g>
          <rect x="74" y="206" width="150" height="8" rx="4" fill="#eef2fe" />
        </g>
      )}

      {variant === "calendar" && (
        <g filter={`url(#${shadowId})`}>
          <rect x="66" y="34" width="348" height="206" rx="14" fill="#ffffff" />
          <rect x="66" y="34" width="348" height="38" rx="14" fill="#ffffff" />
          <rect x="66" y="58" width="348" height="14" fill="#ffffff" />
          <rect x="86" y="46" width="96" height="10" rx="5" fill="#1b1b1a" opacity="0.8" />
          {[0, 1, 2, 3, 4].map((day) => (
            <g key={day}>
              <rect x={86 + day * 62} y="86" width="46" height="6" rx="3" fill="#b7bdcc" />
              {[0, 1, 2].map((slot) => {
                const filled = (day + slot) % 3 !== 1;
                return (
                  <rect
                    key={slot}
                    x={86 + day * 62}
                    y={104 + slot * 34}
                    width="46"
                    height="26"
                    rx="7"
                    fill={filled ? (slot === 1 ? tint.accent : "#eef2fe") : "#f4f6fa"}
                    opacity={filled ? (slot === 1 ? 0.9 : 1) : 1}
                  />
                );
              })}
            </g>
          ))}
          <rect x="86" y="212" width="240" height="6" rx="3" fill="#e7ebf3" />
        </g>
      )}

      {variant === "report" && (
        <g filter={`url(#${shadowId})`}>
          <rect x="52" y="34" width="376" height="206" rx="14" fill="#ffffff" />
          <rect x="72" y="54" width="110" height="10" rx="5" fill="#1b1b1a" opacity="0.8" />
          <g transform="translate(72 92)">
            {[38, 62, 48, 78, 92, 70].map((value, index) => (
              <rect key={index} x={index * 54} y={96 - value} width="30" height={value} rx="6" fill={index === 4 ? tint.accent : "#dbe6ef"} />
            ))}
            <rect x="0" y="98" width="324" height="1.5" fill="#e6ecf2" />
          </g>
          <g transform="translate(72 206)">
            <rect width="150" height="8" rx="4" fill="#eef2f6" />
            <rect x="164" width="96" height="8" rx="4" fill="#eef2f6" />
          </g>
        </g>
      )}
    </svg>
  );
}

export function BannerArt() {
  return (
    <svg
      viewBox="0 0 720 460"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Tiga tampilan Kullo: papan proyek, laporan, dan persetujuan"
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id="bnBg" x1="0" y1="0" x2="720" y2="460" gradientUnits="userSpaceOnUse">
          <stop stopColor="#151d3c" />
          <stop offset="0.55" stopColor="#243c8f" />
          <stop offset="1" stopColor="#4f76e0" />
        </linearGradient>
        <linearGradient id="bnGlass" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#ffffff" stopOpacity="0.97" />
          <stop offset="1" stopColor="#eef2fd" stopOpacity="0.97" />
        </linearGradient>
        <filter id="bnShadow" x="-30%" y="-30%" width="170%" height="170%">
          <feDropShadow dx="0" dy="20" stdDeviation="24" floodColor="#050916" floodOpacity="0.42" />
        </filter>
      </defs>
      <rect width="720" height="460" fill="url(#bnBg)" />
      <circle cx="612" cy="76" r="140" fill="#7d97f2" opacity="0.22" />
      <circle cx="96" cy="404" r="118" fill="#f5a524" opacity="0.16" />

      <g filter="url(#bnShadow)" transform="translate(70 74) rotate(-4)">
        <rect width="330" height="214" rx="16" fill="url(#bnGlass)" />
        <rect x="20" y="20" width="118" height="10" rx="5" fill="#365fd1" />
        {[0, 1, 2].map((col) => (
          <g key={col} transform={`translate(${20 + col * 100} 48)`}>
            <rect width="88" height="146" rx="10" fill="#f1f3f9" />
            <rect x="8" y="10" width="44" height="6" rx="3" fill="#9aa2ba" />
            <rect x="6" y="26" width="76" height="34" rx="8" fill="#ffffff" stroke="#e4e8f2" />
            <rect x="6" y="68" width="76" height="34" rx="8" fill="#ffffff" stroke="#e4e8f2" />
            <rect x="14" y="36" width="44" height="5" rx="2.5" fill="#5b6379" />
            <rect x="14" y="78" width="38" height="5" rx="2.5" fill="#5b6379" />
          </g>
        ))}
      </g>

      <g filter="url(#bnShadow)" transform="translate(366 44) rotate(6)">
        <rect width="278" height="156" rx="16" fill="url(#bnGlass)" />
        <rect x="20" y="18" width="92" height="9" rx="4.5" fill="#1b1b1a" opacity="0.82" />
        <g transform="translate(20 44)">
          {[70, 96, 58, 110, 88].map((value, index) => (
            <rect key={index} x={index * 48} y={72 - value} width="26" height={value} rx="6" fill={index === 3 ? "#365fd1" : "#dbe4f6"} />
          ))}
          <rect x="0" y="74" width="232" height="1.5" fill="#e2e8f4" />
        </g>
        <rect x="20" y="132" width="150" height="7" rx="3.5" fill="#dfe5f1" />
      </g>

      <g filter="url(#bnShadow)" transform="translate(300 250) rotate(-3)">
        <rect width="300" height="152" rx="16" fill="url(#bnGlass)" />
        <rect x="20" y="18" width="118" height="9" rx="4.5" fill="#1b1b1a" opacity="0.82" />
        {[0, 1].map((row) => (
          <g key={row} transform={`translate(20 ${44 + row * 54})`}>
            <rect width="260" height="44" rx="10" fill={row === 0 ? "#e9f7f0" : "#fdf4e3"} />
            <circle cx="24" cy="22" r="12" fill={row === 0 ? "#18794e" : "#f5a524"} />
            <rect x="48" y="14" width="120" height="7" rx="3.5" fill="#4b5470" opacity="0.85" />
            <rect x="48" y="27" width="84" height="6" rx="3" fill="#7b839b" />
            <rect x="196" y="14" width="50" height="18" rx="9" fill="#ffffff" opacity="0.9" />
          </g>
        ))}
      </g>

      <g transform="translate(486 214)">
        <rect width="150" height="38" rx="19" fill="#ffffff" opacity="0.96" />
        <circle cx="22" cy="19" r="7" fill="#18794e" />
        <rect x="38" y="16" width="92" height="6" rx="3" fill="#4b5470" />
      </g>
    </svg>
  );
}
