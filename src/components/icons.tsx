// Minimal inline vector icons (stroke-based, currentColor). No icon library,
// no emojis — keeps the bundle tiny and the look consistent.
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...p,
});

export const PlayIcon = (p: P) => (
  <svg {...base(p)}>
    <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />
  </svg>
);
export const PauseIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="6" y="5" width="4" height="14" fill="currentColor" stroke="none" />
    <rect x="14" y="5" width="4" height="14" fill="currentColor" stroke="none" />
  </svg>
);
export const FlagIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 21V4h13l-2 4 2 4H4" />
  </svg>
);
export const HeartPulseIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 12h4l2-4 3 8 2-5 1.5 1H21" />
  </svg>
);
export const BoltIcon = (p: P) => (
  <svg {...base(p)}>
    <polygon points="13 2 4 14 11 14 10 22 20 9 13 9 13 2" />
  </svg>
);
export const SyringeIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M18 6 22 2M14 4l6 6M16 8l-9 9-4 1 1-4 9-9M9 11l2 2" />
  </svg>
);
export const HeartIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5.5 6 5.5c2 0 3 1.2 6 4 3-2.8 4-4 6-4 3.5 0 5 3.5 3.5 6.5C19 16.5 12 21 12 21z" />
  </svg>
);
export const CheckIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
export const TrashIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" />
  </svg>
);
export const PinIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21v-7M8 3h8l-1 4 3 3H6l3-3-1-4z" />
  </svg>
);
export const SparkIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
    <path d="M19 3v3M20.5 4.5h-3" />
  </svg>
);
export const SunIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
  </svg>
);
export const MoonIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);
export const PrinterIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z" />
  </svg>
);
export const TargetIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
export const ActivityIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 12h4l2-6 4 12 2-6h6" />
  </svg>
);
