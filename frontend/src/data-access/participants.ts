import axios from 'axios';
import type { Participant } from '@/entities/participant';

export const getParticipants = async (): Promise<Participant[]> => {
  const response = await axios.get('/api/participants');
  return response.data;
};
