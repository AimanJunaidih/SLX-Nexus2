import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class PostTrainingTask {
  @PrimaryColumn()
  id: string;

  @Column()
  sessionId: string;

  @Column()
  companyId: string;

  @Column()
  text: string;

  @Column({ default: false })
  done: boolean;

  @Column('int')
  sortOrder: number;
}
