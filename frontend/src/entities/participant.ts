export type ModuleStatus = 0 | 1 | 2; // 0=pending, 1=in-progress, 2=complete

export interface Participant {
  id: string;
  name: string;
  company: string;
  role: string;
  avatarColor: string;
  mods: ModuleStatus[];
  score: number;
}

export const MODULE_NAMES = [
  'Onboarding Fundamentals',
  'Security Compliance',
  'Platform Walkthrough',
  'Advanced Features',
  'Assessment & Review',
] as const;

export function getCompletionPct(mods: ModuleStatus[]): number {
  if (mods.length === 0) return 0;
  const done = mods.filter((m) => m === 2).length;
  return Math.round((done / mods.length) * 100);
}

export function getParticipantStatusLabel(pct: number): 'On Track' | 'At Risk' | 'Completed' | 'Behind' {
  if (pct === 100) return 'Completed';
  if (pct >= 60) return 'On Track';
  if (pct >= 30) return 'At Risk';
  return 'Behind';
}
