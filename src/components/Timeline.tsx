import type { SimEvent } from '../data/types';
import { mmss } from '../lib/format';
import { eventMeta } from './eventMeta';

interface Props {
  events: SimEvent[];
  currentTime: number;
  onSeek: (t: number) => void;
}

/**
 * Source events plotted in time order. Events at/before the playback cursor are
 * "fired"; the most recent one is highlighted as "now". Click any event to move
 * the cursor to it.
 */
export function Timeline({ events, currentTime, onSeek }: Props) {
  const fired = events.filter((e) => e.time <= currentTime);
  const lastFired = fired.length ? fired[fired.length - 1] : undefined;

  return (
    <section className="panel timeline">
      <div className="panel-head">
        <h2>Timeline</h2>
        <span className="tag tag-source">Source events</span>
      </div>
      <ol className="events">
        {events.map((e) => {
          const { Icon, tone } = eventMeta(e.type);
          const isFired = e.time <= currentTime;
          const isNow = lastFired && e.time === lastFired.time && e.type === lastFired.type;
          return (
            <li
              key={`${e.time}-${e.type}`}
              className={`event tone-${tone} ${isFired ? 'fired' : 'pending'} ${
                isNow ? 'now' : ''
              }`}
            >
              <button className="event-btn" onClick={() => onSeek(e.time)}>
                <span className="event-time">{mmss(e.time)}</span>
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
    </section>
  );
}
