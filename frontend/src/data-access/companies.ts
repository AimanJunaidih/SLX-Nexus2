import axios from 'axios';
import type { Company } from '@/entities/company';
import type { Participant } from '@/entities/participant';

export const getCompanies = async (): Promise<Company[]> => {
  const response = await axios.get('/api/companies');
  return response.data;
};

export const createCompany = async (name: string): Promise<Company> => {
  const newCompany = {
    id: `c_${Math.random().toString(36).substr(2, 9)}`,
    name: name,
  };
  const response = await axios.post('/api/companies', newCompany);
  return response.data;
};

export const updateCompany = async (
  id: string,
  data: Partial<Pick<Company, 'name' | 'industry' | 'contactName' | 'contactEmail' | 'engagementStatus'>>,
): Promise<Company> => {
  const response = await axios.put(`/api/companies/${id}`, data);
  return response.data;
};

export const deleteCompany = async (id: string): Promise<void> => {
  await axios.delete(`/api/companies/${id}`);
};

export const getCompanyParticipants = async (companyId: string): Promise<Participant[]> => {
  const response = await axios.get(`/api/companies/${companyId}/participants`);
  return response.data;
};

export const addParticipantToCompany = async (companyId: string, participantId: string): Promise<Participant> => {
  const response = await axios.post(`/api/companies/${companyId}/participants`, { participantId });
  return response.data;
};

export const removeParticipantFromCompany = async (companyId: string, participantId: string): Promise<void> => {
  await axios.delete(`/api/companies/${companyId}/participants/${participantId}`);
};
