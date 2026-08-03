import axios from 'axios';
import type { Material, MaterialType, MaterialStatus } from '@/entities/material';

export const getMaterials = async (): Promise<Material[]> => {
  const response = await axios.get('/api/materials');
  return response.data;
};

export const createMaterial = async (data: {
  title: string;
  type: MaterialType;
  status: MaterialStatus;
  owner: string;
  file?: File;
}): Promise<Material> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('type', data.type);
  formData.append('status', data.status);
  formData.append('owner', data.owner);
  if (data.file) {
    formData.append('file', data.file);
  }
  const response = await axios.post('/api/materials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteMaterial = async (id: string): Promise<void> => {
  await axios.delete(`/api/materials/${id}`);
};

export const bulkDeleteMaterials = async (ids: string[]): Promise<void> => {
  await axios.post('/api/materials/bulk-delete', { ids });
};
