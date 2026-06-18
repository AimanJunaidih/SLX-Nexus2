import { useState, useEffect } from 'react';
import { IconBuilding, IconTrendingUp, IconChartBar } from '@tabler/icons-react';
import StatCard from '@/shared/ui/StatCard';
import Pill from '@/shared/ui/Pill';
import ProgressBar from '@/shared/ui/ProgressBar';
import { getCompanies } from '@/data-access/companies';
import type { Company, EngagementStatus } from '@/entities/company';
import { ENGAGEMENT_PILL, ENGAGEMENT_LABEL } from '@/shared/constants/status';

type Filter = 'all' | EngagementStatus;

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'At Risk', value: 'at-risk' },
];

export default function CompaniesPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompanies().then((data) => {
      setCompanies(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  const filtered = filter === 'all' ? companies : companies.filter((c) => c.engagementStatus === filter);

  const avgCompletion = companies.length > 0 ? Math.round(
    companies.reduce((sum, c) => sum + c.completionPct, 0) / companies.length,
  ) : 0;
  const activeCount = companies.filter((c) => c.engagementStatus === 'active').length;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Companies</h1>
        <p className="page-subtitle">Enrolled organizations and their training engagement.</p>
      </div>

      <div className="stat-grid stat-grid-3">
        <StatCard
          icon={<IconBuilding size={20} stroke={1.8} />}
          iconColor="blue"
          value={companies.length}
          label="Total Companies"
        />
        <StatCard
          icon={<IconTrendingUp size={20} stroke={1.8} />}
          iconColor="green"
          value={activeCount}
          label="Actively Engaged"
        />
        <StatCard
          icon={<IconChartBar size={20} stroke={1.8} />}
          iconColor={avgCompletion >= 70 ? 'green' : 'yellow'}
          value={`${avgCompletion}%`}
          label="Avg Completion"
        />
      </div>

      <div className="filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`filter-btn${filter === f.value ? ' active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="company-grid">
        {filtered.map((c) => (
          <div className="company-card" key={c.id}>
            <div className="company-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="company-logo">{c.name[0]}</div>
                <div>
                  <div className="company-name">{c.name}</div>
                  <div className="company-industry">{c.industry}</div>
                </div>
              </div>
              <Pill variant={ENGAGEMENT_PILL[c.engagementStatus]}>
                {ENGAGEMENT_LABEL[c.engagementStatus]}
              </Pill>
            </div>

            <div className="company-meta-row">
              <div className="company-meta-item">
                <span className="company-meta-label">Participants</span>
                <span className="company-meta-value">{c.participantCount}</span>
              </div>
              <div className="company-meta-item">
                <span className="company-meta-label">Completion</span>
                <span className="company-meta-value">{c.completionPct}%</span>
              </div>
            </div>

            <ProgressBar value={c.completionPct} size="lg" showLabel={false} />

            <div className="company-contact">
              <strong>{c.contactName}</strong> &middot; {c.contactEmail}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
