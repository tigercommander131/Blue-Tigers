import type { Metric, Phase, SessionData, SessionSummary } from '../data/types';
import { clock } from './format';
import { findByCode, metricById, sortedEvents } from './metrics';

// ---------------------------------------------------------------------------
// Derived session overview (still Layer 2 — all deterministic).
// Feeds the outcome hero and the timeline phase shading.
// ---------------------------------------------------------------------------

export function computeSummary(data: SessionData, metrics: Metric[]): SessionSummary {
  const events = sortedEvents(data);
  const rosc = !!findByCode(events, 'rosc');

  const counted = metrics.filter((m) => m.counted);
  const targetsMet = counted.filter((m) => m.status === 'good').length;

  const downtime = metricById(metrics, 'time-to-rosc');
  const toCpr = metricById(metrics, 'time-to-cpr');
  const toShock = metricById(metrics, 'time-to-shock');

  const heroStats = [
    { label: 'Downtime', value: downtime?.value ?? '—' },
    { label: 'Time to CPR', value: toCpr?.value ?? '—' },
    { label: 'Time to Defib', value: toShock?.value ?? '—' },
  ];

  return {
    rosc,
    outcomeLabel: rosc ? 'ROSC achieved' : 'No ROSC',
    heroStats,
    targetsMet,
    targetsTotal: counted.length,
  };
}

/**
 * Split the case into clinical phases from the VF and ROSC event times:
 * pre-arrest, arrest/resuscitation, and post-ROSC. Falls back gracefully when
 * those events are absent.
 */
export function computePhases(data: SessionData): Phase[] {
  const events = sortedEvents(data);
  const end = data.session.durationSeconds;
  const vf = findByCode(events, 'vf')?.time;
  const rosc = findByCode(events, 'rosc')?.time;

  if (vf === undefined) {
    return [{ key: 'pre', label: 'Session', start: 0, end, tone: 'neutral' }];
  }

  const phases: Phase[] = [
    { key: 'pre', label: 'Pre-arrest', start: 0, end: vf, tone: 'neutral' },
  ];

  if (rosc !== undefined) {
    phases.push({ key: 'arrest', label: 'Resuscitation', start: vf, end: rosc, tone: 'crisis' });
    phases.push({ key: 'post', label: 'Post-ROSC', start: rosc, end, tone: 'good' });
  } else {
    phases.push({ key: 'arrest', label: 'Resuscitation', start: vf, end, tone: 'crisis' });
  }

  return phases.map((p) => ({ ...p, label: `${p.label} · ${clock(p.end - p.start)}` }));
}
