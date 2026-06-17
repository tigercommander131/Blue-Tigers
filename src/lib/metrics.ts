import type { EventCode, Metric, SessionData, SimEvent } from '../data/types';
import { clock } from './format';

// ---------------------------------------------------------------------------
// CALCULATED FACTS (Layer 2).
//
// Every value here is a deterministic function of the source events — no
// randomness, no model, no opinion. Given the same session you always get the
// same numbers, which is exactly what you want for anything a clinician might
// act on. The "AI" layer consumes these; it never recomputes them.
//
// All lookups key off the stable `code`, not the display string, so a label
// change in the simulator can't silently drop a metric. Events are sorted by
// time first, so out-of-order input can't produce a negative interval.
//
// Clinical targets below are illustrative ACLS-style references for the
// prototype, not a validated clinical ruleset.
// ---------------------------------------------------------------------------

/** Events sorted chronologically — the basis for every calculation. */
export function sortedEvents(data: SessionData): SimEvent[] {
  return [...data.events].sort((a, b) => a.time - b.time);
}

/** First event with a given code, or undefined. */
export function findByCode(events: SimEvent[], code: EventCode): SimEvent | undefined {
  return events.find((e) => e.code === code);
}

/** Non-negative seconds between two events, or null if either is missing. */
function gap(a?: SimEvent, b?: SimEvent): number | null {
  if (!a || !b) return null;
  return Math.max(0, b.time - a.time);
}

export function computeMetrics(data: SessionData): Metric[] {
  const events = sortedEvents(data);
  const { session } = data;

  const arrest = findByCode(events, 'vf');
  const cpr = findByCode(events, 'cpr');
  const shock = findByCode(events, 'shock');
  const adrenaline = findByCode(events, 'adrenaline');
  const rosc = findByCode(events, 'rosc');

  const metrics: Metric[] = [];

  // Recognition of arrest -> first chest compressions. (Counted.)
  const toCpr = gap(arrest, cpr);
  if (toCpr !== null) {
    metrics.push({
      id: 'time-to-cpr',
      label: 'Time to CPR',
      value: clock(toCpr),
      seconds: toCpr,
      derivedFrom: ['Ventricular Fibrillation', 'CPR Started'],
      target: '< 0:10',
      targetSeconds: 10,
      counted: true,
      status: toCpr <= 10 ? 'good' : toCpr <= 20 ? 'warn' : 'bad',
      note: 'Recognition of VF to first chest compressions.',
    });
  }

  // Arrest -> first defibrillation (shockable rhythm). (Counted.)
  const toShock = gap(arrest, shock);
  if (toShock !== null) {
    metrics.push({
      id: 'time-to-shock',
      label: 'Time to Defibrillation',
      value: clock(toShock),
      seconds: toShock,
      derivedFrom: ['Ventricular Fibrillation', 'Shock Delivered'],
      target: '< 2:00',
      targetSeconds: 120,
      counted: true,
      status: toShock <= 120 ? 'good' : toShock <= 180 ? 'warn' : 'bad',
      note: 'VF onset to first defibrillation.',
    });
  }

  // Compressions -> first shock (context: time on CPR before defib).
  const cprToShock = gap(cpr, shock);
  if (cprToShock !== null) {
    metrics.push({
      id: 'cpr-to-shock',
      label: 'CPR → Shock',
      value: clock(cprToShock),
      seconds: cprToShock,
      derivedFrom: ['CPR Started', 'Shock Delivered'],
      status: 'info',
      note: 'Compressions delivered before the first shock.',
    });
  }

  // Arrest -> first adrenaline.
  const toAdr = gap(arrest, adrenaline);
  if (toAdr !== null) {
    metrics.push({
      id: 'time-to-adrenaline',
      label: 'Time to Adrenaline',
      value: clock(toAdr),
      seconds: toAdr,
      derivedFrom: ['Ventricular Fibrillation', 'Adrenaline Given'],
      target: 'after 2nd shock',
      status: 'info',
      note: 'VF onset to first adrenaline dose.',
    });
  }

  // Arrest -> return of spontaneous circulation (total downtime). No fixed
  // target band, so this is context (info), not a pass/fail.
  const toRosc = gap(arrest, rosc);
  if (toRosc !== null) {
    metrics.push({
      id: 'time-to-rosc',
      label: 'Arrest Downtime',
      value: clock(toRosc),
      seconds: toRosc,
      derivedFrom: ['Ventricular Fibrillation', 'Return of Spontaneous Circulation'],
      target: 'shorter is better',
      status: 'info',
      note: 'VF onset to ROSC — total time in arrest.',
    });
  }

  // Total session length (context).
  metrics.push({
    id: 'duration',
    label: 'Session Length',
    value: clock(session.durationSeconds),
    seconds: session.durationSeconds,
    derivedFrom: ['Scenario Started', 'Scenario Finished'],
    status: 'info',
    note: 'Total recorded length of the scenario.',
  });

  return metrics;
}

/** Look a metric up by id (used by the AI + summary layers). */
export function metricById(metrics: Metric[], id: string): Metric | undefined {
  return metrics.find((m) => m.id === id);
}
