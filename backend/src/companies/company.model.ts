import { Entity, PrimaryColumn, Column } from 'typeorm';

export type EngagementStatus = 'active' | 'pending' | 'at-risk';

@Entity()
export class Company {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  contactName: string;

  @Column({ nullable: true })
  contactEmail: string;

  @Column('int', { default: 0 })
  participantCount: number;

  @Column({ type: 'varchar', default: 'pending' })
  engagementStatus: EngagementStatus;
}
