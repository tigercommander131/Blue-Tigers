import type { AiDebrief, Metric, ReviewMoment, SessionData } from '../data/types';
import { metricById } from './metrics';
import { mmss } from './format';

// ---------------------------------------------------------------------------
// AI-GENERATED SUGGESTIONS (Layer 3) — SIMULATED.
//
// In a production version this function would call an LLM with the source
// events + calculated facts and ask for a debrief. Here it is a deterministic
// rule engine that *imitates* that output so the prototype needs no API key
// and never fails in a live demo. The contract (input: facts, output:
// AiDebrief) is exactly what a real model would slot into.
//
// Crucially: this layer only ever phrases and prioritises the facts from
// Layer 2. It does not compute any new numbers — so it cannot "hallucinate"
// a metric. Everything it says is traceable to a calculated fact.
// ---------------------------------------------------------------------------

export function generateDebrief(data: SessionData, metrics: Metric[]): AiDebrief {
  const toCpr = metricById(metrics, 'time-to-cpr');
  const toShock = metricById(metrics, 'time-to-shock');
  const toRosc = metricById(metrics, 'time-to-rosc');

  const discussionPoints: string[] = [];
  const reviewMoments: ReviewMoment[] = [];

  const evt = (match: string) =>
    data.events.find((e) => e.type.toLowerCase().includes(match.toLowerCase()));

  // --- Rule: delayed compressions ---------------------------------------
  if (toCpr && toCpr.seconds !== undefined && toCpr.seconds > 10) {
    discussionPoints.push(
      `Compressions began ${toCpr.value} after VF was recognised (target < 10s). ` +
        `Explore what drove the delay — rhythm recognition, role clarity, or hesitation to start.`,
    );
    const cprEvt = evt('CPR Started');
    if (cprEvt) {
      reviewMoments.push({
        time: cprEvt.time,
        label: 'CPR start',
        reason: `Recognition-to-compression gap of ${toCpr.value}. Worth reviewing how the arrest was called.`,
      });
    }
  }

  // --- Rule: defibrillation timing --------------------------------------
  if (toShock && toShock.seconds !== undefined) {
    if (toShock.status === 'good') {
      discussionPoints.push(
        `First shock was delivered in ${toShock.value} — reinforce this as effective early defibrillation.`,
      );
    } else {
      discussionPoints.push(
        `First shock took ${toShock.value}. Discuss defibrillator readiness and pad placement workflow.`,
      );
    }
    const shockEvt = evt('Shock Delivered');
    if (shockEvt) {
      reviewMoments.push({
        time: shockEvt.time,
        label: 'First shock',
        reason: 'Check pre-shock pause length and how quickly compressions resumed afterwards.',
      });
    }
  }

  // --- Rule: drug sequencing on a shockable rhythm ----------------------
  const shockEvt = evt('Shock Delivered');
  const adrEvt = evt('Adrenaline');
  if (shockEvt && adrEvt) {
    reviewMoments.push({
      time: adrEvt.time,
      label: 'Adrenaline given',
      reason:
        'Confirm adrenaline timing relative to the shock sequence and that it was communicated clearly to the team.',
    });
    discussionPoints.push(
      'Walk through the drug sequence on a shockable rhythm — was adrenaline timed to the guideline relative to shocks?',
    );
  }

  // --- Rule: outcome -----------------------------------------------------
  if (toRosc && toRosc.seconds !== undefined) {
    const roscEvt = evt('Return of Spontaneous Circulation');
    if (roscEvt) {
      reviewMoments.push({
        time: roscEvt.time,
        label: 'ROSC',
        reason: 'Review immediate post-ROSC actions: rhythm/BP check, handover, and team debrief.',
      });
    }
    discussionPoints.push(
      'Close on post-ROSC care — what were the first three actions after circulation returned?',
    );
  }

  // --- Narrative summary (templated from the facts) ---------------------
  const summary = buildSummary(toCpr, toShock, toRosc);

  // Keep review moments in chronological order for the timeline.
  reviewMoments.sort((a, b) => a.time - b.time);

  return {
    summary,
    discussionPoints: discussionPoints.slice(0, 5),
    reviewMoments,
  };
}

function buildSummary(
  toCpr?: Metric,
  toShock?: Metric,
  toRosc?: Metric,
): string {
  const parts: string[] = [];

  parts.push('This was a witnessed VF arrest managed to ROSC.');

  if (toCpr?.seconds !== undefined) {
    const verdict =
      toCpr.status === 'good'
        ? 'compressions started promptly'
        : `compressions started after a ${toCpr.value} delay`;
    parts.push(`The team recognised the arrest and ${verdict}.`);
  }

  if (toShock?.seconds !== undefined) {
    parts.push(`First defibrillation was delivered in ${toShock.value}.`);
  }

  if (toRosc?.seconds !== undefined) {
    parts.push(
      `ROSC was achieved at ${mmss(
        (toRosc.seconds ?? 0) + 65,
      )} on the clock — about ${toRosc.value} of arrest downtime.`,
    );
  }

  parts.push(
    'The strongest debrief value is in the early recognition-to-action window and the post-ROSC handover.',
  );

  return parts.join(' ');
}
