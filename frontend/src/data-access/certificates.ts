import axios from 'axios';
import type { Certificate } from '@/entities/certificate';

export const getCertificates = async (): Promise<Certificate[]> => {
  const response = await axios.get('/api/certificates');
  return response.data;
};
