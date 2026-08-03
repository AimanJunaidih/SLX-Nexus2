import type { TrainingSession } from '../training-sessions/training-session.model';
import type { SessionCompany } from '../training-sessions/session-company.model';
import type { SessionParticipant } from '../training-sessions/session-participant.model';

export const trainingSessions: TrainingSession[] = [
  { id: 'ts1', name: 'Session 1', date: '2026-07-15', status: 'completed' },
  { id: 'ts2', name: 'Session 2', date: '2026-07-22', status: 'in-progress' },
  { id: 'ts3', name: 'Session 3', date: '2026-07-29', status: 'upcoming' },
];

export const sessionCompanies: SessionCompany[] = [
  { id: 'sc_ts1_c1', sessionId: 'ts1', companyId: 'c1' },
  { id: 'sc_ts1_c2', sessionId: 'ts1', companyId: 'c2' },
  { id: 'sc_ts2_c2', sessionId: 'ts2', companyId: 'c2' },
  { id: 'sc_ts2_c3', sessionId: 'ts2', companyId: 'c3' },
  { id: 'sc_ts3_c1', sessionId: 'ts3', companyId: 'c1' },
  { id: 'sc_ts3_c3', sessionId: 'ts3', companyId: 'c3' },
];

export const sessionParticipants: SessionParticipant[] = [
  { id: 'sp_ts1_c1_p1', sessionId: 'ts1', companyId: 'c1', participantId: 'p1' },
  { id: 'sp_ts1_c1_p2', sessionId: 'ts1', companyId: 'c1', participantId: 'p2' },
  { id: 'sp_ts1_c1_p7', sessionId: 'ts1', companyId: 'c1', participantId: 'p7' },
  { id: 'sp_ts1_c2_p3', sessionId: 'ts1', companyId: 'c2', participantId: 'p3' },
  { id: 'sp_ts1_c2_p4', sessionId: 'ts1', companyId: 'c2', participantId: 'p4' },
  { id: 'sp_ts1_c2_p8', sessionId: 'ts1', companyId: 'c2', participantId: 'p8' },
  { id: 'sp_ts2_c2_p3', sessionId: 'ts2', companyId: 'c2', participantId: 'p3' },
  { id: 'sp_ts2_c2_p4', sessionId: 'ts2', companyId: 'c2', participantId: 'p4' },
  { id: 'sp_ts2_c2_p8', sessionId: 'ts2', companyId: 'c2', participantId: 'p8' },
  { id: 'sp_ts2_c3_p5', sessionId: 'ts2', companyId: 'c3', participantId: 'p5' },
  { id: 'sp_ts2_c3_p6', sessionId: 'ts2', companyId: 'c3', participantId: 'p6' },
  { id: 'sp_ts3_c1_p1', sessionId: 'ts3', companyId: 'c1', participantId: 'p1' },
  { id: 'sp_ts3_c1_p2', sessionId: 'ts3', companyId: 'c1', participantId: 'p2' },
  { id: 'sp_ts3_c3_p5', sessionId: 'ts3', companyId: 'c3', participantId: 'p5' },
  { id: 'sp_ts3_c3_p6', sessionId: 'ts3', companyId: 'c3', participantId: 'p6' },
];
