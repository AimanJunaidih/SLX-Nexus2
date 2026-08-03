import { Entity, PrimaryColumn, Column } from 'typeorm';

export type CertificateStatus = 'issued' | 'ready' | 'pending';

@Entity()
export class Certificate {
  @PrimaryColumn()
  id: string;

  @Column()
  sessionId: string;

  @Column()
  participantId: string;

  @Column()
  participantName: string;

  @Column()
  company: string;

  @Column()
  role: string;

  @Column('int')
  score: number;

  @Column()
  completionDate: string;

  @Column({ type: 'varchar' })
  status: CertificateStatus;
}
