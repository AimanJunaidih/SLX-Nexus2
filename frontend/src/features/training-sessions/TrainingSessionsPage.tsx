import { useState, useEffect } from 'react';
import {
  IconSchool,
  IconCalendarEvent,
  IconClock,
  IconCircleCheck,
  IconBuilding,
  IconChevronRight,
  IconPlus,
  IconX,
  IconUserPlus,
  IconTrash,
} from '@tabler/icons-react';
import StatCard from '@/shared/ui/StatCard';
import Pill from '@/shared/ui/Pill';
import AvatarBadge from '@/shared/ui/AvatarBadge';
import { 
  getTrainingSessions,
  createTrainingSession,
  addCompanyToSession,
  removeCompanyFromSession,
  addParticipantToSession,
  removeParticipantFromSession
} from '@/data-access/training-sessions';
import { getCompanies } from '@/data-access/companies';
import { getParticipants } from '@/data-access/participants';
import type { TrainingSession, SessionStatus, SessionCompany } from '@/entities/training-session';
import type { Company } from '@/entities/company';
import type { Participant } from '@/entities/participant';

const STATUS_PILL: Record<SessionStatus, 'ok' | 'info' | 'neutral'> = {
  completed: 'ok',
  'in-progress': 'info',
  upcoming: 'neutral',
};

const STATUS_LABEL: Record<SessionStatus, string> = {
  completed: 'Completed',
  'in-progress': 'In Progress',
  upcoming: 'Upcoming',
};

const COMPANY_COLORS = ['#4f46e5', '#059669', '#dc2626', '#ca8a04', '#0891b2', '#7c3aed', '#db2777'];

export default function TrainingSessionsPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);

  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStatus, setNewStatus] = useState<SessionStatus>('upcoming');

  const [addCompanySessionId, setAddCompanySessionId] = useState<string | null>(null);
  const [addParticipantContext, setAddParticipantContext] = useState<{ sessionId: string; companyId: string } | null>(null);
  const [companyToRemove, setCompanyToRemove] = useState<{ sessionId: string; companyId: string; companyName: string } | null>(null);
  const [participantToRemove, setParticipantToRemove] = useState<{ sessionId: string; companyId: string; participantId: string; participantName: string } | null>(null);

  useEffect(() => {
    Promise.all([getTrainingSessions(), getCompanies(), getParticipants()]).then(([sData, cData, pData]) => {
      setSessions(sData);
      setAllCompanies(cData);
      setAllParticipants(pData);
      setLoading(false);
    });
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedIds(new Set(sessions.map((s) => s.id)));
  const collapseAll = () => setExpandedIds(new Set());

  const updateSession = (sessionId: string, updater: (s: TrainingSession) => TrainingSession) => {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? updater(s) : s)));
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDate) return;
    try {
      const newSession = await createTrainingSession({
        name: newName.trim(),
        date: newDate,
        status: newStatus,
      });
      setSessions((prev) => [...prev, newSession]);
      setNewName('');
      setNewDate('');
      setNewStatus('upcoming');
      setIsAddSessionOpen(false);
    } catch (error) {
      console.error("Failed to create session", error);
    }
  };

  const handleAddCompany = async (sessionId: string, company: Company) => {
    try {
      await addCompanyToSession(sessionId, company.id);
      updateSession(sessionId, (s) => ({
        ...s,
        companies: [
          ...s.companies,
          { id: company.id, name: company.name, participants: [] },
        ],
      }));
      setAddCompanySessionId(null);
    } catch (error) {
      console.error("Failed to add company", error);
    }
  };

  const handleRemoveCompany = async (sessionId: string, companyId: string) => {
    try {
      await removeCompanyFromSession(sessionId, companyId);
      updateSession(sessionId, (s) => ({
        ...s,
        companies: s.companies.filter((c) => c.id !== companyId),
      }));
    } catch (error) {
      console.error("Failed to remove company", error);
    }
  };

  const handleAddParticipant = async (sessionId: string, companyId: string, participant: Participant) => {
    try {
      await addParticipantToSession(sessionId, companyId, participant.id);
      updateSession(sessionId, (s) => ({
        ...s,
        companies: s.companies.map((c) =>
          c.id === companyId ? { ...c, participants: [...c.participants, participant] } : c,
        ),
      }));
      setAddParticipantContext(null);
    } catch (error) {
      console.error("Failed to add participant", error);
    }
  };

  const handleRemoveParticipant = async (sessionId: string, companyId: string, participantId: string) => {
    try {
      await removeParticipantFromSession(sessionId, companyId, participantId);
      updateSession(sessionId, (s) => ({
        ...s,
        companies: s.companies.map((c) =>
          c.id === companyId ? { ...c, participants: c.participants.filter((p) => p.id !== participantId) } : c,
        ),
      }));
    } catch (error) {
      console.error("Failed to remove participant", error);
    }
  };

  const getAvailableCompanies = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return [];
    const assignedIds = new Set(session.companies.map((c) => c.id));
    return allCompanies.filter((c) => !assignedIds.has(c.id));
  };

  const getAvailableParticipants = (sessionId: string, companyId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    const company = session?.companies.find((c) => c.id === companyId);
    if (!company) return [];
    const assignedIds = new Set(company.participants.map((p) => p.id));
    return allParticipants
      .filter((p) => p.company === company.name && !assignedIds.has(p.id));
  };

  if (loading) return <div>Loading...</div>;

  const completedCount = sessions.filter((s) => s.status === 'completed').length;
  const inProgressCount = sessions.filter((s) => s.status === 'in-progress').length;
  const upcomingCount = sessions.filter((s) => s.status === 'upcoming').length;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Training Sessions</h1>
          <p className="page-subtitle">Manage training sessions, companies, and participant assignments.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={expandedIds.size === sessions.length ? collapseAll : expandAll}
            style={{
              padding: '10px 16px', background: 'white', color: '#374151',
              border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer',
              fontWeight: 500, fontSize: '13px'
            }}
          >
            {expandedIds.size === sessions.length ? 'Collapse All' : 'Expand All'}
          </button>
          <button
            onClick={() => setIsAddSessionOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px', background: '#4f46e5', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
            }}
          >
            <IconPlus size={18} /> Add Session
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={<IconSchool size={20} stroke={1.8} />} iconColor="blue" value={sessions.length} label="Total Sessions" />
        <StatCard icon={<IconCalendarEvent size={20} stroke={1.8} />} iconColor="teal" value={upcomingCount} label="Upcoming" />
        <StatCard icon={<IconClock size={20} stroke={1.8} />} iconColor="yellow" value={inProgressCount} label="In Progress" />
        <StatCard icon={<IconCircleCheck size={20} stroke={1.8} />} iconColor="green" value={completedCount} label="Completed" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sessions.map((session) => {
          const isExpanded = expandedIds.has(session.id);
          const totalParticipants = session.companies.reduce((sum, c) => sum + c.participants.length, 0);
          const availableCompanies = addCompanySessionId === session.id ? getAvailableCompanies(session.id) : [];

          return (
            <div
              key={session.id}
              style={{
                background: 'white', borderRadius: 8, border: '1px solid #e5e7eb',
                overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div
                onClick={() => toggleExpand(session.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px',
                  cursor: 'pointer', userSelect: 'none', transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
              >
                <div
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: 8,
                    background: '#eef2ff', color: '#4f46e5',
                    transition: 'transform 0.2s',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  }}
                >
                  <IconChevronRight size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{session.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {session.date} · {session.companies.length} companies · {totalParticipants} participants
                  </div>
                </div>
                <Pill variant={STATUS_PILL[session.status]}>{STATUS_LABEL[session.status]}</Pill>
              </div>

              {isExpanded && (
                <div style={{ padding: '0 20px 16px', borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 12 }}>
                    {session.companies.map((company) => {
                      const isParticipantOpen = addParticipantContext?.sessionId === session.id && addParticipantContext?.companyId === company.id;
                      const availableParticipants = isParticipantOpen ? getAvailableParticipants(session.id, company.id) : [];

                      return (
                        <div key={company.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                          <div
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '10px 14px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
                            }}
                          >
                            <IconBuilding size={15} stroke={1.8} color="#6b7280" />
                            <span style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>{company.name}</span>
                            <span style={{ fontSize: 11, color: '#9ca3af' }}>
                              {company.participants.length} participant{company.participants.length !== 1 ? 's' : ''}
                            </span>
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <button
                                onClick={() => setAddParticipantContext(isParticipantOpen ? null : { sessionId: session.id, companyId: company.id })}
                                title="Add participant"
                                style={{
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  color: '#9ca3af', padding: 4, display: 'flex',
                                  borderRadius: '4px', transition: 'color 0.15s'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#4f46e5')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                              >
                                <IconUserPlus size={15} />
                              </button>
                              <button
                                onClick={() => setCompanyToRemove({ sessionId: session.id, companyId: company.id, companyName: company.name })}
                                title="Remove company"
                                style={{
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  color: '#9ca3af', padding: 4, display: 'flex',
                                  borderRadius: '4px', transition: 'color 0.15s'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                              >
                                <IconX size={15} />
                              </button>
                            </div>
                          </div>

                          <div style={{ padding: '8px 14px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {company.participants.map((p) => (
                              <div
                                key={p.id}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 8,
                                  padding: '6px 10px', background: '#f3f4f6',
                                  borderRadius: 6, border: '1px solid #e5e7eb',
                                }}
                              >
                                <AvatarBadge name={p.name} color={p.avatarColor} size="sm" />
                                <div>
                                  <div style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>{p.name}</div>
                                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.role}</div>
                                </div>
                                <button
                                  onClick={() => setParticipantToRemove({ sessionId: session.id, companyId: company.id, participantId: p.id, participantName: p.name })}
                                  title="Remove participant"
                                  style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: '#d1d5db', padding: 0, display: 'flex',
                                    borderRadius: '4px', transition: 'color 0.15s', marginLeft: 4
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = '#d1d5db')}
                                >
                                  <IconX size={13} />
                                </button>
                              </div>
                            ))}

                            {company.participants.length === 0 && !isParticipantOpen && (
                              <div style={{ fontSize: 12, color: '#9ca3af', padding: '4px 0' }}>
                                No participants assigned yet.
                              </div>
                            )}
                          </div>

                          {isParticipantOpen && (
                            <div style={{ padding: '8px 14px 10px', borderTop: '1px solid #f3f4f6' }}>
                              {availableParticipants.length === 0 ? (
                                <div style={{ fontSize: 12, color: '#9ca3af', padding: '4px 0' }}>
                                  All participants from {company.name} are already assigned.
                                </div>
                              ) : (
                                <>
                                  <div style={{ fontSize: 11, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>
                                    Select a participant to add:
                                  </div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {availableParticipants.map((p) => (
                                      <button
                                        key={p.id}
                                        onClick={() => handleAddParticipant(session.id, company.id, p)}
                                        style={{
                                          display: 'flex', alignItems: 'center', gap: 6,
                                          padding: '5px 10px', background: 'white',
                                          border: '1px solid #e5e7eb', borderRadius: 6,
                                          cursor: 'pointer', transition: 'background 0.15s',
                                          fontSize: 12, color: '#374151',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                                      >
                                        <AvatarBadge name={p.name} color={p.avatarColor} size="sm" />
                                        <span style={{ fontWeight: 500 }}>{p.name}</span>
                                        <span style={{ color: '#9ca3af' }}>{p.role}</span>
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                              <button
                                onClick={() => setAddParticipantContext(null)}
                                style={{
                                  marginTop: 8, padding: '4px 10px', background: 'white',
                                  color: '#374151', border: '1px solid #d1d5db', borderRadius: 4,
                                  cursor: 'pointer', fontSize: 11
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {addCompanySessionId === session.id ? (
                      <div style={{ border: '1px dashed #d1d5db', borderRadius: 8, padding: 12 }}>
                        {availableCompanies.length === 0 ? (
                          <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '4px 0' }}>
                            All companies are already assigned to this session.
                          </div>
                        ) : (
                          <>
                            <div style={{ fontSize: 11, fontWeight: 500, color: '#6b7280', marginBottom: 8 }}>
                              Select a company to add:
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {availableCompanies.map((c) => (
                                <button
                                  key={c.id}
                                  onClick={() => handleAddCompany(session.id, c)}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '8px 12px', background: 'white',
                                    border: '1px solid #e5e7eb', borderRadius: 6,
                                    cursor: 'pointer', transition: 'background 0.15s',
                                    textAlign: 'left',
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                                >
                                  <div
                                    style={{
                                      width: 28, height: 28, borderRadius: 6,
                                      background: COMPANY_COLORS[allCompanies.indexOf(c) % COMPANY_COLORS.length],
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      color: 'white', fontWeight: 600, fontSize: 12, flexShrink: 0,
                                    }}
                                  >
                                    {c.name[0]}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{c.name}</div>
                                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{c.industry}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                        <button
                          onClick={() => setAddCompanySessionId(null)}
                          style={{
                            marginTop: 8, padding: '4px 10px', background: 'white',
                            color: '#374151', border: '1px solid #d1d5db', borderRadius: 4,
                            cursor: 'pointer', fontSize: 11
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddCompanySessionId(session.id)}
                        disabled={getAvailableCompanies(session.id).length === 0}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '8px 14px',
                          background: getAvailableCompanies(session.id).length === 0 ? '#f3f4f6' : 'white',
                          color: getAvailableCompanies(session.id).length === 0 ? '#9ca3af' : '#4f46e5',
                          border: '1px dashed #d1d5db', borderRadius: 8,
                          cursor: getAvailableCompanies(session.id).length === 0 ? 'not-allowed' : 'pointer',
                          fontWeight: 500, fontSize: 13, width: '100%', justifyContent: 'center',
                          transition: 'background 0.15s, color 0.15s',
                        }}
                      >
                        <IconPlus size={15} /> Add Company
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {companyToRemove && (
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
                Remove Company
              </h2>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
                Are you sure you want to remove <strong>{companyToRemove.companyName}</strong> from this session? All assigned participants will also be removed.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 20px', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={() => setCompanyToRemove(null)}
                style={{
                  padding: '9px 20px', background: 'white', color: '#374151',
                  border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: 500, fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleRemoveCompany(companyToRemove.sessionId, companyToRemove.companyId);
                  setCompanyToRemove(null);
                }}
                style={{
                  padding: '9px 20px', background: '#dc2626', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: 500, fontSize: '14px'
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {participantToRemove && (
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
                Remove Participant
              </h2>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
                Are you sure you want to remove <strong>{participantToRemove.participantName}</strong> from this session?
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 20px', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={() => setParticipantToRemove(null)}
                style={{
                  padding: '9px 20px', background: 'white', color: '#374151',
                  border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: 500, fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleRemoveParticipant(participantToRemove.sessionId, participantToRemove.companyId, participantToRemove.participantId);
                  setParticipantToRemove(null);
                }}
                style={{
                  padding: '9px 20px', background: '#dc2626', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: 500, fontSize: '14px'
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddSessionOpen && (
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
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>Add Session</h2>
              <button onClick={() => setIsAddSessionOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', padding: 0, display: 'flex' }}>
                <IconX size={24} stroke={1.5} />
              </button>
            </div>
            <form onSubmit={handleCreateSession} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text" placeholder="Session Name (e.g. Session 4)" value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', color: '#374151' }}
                autoFocus
              />
              <input
                type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', color: '#374151' }}
              />
              <select
                value={newStatus} onChange={(e) => setNewStatus(e.target.value as SessionStatus)}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', color: '#374151', background: 'white' }}
              >
                <option value="upcoming">Upcoming</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <button type="submit" style={{ padding: '10px 28px', background: '#002842', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, fontSize: '14px', letterSpacing: '0.5px' }}>
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
