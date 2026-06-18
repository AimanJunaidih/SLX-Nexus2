import { useState, useEffect } from 'react';
import { IconCircleCheck, IconClock, IconFiles, IconChartBar } from '@tabler/icons-react';
import StatCard from '@/shared/ui/StatCard';
import Panel from '@/shared/ui/Panel';
import Pill from '@/shared/ui/Pill';
import ProgressBar from '@/shared/ui/ProgressBar';
import AvatarBadge from '@/shared/ui/AvatarBadge';
import { getParticipants } from '@/data-access/participants';
import { getMaterials } from '@/data-access/materials';
import type { Participant } from '@/entities/participant';
import type { Material } from '@/entities/material';
import { getCompletionPct } from '@/entities/participant';

const CHECKLIST = [
  'Access credentials distributed to all participants',
  'Pre-training materials shared via portal',
  'Pre-assessment survey sent',
  'Session schedule confirmed with all companies',
  'Tech check completed for remote participants',
  'Manager notification emails dispatched',
  'LMS accounts activated',
];

export default function PreTrainingPage() {
  const [checked, setChecked] = useState<Set<number>>(new Set([0, 1, 2]));
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getParticipants(), getMaterials()]).then(([pData, mData]) => {
      setParticipants(pData);
      setMaterials(mData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const preReady = participants.filter((p) => p.mods[0] === 2 && p.mods[1] === 2).length;
  const prePending = participants.length - preReady;
  const readyMaterials = materials.filter((m) => m.status === 'ready').length;
  const avgScore = participants.length > 0 ? Math.round(participants.reduce((s, p) => s + p.score, 0) / participants.length) : 0;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Pre-Training</h1>
        <p className="page-subtitle">Readiness checks, materials, and participant preparedness.</p>
      </div>

      <div className="stat-grid">
        <StatCard
          icon={<IconCircleCheck size={20} stroke={1.8} />}
          iconColor="green"
          value={preReady}
          label="Participants Ready"
          sub={`of ${participants.length}`}
        />
        <StatCard
          icon={<IconClock size={20} stroke={1.8} />}
          iconColor="yellow"
          value={prePending}
          label="Still Pending"
        />
        <StatCard
          icon={<IconFiles size={20} stroke={1.8} />}
          iconColor="teal"
          value={readyMaterials}
          label="Materials Ready"
          sub={`of ${materials.length}`}
        />
        <StatCard
          icon={<IconChartBar size={20} stroke={1.8} />}
          iconColor={avgScore >= 70 ? 'green' : 'yellow'}
          value={`${avgScore}%`}
          label="Pre-Assessment Avg"
        />
      </div>

      <div className="content-grid">
        <Panel
          title="Pre-Training Checklist"
          subtitle={`${checked.size} of ${CHECKLIST.length} completed`}
        >
          <div className="checklist">
            {CHECKLIST.map((item, i) => (
              <div
                key={i}
                className={`checklist-item${checked.has(i) ? ' checked' : ''}`}
                onClick={() => toggle(i)}
                role="checkbox"
                aria-checked={checked.has(i)}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggle(i)}
              >
                <div className="checklist-check">
                  {checked.has(i) && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="checklist-text">{item}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Participant Readiness" subtitle="Modules 1–2 completion">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {participants.map((p) => {
              const m1 = p.mods[0];
              const m2 = p.mods[1];
              const pct = Math.round(([m1, m2].filter((m) => m === 2).length / 2) * 100);
              const ready = m1 === 2 && m2 === 2;
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AvatarBadge name={p.name} color={p.avatarColor} size="sm" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{p.name}</span>
                      <Pill variant={ready ? 'ok' : 'warn'}>{ready ? 'Ready' : 'Pending'}</Pill>
                    </div>
                    <ProgressBar value={pct} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel title="Full Pre-Training Status" className="full-panel" bodyClass="panel-body-sm">
        <table className="data-table">
          <thead>
            <tr>
              <th>Participant</th>
              <th>Company</th>
              <th>Module 1</th>
              <th>Module 2</th>
              <th>Overall Progress</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => {
              const MOD_LABELS = ['Pending', 'In Progress', 'Complete'];
              const MOD_PILLS: Array<'warn' | 'info' | 'ok'> = ['warn', 'info', 'ok'];
              return (
                <tr key={p.id}>
                  <td>
                    <div className="table-name-cell">
                      <AvatarBadge name={p.name} color={p.avatarColor} />
                      <span className="table-name-primary">{p.name}</span>
                    </div>
                  </td>
                  <td className="table-cell-muted">{p.company}</td>
                  <td>
                    <Pill variant={MOD_PILLS[p.mods[0]]}>{MOD_LABELS[p.mods[0]]}</Pill>
                  </td>
                  <td>
                    <Pill variant={MOD_PILLS[p.mods[1]]}>{MOD_LABELS[p.mods[1]]}</Pill>
                  </td>
                  <td style={{ minWidth: 140 }}>
                    <ProgressBar value={getCompletionPct(p.mods)} showLabel />
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
