import React from "react";

/**
 * Self-contained "blurred estate photo" backdrop: sky, tree canopy and
 * pitched roofs drawn in SVG, softened with blur and a brand-red tint so the page
 * needs no external image.
 */
export function LoginBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full scale-110 blur-[6px]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d9534f" />
            <stop offset="55%" stopColor="#B22222" />
            <stop offset="100%" stopColor="#5c1010" />
          </linearGradient>
          <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b1f1f" />
            <stop offset="100%" stopColor="#3a0f0f" />
          </linearGradient>
          <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fde2e2" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        <rect width="1440" height="900" fill="url(#sky)" />

        {/* Back tree line */}
        {[
          [80, 260, 170], [260, 210, 190], [470, 250, 160], [700, 190, 210],
          [930, 240, 170], [1130, 200, 200], [1340, 250, 180],
        ].map(([cx, cy, r], i) => (
          <circle key={`b${i}`} cx={cx} cy={cy} r={r} fill="#8f1c1c" opacity="0.85" />
        ))}
        {[
          [170, 330, 120], [380, 300, 140], [600, 320, 120], [830, 290, 150],
          [1040, 320, 130], [1250, 300, 140],
        ].map(([cx, cy, r], i) => (
          <circle key={`m${i}`} cx={cx} cy={cy} r={r} fill="#c94a4a" opacity="0.55" />
        ))}

        {/* Houses */}
        <g>
          {/* Left large house */}
          <rect x="40" y="520" width="420" height="300" fill="url(#wall)" />
          <polygon points="0,540 250,330 500,540" fill="url(#roof)" />
          <rect x="110" y="600" width="70" height="90" fill="#4a0d0d" opacity="0.5" />
          <rect x="300" y="600" width="70" height="90" fill="#4a0d0d" opacity="0.5" />

          {/* Centre house */}
          <rect x="560" y="470" width="360" height="340" fill="url(#wall)" />
          <polygon points="520,490 740,300 960,490" fill="url(#roof)" />
          <polygon points="700,410 820,330 940,410" fill="#521414" />
          <rect x="620" y="560" width="60" height="80" fill="#4a0d0d" opacity="0.45" />
          <rect x="800" y="560" width="60" height="80" fill="#4a0d0d" opacity="0.45" />

          {/* Right house */}
          <rect x="1000" y="500" width="400" height="320" fill="url(#wall)" />
          <polygon points="960,520 1200,320 1440,520" fill="url(#roof)" />
          <rect x="1080" y="590" width="70" height="90" fill="#4a0d0d" opacity="0.5" />
          <rect x="1250" y="590" width="70" height="90" fill="#4a0d0d" opacity="0.5" />
        </g>

        {/* Foreground shrubs */}
        {[
          [0, 860, 160], [220, 880, 140], [480, 870, 170], [760, 890, 150],
          [1010, 870, 170], [1260, 880, 160], [1440, 860, 150],
        ].map(([cx, cy, r], i) => (
          <circle key={`f${i}`} cx={cx} cy={cy} r={r} fill="#6e1515" />
        ))}
        {[
          [120, 780, 70], [380, 800, 60], [650, 790, 80], [900, 800, 60], [1160, 790, 70], [1380, 800, 60],
        ].map(([cx, cy, r], i) => (
          <circle key={`l${i}`} cx={cx} cy={cy} r={r} fill="#e57373" opacity="0.5" />
        ))}
      </svg>

      {/* Brand-red tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/55 via-primary-dark/45 to-black/55" />
    </div>
  );
}
