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

export interface ScheduleDay {
  date: string;
  label: string;
  status: DayStatus;
  events: ScheduleEvent[];
}
