import { useState, useEffect, useRef } from 'react';
import {
  IconPresentation,
  IconUsers,
  IconBuilding,
  IconUserCheck,
  IconUserX,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import StatCard from '@/shared/ui/StatCard';
import Pill from '@/shared/ui/Pill';
import AvatarBadge from '@/shared/ui/AvatarBadge';
import { getTrainingSessions } from '@/data-access/training-sessions';
import { getSessionAttendance, syncSessionAttendance } from '@/data-access/attendance';
import type { TrainingSession, SessionCompany, SessionStatus } from '@/entities/training-session';

type Attendance = Record<string, { day1: boolean; day2: boolean }>;

const DAY_LABELS = ['Day 1', 'Day 2'] as const;
type DayKey = 'day1' | 'day2';

const STATUS_PILL: Record<SessionStatus, 'ok' | 'info' | 'neutral'> = {
  completed: 'ok',
  'in-progress': 'info',
  upcoming: 'neutral',
};

const STATUS_LABEL: Record<SessionStatus, string> = {
  completed: 'Completed',
  'in-progress': 'In Progress',
  upcoming: 'Upcoming',
};

function findCurrentSessionId(sessions: TrainingSession[]): string {
  const inProgress = sessions.find((s) => s.status === 'in-progress');
  if (inProgress) return inProgress.id;
  const nextUpcoming = sessions.find((s) => s.status === 'upcoming');
  if (nextUpcoming) return nextUpcoming.id;
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  return sorted[sorted.length - 1]?.id ?? '';
}

export default function LiveSessionPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [activeDay, setActiveDay] = useState<DayKey>('day1');
  const [attendance, setAttendance] = useState<Attendance>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    getTrainingSessions().then((data) => {
      setSessions(data);
      setSelectedSessionId(findCurrentSessionId(data));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (sessions.length === 0) return;
    const interval = setInterval(() => {
      const best = findCurrentSessionId(sessions);
      setSelectedSessionId((prev) => (prev !== best ? best : prev));
    }, 60_000);
    return () => clearInterval(interval);
  }, [sessions]);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  useEffect(() => {
    if (!selectedSessionId) return;
    getSessionAttendance(selectedSessionId).then((records) => {
      const init: Attendance = {};
      for (const company of (selectedSession?.companies ?? [])) {
        for (const p of company.participants) {
          init[p.id] = { day1: false, day2: false };
        }
      }
      for (const record of records) {
        if (init[record.participantId]) {
          init[record.participantId] = { day1: record.day1, day2: record.day2 };
        }
      }
      setAttendance(init);
      setDirty(false);
    });
  }, [selectedSessionId, selectedSession?.companies.length]);

  const toggleAttendance = (participantId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        [activeDay]: !(prev[participantId]?.[activeDay] ?? false),
      },
    }));
    setDirty(true);
  };

  const markAll = (present: boolean) => {
    if (!selectedSession) return;
    const updated: Attendance = { ...attendance };
    for (const company of selectedSession.companies) {
      for (const p of company.participants) {
        updated[p.id] = { ...updated[p.id], [activeDay]: present };
      }
    }
    setAttendance(updated);
    setDirty(true);
  };

  const handleSave = async () => {
    if (!selectedSessionId || !selectedSession) return;
    setSaving(true);
    try {
      const items: { participantId: string; companyId: string; day1: boolean; day2: boolean }[] = [];
      for (const company of selectedSession.companies) {
        for (const p of company.participants) {
          items.push({
            participantId: p.id,
            companyId: company.id,
            day1: attendance[p.id]?.day1 ?? false,
            day2: attendance[p.id]?.day2 ?? false,
          });
        }
      }
      await syncSessionAttendance(selectedSessionId, items);
      setSaved(true);
      setDirty(false);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      console.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const allParticipants = selectedSession?.companies.flatMap((c) => c.participants) ?? [];
  const presentCount = allParticipants.filter((p) => attendance[p.id]?.[activeDay]).length;
  const absentCount = allParticipants.length - presentCount;
  const companyCount = selectedSession?.companies.length ?? 0;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Live Session</h1>
          <p className="page-subtitle">Select a training session and track daily attendance for each participant.</p>
        </div>
        {selectedSession && (
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 18px',
              background: saved ? '#059669' : dirty ? '#4f46e5' : '#e5e7eb',
              color: dirty || saved ? 'white' : '#9ca3af',
              border: 'none', borderRadius: 8,
              cursor: dirty && !saving ? 'pointer' : 'not-allowed',
              fontWeight: 600, fontSize: 13, transition: 'background 0.2s',
            }}
          >
            <IconDeviceFloppy size={16} />
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Attendance'}
          </button>
        )}
      </div>

      <div style={{
        background: 'white', borderRadius: 8, border: '1px solid #e5e7eb',
        padding: '16px 20px', marginBottom: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
            Current Session:
          </label>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            style={{
              padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 6,
              fontSize: 14, outline: 'none', background: 'white', color: '#374151',
              minWidth: 200,
            }}
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.date} ({STATUS_LABEL[s.status]})
              </option>
            ))}
          </select>

          {selectedSession && (
            <Pill variant={STATUS_PILL[selectedSession.status]}>
              {STATUS_LABEL[selectedSession.status]}
            </Pill>
          )}

          {selectedSession && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <button
                onClick={() => markAll(true)}
                style={{
                  padding: '6px 12px', background: '#059669', color: 'white',
                  border: 'none', borderRadius: 6, cursor: 'pointer',
                  fontWeight: 500, fontSize: 12,
                }}
              >
                Mark All Present
              </button>
              <button
                onClick={() => markAll(false)}
                style={{
                  padding: '6px 12px', background: '#dc2626', color: 'white',
                  border: 'none', borderRadius: 6, cursor: 'pointer',
                  fontWeight: 500, fontSize: 12,
                }}
              >
                Mark All Absent
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedSession && (
        <>
          <div className="stat-grid">
            <StatCard
              icon={<IconPresentation size={20} stroke={1.8} />}
              iconColor="blue"
              value={selectedSession.name}
              label={selectedSession.date}
            />
            <StatCard
              icon={<IconBuilding size={20} stroke={1.8} />}
              iconColor="teal"
              value={companyCount}
              label="Companies"
            />
            <StatCard
              icon={<IconUsers size={20} stroke={1.8} />}
              iconColor="blue"
              value={allParticipants.length}
              label="Total Participants"
            />
            <StatCard
              icon={<IconUserCheck size={20} stroke={1.8} />}
              iconColor="green"
              value={presentCount}
              label={`Present (${DAY_LABELS[activeDay === 'day1' ? 0 : 1]})`}
              sub={`${absentCount} absent`}
            />
          </div>

          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {(['day1', 'day2'] as const).map((day, idx) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                style={{
                  padding: '10px 28px', fontWeight: 600, fontSize: 13,
                  border: '1px solid #d1d5db', cursor: 'pointer',
                  background: activeDay === day ? '#4f46e5' : 'white',
                  color: activeDay === day ? 'white' : '#374151',
                  borderRadius: idx === 0 ? '8px 0 0 8px' : '0 8px 8px 0',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {DAY_LABELS[idx]}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selectedSession.companies.map((company) => (
              <CompanyAttendanceCard
                key={company.id}
                company={company}
                attendance={attendance}
                toggleAttendance={toggleAttendance}
              />
            ))}

            {selectedSession.companies.length === 0 && (
              <div style={{
                background: 'white', borderRadius: 8, border: '1px solid #e5e7eb',
                padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 14,
              }}>
                No companies assigned to this session yet. Go to Training Sessions to add companies.
              </div>
            )}
          </div>
        </>
      )}

      {!selectedSession && sessions.length > 0 && (
        <div style={{
          background: 'white', borderRadius: 8, border: '1px solid #e5e7eb',
          padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 14,
        }}>
          Select a training session to begin tracking attendance.
        </div>
      )}
    </>
  );
}

function CompanyAttendanceCard({
  company,
  attendance,
  toggleAttendance,
}: {
  company: SessionCompany;
  attendance: Attendance;
  toggleAttendance: (id: string) => void;
}) {
  const presentCount = company.participants.filter((p) => attendance[p.id]?.day1 || attendance[p.id]?.day2).length;

  return (
    <div style={{
      background: 'white', borderRadius: 8, border: '1px solid #e5e7eb',
      overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
      }}>
        <IconBuilding size={16} stroke={1.8} color="#6b7280" />
        <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{company.name}</span>
        <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>
          {company.participants.length} participant{company.participants.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ padding: '4px 0' }}>
        {company.participants.map((p) => {
          const isPresent = attendance[p.id]?.day1 || attendance[p.id]?.day2;
          return (
            <div
              key={p.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px',
                borderBottom: '1px solid #f3f4f6',
                transition: 'background 0.15s',
              }}
            >
              <AvatarBadge name={p.name} color={p.avatarColor} size="sm" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.role}</div>
              </div>
              <button
                onClick={() => toggleAttendance(p.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 6,
                  border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: 12,
                  background: isPresent ? '#dcfce7' : '#fee2e2',
                  color: isPresent ? '#166534' : '#991b1b',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {isPresent ? <IconUserCheck size={14} /> : <IconUserX size={14} />}
                {isPresent ? 'Present' : 'Absent'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
