import { Entity, PrimaryColumn, Column } from 'typeorm';

export type SessionStatus = 'upcoming' | 'in-progress' | 'completed';

@Entity()
export class TrainingSession {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  date: string;

  @Column({ type: 'varchar' })
  status: SessionStatus;
}
