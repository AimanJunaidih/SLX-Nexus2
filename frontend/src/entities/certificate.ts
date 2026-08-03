export type CertificateStatus = 'issued' | 'ready' | 'pending';

export interface Certificate {
  id: string;
  sessionId: string;
  participantId: string;
  participantName: string;
  company: string;
  role: string;
  score: number;
  completionDate: string;
  status: CertificateStatus;
}
