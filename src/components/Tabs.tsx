import type { ComponentType, SVGProps } from 'react';
import { useRef } from 'react';

export interface TabItem<K extends string> {
  key: K;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Optional small count/score shown on the tab, e.g. "1/2" or "3". */
  badge?: string;
}

interface Props<K extends string> {
  tabs: TabItem<K>[];
  active: K;
  onChange: (k: K) => void;
}

/**
 * Plain, keyboard-navigable tab bar. Splits the review into one task at a time
 * so a first-time user is never looking at the whole tool at once.
 */
export function Tabs<K extends string>({ tabs, active, onChange }: Props<K>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = e.key === 'ArrowRight' ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
    onChange(tabs[next].key);
    refs.current[next]?.focus();
  };

  return (
    <div className="tabs no-print" role="tablist" aria-label="Debrief sections">
      {tabs.map((t, i) => {
        const selected = t.key === active;
        return (
          <button
            key={t.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={`tab ${selected ? 'active' : ''}`}
            onClick={() => onChange(t.key)}
            onKeyDown={(e) => onKey(e, i)}
          >
            <t.Icon />
            <span className="tab-label">{t.label}</span>
            {t.badge && <span className="tab-badge">{t.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
