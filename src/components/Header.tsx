import type { Participant, Session } from '../data/types';
import { mmss } from '../lib/format';

interface Props {
  session: Session;
  participants: Participant[];
}

export function Header({ session, participants }: Props) {
  return (
    <header className="header">
      <div className="header-id">
        <span className="rec-dot" aria-hidden />
        <div>
          <h1>Simulation Debrief</h1>
          <p className="muted">
            Session <strong>{session.id}</strong> · {mmss(session.durationSeconds)} ·{' '}
            ACLS cardiac arrest
          </p>
        </div>
      </div>
      <ul className="roster">
        {participants.map((p) => (
          <li key={p.id} className="chip">
            <span className="chip-id">{p.id}</span>
            {p.role}
          </li>
        ))}
      </ul>
    </header>
  );
}
