import { useMemo } from 'react';
import './App.css';
import { sampleSession } from './data/sampleSession';
import { computeMetrics, sortedEvents } from './lib/metrics';
import { computePhases, computeSummary } from './lib/summary';
import { generateDebrief } from './lib/aiDebrief';
import { usePlayback } from './hooks/usePlayback';
import { useNotes } from './hooks/useNotes';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Legend } from './components/Legend';
import { Playback } from './components/Playback';
import { Timeline } from './components/Timeline';
import { MetricsPanel } from './components/MetricsPanel';
import { AiDebriefPanel } from './components/AiDebriefPanel';
import { NotesPanel } from './components/NotesPanel';

export default function App() {
  const data = sampleSession;

  // Layers 2 + 3 are pure functions of the source data — compute once.
  const events = useMemo(() => sortedEvents(data), [data]);
  const metrics = useMemo(() => computeMetrics(data), [data]);
  const summary = useMemo(() => computeSummary(data, metrics), [data, metrics]);
  const phases = useMemo(() => computePhases(data), [data]);
  const debrief = useMemo(() => generateDebrief(data, metrics), [data, metrics]);

  const playback = usePlayback(data.session.durationSeconds);
  const { notes, addNote, removeNote } = useNotes(data.session.id);
  const { theme, toggle } = useTheme();

  return (
    <div className="app">
      <Header
        session={data.session}
        participants={data.participants}
        theme={theme}
        onToggleTheme={toggle}
        onPrint={() => window.print()}
      />

      <Hero summary={summary} />
      <Legend />

      <Playback playback={playback} events={events} duration={data.session.durationSeconds} />

      <main className="grid">
        <div className="col-left">
          <Timeline
            events={events}
            phases={phases}
            currentTime={playback.currentTime}
            onSeek={playback.seek}
          />
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
        Prototype · structured event data only (no video / audio / images) · {data.session.id}
      </footer>
    </div>
  );
}
