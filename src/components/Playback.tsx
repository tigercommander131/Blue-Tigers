import type { SimEvent } from '../data/types';
import type { Playback as PlaybackState } from '../hooks/usePlayback';
import { mmss } from '../lib/format';
import { eventMeta } from './eventMeta';
import { PlayIcon, PauseIcon } from './icons';

interface Props {
  playback: PlaybackState;
  events: SimEvent[];
  duration: number;
}

const SPEEDS = [1, 2, 4];

/**
 * The scrubber. Owns no time state itself — it reads/writes the shared
 * `currentTime` cursor so the timeline and clock stay in lockstep with it.
 */
export function Playback({ playback, events, duration }: Props) {
  const { currentTime, isPlaying, speed, toggle, seek, setSpeed } = playback;
  const pct = (currentTime / duration) * 100;

  return (
    <section className="playback panel">
      <button className="play-btn" onClick={toggle} aria-label={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      <div className="scrubber">
        <div className="scrubber-track">
          <div className="scrubber-fill" style={{ width: `${pct}%` }} />
          {events.map((e) => {
            const { tone } = eventMeta(e.type);
            const left = (e.time / duration) * 100;
            const fired = e.time <= currentTime;
            return (
              <button
                key={`${e.time}-${e.type}`}
                className={`marker tone-${tone} ${fired ? 'fired' : ''}`}
                style={{ left: `${left}%` }}
                title={`${mmss(e.time)} — ${e.type}`}
                onClick={() => seek(e.time)}
                aria-label={`Seek to ${e.type} at ${mmss(e.time)}`}
              />
            );
          })}
          <div className="playhead" style={{ left: `${pct}%` }} aria-hidden />
        </div>
        <input
          className="scrubber-range"
          type="range"
          min={0}
          max={duration}
          step={1}
          value={Math.round(currentTime)}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Seek through session"
        />
      </div>

      <div className="playback-right">
        <span className="clock">
          {mmss(currentTime)} <span className="muted">/ {mmss(duration)}</span>
        </span>
        <div className="speeds">
          {SPEEDS.map((s) => (
            <button
              key={s}
              className={`speed ${speed === s ? 'active' : ''}`}
              onClick={() => setSpeed(s)}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
