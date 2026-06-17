import { useCallback, useEffect, useState } from 'react';
import type { Note } from '../data/types';

/**
 * Instructor notes, persisted to localStorage keyed by session id so they
 * survive a refresh. This is the one bit of "future stream" data the prototype
 * actually captures; a production build would sync it server-side.
 */
export function useNotes(sessionId: string) {
  const key = `sim-debrief:notes:${sessionId}`;
  const [notes, setNotes] = useState<Note[]>(() => load(key));

  useEffect(() => {
    setNotes(load(key));
  }, [key]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(notes));
    } catch {
      /* storage unavailable — notes stay in memory only */
    }
  }, [key, notes]);

  const addNote = useCallback((text: string, time: number | null) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setNotes((prev) => [...prev, { id: uuid(), time, text: trimmed, createdAt: Date.now() }]);
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notes, addNote, removeNote };
}

/** UUID with a fallback for non-secure contexts / older browsers. */
function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** A well-formed note from storage, ignoring anything malformed. */
function isNote(v: unknown): v is Note {
  if (!v || typeof v !== 'object') return false;
  const n = v as Record<string, unknown>;
  return (
    typeof n.id === 'string' &&
    typeof n.text === 'string' &&
    (n.time === null || typeof n.time === 'number') &&
    typeof n.createdAt === 'number'
  );
}

function load(key: string): Note[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isNote) : [];
  } catch {
    return [];
  }
}
