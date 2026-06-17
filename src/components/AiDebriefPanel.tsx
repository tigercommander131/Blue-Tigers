import type { AiDebrief } from '../data/types';
import { mmss } from '../lib/format';
import { SparkIcon } from './icons';

interface Props {
  debrief: AiDebrief;
  onSeek: (t: number) => void;
}

/**
 * AI-generated suggestions. Deliberately fenced off with its own border, badge,
 * and disclaimer so it can never be mistaken for recorded or calculated fact.
 * In production the body of this would come from an LLM; the framing stays.
 */
export function AiDebriefPanel({ debrief, onSeek }: Props) {
  return (
    <section className="panel ai">
      <div className="panel-head">
        <h2>
          <SparkIcon /> AI Debrief Assistant
        </h2>
        <span className="tag tag-ai">Simulated AI · not a real model</span>
      </div>

      <p className="ai-disclaimer">
        Suggestions to support the instructor — not clinical conclusions. Every point below is
        phrased from the calculated facts; review before using.
      </p>

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
                {mmss(m.time)} · {m.label}
              </button>
              <span className="moment-reason">{m.reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
