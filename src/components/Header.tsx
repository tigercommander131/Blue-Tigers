import type { Participant, Session } from '../data/types';
import type { Theme } from '../hooks/useTheme';
import { clock } from '../lib/format';
import { ActivityIcon, MoonIcon, PrinterIcon, SunIcon } from './icons';

interface Props {
  session: Session;
  participants: Participant[];
  theme: Theme;
  onToggleTheme: () => void;
  onPrint: () => void;
}

export function Header({ session, participants, theme, onToggleTheme, onPrint }: Props) {
  return (
    <header className="header">
      <div className="header-id">
        <span className="header-mark" aria-hidden>
          <ActivityIcon />
        </span>
        <div>
          <h1>Simulation Debrief</h1>
          <p className="muted">
            Session <strong>{session.id}</strong> · {clock(session.durationSeconds)} ·{' '}
            ACLS cardiac arrest
          </p>
        </div>
      </div>

      <div className="header-side">
        <div className="header-actions no-print">
          <button className="icon-btn" onClick={onPrint} aria-label="Print debrief">
            <PrinterIcon /> Print
          </button>
          <button
            className="icon-btn"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
        <ul className="roster">
          {participants.map((p) => (
            <li key={p.id} className="chip">
              <span className="chip-id">{p.id}</span>
              {p.role}
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
