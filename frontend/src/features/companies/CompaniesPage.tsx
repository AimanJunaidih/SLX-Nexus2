import { useState, useEffect } from 'react';
import { IconBuilding, IconTrendingUp, IconChartBar, IconPlus, IconX } from '@tabler/icons-react';
import StatCard from '@/shared/ui/StatCard';
import Pill from '@/shared/ui/Pill';
import ProgressBar from '@/shared/ui/ProgressBar';
import { getCompanies, createCompany } from '@/data-access/companies';
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');

  const fetchCompanies = () => {
    setLoading(true);
    getCompanies().then((data) => {
      setCompanies(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCompanyName.trim()) {
      await createCompany(newCompanyName.trim());
      setNewCompanyName('');
      setIsAddModalOpen(false);
      fetchCompanies(); // Refresh the list
    }
  };

  if (loading) return <div>Loading...</div>;

  const filtered = filter === 'all' ? companies : companies.filter((c) => c.engagementStatus === filter);

  const avgCompletion = companies.length > 0 ? Math.round(
    companies.reduce((sum, c) => sum + c.completionPct, 0) / companies.length,
  ) : 0;
  const activeCount = companies.filter((c) => c.engagementStatus === 'active').length;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Companies</h1>
          <p className="page-subtitle">Enrolled organizations and their training engagement.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            padding: '10px 16px', background: '#4f46e5', color: 'white', 
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
          }}
        >
          <IconPlus size={18} /> Add Company
        </button>
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

      {isAddModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'modalFadeIn 0.2s ease-out forwards'
        }}>
          <div style={{
            background: 'white', borderRadius: '8px', width: '100%', maxWidth: '500px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>Add Company</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', padding: 0, display: 'flex' }}
              >
                <IconX size={24} stroke={1.5} />
              </button>
            </div>
            <form onSubmit={handleCreateCompany} style={{ padding: '24px 20px' }}>
              <input 
                type="text" 
                placeholder="Add Company..." 
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', border: '1px solid #d1d5db',
                  borderRadius: '6px', fontSize: '15px', outline: 'none',
                  boxSizing: 'border-box', color: '#374151'
                }}
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid #e5e7eb', paddingTop: '16px', margin: '24px -20px -10px -20px', paddingRight: '20px' }}>
                <button 
                  type="submit"
                  style={{
                    padding: '10px 28px', background: '#002842', color: 'white',
                    border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500,
                    fontSize: '14px', letterSpacing: '0.5px'
                  }}
                >
                  ADD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
