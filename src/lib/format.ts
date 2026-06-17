/**
 * Clock format used everywhere for times and durations: minutes (no pad) +
 * zero-padded seconds, e.g. 17 -> "0:17", 73 -> "1:13", 720 -> "12:00".
 * This is how arrest downtime is charted clinically, and it aligns in columns.
 */
export function clock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

/** Signed clock delta, e.g. +7 -> "+0:07", -47 -> "−0:47". */
export function delta(seconds: number): string {
  const sign = seconds >= 0 ? '+' : '−';
  const a = Math.abs(Math.round(seconds));
  const m = Math.floor(a / 60);
  const r = a % 60;
  return `${sign}${m}:${String(r).padStart(2, '0')}`;
}

/** Long-form duration for prose, e.g. 17 -> "17s", 73 -> "1m 13s". */
export function dur(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}
