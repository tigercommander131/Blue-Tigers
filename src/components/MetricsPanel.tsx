import type { Metric } from '../data/types';

interface Props {
  metrics: Metric[];
}

/**
 * Calculated facts. Each card shows the value, the clinical target, a pass/warn
 * status, and — importantly — exactly which source events it was derived from,
 * so the instructor can trust and trace every number.
 */
export function MetricsPanel({ metrics }: Props) {
  return (
    <section className="panel metrics">
      <div className="panel-head">
        <h2>Calculated Facts</h2>
        <span className="tag tag-calc">Deterministic</span>
      </div>
      <div className="metric-grid">
        {metrics.map((m) => (
          <article key={m.id} className={`metric-card status-${m.status}`}>
            <div className="metric-top">
              <span className="metric-label">{m.label}</span>
              <span className={`status-dot status-${m.status}`} aria-hidden />
            </div>
            <div className="metric-value">{m.value}</div>
            {m.target && <div className="metric-target">target: {m.target}</div>}
            <p className="metric-note">{m.note}</p>
            <div className="metric-derived" title="Source events this was calculated from">
              {m.derivedFrom.map((d) => (
                <span key={d} className="derived-chip">
                  {d}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
