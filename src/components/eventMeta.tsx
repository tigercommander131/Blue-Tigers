import type { ComponentType, SVGProps } from 'react';
import {
  BoltIcon,
  CheckIcon,
  FlagIcon,
  HeartIcon,
  HeartPulseIcon,
  SyringeIcon,
} from './icons';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export interface EventMeta {
  Icon: IconType;
  /** CSS tone class suffix: maps to a status colour. */
  tone: 'crisis' | 'good' | 'warn' | 'accent' | 'neutral';
}

/** Map a source event type to an icon + colour tone for the timeline. */
export function eventMeta(type: string): EventMeta {
  const t = type.toLowerCase();
  if (t.includes('fibrillation')) return { Icon: HeartPulseIcon, tone: 'crisis' };
  if (t.includes('cpr')) return { Icon: HeartIcon, tone: 'accent' };
  if (t.includes('shock')) return { Icon: BoltIcon, tone: 'warn' };
  if (t.includes('adrenaline')) return { Icon: SyringeIcon, tone: 'accent' };
  if (t.includes('spontaneous')) return { Icon: CheckIcon, tone: 'good' };
  return { Icon: FlagIcon, tone: 'neutral' };
}
