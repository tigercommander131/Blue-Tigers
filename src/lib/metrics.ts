import type { Metric, SessionData, SimEvent } from '../data/types';
import { dur } from './format';

// ---------------------------------------------------------------------------
// CALCULATED FACTS (Layer 2).
//
// Every value here is a deterministic function of the source events — no
// randomness, no model, no opinion. Given the same session you always get the
// same numbers, which is exactly what you want for anything a clinician might
// act on. The "AI" layer consumes these; it never recomputes them.
//
// Clinical targets below are illustrative ACLS-style references for the
// prototype, not a validated clinical ruleset.
// ---------------------------------------------------------------------------

/** First event whose type matches (case-insensitive substring), or undefined. */
function firstEvent(events: SimEvent[], match: string): SimEvent | undefined {
  const m = match.toLowerCase();
  return events.find((e) => e.type.toLowerCase().includes(m));
}

/** Seconds between two events, or null if either is missing. */
function gap(a?: SimEvent, b?: SimEvent): number | null {
  if (!a || !b) return null;
  return b.time - a.time;
}

export function computeMetrics(data: SessionData): Metric[] {
  const { events, session } = data;

  const arrest = firstEvent(events, 'Ventricular Fibrillation');
  const cpr = firstEvent(events, 'CPR Started');
  const shock = firstEvent(events, 'Shock Delivered');
  const adrenaline = firstEvent(events, 'Adrenaline');
  const rosc = firstEvent(events, 'Return of Spontaneous Circulation');

  const metrics: Metric[] = [];

  // Time from arrest recognition to start of compressions.
  const toCpr = gap(arrest, cpr);
  if (toCpr !== null) {
    metrics.push({
      id: 'time-to-cpr',
      label: 'Time to CPR',
      value: dur(toCpr),
      seconds: toCpr,
      derivedFrom: ['Ventricular Fibrillation', 'CPR Started'],
      target: '< 10s after arrest',
      status: toCpr <= 10 ? 'good' : toCpr <= 20 ? 'warn' : 'bad',
      note: 'Recognition of VF to first chest compressions.',
    });
  }

  // Time from arrest to first defibrillation (shockable rhythm).
  const toShock = gap(arrest, shock);
  if (toShock !== null) {
    metrics.push({
      id: 'time-to-shock',
      label: 'Time to First Shock',
      value: dur(toShock),
      seconds: toShock,
      derivedFrom: ['Ventricular Fibrillation', 'Shock Delivered'],
      target: '< 2 min after arrest',
      status: toShock <= 120 ? 'good' : toShock <= 180 ? 'warn' : 'bad',
      note: 'VF onset to first defibrillation.',
    });
  }

  // Time from arrest to first adrenaline.
  const toAdr = gap(arrest, adrenaline);
  if (toAdr !== null) {
    metrics.push({
      id: 'time-to-adrenaline',
      label: 'Time to Adrenaline',
      value: dur(toAdr),
      seconds: toAdr,
      derivedFrom: ['Ventricular Fibrillation', 'Adrenaline Given'],
      target: 'after 2nd shock (shockable)',
      status: 'info',
      note: 'VF onset to first adrenaline dose.',
    });
  }

  // Time from arrest to return of spontaneous circulation.
  const toRosc = gap(arrest, rosc);
  if (toRosc !== null) {
    metrics.push({
      id: 'time-to-rosc',
      label: 'Time to ROSC',
      value: dur(toRosc),
      seconds: toRosc,
      derivedFrom: ['Ventricular Fibrillation', 'Return of Spontaneous Circulation'],
      target: 'shorter is better',
      status: 'good',
      note: 'Total arrest downtime: VF onset to ROSC.',
    });
  }

  // No-flow interval before compressions began (time the patient had no
  // circulation support). Here it equals the recognition-to-CPR gap.
  if (toCpr !== null) {
    metrics.push({
      id: 'no-flow',
      label: 'Pre-CPR No-Flow',
      value: dur(toCpr),
      seconds: toCpr,
      derivedFrom: ['Ventricular Fibrillation', 'CPR Started'],
      target: 'minimise',
      status: toCpr <= 10 ? 'good' : 'warn',
      note: 'Window from arrest to compressions with no circulatory support.',
    });
  }

  // Total session length (context, not performance).
  metrics.push({
    id: 'duration',
    label: 'Session Duration',
    value: dur(session.durationSeconds),
    seconds: session.durationSeconds,
    derivedFrom: ['Scenario Started', 'Scenario Finished'],
    status: 'info',
    note: 'Total recorded length of the scenario.',
  });

  return metrics;
}

/** Convenience: look a metric up by id (used by the AI layer). */
export function metricById(metrics: Metric[], id: string): Metric | undefined {
  return metrics.find((m) => m.id === id);
}
