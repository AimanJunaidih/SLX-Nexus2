import { Entity, PrimaryColumn, Column } from 'typeorm';

export type MaterialType = 'document' | 'video' | 'presentation' | 'spreadsheet';
export type MaterialStatus = 'ready' | 'draft' | 'review';

@Entity()
export class Material {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column({ type: 'varchar' })
  type: MaterialType;

  @Column('int')
  sizeKb: number;

  @Column({ type: 'varchar' })
  status: MaterialStatus;

  @Column()
  uploadedAt: string;

  @Column()
  owner: string;
}

export function formatFileSize(kb: number): string {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}
