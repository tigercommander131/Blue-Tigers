import { describe, expect, it } from 'vitest';
import { computeMetrics, metricById } from './metrics';
import { sampleSession } from '../data/sampleSession';

// The deterministic layer is the part a clinician would trust, so it gets the
// tests. Values are checked against the brief's sample data by hand:
//   VF onset       = 65s
//   CPR started    = 82s   -> time to CPR   = 17s
//   Shock          = 138s  -> time to shock = 73s
//   Adrenaline     = 152s  -> time to adr   = 87s
//   ROSC           = 201s  -> time to ROSC  = 136s

describe('computeMetrics (sample SIM001)', () => {
  const metrics = computeMetrics(sampleSession);

  it('time to CPR = 17s and flags a warning (target < 10s)', () => {
    const m = metricById(metrics, 'time-to-cpr');
    expect(m?.seconds).toBe(17);
    expect(m?.status).toBe('warn');
    expect(m?.derivedFrom).toEqual(['Ventricular Fibrillation', 'CPR Started']);
  });

  it('time to first shock = 73s and is within target', () => {
    const m = metricById(metrics, 'time-to-shock');
    expect(m?.seconds).toBe(73);
    expect(m?.status).toBe('good');
  });

  it('time to adrenaline = 87s', () => {
    expect(metricById(metrics, 'time-to-adrenaline')?.seconds).toBe(87);
  });

  it('time to ROSC = 136s', () => {
    expect(metricById(metrics, 'time-to-rosc')?.seconds).toBe(136);
  });

  it('session duration = 720s', () => {
    expect(metricById(metrics, 'duration')?.seconds).toBe(720);
  });

  it('is deterministic — same input, same output', () => {
    expect(computeMetrics(sampleSession)).toEqual(metrics);
  });
});
