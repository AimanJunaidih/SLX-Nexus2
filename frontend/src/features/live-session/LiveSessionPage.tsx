import { useState, useEffect } from 'react';
import { IconPresentation, IconCircleCheck, IconLoader, IconCircle } from '@tabler/icons-react';
import StatCard from '@/shared/ui/StatCard';
import Panel from '@/shared/ui/Panel';
import AvatarBadge from '@/shared/ui/AvatarBadge';
import { getParticipants } from '@/data-access/participants';
import type { Participant, ModuleStatus } from '@/entities/participant';
import { MODULE_NAMES } from '@/entities/participant';

type ModMap = Map<string, ModuleStatus[]>;

function initModMap(participants: Participant[]): ModMap {
  return new Map(participants.map((p) => [p.id, [...p.mods] as ModuleStatus[]]));
}

function countByStatus(modMap: ModMap, status: ModuleStatus): number {
  let count = 0;
  for (const mods of modMap.values()) {
    count += mods.filter((m) => m === status).length;
  }
  return count;
}

const MOD_LABEL = ['Pending', 'In Progress', 'Complete'] as const;

export default function LiveSessionPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [modMap, setModMap] = useState<ModMap>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParticipants().then((data) => {
      setParticipants(data);
      setModMap(initModMap(data));
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  const cycle = (participantId: string, idx: number) => {
    setModMap((prev) => {
      const next = new Map(prev);
      const mods = [...(next.get(participantId) ?? [])] as ModuleStatus[];
      mods[idx] = ((mods[idx] + 1) % 3) as ModuleStatus;
      next.set(participantId, mods);
      return next;
    });
  };

  const totalSlots = participants.length * MODULE_NAMES.length;
  const doneCount = countByStatus(modMap, 2);
  const activeCount = countByStatus(modMap, 1);
  const pendingCount = countByStatus(modMap, 0);
  const fullyDone = [...modMap.values()].filter((m) => m.every((s) => s === 2)).length;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Live Session</h1>
        <p className="page-subtitle">
          Real-time module tracking. Click a dot to cycle its status (Pending → In Progress → Complete).
        </p>
      </div>

      <div className="stat-grid">
        <StatCard
          icon={<IconPresentation size={20} stroke={1.8} />}
          iconColor="blue"
          value={participants.length}
          label="Active Participants"
        />
        <StatCard
          icon={<IconCircleCheck size={20} stroke={1.8} />}
          iconColor="green"
          value={fullyDone}
          label="Fully Completed"
        />
        <StatCard
          icon={<IconLoader size={20} stroke={1.8} />}
          iconColor="yellow"
          value={activeCount}
          label="Modules In Progress"
        />
        <StatCard
          icon={<IconCircle size={20} stroke={1.8} />}
          iconColor="red"
          value={pendingCount}
          label="Modules Pending"
          sub={`${doneCount}/${totalSlots} total done`}
        />
      </div>

      <Panel
        title="Module Status Board"
        subtitle="Click dots to update status"
        className="full-panel"
        bodyClass="panel-body-sm"
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>Participant</th>
              <th>Company</th>
              {MODULE_NAMES.map((name) => (
                <th key={name} style={{ minWidth: 110 }}>
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => {
              const mods = modMap.get(p.id) ?? p.mods;
              return (
                <tr key={p.id}>
                  <td>
                    <div className="table-name-cell">
                      <AvatarBadge name={p.name} color={p.avatarColor} />
                      <span className="table-name-primary">{p.name}</span>
                    </div>
                  </td>
                  <td className="table-cell-muted">{p.company}</td>
                  {mods.map((status, idx) => (
                    <td key={idx}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                        onClick={() => cycle(p.id, idx)}
                        title={`${MOD_LABEL[status]} — click to advance`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && cycle(p.id, idx)}
                      >
                        <div
                          className={`mod-dot ${status === 0 ? 'pending' : status === 1 ? 'active' : 'done'}`}
                        />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{MOD_LABEL[status]}</span>
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
