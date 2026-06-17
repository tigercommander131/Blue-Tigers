import type { AiDebrief } from '../data/types';
import { clock } from '../lib/format';
import { SparkIcon } from './icons';

interface Props {
  debrief: AiDebrief;
  onSeek: (t: number) => void;
}

/**
 * AI-generated suggestions. Fenced off with its own accent border and a clear
 * one-line disclaimer so it can never be mistaken for recorded or calculated
 * fact. In production the body would come from an LLM; the framing stays.
 */
export function AiDebriefPanel({ debrief, onSeek }: Props) {
  return (
    <section className="panel ai" aria-label="AI-assisted debrief suggestions">
      <div className="panel-head">
        <h2>
          <SparkIcon /> AI-Assisted Debrief
        </h2>
        <span className="tag tag-ai">Simulated · review before use</span>
      </div>

      <div className="ai-block">
        <h3>Summary</h3>
        <p className="ai-summary">{debrief.summary}</p>
      </div>

      <div className="ai-block">
        <h3>Suggested discussion points</h3>
        <ul className="ai-list">
          {debrief.discussionPoints.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>

      <div className="ai-block">
        <h3>Moments worth reviewing</h3>
        <ul className="ai-moments">
          {debrief.reviewMoments.map((m) => (
            <li key={`${m.time}-${m.label}`}>
              <button className="moment-jump" onClick={() => onSeek(m.time)}>
                {clock(m.time)} · {m.label}
              </button>
              <span className="moment-reason">{m.reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
