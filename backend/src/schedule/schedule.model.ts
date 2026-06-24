import { Entity, PrimaryColumn, Column } from 'typeorm';

export type DayStatus = 'completed' | 'today' | 'upcoming' | 'cancelled';
export type EventTag = 'required' | 'optional' | 'external' | 'recorded';
export type EventType = 'session' | 'workshop' | 'assessment' | 'break' | 'office-hours';

export interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  type: EventType;
  tags: EventTag[];
  presenter?: string;
  durationMin: number;
}

@Entity()
export class ScheduleDay {
  @PrimaryColumn()
  date: string;

  @Column()
  label: string;

  @Column({ type: 'varchar' })
  status: DayStatus;

  @Column('simple-json')
  events: ScheduleEvent[];
}
