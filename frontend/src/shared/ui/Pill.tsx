import type { ReactNode } from 'react';

type PillVariant = 'ok' | 'warn' | 'danger' | 'info' | 'neutral';

interface PillProps {
  variant: PillVariant;
  children: ReactNode;
}

export default function Pill({ variant, children }: PillProps) {
  return <span className={`pill pill-${variant}`}>{children}</span>;
}
