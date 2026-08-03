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
  filePath?: string;
}

export function formatFileSize(kb: number): string {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

export function detectTypeFromFilename(filename: string): MaterialType {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext)) return 'document';
  if (['mp4', 'webm', 'avi', 'mov', 'mkv'].includes(ext)) return 'video';
  if (['ppt', 'pptx', 'key'].includes(ext)) return 'presentation';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'spreadsheet';
  return 'document';
}
