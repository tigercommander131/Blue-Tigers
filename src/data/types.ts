// ---------------------------------------------------------------------------
// LAYER 1 — SOURCE DATA
// Shapes that come straight from the simulator. We never invent these values;
// they are recorded facts. Keep this identical to what the device emits.
// ---------------------------------------------------------------------------

export interface Session {
  id: string;
  durationSeconds: number;
}

export interface Participant {
  id: string;
  role: string;
}

/**
 * Stable machine code for an event. The human `type` string is for display;
 * all logic keys off `code` so a label change in the simulator never breaks a
 * calculation. ('other' = an event we don't specifically reason about.)
 */
export type EventCode =
  | 'start'
  | 'vf'
  | 'cpr'
  | 'shock'
  | 'adrenaline'
  | 'rosc'
  | 'finish'
  | 'other';

export interface SimEvent {
  /** Seconds from scenario start. */
  time: number;
  /** Human-readable event name as emitted by the simulator. */
  type: string;
  /** Stable code used by all downstream logic. */
  code: EventCode;
}

export interface SessionData {
  session: Session;
  participants: Participant[];
  events: SimEvent[];
}

// ---------------------------------------------------------------------------
// LAYER 2 — CALCULATED FACTS
// Deterministic values derived purely from the source data. Same input always
// yields the same output. These are auditable and safe for a clinician to act
// on. See lib/metrics.ts.
// ---------------------------------------------------------------------------

export type MetricStatus = 'good' | 'warn' | 'bad' | 'info';

export interface Metric {
  id: string;
  label: string;
  /** Formatted value for display, e.g. "0:17". */
  value: string;
  /** Raw seconds when the metric is a duration, for sorting / logic. */
  seconds?: number;
  /** Source event types this fact was computed from — traceability. */
  derivedFrom: string[];
  /** Optional clinical target string, e.g. "< 0:10". */
  target?: string;
  /** Numeric target threshold in seconds, for delta calculations. */
  targetSeconds?: number;
  /** Whether this metric counts toward the guideline-compliance score. */
  counted?: boolean;
  /** Pass / warn / fail against the target. */
  status: MetricStatus;
  /** One-line plain explanation of how this was calculated. */
  note: string;
}

/** A clinical phase of the case, derived from the source events. */
export interface Phase {
  key: 'pre' | 'arrest' | 'post';
  label: string;
  start: number;
  end: number;
  tone: 'neutral' | 'crisis' | 'good';
}

export interface HeroStat {
  label: string;
  value: string;
}

/** High-level outcome + headline numbers, all deterministic. */
export interface SessionSummary {
  rosc: boolean;
  outcomeLabel: string;
  heroStats: HeroStat[];
  targetsMet: number;
  targetsTotal: number;
}

// ---------------------------------------------------------------------------
// LAYER 3 — AI-GENERATED SUGGESTIONS
// Produced by lib/aiDebrief.ts. In this prototype the "AI" is a deterministic
// rule engine standing in for an LLM. These are suggestions, never facts, and
// the UI always labels them as such.
// ---------------------------------------------------------------------------

export interface ReviewMoment {
  /** Timestamp the instructor should jump to. */
  time: number;
  label: string;
  reason: string;
}

export interface AiDebrief {
  /** Short narrative summary of the run. */
  summary: string;
  /** Suggested talking points / instructor prompts for the debrief. */
  discussionPoints: string[];
  /** Specific timestamps worth re-watching, with why. */
  reviewMoments: ReviewMoment[];
}

// ---------------------------------------------------------------------------
// Instructor notes (local only).
// ---------------------------------------------------------------------------

export interface Note {
  id: string;
  /** Optional timestamp the note is pinned to. */
  time: number | null;
  text: string;
  createdAt: number;
}
