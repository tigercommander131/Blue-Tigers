import { useMemo, useState } from 'react';
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
import { Tabs, type TabItem } from './components/Tabs';
import { Playback } from './components/Playback';
import { Timeline } from './components/Timeline';
import { MetricsPanel } from './components/MetricsPanel';
import { AiDebriefPanel } from './components/AiDebriefPanel';
import { NotesPanel } from './components/NotesPanel';
import { PlayIcon, TargetIcon, SparkIcon, PinIcon } from './components/icons';

type TabKey = 'replay' | 'performance' | 'debrief' | 'notes';

const HINTS: Record<TabKey, string> = {
  replay: 'Press play to watch the case unfold — or click any event to jump straight to it.',
  performance: 'How the team’s timings compare to ACLS guideline targets.',
  debrief: 'AI-suggested talking points for the debrief — review before using.',
  notes: 'Your own observations, saved to this device. Pin one to the current moment.',
};

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

  const [tab, setTab] = useState<TabKey>('replay');

  // Jumping to a timestamp from another tab takes you to the replay to see it.
  const seekTo = (t: number) => {
    playback.seek(t);
    setTab('replay');
  };

  const tabs: TabItem<TabKey>[] = [
    { key: 'replay', label: 'Replay', Icon: PlayIcon },
    {
      key: 'performance',
      label: 'Performance',
      Icon: TargetIcon,
      badge: `${summary.targetsMet}/${summary.targetsTotal}`,
    },
    { key: 'debrief', label: 'Debrief', Icon: SparkIcon },
    { key: 'notes', label: 'Notes', Icon: PinIcon, badge: notes.length ? String(notes.length) : undefined },
  ];

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

      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      <p className="tab-hint no-print">{HINTS[tab]}</p>

      {/* All sections stay mounted (state + a complete printout); inactive ones
          are hidden via CSS, and @media print reveals every section. */}
      <main className="tab-panel">
        <section className={`tab-section ${tab === 'replay' ? 'is-active' : ''}`} role="tabpanel">
          <Playback playback={playback} events={events} duration={data.session.durationSeconds} />
          <Timeline
            events={events}
            phases={phases}
            currentTime={playback.currentTime}
            onSeek={playback.seek}
          />
        </section>

        <section className={`tab-section ${tab === 'performance' ? 'is-active' : ''}`} role="tabpanel">
          <MetricsPanel metrics={metrics} />
        </section>

        <section className={`tab-section ${tab === 'debrief' ? 'is-active' : ''}`} role="tabpanel">
          <AiDebriefPanel debrief={debrief} onSeek={seekTo} />
        </section>

        <section className={`tab-section ${tab === 'notes' ? 'is-active' : ''}`} role="tabpanel">
          <NotesPanel
            notes={notes}
            currentTime={playback.currentTime}
            addNote={addNote}
            removeNote={removeNote}
            onSeek={seekTo}
          />
        </section>
      </main>

      <footer className="app-footer muted">
        Prototype · structured event data only (no video / audio / images) · {data.session.id}
      </footer>
    </div>
  );
}
