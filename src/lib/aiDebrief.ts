import type { AiDebrief, Metric, ReviewMoment, SessionData } from '../data/types';
import { findByCode, metricById, sortedEvents } from './metrics';
import { clock } from './format';

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
// a metric. Every timestamp it shows comes straight from an event's `.time`.
// ---------------------------------------------------------------------------

export function generateDebrief(data: SessionData, metrics: Metric[]): AiDebrief {
  const events = sortedEvents(data);
  const vf = findByCode(events, 'vf');
  const shock = findByCode(events, 'shock');
  const adrenaline = findByCode(events, 'adrenaline');
  const rosc = findByCode(events, 'rosc');
  const cpr = findByCode(events, 'cpr');

  const toCpr = metricById(metrics, 'time-to-cpr');
  const toShock = metricById(metrics, 'time-to-shock');
  const downtime = metricById(metrics, 'time-to-rosc');

  const discussionPoints: string[] = [];
  const reviewMoments: ReviewMoment[] = [];

  // --- Rule: delayed compressions ---------------------------------------
  if (toCpr && toCpr.seconds !== undefined && toCpr.seconds > 10) {
    discussionPoints.push(
      `Compressions began ${toCpr.value} after VF was recognised (target < 0:10). ` +
        `Explore what drove the delay — rhythm recognition, role clarity, or hesitation to start.`,
    );
    if (cpr) {
      reviewMoments.push({
        time: cpr.time,
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
    if (shock) {
      reviewMoments.push({
        time: shock.time,
        label: 'First shock',
        reason: 'Check pre-shock pause length and how quickly compressions resumed afterwards.',
      });
    }
  }

  // --- Rule: drug sequencing on a shockable rhythm ----------------------
  if (shock && adrenaline) {
    reviewMoments.push({
      time: adrenaline.time,
      label: 'Adrenaline given',
      reason:
        'Confirm adrenaline timing relative to the shock sequence and that it was communicated clearly to the team.',
    });
    discussionPoints.push(
      'Walk through the drug sequence on a shockable rhythm — was adrenaline timed to the guideline relative to shocks?',
    );
  }

  // --- Rule: outcome -----------------------------------------------------
  if (rosc) {
    reviewMoments.push({
      time: rosc.time,
      label: 'ROSC',
      reason: 'Review immediate post-ROSC actions: rhythm/BP check, handover, and team debrief.',
    });
    discussionPoints.push(
      'Close on post-ROSC care — what were the first three actions after circulation returned?',
    );
  }

  const summary = buildSummary({ vf, rosc, toCpr, toShock, downtime });

  // Keep review moments in chronological order for the timeline.
  reviewMoments.sort((a, b) => a.time - b.time);

  return {
    summary,
    discussionPoints: discussionPoints.slice(0, 5),
    reviewMoments,
  };
}

interface SummaryInput {
  vf?: { time: number };
  rosc?: { time: number };
  toCpr?: Metric;
  toShock?: Metric;
  downtime?: Metric;
}

function buildSummary({ vf, rosc, toCpr, toShock, downtime }: SummaryInput): string {
  const parts: string[] = [];

  // Only assert the narrative we actually have evidence for.
  if (vf && rosc) {
    parts.push('This was a witnessed VF arrest managed to ROSC.');
  } else if (vf) {
    parts.push('This was a witnessed VF arrest; ROSC was not recorded in this session.');
  } else {
    parts.push('No cardiac-arrest sequence was recorded in this session.');
    return parts.join(' ');
  }

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

  if (rosc) {
    const downtimeText = downtime?.value ? ` — about ${downtime.value} of arrest downtime` : '';
    parts.push(`ROSC was achieved at ${clock(rosc.time)} on the clock${downtimeText}.`);
  }

  parts.push(
    'The strongest debrief value is in the early recognition-to-action window and the post-ROSC handover.',
  );

  return parts.join(' ');
}
