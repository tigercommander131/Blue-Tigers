import type { ComponentType, SVGProps } from 'react';
import type { EventCode } from '../data/types';
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

/** Map a source event code to an icon + colour tone for the timeline. */
export function eventMeta(code: EventCode): EventMeta {
  switch (code) {
    case 'vf':
      return { Icon: HeartPulseIcon, tone: 'crisis' };
    case 'cpr':
      return { Icon: HeartIcon, tone: 'accent' };
    case 'shock':
      return { Icon: BoltIcon, tone: 'warn' };
    case 'adrenaline':
      return { Icon: SyringeIcon, tone: 'accent' };
    case 'rosc':
      return { Icon: CheckIcon, tone: 'good' };
    default:
      return { Icon: FlagIcon, tone: 'neutral' };
  }
}
