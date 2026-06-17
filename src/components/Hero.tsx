import type { SessionSummary } from '../data/types';
import { CheckIcon } from './icons';

interface Props {
  summary: SessionSummary;
}

/**
 * Outcome-first banner. An instructor should be able to answer "did the patient
 * survive, and did the team hit their targets?" in the first second — before
 * scanning any cards. All values are deterministic (Layer 2).
 */
export function Hero({ summary }: Props) {
  const { rosc, outcomeLabel, heroStats, targetsMet, targetsTotal } = summary;
  const allMet = targetsTotal > 0 && targetsMet === targetsTotal;

  return (
    <section className={`hero ${rosc ? 'hero-rosc' : 'hero-norosc'}`}>
      <div className="hero-outcome">
        <span className="outcome-pill">
          {rosc && <CheckIcon />}
          {outcomeLabel}
        </span>
        <span className="outcome-sub muted">Cardiac arrest · shockable (VF)</span>
      </div>

      <div className="hero-stats">
        {heroStats.map((s) => (
          <div className="hero-stat" key={s.label}>
            <div className="v">{s.value}</div>
            <div className="k">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="hero-score">
        <div className={`score-num ${allMet ? 'all-met' : ''}`}>
          {targetsMet}
          <span className="score-of">/ {targetsTotal}</span>
        </div>
        <div className="score-label">ACLS targets met</div>
      </div>
    </section>
  );
}
