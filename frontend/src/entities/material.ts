export type MaterialType = 'document' | 'video' | 'presentation' | 'spreadsheet';
export type MaterialStatus = 'ready' | 'draft' | 'review';

export interface Material {
  id: string;
  title: string;
  type: MaterialType;
  sizeKb: number;
  status: MaterialStatus;
  uploadedAt: string;
  owner: string;
}

export function formatFileSize(kb: number): string {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}
