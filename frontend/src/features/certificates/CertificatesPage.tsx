import { useState, useEffect } from 'react';
import { IconAward, IconCircleCheck, IconClock } from '@tabler/icons-react';
import StatCard from '@/shared/ui/StatCard';
import Panel from '@/shared/ui/Panel';
import Pill from '@/shared/ui/Pill';
import AvatarBadge from '@/shared/ui/AvatarBadge';
import DataTable from '@/shared/ui/DataTable';
import { getCertificates } from '@/data-access/certificates';
import { getParticipants } from '@/data-access/participants';
import type { Certificate } from '@/entities/certificate';
import type { Participant } from '@/entities/participant';
import { CERT_STATUS_PILL, CERT_STATUS_LABEL, scoreColor } from '@/shared/constants/status';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCertificates(), getParticipants()]).then(([certsData, partsData]) => {
      setCertificates(certsData);
      setParticipants(partsData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  const issuedCount = certificates.filter((c) => c.status === 'issued').length;
  const readyCount = certificates.filter((c) => c.status === 'ready').length;
  const pendingCount = certificates.filter((c) => c.status === 'pending').length;

  const avatarColors = Object.fromEntries(participants.map((p) => [p.id, p.avatarColor]));

  const columns = [
    {
      key: 'name',
      label: 'Participant',
      render: (c: Certificate) => (
        <div className="table-name-cell">
          <AvatarBadge
            name={c.participantName}
            color={avatarColors[c.participantId] ?? '#6b7280'}
          />
          <div className="table-name-info">
            <span className="table-name-primary">{c.participantName}</span>
            <span className="table-name-secondary">{c.role}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'company',
      label: 'Company',
      render: (c: Certificate) => <span className="table-cell-muted">{c.company}</span>,
    },
    {
      key: 'score',
      label: 'Score',
      render: (c: Certificate) => (
        <span className={`score-badge ${scoreColor(c.score)}`}>{c.score}</span>
      ),
    },
    {
      key: 'date',
      label: 'Completion Date',
      render: (c: Certificate) => (
        <span className="table-cell-muted">{c.completionDate || '—'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (c: Certificate) => (
        <Pill variant={CERT_STATUS_PILL[c.status]}>{CERT_STATUS_LABEL[c.status]}</Pill>
      ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Certificates</h1>
        <p className="page-subtitle">Issue status and certificate readiness per participant.</p>
      </div>

      <div className="stat-grid stat-grid-3">
        <StatCard
          icon={<IconAward size={20} stroke={1.8} />}
          iconColor="green"
          value={issuedCount}
          label="Certificates Issued"
        />
        <StatCard
          icon={<IconCircleCheck size={20} stroke={1.8} />}
          iconColor="teal"
          value={readyCount}
          label="Ready to Issue"
        />
        <StatCard
          icon={<IconClock size={20} stroke={1.8} />}
          iconColor="yellow"
          value={pendingCount}
          label="Pending Completion"
        />
      </div>

      <Panel title="Certificate Registry" className="full-panel" bodyClass="panel-body-sm">
        <DataTable columns={columns} data={certificates} keyFn={(c) => c.id} />
      </Panel>
    </>
  );
}
