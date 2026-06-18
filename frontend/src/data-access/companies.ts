import axios from 'axios';
import type { Company } from '@/entities/company';

export const getCompanies = async (): Promise<Company[]> => {
  const response = await axios.get('/api/companies');
  return response.data;
};
