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
    setNotes((prev) => [
      ...prev,
      { id: crypto.randomUUID(), time, text: trimmed, createdAt: Date.now() },
    ]);
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notes, addNote, removeNote };
}

function load(key: string): Note[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Note[]) : [];
  } catch {
    return [];
  }
}
