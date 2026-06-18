import type { EngagementStatus } from '@/entities/company';
import type { MaterialStatus } from '@/entities/material';
import type { CertificateStatus } from '@/entities/certificate';
import type { DayStatus } from '@/entities/schedule';

// Participant completion → pill variant
export function completionToPill(pct: number): 'ok' | 'warn' | 'danger' | 'neutral' {
  if (pct === 100) return 'ok';
  if (pct >= 60) return 'ok';
  if (pct >= 30) return 'warn';
  return 'danger';
}

// Score → visual tier
export function scoreColor(score: number): 'high' | 'mid' | 'low' {
  if (score >= 80) return 'high';
  if (score >= 60) return 'mid';
  return 'low';
}

// Progress bar color from value
export function progressColor(pct: number): 'green' | 'yellow' | 'red' {
  if (pct >= 70) return 'green';
  if (pct >= 40) return 'yellow';
  return 'red';
}

// Engagement status pill
export const ENGAGEMENT_PILL: Record<EngagementStatus, 'ok' | 'warn' | 'danger'> = {
  active: 'ok',
  pending: 'warn',
  'at-risk': 'danger',
};

export const ENGAGEMENT_LABEL: Record<EngagementStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  'at-risk': 'At Risk',
};

// Material status
export const MATERIAL_STATUS_PILL: Record<MaterialStatus, 'ok' | 'warn' | 'neutral'> = {
  ready: 'ok',
  review: 'warn',
  draft: 'neutral',
};

export const MATERIAL_STATUS_LABEL: Record<MaterialStatus, string> = {
  ready: 'Ready',
  review: 'In Review',
  draft: 'Draft',
};

// Certificate status
export const CERT_STATUS_PILL: Record<CertificateStatus, 'ok' | 'info' | 'neutral'> = {
  issued: 'ok',
  ready: 'info',
  pending: 'neutral',
};

export const CERT_STATUS_LABEL: Record<CertificateStatus, string> = {
  issued: 'Issued',
  ready: 'Ready to Issue',
  pending: 'Pending',
};

// Day status label
export const DAY_STATUS_LABEL: Record<DayStatus, string> = {
  completed: 'Done',
  today: 'Today',
  upcoming: 'Upcoming',
  cancelled: 'Cancelled',
};
