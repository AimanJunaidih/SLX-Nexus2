import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class SessionParticipant {
  @PrimaryColumn()
  id: string;

  @Column()
  sessionId: string;

  @Column()
  companyId: string;

  @Column()
  participantId: string;
}
