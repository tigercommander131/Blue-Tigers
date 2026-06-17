import type { Phase, SimEvent } from '../data/types';
import { clock } from '../lib/format';
import { eventMeta } from './eventMeta';

interface Props {
  events: SimEvent[];
  phases: Phase[];
  currentTime: number;
  onSeek: (t: number) => void;
}

/**
 * Source events grouped into clinical phases (pre-arrest / resuscitation /
 * post-ROSC), so the shape of the case is visible at a glance. Events at/before
 * the playback cursor are "fired"; the most recent one is "now". Click any
 * event to move the cursor to it.
 */
export function Timeline({ events, phases, currentTime, onSeek }: Props) {
  const fired = events.filter((e) => e.time <= currentTime);
  const lastFired = fired.length ? fired[fired.length - 1] : undefined;

  const inPhase = (e: SimEvent, p: Phase, isLast: boolean) =>
    e.time >= p.start && (isLast ? e.time <= p.end : e.time < p.end);

  return (
    <section className="panel timeline">
      <div className="panel-head">
        <h2>Timeline</h2>
        <span className="tag tag-source">Source events</span>
      </div>

      <div className="phases">
        {phases.map((p, pi) => {
          const isLast = pi === phases.length - 1;
          const phaseEvents = events.filter((e) => inPhase(e, p, isLast));
          if (phaseEvents.length === 0) return null;
          return (
            <div className={`phase phase-${p.tone}`} key={p.key}>
              <div className="phase-head">
                <span className="phase-bar" aria-hidden />
                {p.label}
              </div>
              <ol className="events">
                {phaseEvents.map((e) => {
                  const { Icon, tone } = eventMeta(e.code);
                  const isFired = e.time <= currentTime;
                  const isNow =
                    lastFired && e.time === lastFired.time && e.code === lastFired.code;
                  return (
                    <li
                      key={`${e.time}-${e.code}`}
                      className={`event tone-${tone} ${isFired ? 'fired' : 'pending'} ${
                        isNow ? 'now' : ''
                      }`}
                    >
                      <button
                        className="event-btn"
                        onClick={() => onSeek(e.time)}
                        aria-current={isNow ? 'true' : undefined}
                      >
                        <span className="event-time">{clock(e.time)}</span>
                        <span className="event-icon">
                          <Icon />
                        </span>
                        <span className="event-type">{e.type}</span>
                        {isNow && <span className="now-tag">now</span>}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </div>
    </section>
  );
}
