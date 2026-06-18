import axios from 'axios';
import type { ScheduleDay } from '@/entities/schedule';

export const getScheduleData = async (): Promise<ScheduleDay[]> => {
  const response = await axios.get('/api/schedule');
  return response.data;
};
