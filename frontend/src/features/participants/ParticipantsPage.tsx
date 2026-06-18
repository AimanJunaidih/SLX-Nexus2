import { useState, useEffect } from 'react';
import { IconUsers, IconCircleCheck, IconAlertTriangle, IconTrophy } from '@tabler/icons-react';
import StatCard from '@/shared/ui/StatCard';
import Panel from '@/shared/ui/Panel';
import Pill from '@/shared/ui/Pill';
import ProgressBar from '@/shared/ui/ProgressBar';
import AvatarBadge from '@/shared/ui/AvatarBadge';
import DataTable from '@/shared/ui/DataTable';
import { getParticipants } from '@/data-access/participants';
import type { Participant } from '@/entities/participant';
import { getCompletionPct, getParticipantStatusLabel } from '@/entities/participant';
import { completionToPill } from '@/shared/constants/status';

const columns = [
  {
    key: 'name',
    label: 'Participant',
    render: (p: Participant) => (
      <div className="table-name-cell">
        <AvatarBadge name={p.name} color={p.avatarColor} />
        <div className="table-name-info">
          <span className="table-name-primary">{p.name}</span>
          <span className="table-name-secondary">{p.role}</span>
        </div>
      </div>
    ),
  },
  {
    key: 'company',
    label: 'Company',
    render: (p: Participant) => <span className="table-cell-muted">{p.company}</span>,
  },
  {
    key: 'progress',
    label: 'Progress',
    width: '180px',
    render: (p: Participant) => <ProgressBar value={getCompletionPct(p.mods)} showLabel />,
  },
  {
    key: 'score',
    label: 'Score',
    render: (p: Participant) => {
      const c = p.score >= 80 ? 'high' : p.score >= 60 ? 'mid' : 'low';
      return <span className={`score-badge ${c}`}>{p.score}</span>;
    },
  },
  {
    key: 'status',
    label: 'Status',
    render: (p: Participant) => {
      const pct = getCompletionPct(p.mods);
      return (
        <Pill variant={completionToPill(pct)}>{getParticipantStatusLabel(pct)}</Pill>
      );
    },
  },
];

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParticipants().then((data) => {
      setParticipants(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  const completedCount = participants.filter((p) => getCompletionPct(p.mods) === 100).length;
  const onTrackCount = participants.filter((p) => {
    const pct = getCompletionPct(p.mods);
    return pct >= 60 && pct < 100;
  }).length;
  const atRiskCount = participants.filter((p) => getCompletionPct(p.mods) < 60).length;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Participants</h1>
        <p className="page-subtitle">Individual progress and status across all enrolled participants.</p>
      </div>

      <div className="stat-grid">
        <StatCard
          icon={<IconUsers size={20} stroke={1.8} />}
          iconColor="blue"
          value={participants.length}
          label="Total Participants"
        />
        <StatCard
          icon={<IconTrophy size={20} stroke={1.8} />}
          iconColor="green"
          value={completedCount}
          label="Completed"
        />
        <StatCard
          icon={<IconCircleCheck size={20} stroke={1.8} />}
          iconColor="teal"
          value={onTrackCount}
          label="On Track"
        />
        <StatCard
          icon={<IconAlertTriangle size={20} stroke={1.8} />}
          iconColor="red"
          value={atRiskCount}
          label="At Risk / Behind"
        />
      </div>

      <Panel title="All Participants" className="full-panel" bodyClass="panel-body-sm">
        <DataTable columns={columns} data={participants} keyFn={(p) => p.id} />
      </Panel>
    </>
  );
}
