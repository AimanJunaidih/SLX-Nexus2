import axios from 'axios';
import type { TrainingSession, SessionStatus, SessionCompany } from '@/entities/training-session';
import type { Company } from '@/entities/company';
import type { Participant } from '@/entities/participant';

interface ApiSessionCompany {
  id: string;
  companyId: string;
  participants: { id: string; participantId: string }[];
}

interface ApiSession {
  id: string;
  name: string;
  date: string;
  status: SessionStatus;
  companies: ApiSessionCompany[];
}

function resolveSession(api: ApiSession, companies: Company[], participants: Participant[]): TrainingSession {
  const companyMap = new Map(companies.map((c) => [c.id, c]));
  const participantMap = new Map(participants.map((p) => [p.id, p]));

  const resolvedCompanies: SessionCompany[] = api.companies.map((sc) => {
    const company = companyMap.get(sc.companyId);
    return {
      id: sc.companyId,
      name: company?.name ?? sc.companyId,
      participants: sc.participants
        .map((sp) => participantMap.get(sp.participantId))
        .filter((p): p is Participant => p !== undefined),
    };
  });

  return { ...api, companies: resolvedCompanies };
}

export const getTrainingSessions = async (): Promise<TrainingSession[]> => {
  const [apiSessions, companies, participants] = await Promise.all([
    axios.get<ApiSession[]>('/api/training-sessions'),
    axios.get<Company[]>('/api/companies'),
    axios.get<Participant[]>('/api/participants'),
  ]);
  return apiSessions.data.map((s) => resolveSession(s, companies.data, participants.data));
};

export const createTrainingSession = async (data: {
  name: string;
  date: string;
  status: SessionStatus;
}): Promise<TrainingSession> => {
  const response = await axios.post('/api/training-sessions', data);
  return { ...response.data, companies: [] };
};

export const deleteTrainingSession = async (id: string): Promise<void> => {
  await axios.delete(`/api/training-sessions/${id}`);
};

export const addCompanyToSession = async (sessionId: string, companyId: string): Promise<void> => {
  await axios.post(`/api/training-sessions/${sessionId}/companies`, { companyId });
};

export const removeCompanyFromSession = async (sessionId: string, companyId: string): Promise<void> => {
  await axios.delete(`/api/training-sessions/${sessionId}/companies/${companyId}`);
};

export const addParticipantToSession = async (sessionId: string, companyId: string, participantId: string): Promise<void> => {
  await axios.post(`/api/training-sessions/${sessionId}/companies/${companyId}/participants`, { participantId });
};

export const removeParticipantFromSession = async (sessionId: string, companyId: string, participantId: string): Promise<void> => {
  await axios.delete(`/api/training-sessions/${sessionId}/companies/${companyId}/participants/${participantId}`);
};
