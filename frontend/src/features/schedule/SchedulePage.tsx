import { useState, useEffect } from 'react';
import { IconCalendar, IconCircleCheck, IconArrowRight } from '@tabler/icons-react';
import StatCard from '@/shared/ui/StatCard';
import Panel from '@/shared/ui/Panel';
import Pill from '@/shared/ui/Pill';
import { getScheduleData } from '@/data-access/scheduleData';
import type { ScheduleDay } from '@/entities/schedule';
import { DAY_STATUS_LABEL } from '@/shared/constants/status';

const DAY_STATUS_PILL: Record<ScheduleDay['status'], 'ok' | 'info' | 'neutral' | 'warn'> = {
  completed: 'ok',
  today: 'info',
  upcoming: 'neutral',
  cancelled: 'warn',
};

export default function SchedulePage() {
  const [scheduleData, setScheduleData] = useState<ScheduleDay[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScheduleData().then((data) => {
      setScheduleData(data);
      const todayIdx = data.findIndex((d) => d.status === 'today');
      setSelectedIdx(todayIdx >= 0 ? todayIdx : 0);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  const totalDays = scheduleData.length;
  const completedDays = scheduleData.filter((d) => d.status === 'completed').length;
  const upcomingDays = scheduleData.filter((d) => d.status === 'upcoming').length;

  const selectedDay = scheduleData[selectedIdx];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Schedule</h1>
        <p className="page-subtitle">Program timeline and session calendar.</p>
      </div>

      <div className="stat-grid stat-grid-3">
        <StatCard
          icon={<IconCalendar size={20} stroke={1.8} />}
          iconColor="blue"
          value={totalDays}
          label="Program Days"
        />
        <StatCard
          icon={<IconCircleCheck size={20} stroke={1.8} />}
          iconColor="green"
          value={completedDays}
          label="Days Completed"
        />
        <StatCard
          icon={<IconArrowRight size={20} stroke={1.8} />}
          iconColor="yellow"
          value={upcomingDays}
          label="Days Upcoming"
        />
      </div>

      <div className="schedule-layout">
        <div className="day-list">
          {scheduleData.map((day, idx) => (
            <div
              key={day.date}
              className={`day-item ${day.status}${idx === selectedIdx ? ' selected' : ''}`}
              onClick={() => setSelectedIdx(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedIdx(idx)}
              style={idx === selectedIdx ? { outline: '2px solid var(--accent)', outlineOffset: 1 } : undefined}
            >
              <div className="day-label">{day.label}</div>
              <div className="day-date">{day.date}</div>
              <div style={{ marginTop: 4 }}>
                <Pill variant={DAY_STATUS_PILL[day.status]}>{DAY_STATUS_LABEL[day.status]}</Pill>
              </div>
            </div>
          ))}
        </div>

        {selectedDay && (
          <Panel
            title={`${selectedDay.label} — ${selectedDay.date}`}
            subtitle={`${selectedDay.events.length} event${selectedDay.events.length !== 1 ? 's' : ''}`}
          >
            <div className="event-list">
              {selectedDay.events.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No events scheduled.</p>
              )}
              {selectedDay.events.map((ev) => (
                <div className="event-item" key={ev.id}>
                  <div className="event-time">{ev.time}</div>
                  <div className="event-info">
                    <div className="event-title">{ev.title}</div>
                    {ev.presenter && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                        {ev.presenter} · {ev.durationMin} min
                      </div>
                    )}
                    <div className="event-tags">
                      {ev.tags.map((tag) => (
                        <span key={tag} className={`event-tag ${tag}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </>
  );
}
