import axios from 'axios';
import type { Company } from '@/entities/company';

export const getCompanies = async (): Promise<Company[]> => {
  const response = await axios.get('/api/companies');
  return response.data;
};

export const createCompany = async (name: string): Promise<Company> => {
  const newCompany = {
    id: `c_${Math.random().toString(36).substr(2, 9)}`, // Generate a simple unique ID
    name: name,
  };
  const response = await axios.post('/api/companies', newCompany);
  return response.data;
};
