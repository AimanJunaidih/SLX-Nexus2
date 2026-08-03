import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class SessionCompany {
  @PrimaryColumn()
  id: string;

  @Column()
  sessionId: string;

  @Column()
  companyId: string;
}
