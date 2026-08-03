import axios from 'axios';

export interface PostTrainingTask {
  id: string;
  sessionId: string;
  companyId: string;
  text: string;
  done: boolean;
  sortOrder: number;
}

export const getSessionCompanyTasks = async (sessionId: string, companyId: string): Promise<PostTrainingTask[]> => {
  const response = await axios.get(`/api/post-training-tasks/${sessionId}/${companyId}`);
  return response.data;
};

export const syncSessionCompanyTasks = async (sessionId: string, companyId: string, items: PostTrainingTask[]): Promise<PostTrainingTask[]> => {
  const response = await axios.post(`/api/post-training-tasks/${sessionId}/${companyId}/sync`, { items });
  return response.data;
};
