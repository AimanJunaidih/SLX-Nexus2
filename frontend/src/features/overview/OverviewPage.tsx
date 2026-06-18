import { useState, useEffect } from 'react';
import {
  IconUsers,
  IconBuilding,
  IconChartBar,
  IconFiles,
  IconBook,
  IconPresentation,
  IconCircleCheck,
} from '@tabler/icons-react';
import StatCard from '@/shared/ui/StatCard';
import Panel from '@/shared/ui/Panel';
import Pill from '@/shared/ui/Pill';
import ProgressBar from '@/shared/ui/ProgressBar';
import AvatarBadge from '@/shared/ui/AvatarBadge';
import { getParticipants } from '@/data-access/participants';
import { getCompanies } from '@/data-access/companies';
import { getMaterials } from '@/data-access/materials';
import { getScheduleData } from '@/data-access/scheduleData';
import type { Participant } from '@/entities/participant';
import type { Company } from '@/entities/company';
import type { Material } from '@/entities/material';
import type { ScheduleDay } from '@/entities/schedule';
import { getCompletionPct, getParticipantStatusLabel } from '@/entities/participant';
import { completionToPill } from '@/shared/constants/status';

export default function OverviewPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [scheduleData, setScheduleData] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getParticipants(),
      getCompanies(),
      getMaterials(),
      getScheduleData(),
    ]).then(([pData, cData, mData, sData]) => {
      setParticipants(pData);
      setCompanies(cData);
      setMaterials(mData);
      setScheduleData(sData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  const totalParticipants = participants.length;
  const totalCompanies = companies.length;
  const avgCompletion = participants.length > 0 ? Math.round(
    participants.reduce((sum, p) => sum + getCompletionPct(p.mods), 0) / participants.length,
  ) : 0;
  const readyMaterials = materials.filter((m) => m.status === 'ready').length;

  const upcomingEvents = scheduleData
    .filter((d) => d.status === 'today' || d.status === 'upcoming')
    .flatMap((d) =>
      d.events.map((e) => ({ ...e, dayLabel: d.label, date: d.date })),
    )
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
          icon={<IconChartBar size={20} stroke={1.8} />}
          iconColor={avgCompletion >= 70 ? 'green' : avgCompletion >= 40 ? 'yellow' : 'red'}
          value={`${avgCompletion}%`}
          label="Avg Completion Rate"
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

        <Panel title="Upcoming Events" subtitle="Next sessions on the schedule">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcomingEvents.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No upcoming events.</p>
            )}
            {upcomingEvents.map((ev) => (
              <div key={ev.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div
                  style={{
                    minWidth: 40,
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                    paddingTop: 2,
                  }}
                >
                  {ev.time}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{ev.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {ev.dayLabel} · {ev.date}
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
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => {
              const pct = getCompletionPct(p.mods);
              const label = getParticipantStatusLabel(pct);
              const pillVariant = completionToPill(pct);
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
                  <td style={{ minWidth: 140 }}>
                    <ProgressBar value={pct} showLabel />
                  </td>
                  <td>
                    <Pill variant={pillVariant}>{label}</Pill>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
