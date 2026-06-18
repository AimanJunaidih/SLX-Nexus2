import { useState, useEffect } from 'react';
import { IconTrophy, IconChartBar, IconPercentage, IconAward } from '@tabler/icons-react';
import StatCard from '@/shared/ui/StatCard';
import Panel from '@/shared/ui/Panel';
import Pill from '@/shared/ui/Pill';
import ProgressBar from '@/shared/ui/ProgressBar';
import AvatarBadge from '@/shared/ui/AvatarBadge';
import DataTable from '@/shared/ui/DataTable';
import { getParticipants } from '@/data-access/participants';
import { getCertificates } from '@/data-access/certificates';
import type { Participant } from '@/entities/participant';
import type { Certificate } from '@/entities/certificate';
import { getCompletionPct, MODULE_NAMES } from '@/entities/participant';
import { completionToPill, scoreColor } from '@/shared/constants/status';

export default function PostTrainingPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getParticipants(), getCertificates()]).then(([pData, cData]) => {
      setParticipants(pData);
      setCertificates(cData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  const completed = participants.filter((p) => getCompletionPct(p.mods) === 100);
  const avgScore = participants.length > 0 ? Math.round(participants.reduce((s, p) => s + p.score, 0) / participants.length) : 0;
  const passRate = participants.length > 0 ? Math.round((participants.filter((p) => p.score >= 60).length / participants.length) * 100) : 0;
  const certsReady = certificates.filter((c) => c.status === 'ready' || c.status === 'issued').length;

  const moduleRates = MODULE_NAMES.map((name, idx) => ({
    name,
    pct: participants.length > 0 ? Math.round((participants.filter((p) => p.mods[idx] === 2).length / participants.length) * 100) : 0,
  }));

  const columns = [
    {
      key: 'name',
      label: 'Participant',
      render: (p: Participant) => (
        <div className="table-name-cell">
          <AvatarBadge name={p.name} color={p.avatarColor} />
          <div className="table-name-info">
            <span className="table-name-primary">{p.name}</span>
            <span className="table-name-secondary">{p.company}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'score',
      label: 'Score',
      render: (p: Participant) => (
        <span className={`score-badge ${scoreColor(p.score)}`}>{p.score}</span>
      ),
    },
    {
      key: 'completion',
      label: 'Completion',
      width: '160px',
      render: (p: Participant) => <ProgressBar value={getCompletionPct(p.mods)} showLabel />,
    },
    {
      key: 'pass',
      label: 'Pass/Fail',
      render: (p: Participant) => (
        <Pill variant={p.score >= 60 ? 'ok' : 'danger'}>{p.score >= 60 ? 'Pass' : 'Fail'}</Pill>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (p: Participant) => {
        const pct = getCompletionPct(p.mods);
        return <Pill variant={completionToPill(pct)}>{pct === 100 ? 'Completed' : 'In Progress'}</Pill>;
      },
    },
  ];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Post-Training</h1>
        <p className="page-subtitle">Results, scores, and certification readiness.</p>
      </div>

      <div className="stat-grid">
        <StatCard
          icon={<IconTrophy size={20} stroke={1.8} />}
          iconColor="green"
          value={completed.length}
          label="Fully Completed"
          sub={`of ${participants.length}`}
        />
        <StatCard
          icon={<IconChartBar size={20} stroke={1.8} />}
          iconColor={avgScore >= 70 ? 'green' : 'yellow'}
          value={`${avgScore}%`}
          label="Avg Score"
        />
        <StatCard
          icon={<IconPercentage size={20} stroke={1.8} />}
          iconColor={passRate >= 70 ? 'green' : 'yellow'}
          value={`${passRate}%`}
          label="Pass Rate"
        />
        <StatCard
          icon={<IconAward size={20} stroke={1.8} />}
          iconColor="teal"
          value={certsReady}
          label="Certificates Ready"
        />
      </div>

      <div className="content-grid">
        <Panel title="Score Distribution" subtitle="Participant score breakdown">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...participants]
              .sort((a, b) => b.score - a.score)
              .map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AvatarBadge name={p.name} color={p.avatarColor} size="sm" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{p.name}</span>
                      <span
                        className={`score-badge ${scoreColor(p.score)}`}
                        style={{ width: 'auto', padding: '0 8px', fontSize: 11 }}
                      >
                        {p.score}
                      </span>
                    </div>
                    <ProgressBar value={p.score} size="sm" />
                  </div>
                </div>
              ))}
          </div>
        </Panel>

        <Panel title="Module Completion Rates" subtitle="% of participants who completed each module">
          <div className="phase-list">
            {moduleRates.map((m) => (
              <div className="phase-row" key={m.name}>
                <span className="phase-label" style={{ fontSize: 12 }}>
                  {m.name}
                </span>
                <div className="phase-progress">
                  <ProgressBar value={m.pct} showLabel />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Participant Results" className="full-panel" bodyClass="panel-body-sm">
        <DataTable columns={columns} data={participants} keyFn={(p) => p.id} />
      </Panel>
    </>
  );
}
