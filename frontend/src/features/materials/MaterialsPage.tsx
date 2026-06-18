import { useState, useEffect } from 'react';
import {
  IconFiles,
  IconCircleCheck,
  IconEdit,
  IconFileText,
  IconVideo,
  IconPresentation,
  IconTable,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import StatCard from '@/shared/ui/StatCard';
import Panel from '@/shared/ui/Panel';
import Pill from '@/shared/ui/Pill';
import { getMaterials } from '@/data-access/materials';
import type { Material, MaterialType } from '@/entities/material';
import { formatFileSize } from '@/entities/material';
import { MATERIAL_STATUS_PILL, MATERIAL_STATUS_LABEL } from '@/shared/constants/status';

const TYPE_ICON: Record<MaterialType, ReactNode> = {
  document: <IconFileText size={16} stroke={1.8} />,
  video: <IconVideo size={16} stroke={1.8} />,
  presentation: <IconPresentation size={16} stroke={1.8} />,
  spreadsheet: <IconTable size={16} stroke={1.8} />,
};

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMaterials().then((data) => {
      setMaterials(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  const readyCount = materials.filter((m) => m.status === 'ready').length;
  const draftCount = materials.filter((m) => m.status === 'draft').length;
  const reviewCount = materials.filter((m) => m.status === 'review').length;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Materials</h1>
        <p className="page-subtitle">Training documents, videos, and resources.</p>
      </div>

      <div className="stat-grid stat-grid-3">
        <StatCard
          icon={<IconFiles size={20} stroke={1.8} />}
          iconColor="blue"
          value={materials.length}
          label="Total Materials"
        />
        <StatCard
          icon={<IconCircleCheck size={20} stroke={1.8} />}
          iconColor="green"
          value={readyCount}
          label="Ready to Distribute"
        />
        <StatCard
          icon={<IconEdit size={20} stroke={1.8} />}
          iconColor="yellow"
          value={draftCount + reviewCount}
          label="Draft / In Review"
        />
      </div>

      <Panel title="All Materials" className="full-panel" bodyClass="panel-body-sm">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Owner</th>
              <th>Size</th>
              <th>Uploaded</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m: Material) => (
              <tr key={m.id}>
                <td>
                  <div className="table-name-cell">
                    <div className={`material-type-icon ${m.type}`}>{TYPE_ICON[m.type]}</div>
                    <span className="table-name-primary">{m.title}</span>
                  </div>
                </td>
                <td className="table-cell-muted" style={{ textTransform: 'capitalize' }}>
                  {m.type}
                </td>
                <td className="table-cell-muted">{m.owner}</td>
                <td className="table-cell-muted">{formatFileSize(m.sizeKb)}</td>
                <td className="table-cell-muted">{m.uploadedAt}</td>
                <td>
                  <Pill variant={MATERIAL_STATUS_PILL[m.status]}>{MATERIAL_STATUS_LABEL[m.status]}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
