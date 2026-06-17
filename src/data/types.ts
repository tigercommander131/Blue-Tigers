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

export interface SimEvent {
  /** Seconds from scenario start. */
  time: number;
  /** Human-readable event name as emitted by the simulator. */
  type: string;
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
  /** Formatted value for display, e.g. "17s" or "00:17". */
  value: string;
  /** Raw seconds when the metric is a duration, for sorting / logic. */
  seconds?: number;
  /** Source event types this fact was computed from — traceability. */
  derivedFrom: string[];
  /** Optional clinical target string, e.g. "< 10s (ACLS)". */
  target?: string;
  /** Pass / warn / fail against the target. */
  status: MetricStatus;
  /** One-line plain explanation of how this was calculated. */
  note: string;
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
