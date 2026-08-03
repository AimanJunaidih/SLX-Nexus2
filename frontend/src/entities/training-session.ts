import type { Participant } from './participant';

export type SessionStatus = 'upcoming' | 'in-progress' | 'completed';

export interface SessionCompany {
  id: string;
  name: string;
  participants: Participant[];
}

export interface TrainingSession {
  id: string;
  name: string;
  date: string;
  status: SessionStatus;
  companies: SessionCompany[];
}
