import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Attendance {
  @PrimaryColumn()
  id: string;

  @Column()
  sessionId: string;

  @Column()
  participantId: string;

  @Column()
  companyId: string;

  @Column({ default: false })
  day1: boolean;

  @Column({ default: false })
  day2: boolean;
}
