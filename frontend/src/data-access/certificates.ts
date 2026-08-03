import axios from 'axios';
import type { Certificate, CertificateStatus } from '@/entities/certificate';

export const getCertificates = async (): Promise<Certificate[]> => {
  const response = await axios.get('/api/certificates');
  return response.data;
};

export const createCertificate = async (data: {
  sessionId: string;
  participantId: string;
  participantName: string;
  company: string;
  role: string;
  score: number;
  completionDate?: string;
  status: CertificateStatus;
}): Promise<Certificate> => {
  const response = await axios.post('/api/certificates', data);
  return response.data;
};

export const updateCertificateStatus = async (id: string, status: CertificateStatus): Promise<Certificate> => {
  const response = await axios.patch(`/api/certificates/${id}/status`, { status });
  return response.data;
};
