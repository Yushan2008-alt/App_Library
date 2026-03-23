export default function WaveBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(150deg, #0B1A38 0%, #0E2248 45%, #091630 100%)' }}
      />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* === WAVE BANDS === */}

        {/* Wave 1 — top filled band */}
        <path
          d="M0,130 C200,60 480,230 760,140 C1020,55 1260,190 1440,110 L1440,0 L0,0 Z"
          fill="rgba(255,255,255,0.04)"
        />
        <path
          d="M0,130 C200,60 480,230 760,140 C1020,55 1260,190 1440,110"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.5"
        />

        {/* Wave 2 — second band */}
        <path
          d="M0,270 C260,190 560,340 840,255 C1080,185 1300,295 1440,235 L1440,0 L0,0 Z"
          fill="rgba(255,255,255,0.022)"
        />
        <path
          d="M0,270 C260,190 560,340 840,255 C1080,185 1300,295 1440,235"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />

        {/* Wave 3 — thin accent wave middle */}
        <path
          d="M0,500 C300,440 600,540 900,470 C1100,420 1300,490 1440,450"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
        />

        {/* Wave 4 — bottom band */}
        <path
          d="M0,720 C280,660 600,740 920,690 C1120,655 1320,710 1440,675 L1440,900 L0,900 Z"
          fill="rgba(255,255,255,0.02)"
        />
        <path
          d="M0,720 C280,660 600,740 920,690 C1120,655 1320,710 1440,675"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />

        {/* === DECORATIVE CIRCLES === */}
        <circle cx="1195" cy="72" r="5" fill="rgba(255,255,255,0.22)" />
        <circle cx="118"  cy="390" r="3.5" fill="rgba(255,255,255,0.14)" />
        <circle cx="850"  cy="490" r="2.5" fill="rgba(255,255,255,0.1)" />
        <circle cx="1380" cy="460" r="3" fill="rgba(255,255,255,0.12)" />
        <circle cx="380"  cy="630" r="2" fill="rgba(255,255,255,0.14)" />
        <circle cx="690"  cy="820" r="3" fill="rgba(255,255,255,0.1)" />
        <circle cx="1050" cy="200" r="2.5" fill="rgba(255,255,255,0.1)" />

        {/* Dot grid cluster — right center */}
        {[0, 14, 28].map((dx) =>
          [0, 14, 28].map((dy) => (
            <circle
              key={`dot-${dx}-${dy}`}
              cx={1060 + dx}
              cy={340 + dy}
              r="1.8"
              fill="rgba(255,255,255,0.12)"
            />
          ))
        )}

        {/* Dot grid cluster — lower left */}
        {[0, 14].map((dx) =>
          [0, 14].map((dy) => (
            <circle
              key={`dot2-${dx}-${dy}`}
              cx={190 + dx}
              cy={700 + dy}
              r="1.8"
              fill="rgba(255,255,255,0.1)"
            />
          ))
        )}

        {/* === PLUS SIGNS === */}
        {/* Top right */}
        <line x1="1385" y1="186" x2="1385" y2="208" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
        <line x1="1374" y1="197" x2="1396" y2="197" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />

        {/* Left mid */}
        <line x1="58"  y1="545" x2="58"  y2="565" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
        <line x1="48"  y1="555" x2="68"  y2="555" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />

        {/* Center */}
        <line x1="755" y1="378" x2="755" y2="394" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
        <line x1="747" y1="386" x2="763" y2="386" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />

        {/* Bottom right */}
        <line x1="1310" y1="800" x2="1310" y2="816" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <line x1="1302" y1="808" x2="1318" y2="808" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />

        {/* === DASHED RECTANGLES === */}
        <rect
          x="72" y="755" width="110" height="72" rx="5"
          stroke="rgba(255,255,255,0.14)" strokeWidth="1" fill="none"
          strokeDasharray="5 4"
        />
        <rect
          x="1298" y="590" width="86" height="86" rx="5"
          stroke="rgba(255,255,255,0.11)" strokeWidth="1" fill="none"
          strokeDasharray="4 3"
        />
        <rect
          x="1340" y="298" width="52" height="52" rx="4"
          stroke="rgba(255,255,255,0.09)" strokeWidth="1" fill="none"
          strokeDasharray="4 3"
        />
      </svg>
    </div>
  )
}
