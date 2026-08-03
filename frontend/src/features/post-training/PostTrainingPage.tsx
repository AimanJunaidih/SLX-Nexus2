import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconPresentation,
  IconBuilding,
  IconUsers,
  IconClipboardList,
} from '@tabler/icons-react';
import StatCard from '@/shared/ui/StatCard';
import AvatarBadge from '@/shared/ui/AvatarBadge';
import { getTrainingSessions } from '@/data-access/training-sessions';
import type { TrainingSession, SessionCompany } from '@/entities/training-session';

export default function PostTrainingPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  useEffect(() => {
    getTrainingSessions().then((data) => {
      setSessions(data);
      if (data.length > 0) setSelectedSessionId(data[0].id);
      setLoading(false);
    });
  }, []);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  const allParticipants = selectedSession?.companies.flatMap((c) => c.participants) ?? [];

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Post-Training</h1>
        <p className="page-subtitle">Review companies, participants, and manage post-training tasks.</p>
      </div>

      {/* Session Selector */}
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
                {s.name} — {s.date}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedSession && (
        <>
          <div className="stat-grid stat-grid-3">
            <StatCard
              icon={<IconPresentation size={20} stroke={1.8} />}
              iconColor="blue"
              value={selectedSession.name}
              label={selectedSession.date}
            />
            <StatCard
              icon={<IconBuilding size={20} stroke={1.8} />}
              iconColor="teal"
              value={selectedSession.companies.length}
              label="Companies"
            />
            <StatCard
              icon={<IconUsers size={20} stroke={1.8} />}
              iconColor="blue"
              value={allParticipants.length}
              label="Total Participants"
            />
          </div>

          {/* Company Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {selectedSession.companies.map((company) => (
              <CompanyCard key={company.id} company={company} sessionId={selectedSession.id} />
            ))}

            {selectedSession.companies.length === 0 && (
              <div style={{
                background: 'white', borderRadius: 8, border: '1px solid #e5e7eb',
                padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 14,
              }}>
                No companies assigned to this session yet.
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
          Select a training session to begin.
        </div>
      )}
    </>
  );
}

function CompanyCard({ company, sessionId }: { company: SessionCompany; sessionId: string }) {
  const navigate = useNavigate();
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');

  useEffect(() => {
    if (company.participants.length > 0) {
      setSelectedParticipantId(company.participants[0].id);
    }
  }, [company.participants]);

  const selectedParticipant = company.participants.find((p) => p.id === selectedParticipantId);

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
        <span style={{ fontSize: 12, color: '#9ca3af' }}>
          {company.participants.length} participant{company.participants.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => navigate(`/post-training/${sessionId}/${company.id}/tasks`)}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '6px 12px', background: '#4f46e5', color: 'white',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12,
            marginLeft: 'auto',
          }}
        >
          <IconClipboardList size={14} />
          View Tasks
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>
            Select Participant
          </label>
          <select
            value={selectedParticipantId}
            onChange={(e) => setSelectedParticipantId(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6,
              fontSize: 13, outline: 'none', background: 'white', color: '#374151',
            }}
          >
            {company.participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.role}
              </option>
            ))}
          </select>
        </div>

        {selectedParticipant && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', background: '#f9fafb', borderRadius: 6,
          }}>
            <AvatarBadge name={selectedParticipant.name} color={selectedParticipant.avatarColor} size="sm" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{selectedParticipant.name}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>{selectedParticipant.role}</div>
            </div>
          </div>
        )}

        {!selectedParticipant && (
          <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: 12 }}>
            No participants in this company.
          </div>
        )}
      </div>
    </div>
  );
}
