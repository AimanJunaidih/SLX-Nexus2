import axios from 'axios';
import type { Participant } from '@/entities/participant';

export const getParticipants = async (): Promise<Participant[]> => {
  const response = await axios.get('/api/participants');
  return response.data;
};

export const createParticipant = async (data: {
  id: string;
  name: string;
  company: string;
  role: string;
  avatarColor: string;
  mods: (0 | 1 | 2)[];
  score: number;
}): Promise<Participant> => {
  const response = await axios.post('/api/participants', data);
  return response.data;
};

export const updateParticipant = async (
  id: string,
  data: Partial<Pick<Participant, 'mods' | 'score' | 'name' | 'company' | 'role' | 'avatarColor'>>,
): Promise<Participant> => {
  const response = await axios.patch(`/api/participants/${id}`, data);
  return response.data;
};

export const deleteParticipant = async (id: string): Promise<void> => {
  await axios.delete(`/api/participants/${id}`);
};
