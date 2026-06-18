import axios from 'axios';
import type { Material } from '@/entities/material';

export const getMaterials = async (): Promise<Material[]> => {
  const response = await axios.get('/api/materials');
  return response.data;
};
