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
