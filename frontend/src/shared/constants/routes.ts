import type { ComponentType } from 'react';
import {
  IconLayoutDashboard,
  IconBuilding,
  IconUsers,
  IconBook,
  IconPresentation,
  IconChartBar,
  IconFiles,
  IconAward,
  IconCalendar,
  IconSchool,
  IconReceiptTax,
} from '@tabler/icons-react';

export interface NavRoute {
  path: string;
  title: string;
  section: string;
  Icon: ComponentType<{ size?: number; stroke?: number; className?: string }>;
  badge?: number;
}

export const NAV_ROUTES: NavRoute[] = [
  { path: '/', title: 'Overview', section: 'Main', Icon: IconLayoutDashboard },
  { path: '/companies', title: 'Companies', section: 'Management', Icon: IconBuilding, badge: 4 },
  { path: '/participants', title: 'Participants', section: 'Management', Icon: IconUsers, badge: 10 },
  { path: '/rebate-tracker', title: 'Rebate Tracker', section: 'Management', Icon: IconReceiptTax },
  { path: '/pre-training', title: 'Pre-Training', section: 'Training Phases', Icon: IconBook },
  { path: '/training-sessions', title: 'Training Sessions', section: 'Training Phases', Icon: IconSchool },
  { path: '/live-session', title: 'Live Session', section: 'Training Phases', Icon: IconPresentation },
  { path: '/post-training', title: 'Post-Training', section: 'Training Phases', Icon: IconChartBar },
  { path: '/materials', title: 'Materials', section: 'Resources', Icon: IconFiles, badge: 10 },
  { path: '/certificates', title: 'Certificates', section: 'Resources', Icon: IconAward },
  { path: '/schedule', title: 'Schedule', section: 'Resources', Icon: IconCalendar },
];

export const NAV_SECTIONS = ['Main', 'Management', 'Training Phases', 'Resources'] as const;
