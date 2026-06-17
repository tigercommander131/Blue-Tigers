import type { SessionData } from './types';

/**
 * SOURCE DATA (Layer 1).
 *
 * This is the exact payload from the exercise brief — an ACLS cardiac-arrest
 * resuscitation — with a stable `code` added to each event. In production this
 * object would arrive from the simulator (or be uploaded / fetched), but the
 * shape would be identical, so everything downstream (metrics, AI debrief, UI)
 * works unchanged when the source swaps.
 */
export const sampleSession: SessionData = {
  session: {
    id: 'SIM001',
    durationSeconds: 720,
  },
  participants: [
    { id: 'P1', role: 'Team Leader' },
    { id: 'P2', role: 'Airway' },
    { id: 'P3', role: 'Nurse' },
    { id: 'P4', role: 'Runner' },
  ],
  events: [
    { time: 0, type: 'Scenario Started', code: 'start' },
    { time: 65, type: 'Ventricular Fibrillation', code: 'vf' },
    { time: 82, type: 'CPR Started', code: 'cpr' },
    { time: 138, type: 'Shock Delivered', code: 'shock' },
    { time: 152, type: 'Adrenaline Given', code: 'adrenaline' },
    { time: 201, type: 'Return of Spontaneous Circulation', code: 'rosc' },
    { time: 720, type: 'Scenario Finished', code: 'finish' },
  ],
};
