import { useState, useEffect } from 'react';
import { IconBuilding, IconTrendingUp, IconPlus, IconX, IconTrash, IconPencil, IconUserPlus, IconUserMinus } from '@tabler/icons-react';
import StatCard from '@/shared/ui/StatCard';
import Pill from '@/shared/ui/Pill';
import { getCompanies, createCompany, updateCompany, deleteCompany, getCompanyParticipants, addParticipantToCompany, removeParticipantFromCompany } from '@/data-access/companies';
import { getTrainingSessions } from '@/data-access/training-sessions';
import { getParticipants } from '@/data-access/participants';
import type { Company, EngagementStatus } from '@/entities/company';
import type { Participant } from '@/entities/participant';
import type { TrainingSession, SessionStatus } from '@/entities/training-session';
import { ENGAGEMENT_PILL, ENGAGEMENT_LABEL } from '@/shared/constants/status';

type Filter = 'all' | EngagementStatus;

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'At Risk', value: 'at-risk' },
];

const SESSION_PILL: Record<SessionStatus, 'ok' | 'info' | 'neutral'> = {
  completed: 'ok',
  'in-progress': 'info',
  upcoming: 'neutral',
};

export default function CompaniesPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const [editName, setEditName] = useState('');
  const [editIndustry, setEditIndustry] = useState('');
  const [editContactName, setEditContactName] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editEngagementStatus, setEditEngagementStatus] = useState<EngagementStatus>('pending');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyParticipants, setCompanyParticipants] = useState<Participant[]>([]);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [companiesData, sessionsData] = await Promise.all([
        getCompanies(),
        getTrainingSessions(),
      ]);
      setCompanies(companiesData);
      setSessions(sessionsData);
    } catch {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    try {
      await createCompany(newCompanyName.trim());
      setNewCompanyName('');
      setIsAddModalOpen(false);
      fetchData();
    } catch {
      console.error('Failed to create company');
    }
  };

  const handleConfirmDelete = async () => {
    if (!companyToDelete) return;
    try {
      await deleteCompany(companyToDelete.id);
      setCompanyToDelete(null);
      fetchData();
    } catch {
      console.error('Failed to delete company');
    }
  };

  const openEditModal = (c: Company) => {
    setCompanyToEdit(c);
    setEditName(c.name);
    setEditIndustry(c.industry ?? '');
    setEditContactName(c.contactName ?? '');
    setEditContactEmail(c.contactEmail ?? '');
    setEditEngagementStatus(c.engagementStatus ?? 'pending');
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyToEdit) return;
    try {
      await updateCompany(companyToEdit.id, {
        name: editName.trim(),
        industry: editIndustry.trim(),
        contactName: editContactName.trim(),
        contactEmail: editContactEmail.trim(),
        engagementStatus: editEngagementStatus,
      });
      setCompanyToEdit(null);
      fetchData();
    } catch {
      console.error('Failed to update company');
    }
  };

  const openParticipantsModal = async (c: Company) => {
    setSelectedCompany(c);
    try {
      const [participants, all] = await Promise.all([
        getCompanyParticipants(c.id),
        getParticipants(),
      ]);
      setCompanyParticipants(participants);
      setAllParticipants(all);
    } catch {
      console.error('Failed to load participants');
    }
  };

  const handleAddParticipant = async (participantId: string) => {
    if (!selectedCompany) return;
    try {
      await addParticipantToCompany(selectedCompany.id, participantId);
      const [participants, all] = await Promise.all([
        getCompanyParticipants(selectedCompany.id),
        getParticipants(),
      ]);
      setCompanyParticipants(participants);
      setAllParticipants(all);
      fetchData();
    } catch {
      console.error('Failed to add participant');
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!selectedCompany) return;
    try {
      await removeParticipantFromCompany(selectedCompany.id, participantId);
      const [participants, all] = await Promise.all([
        getCompanyParticipants(selectedCompany.id),
        getParticipants(),
      ]);
      setCompanyParticipants(participants);
      setAllParticipants(all);
      fetchData();
    } catch {
      console.error('Failed to remove participant');
    }
  };

  const availableParticipants = allParticipants.filter(
    (p) => !companyParticipants.some((cp) => cp.id === p.id),
  );

  if (loading) return <div>Loading...</div>;

  const filtered = filter === 'all' ? companies : companies.filter((c) => c.engagementStatus === filter);

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

      <div className="stat-grid">
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
                  <div
                    className="company-name"
                    onClick={() => openParticipantsModal(c)}
                    style={{ cursor: 'pointer', color: '#4f46e5', textDecoration: 'underline' }}
                  >
                    {c.name}
                  </div>
                  <div className="company-industry">{c.industry}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Pill variant={ENGAGEMENT_PILL[c.engagementStatus]}>
                  {ENGAGEMENT_LABEL[c.engagementStatus]}
                </Pill>
                <button
                  onClick={() => openParticipantsModal(c)}
                  title="Manage participants"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#9ca3af', padding: 4, display: 'flex',
                    borderRadius: '4px', transition: 'color 0.15s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#4f46e5')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                >
                  <IconUserPlus size={16} />
                </button>
                <button
                  onClick={() => openEditModal(c)}
                  title="Edit company"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#9ca3af', padding: 4, display: 'flex',
                    borderRadius: '4px', transition: 'color 0.15s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#4f46e5')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                >
                  <IconPencil size={16} />
                </button>
                <button
                  onClick={() => setCompanyToDelete(c)}
                  title="Delete company"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#9ca3af', padding: 4, display: 'flex',
                    borderRadius: '4px', transition: 'color 0.15s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                >
                  <IconTrash size={16} />
                </button>
              </div>
            </div>

            <div className="company-meta-row">
              <div className="company-meta-item">
                <span className="company-meta-label">Participants</span>
                <span className="company-meta-value">{c.participantCount}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 24, alignItems: 'center' }}>
              <span className="company-meta-label">Sessions</span>
              {sessions.filter((s) => s.companies.some((sc) => sc.id === c.id)).length === 0 ? (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>None</span>
              ) : (
                sessions
                  .filter((s) => s.companies.some((sc) => sc.id === c.id))
                  .map((s) => (
                    <Pill key={s.id} variant={SESSION_PILL[s.status]}>
                      {s.name}
                    </Pill>
                  ))
              )}
            </div>

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

      {companyToEdit && (
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
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>Edit Company</h2>
              <button
                onClick={() => setCompanyToEdit(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', padding: 0, display: 'flex' }}
              >
                <IconX size={24} stroke={1.5} />
              </button>
            </div>
            <form onSubmit={handleUpdateCompany} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                placeholder="Company Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', border: '1px solid #d1d5db',
                  borderRadius: '6px', fontSize: '15px', outline: 'none',
                  boxSizing: 'border-box', color: '#374151'
                }}
                autoFocus
              />
              <input
                type="text"
                placeholder="Industry"
                value={editIndustry}
                onChange={(e) => setEditIndustry(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', border: '1px solid #d1d5db',
                  borderRadius: '6px', fontSize: '15px', outline: 'none',
                  boxSizing: 'border-box', color: '#374151'
                }}
              />
              <input
                type="text"
                placeholder="Contact Name"
                value={editContactName}
                onChange={(e) => setEditContactName(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', border: '1px solid #d1d5db',
                  borderRadius: '6px', fontSize: '15px', outline: 'none',
                  boxSizing: 'border-box', color: '#374151'
                }}
              />
              <input
                type="email"
                placeholder="Contact Email"
                value={editContactEmail}
                onChange={(e) => setEditContactEmail(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', border: '1px solid #d1d5db',
                  borderRadius: '6px', fontSize: '15px', outline: 'none',
                  boxSizing: 'border-box', color: '#374151'
                }}
              />
              <select
                value={editEngagementStatus}
                onChange={(e) => setEditEngagementStatus(e.target.value as EngagementStatus)}
                style={{
                  width: '100%', padding: '12px 16px', border: '1px solid #d1d5db',
                  borderRadius: '6px', fontSize: '15px', outline: 'none',
                  boxSizing: 'border-box', color: '#374151', background: 'white'
                }}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="at-risk">At Risk</option>
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '10px 28px', background: '#002842', color: 'white',
                    border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500,
                    fontSize: '14px', letterSpacing: '0.5px'
                  }}
                >
                  SAVE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {companyToDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'modalFadeIn 0.2s ease-out forwards'
        }}>
          <div style={{
            background: 'white', borderRadius: '8px', width: '100%', maxWidth: '420px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px', color: '#dc2626' }}>
                <IconTrash size={40} />
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                Delete Company
              </h2>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
                Are you sure you want to delete <strong>{companyToDelete.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 20px', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={() => setCompanyToDelete(null)}
                style={{
                  padding: '9px 20px', background: 'white', color: '#374151',
                  border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: 500, fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  padding: '9px 20px', background: '#dc2626', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: 500, fontSize: '14px'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCompany && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'modalFadeIn 0.2s ease-out forwards'
        }}>
          <div style={{
            background: 'white', borderRadius: '8px', width: '100%', maxWidth: '600px',
            maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                  {selectedCompany.name} — Participants
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
                  {companyParticipants.length} participant{companyParticipants.length !== 1 ? 's' : ''} enrolled
                </p>
              </div>
              <button
                onClick={() => { setSelectedCompany(null); setIsAddParticipantOpen(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', padding: 0, display: 'flex' }}
              >
                <IconX size={24} stroke={1.5} />
              </button>
            </div>

            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
              {companyParticipants.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
                  <p style={{ margin: 0, fontSize: '14px' }}>No participants assigned to this company yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {companyParticipants.map((p) => {
                    return (
                      <div
                        key={p.id}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 12px', background: '#f9fafb', borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: p.avatarColor, display: 'flex', alignItems: 'center',
                              justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '13px'
                            }}
                          >
                            {p.name[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '14px', color: '#111827' }}>{p.name}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{p.role}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveParticipant(p.id)}
                          title="Remove from company"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#9ca3af', padding: 4, display: 'flex',
                            borderRadius: '4px', transition: 'color 0.15s'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                        >
                          <IconUserMinus size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', flexShrink: 0 }}>
              {!isAddParticipantOpen ? (
                <button
                  onClick={() => setIsAddParticipantOpen(true)}
                  disabled={availableParticipants.length === 0}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', background: availableParticipants.length === 0 ? '#e5e7eb' : '#4f46e5',
                    color: availableParticipants.length === 0 ? '#9ca3af' : 'white',
                    border: 'none', borderRadius: '6px', cursor: availableParticipants.length === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 500, fontSize: '13px'
                  }}
                >
                  <IconUserPlus size={14} /> Add Existing Participant
                </button>
              ) : (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: '8px' }}>
                    Select a participant to add:
                  </div>
                  {availableParticipants.length === 0 ? (
                    <div style={{ fontSize: '13px', color: '#9ca3af', padding: '8px 0' }}>
                      All participants are already assigned to this company.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                      {availableParticipants.map((p) => (
                        <div
                          key={p.id}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '8px 10px', borderRadius: '6px',
                            border: '1px solid #e5e7eb', cursor: 'pointer',
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: p.avatarColor, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '12px'
                              }}
                            >
                              {p.name[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500, fontSize: '13px', color: '#111827' }}>{p.name}</div>
                              <div style={{ fontSize: '11px', color: '#9ca3af' }}>{p.role}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddParticipant(p.id)}
                            style={{
                              padding: '4px 10px', background: '#4f46e5', color: 'white',
                              border: 'none', borderRadius: '4px', cursor: 'pointer',
                              fontWeight: 500, fontSize: '12px'
                            }}
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setIsAddParticipantOpen(false)}
                    style={{
                      marginTop: '8px', padding: '6px 12px', background: 'white',
                      color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px',
                      cursor: 'pointer', fontSize: '12px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
