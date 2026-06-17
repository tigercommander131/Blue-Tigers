import { useCallback, useEffect, useRef, useState } from 'react';

export interface Playback {
  currentTime: number;
  isPlaying: boolean;
  speed: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (t: number) => void;
  setSpeed: (s: number) => void;
}

/**
 * Drives a single `currentTime` cursor (in seconds) that the whole review
 * screen reacts to — the scrubber, the timeline, the clock. Ticks on an
 * interval scaled by `speed`; stops at the end of the session.
 */
export function usePlayback(durationSeconds: number): Playback {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      last.current = null;
      return;
    }
    const id = setInterval(() => {
      const now = performance.now();
      const dtMs = last.current === null ? 0 : now - last.current;
      last.current = now;
      setCurrentTime((t) => {
        const next = t + (dtMs / 1000) * speed;
        if (next >= durationSeconds) {
          setIsPlaying(false);
          return durationSeconds;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [isPlaying, speed, durationSeconds]);

  const play = useCallback(() => {
    // Restart from 0 if we're parked at the end.
    setCurrentTime((t) => (t >= durationSeconds ? 0 : t));
    setIsPlaying(true);
  }, [durationSeconds]);

  const pause = useCallback(() => setIsPlaying(false), []);
  const toggle = useCallback(() => (isPlaying ? pause() : play()), [isPlaying, pause, play]);

  const seek = useCallback(
    (t: number) => {
      last.current = null;
      setCurrentTime(Math.max(0, Math.min(durationSeconds, t)));
    },
    [durationSeconds],
  );

  return { currentTime, isPlaying, speed, play, pause, toggle, seek, setSpeed };
}
