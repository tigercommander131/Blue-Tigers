import { useMemo } from 'react';
import './App.css';
import { sampleSession } from './data/sampleSession';
import { computeMetrics } from './lib/metrics';
import { generateDebrief } from './lib/aiDebrief';
import { usePlayback } from './hooks/usePlayback';
import { useNotes } from './hooks/useNotes';
import { Header } from './components/Header';
import { Legend } from './components/Legend';
import { Playback } from './components/Playback';
import { Timeline } from './components/Timeline';
import { MetricsPanel } from './components/MetricsPanel';
import { AiDebriefPanel } from './components/AiDebriefPanel';
import { NotesPanel } from './components/NotesPanel';

export default function App() {
  const data = sampleSession;

  // Layer 2 + 3 are pure functions of the source data — compute once.
  const metrics = useMemo(() => computeMetrics(data), [data]);
  const debrief = useMemo(() => generateDebrief(data, metrics), [data, metrics]);

  const playback = usePlayback(data.session.durationSeconds);
  const { notes, addNote, removeNote } = useNotes(data.session.id);

  return (
    <div className="app">
      <Header session={data.session} participants={data.participants} />
      <Legend />

      <Playback playback={playback} events={data.events} duration={data.session.durationSeconds} />

      <main className="grid">
        <div className="col-left">
          <Timeline events={data.events} currentTime={playback.currentTime} onSeek={playback.seek} />
          <NotesPanel
            notes={notes}
            currentTime={playback.currentTime}
            addNote={addNote}
            removeNote={removeNote}
            onSeek={playback.seek}
          />
        </div>
        <div className="col-right">
          <MetricsPanel metrics={metrics} />
          <AiDebriefPanel debrief={debrief} onSeek={playback.seek} />
        </div>
      </main>

      <footer className="app-footer muted">
        Prototype · structured event data only (no video / audio / images) · SIM001
      </footer>
    </div>
  );
}
