import { Entity, PrimaryColumn, Column } from 'typeorm';

export type EngagementStatus = 'active' | 'pending' | 'at-risk';

@Entity()
export class Company {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  industry: string;

  @Column()
  contactName: string;

  @Column()
  contactEmail: string;

  @Column('int')
  participantCount: number;

  @Column('int')
  completionPct: number;

  @Column({ type: 'varchar' })
  engagementStatus: EngagementStatus;
}
