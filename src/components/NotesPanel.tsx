import { useState } from 'react';
import type { Note } from '../data/types';
import { mmss } from '../lib/format';
import { PinIcon, TrashIcon } from './icons';

interface Props {
  notes: Note[];
  currentTime: number;
  addNote: (text: string, time: number | null) => void;
  removeNote: (id: string) => void;
  onSeek: (t: number) => void;
}

/**
 * Instructor notes, optionally pinned to the current playback time. Persisted
 * to localStorage by the useNotes hook so they survive a refresh.
 */
export function NotesPanel({ notes, currentTime, addNote, removeNote, onSeek }: Props) {
  const [text, setText] = useState('');
  const [pin, setPin] = useState(true);

  const submit = () => {
    addNote(text, pin ? Math.round(currentTime) : null);
    setText('');
  };

  const sorted = [...notes].sort((a, b) => {
    if (a.time === null) return 1;
    if (b.time === null) return -1;
    return a.time - b.time;
  });

  return (
    <section className="panel notes">
      <div className="panel-head">
        <h2>Instructor Notes</h2>
        <span className="tag tag-source">Saved locally</span>
      </div>

      <div className="note-input">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add an observation…"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
          }}
        />
        <div className="note-actions">
          <label className={`pin-toggle ${pin ? 'on' : ''}`}>
            <input type="checkbox" checked={pin} onChange={(e) => setPin(e.target.checked)} />
            <PinIcon /> pin @ {mmss(currentTime)}
          </label>
          <button className="add-note" onClick={submit} disabled={!text.trim()}>
            Add note
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="muted notes-empty">No notes yet.</p>
      ) : (
        <ul className="note-list">
          {sorted.map((n) => (
            <li key={n.id} className="note-item">
              {n.time !== null && (
                <button className="note-time" onClick={() => onSeek(n.time as number)}>
                  {mmss(n.time)}
                </button>
              )}
              <span className="note-text">{n.text}</span>
              <button
                className="note-del"
                onClick={() => removeNote(n.id)}
                aria-label="Delete note"
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
