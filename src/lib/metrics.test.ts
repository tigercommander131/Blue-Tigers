import { describe, expect, it } from 'vitest';
import { computeMetrics, metricById, sortedEvents } from './metrics';
import { computePhases, computeSummary } from './summary';
import { generateDebrief } from './aiDebrief';
import { sampleSession } from '../data/sampleSession';

// The deterministic layer is the part a clinician would trust, so it gets the
// tests. Values are checked against the brief's sample data by hand:
//   VF onset       = 65s
//   CPR started    = 82s   -> time to CPR    = 17s
//   Shock          = 138s  -> time to defib  = 73s, CPR->shock = 56s
//   Adrenaline     = 152s  -> time to adr    = 87s
//   ROSC           = 201s  -> downtime       = 136s

describe('computeMetrics (sample SIM001)', () => {
  const metrics = computeMetrics(sampleSession);

  it('time to CPR = 17s and flags a warning (target < 10s)', () => {
    const m = metricById(metrics, 'time-to-cpr');
    expect(m?.seconds).toBe(17);
    expect(m?.status).toBe('warn');
    expect(m?.counted).toBe(true);
    expect(m?.derivedFrom).toEqual(['Ventricular Fibrillation', 'CPR Started']);
  });

  it('time to defibrillation = 73s and is within target', () => {
    const m = metricById(metrics, 'time-to-shock');
    expect(m?.seconds).toBe(73);
    expect(m?.status).toBe('good');
  });

  it('CPR -> shock interval = 56s', () => {
    expect(metricById(metrics, 'cpr-to-shock')?.seconds).toBe(56);
  });

  it('time to adrenaline = 87s', () => {
    expect(metricById(metrics, 'time-to-adrenaline')?.seconds).toBe(87);
  });

  it('arrest downtime (ROSC) = 136s and is info, not a hardcoded pass', () => {
    const m = metricById(metrics, 'time-to-rosc');
    expect(m?.seconds).toBe(136);
    expect(m?.status).toBe('info');
  });

  it('session length = 720s', () => {
    expect(metricById(metrics, 'duration')?.seconds).toBe(720);
  });

  it('is deterministic — same input, same output', () => {
    expect(computeMetrics(sampleSession)).toEqual(metrics);
  });
});

describe('out-of-order input is sorted, never negative', () => {
  it('produces the same metrics when events are shuffled', () => {
    const shuffled = {
      ...sampleSession,
      events: [...sampleSession.events].reverse(),
    };
    expect(sortedEvents(shuffled).map((e) => e.time)).toEqual([0, 65, 82, 138, 152, 201, 720]);
    expect(computeMetrics(shuffled)).toEqual(computeMetrics(sampleSession));
  });
});

describe('computeSummary', () => {
  const metrics = computeMetrics(sampleSession);
  const summary = computeSummary(sampleSession, metrics);

  it('reports ROSC achieved', () => {
    expect(summary.rosc).toBe(true);
    expect(summary.outcomeLabel).toBe('ROSC achieved');
  });

  it('scores 1 of 2 counted ACLS targets met (defib yes, CPR no)', () => {
    expect(summary.targetsTotal).toBe(2);
    expect(summary.targetsMet).toBe(1);
  });
});

describe('computePhases', () => {
  it('splits into pre-arrest / resuscitation / post-ROSC from event times', () => {
    const phases = computePhases(sampleSession);
    expect(phases.map((p) => p.key)).toEqual(['pre', 'arrest', 'post']);
    expect(phases[1].start).toBe(65);
    expect(phases[1].end).toBe(201);
  });
});

describe('generateDebrief uses real event times (no hardcoded offset)', () => {
  it('mentions ROSC at the actual clock time 3:21', () => {
    const metrics = computeMetrics(sampleSession);
    const debrief = generateDebrief(sampleSession, metrics);
    expect(debrief.summary).toContain('3:21');
    expect(debrief.reviewMoments.some((m) => m.time === 201)).toBe(true);
  });
});
