import axios from 'axios';

export interface PreTrainingTask {
  id: string;
  sessionId: string;
  companyId: string;
  text: string;
  done: boolean;
  sortOrder: number;
}

export const getSessionCompanyPreTasks = async (sessionId: string, companyId: string): Promise<PreTrainingTask[]> => {
  const response = await axios.get(`/api/pre-training-tasks/${sessionId}/${companyId}`);
  return response.data;
};

export const syncSessionCompanyPreTasks = async (sessionId: string, companyId: string, items: PreTrainingTask[]): Promise<PreTrainingTask[]> => {
  const response = await axios.post(`/api/pre-training-tasks/${sessionId}/${companyId}/sync`, { items });
  return response.data;
};
