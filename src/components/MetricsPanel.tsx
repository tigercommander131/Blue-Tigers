import type { Metric } from '../data/types';
import { delta } from '../lib/format';

interface Props {
  metrics: Metric[];
}

const STATUS_WORD: Record<string, string> = {
  good: 'Met',
  warn: 'Over target',
  bad: 'Missed',
};

/**
 * Calculated facts. Each card shows the value, the clinical target, a pass/warn
 * status (as a word, not just a dot), how far off target it was, and — for
 * traceability — which source events it was derived from. The header carries a
 * one-line guideline-compliance summary so the grid reads as an audit.
 */
export function MetricsPanel({ metrics }: Props) {
  const counted = metrics.filter((m) => m.counted);
  const met = counted.filter((m) => m.status === 'good').length;

  return (
    <section className="panel metrics">
      <div className="panel-head">
        <h2>Calculated Facts</h2>
        <span className="tag tag-calc">Deterministic</span>
      </div>

      {counted.length > 0 && (
        <div className="compliance">
          <span className="compliance-text">
            <strong>
              {met} of {counted.length}
            </strong>{' '}
            ACLS timing targets met
          </span>
          <div className="compliance-bar" aria-hidden>
            {counted.map((m) => (
              <span key={m.id} className={`seg status-${m.status}`} title={`${m.label}: ${m.value}`} />
            ))}
          </div>
        </div>
      )}

      <div className="metric-grid">
        {metrics.map((m) => {
          const off =
            m.targetSeconds !== undefined && m.seconds !== undefined
              ? m.seconds - m.targetSeconds
              : undefined;
          return (
            <article key={m.id} className={`metric-card status-${m.status}`}>
              <div className="metric-top">
                <span className="metric-label">{m.label}</span>
                {STATUS_WORD[m.status] && (
                  <span className={`status-word status-${m.status}`}>{STATUS_WORD[m.status]}</span>
                )}
              </div>
              <div className="metric-value">{m.value}</div>
              {m.target && (
                <div className="metric-target">
                  Target {m.target}
                  {off !== undefined && (
                    <span className={`metric-delta status-${m.status}`}>
                      {delta(off)} {off > 0 ? 'over' : 'under'}
                    </span>
                  )}
                </div>
              )}
              <p className="metric-note">{m.note}</p>
              <div className="metric-derived" title="Source events this was calculated from">
                {m.derivedFrom.map((d) => (
                  <span key={d} className="derived-chip">
                    {d}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
