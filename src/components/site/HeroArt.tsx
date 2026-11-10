export function WorkspaceArt() {
  return (
    <svg
      viewBox="0 0 760 565"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Ilustrasi tiga panel Kullo: papan proyek, detail tugas, dan percakapan tim"
    >
      <defs>
        <linearGradient id="wsBg" x1="0" y1="0" x2="760" y2="565" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0d1430" />
          <stop offset="0.55" stopColor="#1a2a63" />
          <stop offset="1" stopColor="#0f6cbd" />
        </linearGradient>
        <radialGradient id="wsGlow" cx="0.5" cy="0.5" r="0.5">
          <stop stopColor="#479ef5" stopOpacity="0.55" />
          <stop offset="1" stopColor="#479ef5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="wsWarm" cx="0.5" cy="0.5" r="0.5">
          <stop stopColor="#ffb900" stopOpacity="0.34" />
          <stop offset="1" stopColor="#ffb900" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wsPanel" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#f4f6fc" />
        </linearGradient>
        <pattern id="wsGrid" width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M34 0H0v34" fill="none" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1" />
        </pattern>
        <filter id="wsShadow" x="-30%" y="-30%" width="170%" height="170%">
          <feDropShadow dx="0" dy="18" stdDeviation="22" floodColor="#050916" floodOpacity="0.45" />
        </filter>
      </defs>

      <rect width="760" height="565" fill="url(#wsBg)" />
      <rect width="760" height="565" fill="url(#wsGrid)" />
      <ellipse cx="560" cy="150" rx="260" ry="200" fill="url(#wsGlow)" />
      <ellipse cx="300" cy="500" rx="240" ry="170" fill="url(#wsWarm)" />

      {/* board panel */}
      <g filter="url(#wsShadow)" transform="translate(236 78) rotate(-6)">
        <rect width="336" height="216" rx="16" fill="url(#wsPanel)" />
        <rect x="18" y="18" width="16" height="16" rx="5" fill="#0f6cbd" />
        <rect x="42" y="22" width="118" height="9" rx="4.5" fill="#1b1b1a" opacity="0.82" />
        <rect x="244" y="19" width="74" height="15" rx="7.5" fill="#eef2fe" />
        <rect x="254" y="24" width="54" height="5" rx="2.5" fill="#0f6cbd" opacity="0.7" />
        {[0, 1, 2].map((col) => (
          <g key={col} transform={`translate(${18 + col * 104} 52)`}>
            <rect width="96" height="148" rx="10" fill="#f1f3f9" />
            <rect x="10" y="12" width="52" height="7" rx="3.5" fill="#8b93ab" />
            {[0, 1].map((card) => (
              <g key={card} transform={`translate(8 ${30 + card * 52})`}>
                <rect width="80" height="44" rx="8" fill="#ffffff" stroke="#e4e8f2" />
                <rect x="8" y="9" width="52" height="6" rx="3" fill="#4b5470" />
                <rect x="8" y="21" width="34" height="5" rx="2.5" fill="#9aa2ba" />
                <rect x="8" y="32" width="24" height="5" rx="2.5" fill={col === 1 ? "#107c10" : "#ffb900"} opacity="0.85" />
              </g>
            ))}
            <rect x="8" y="130" width="80" height="10" rx="5" fill="#ffffff" stroke="#d9deec" strokeDasharray="4 4" />
          </g>
        ))}
      </g>

      {/* task detail panel */}
      <g filter="url(#wsShadow)" transform="translate(456 288) rotate(7)">
        <rect width="278" height="172" rx="16" fill="#ffffff" />
        <circle cx="30" cy="34" r="13" fill="#eef2fe" />
        <rect x="30" y="28" width="12" height="12" rx="6" fill="#0f6cbd" opacity="0.8" />
        <rect x="52" y="27" width="132" height="10" rx="5" fill="#1b1b1a" opacity="0.85" />
        <rect x="52" y="43" width="84" height="7" rx="3.5" fill="#a3aabc" />
        <rect x="18" y="70" width="242" height="8" rx="4" fill="#eceff7" />
        <rect x="18" y="70" width="152" height="8" rx="4" fill="#0f6cbd" />
        <g>
          {[0, 1, 2].map((row) => (
            <g key={row} transform={`translate(18 ${94 + row * 24})`}>
              <rect width="14" height="14" rx="4" fill={row < 2 ? "#107c10" : "#ffffff"} stroke={row < 2 ? "#107c10" : "#c9cfdd"} />
              {row < 2 && <path d="M3.4 7.2l2.6 2.6 5-5.4" stroke="#ffffff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
              <rect x="24" y="3" width={row === 1 ? 148 : 116} height="7" rx="3.5" fill={row < 2 ? "#b7bdcd" : "#5b6379"} />
            </g>
          ))}
        </g>
        <g transform="translate(178 94)">
          <rect width="82" height="26" rx="8" fill="#e9f7f0" />
          <circle cx="15" cy="13" r="5" fill="#107c10" />
          <rect x="26" y="10" width="44" height="6" rx="3" fill="#107c10" opacity="0.65" />
        </g>
      </g>

      {/* chat panel */}
      <g filter="url(#wsShadow)" transform="translate(196 372) rotate(-4)">
        <rect width="256" height="134" rx="16" fill="#ffffff" />
        <rect x="16" y="16" width="94" height="8" rx="4" fill="#8b93ab" />
        <g transform="translate(16 38)">
          <circle cx="11" cy="11" r="11" fill="#e7edff" />
          <rect x="30" y="0" width="150" height="34" rx="12" fill="#f2f4f9" />
          <rect x="42" y="10" width="112" height="6" rx="3" fill="#7b839b" />
          <rect x="42" y="21" width="72" height="6" rx="3" fill="#aeb5c7" />
        </g>
        <g transform="translate(46 84)">
          <rect width="194" height="34" rx="12" fill="#eef2fe" />
          <rect x="12" y="10" width="150" height="6" rx="3" fill="#0f6cbd" opacity="0.75" />
          <rect x="12" y="21" width="96" height="6" rx="3" fill="#7c93e4" />
        </g>
      </g>

      {/* floating chips */}
      <g transform="translate(574 96)">
        <rect width="118" height="34" rx="17" fill="#ffffff" opacity="0.96" />
        <circle cx="20" cy="17" r="6" fill="#107c10" />
        <rect x="34" y="14" width="66" height="6" rx="3" fill="#4b5470" />
      </g>
      <g transform="translate(120 168)">
        <rect width="132" height="34" rx="17" fill="#ffffff" opacity="0.94" />
        <circle cx="20" cy="17" r="6" fill="#ffb900" />
        <rect x="34" y="14" width="78" height="6" rx="3" fill="#4b5470" />
      </g>
      <circle cx="660" cy="440" r="7" fill="#ffb900" opacity="0.9" />
      <circle cx="122" cy="300" r="5" fill="#479ef5" opacity="0.9" />
      <circle cx="612" cy="520" r="4" fill="#ffffff" opacity="0.55" />
    </svg>
  );
}

export function ApprovalArt() {
  return (
    <svg
      viewBox="0 0 760 565"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Ilustrasi alur persetujuan tiga tahap di Kullo"
    >
      <defs>
        <linearGradient id="apBg" x1="0" y1="0" x2="760" y2="565" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f7f9ff" />
          <stop offset="0.5" stopColor="#e9eeff" />
          <stop offset="1" stopColor="#dfe7fb" />
        </linearGradient>
        <filter id="apShadow" x="-30%" y="-30%" width="170%" height="170%">
          <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#1b2b63" floodOpacity="0.16" />
        </filter>
        <pattern id="apGrid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M30 0H0v30" fill="none" stroke="#0f6cbd" strokeOpacity="0.08" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="760" height="565" fill="url(#apBg)" />
      <rect width="760" height="565" fill="url(#apGrid)" />

      <path
        d="M176 168 C 300 168, 300 262, 424 262"
        fill="none"
        stroke="#0f6cbd"
        strokeOpacity="0.5"
        strokeWidth="3"
        strokeDasharray="8 8"
      />
      <path
        d="M176 344 C 300 344, 300 262, 424 262"
        fill="none"
        stroke="#0f6cbd"
        strokeOpacity="0.5"
        strokeWidth="3"
        strokeDasharray="8 8"
      />

      <g filter="url(#apShadow)" transform="translate(74 96)">
        <rect width="212" height="148" rx="16" fill="#ffffff" />
        <rect x="18" y="18" width="86" height="9" rx="4.5" fill="#1b1b1a" opacity="0.8" />
        <rect x="18" y="46" width="64" height="6" rx="3" fill="#a3aabc" />
        <rect x="96" y="42" width="98" height="14" rx="7" fill="#f1f3f9" />
        <rect x="18" y="74" width="54" height="6" rx="3" fill="#a3aabc" />
        <rect x="96" y="70" width="76" height="14" rx="7" fill="#f1f3f9" />
        <rect x="18" y="104" width="64" height="6" rx="3" fill="#a3aabc" />
        <rect x="96" y="100" width="60" height="14" rx="7" fill="#fdf4e3" />
        <rect x="18" y="128" width="84" height="8" rx="4" fill="#eef2fe" />
      </g>

      <g filter="url(#apShadow)" transform="translate(74 316)">
        <rect width="212" height="112" rx="16" fill="#ffffff" />
        <circle cx="34" cy="34" r="15" fill="#e7edff" />
        <rect x="58" y="24" width="96" height="9" rx="4.5" fill="#1b1b1a" opacity="0.8" />
        <rect x="58" y="40" width="62" height="6" rx="3" fill="#a3aabc" />
        <rect x="18" y="68" width="176" height="10" rx="5" fill="#f1f3f9" />
        <rect x="18" y="86" width="120" height="10" rx="5" fill="#f1f3f9" />
      </g>

      <g filter="url(#apShadow)" transform="translate(424 178)">
        <rect width="264" height="172" rx="16" fill="#ffffff" />
        <rect x="18" y="18" width="104" height="9" rx="4.5" fill="#1b1b1a" opacity="0.82" />
        <g transform="translate(18 44)">
          <rect width="228" height="40" rx="10" fill="#e9f7f0" />
          <circle cx="24" cy="20" r="11" fill="#107c10" />
          <path d="M19 20l4 4 7-8" stroke="#ffffff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="44" y="12" width="122" height="7" rx="3.5" fill="#107c10" opacity="0.75" />
          <rect x="44" y="24" width="80" height="6" rx="3" fill="#107c10" opacity="0.45" />
        </g>
        <g transform="translate(18 96)">
          <rect width="228" height="40" rx="10" fill="#fdf4e3" />
          <circle cx="24" cy="20" r="11" fill="#ffb900" />
          <rect x="44" y="12" width="104" height="7" rx="3.5" fill="#8a5a10" opacity="0.75" />
          <rect x="44" y="24" width="64" height="6" rx="3" fill="#8a5a10" opacity="0.45" />
        </g>
        <rect x="18" y="148" width="96" height="8" rx="4" fill="#eef2fe" />
      </g>

      <g filter="url(#apShadow)" transform="translate(468 388)">
        <rect width="220" height="96" rx="16" fill="#0f6cbd" />
        <rect x="18" y="22" width="72" height="9" rx="4.5" fill="#ffffff" opacity="0.95" />
        <rect x="18" y="44" width="150" height="7" rx="3.5" fill="#ffffff" opacity="0.7" />
        <rect x="18" y="62" width="108" height="7" rx="3.5" fill="#ffffff" opacity="0.5" />
        <circle cx="186" cy="60" r="14" fill="#ffffff" opacity="0.22" />
        <path d="M180 60l5 5 9-10" stroke="#ffffff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
