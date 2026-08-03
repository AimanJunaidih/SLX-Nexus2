import { useState, useEffect } from 'react';
import {
  IconUsers,
  IconBuilding,
  IconFiles,
  IconBook,
  IconPresentation,
  IconCircleCheck,
} from '@tabler/icons-react';
import StatCard from '@/shared/ui/StatCard';
import Panel from '@/shared/ui/Panel';
import ProgressBar from '@/shared/ui/ProgressBar';
import AvatarBadge from '@/shared/ui/AvatarBadge';
import { getParticipants } from '@/data-access/participants';
import { getCompanies } from '@/data-access/companies';
import { getMaterials } from '@/data-access/materials';
import { getTrainingSessions } from '@/data-access/training-sessions';
import type { Participant } from '@/entities/participant';
import type { Company } from '@/entities/company';
import type { Material } from '@/entities/material';
import type { TrainingSession } from '@/entities/training-session';

export default function OverviewPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getParticipants(),
      getCompanies(),
      getMaterials(),
      getTrainingSessions(),
    ]).then(([pData, cData, mData, sData]) => {
      setParticipants(pData);
      setCompanies(cData);
      setMaterials(mData);
      setTrainingSessions(sData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  const totalParticipants = participants.length;
  const totalCompanies = companies.length;
  const readyMaterials = materials.filter((m) => m.status === 'ready').length;

  const upcomingSessions = trainingSessions
    .filter((s) => s.status === 'in-progress' || s.status === 'upcoming')
    .slice(0, 5);

  const phases = [
    {
      label: 'Pre-Training',
      icon: <IconBook size={16} stroke={1.8} />,
      color: 'blue',
      pct: participants.length > 0 ? Math.round(
        (participants.filter((p) => p.mods[0] === 2 && p.mods[1] === 2).length / participants.length) * 100,
      ) : 0,
    },
    {
      label: 'Live Session',
      icon: <IconPresentation size={16} stroke={1.8} />,
      color: 'purple',
      pct: participants.length > 0 ? Math.round(
        (participants.filter((p) => p.mods[2] === 2).length / participants.length) * 100,
      ) : 0,
    },
    {
      label: 'Post-Training',
      icon: <IconCircleCheck size={16} stroke={1.8} />,
      color: 'green',
      pct: participants.length > 0 ? Math.round(
        (participants.filter((p) => p.mods[3] === 2 && p.mods[4] === 2).length / participants.length) * 100,
      ) : 0,
    },
  ];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Training Overview</h1>
        <p className="page-subtitle">Live snapshot of the current program cohort.</p>
      </div>

      <div className="stat-grid">
        <StatCard
          icon={<IconUsers size={20} stroke={1.8} />}
          iconColor="blue"
          value={totalParticipants}
          label="Total Participants"
        />
        <StatCard
          icon={<IconBuilding size={20} stroke={1.8} />}
          iconColor="purple"
          value={totalCompanies}
          label="Enrolled Companies"
        />
        <StatCard
          icon={<IconFiles size={20} stroke={1.8} />}
          iconColor="teal"
          value={readyMaterials}
          label="Materials Ready"
          sub={`of ${materials.length} total`}
        />
      </div>

      <div className="content-grid">
        <Panel title="Training Phase Status" subtitle="Completion across all phases">
          <div className="phase-list">
            {phases.map((phase) => (
              <div className="phase-row" key={phase.label}>
                <div className={`phase-icon ${phase.color}`}>{phase.icon}</div>
                <span className="phase-label">{phase.label}</span>
                <div className="phase-progress">
                  <ProgressBar value={phase.pct} showLabel />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Upcoming Sessions" subtitle="Next training sessions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcomingSessions.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No upcoming sessions.</p>
            )}
            {upcomingSessions.map((session) => (
              <div key={session.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div
                  style={{
                    fontSize: 10,
                    padding: '4px 8px',
                    borderRadius: 12,
                    fontWeight: 600,
                    backgroundColor: session.status === 'in-progress' ? '#eff6ff' : '#f3f4f6',
                    color: session.status === 'in-progress' ? '#2563eb' : '#4b5563',
                    textTransform: 'uppercase',
                    minWidth: 70,
                    textAlign: 'center',
                  }}
                >
                  {session.status.replace('-', ' ')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{session.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {session.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Participants at a Glance" className="full-panel" bodyClass="panel-body-sm">
        <table className="data-table">
          <thead>
            <tr>
              <th>Participant</th>
              <th>Company</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => {
              return (
                <tr key={p.id}>
                  <td>
                    <div className="table-name-cell">
                      <AvatarBadge name={p.name} color={p.avatarColor} />
                      <span className="table-name-primary">{p.name}</span>
                    </div>
                  </td>
                  <td className="table-cell-muted">{p.company}</td>
                  <td className="table-cell-muted">{p.role}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
