import { useState, useEffect } from 'react';
import { IconUsers, IconCircleCheck, IconAlertTriangle, IconTrophy, IconPlus, IconX, IconTrash, IconPencil } from '@tabler/icons-react';
import StatCard from '@/shared/ui/StatCard';
import Panel from '@/shared/ui/Panel';
import AvatarBadge from '@/shared/ui/AvatarBadge';
import DataTable from '@/shared/ui/DataTable';
import { getParticipants, createParticipant, updateParticipant, deleteParticipant } from '@/data-access/participants';
import { getCompanies } from '@/data-access/companies';
import type { Participant } from '@/entities/participant';
import type { Company } from '@/entities/company';
import { getCompletionPct } from '@/entities/participant';

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
];

const AVATAR_COLORS = ['#4f46e5', '#059669', '#dc2626', '#ca8a04', '#0891b2', '#7c3aed', '#db2777'];

function randomAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  const [participantToEdit, setParticipantToEdit] = useState<Participant | null>(null);
  const [editName, setEditName] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editAvatarColor, setEditAvatarColor] = useState('');

  const fetchParticipants = async () => {
    try {
      const data = await getParticipants();
      setParticipants(data);
    } catch {
      console.error('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  useEffect(() => {
    if (isAddModalOpen || participantToEdit) {
      getCompanies().then(setCompanies);
    }
  }, [isAddModalOpen, participantToEdit]);

  const handleCreateParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCompany.trim() || !newRole.trim()) return;
    try {
      await createParticipant({
        id: `p_${Math.random().toString(36).substr(2, 9)}`,
        name: newName.trim(),
        company: newCompany.trim(),
        role: newRole.trim(),
        avatarColor: randomAvatarColor(),
        mods: [0, 0, 0, 0, 0],
        score: 0,
      });
      setNewName('');
      setNewCompany('');
      setNewRole('');
      setIsAddModalOpen(false);
      fetchParticipants();
    } catch {
      console.error('Failed to create participant');
    }
  };

  const openEditModal = (p: Participant) => {
    setParticipantToEdit(p);
    setEditName(p.name);
    setEditCompany(p.company);
    setEditRole(p.role);
    setEditAvatarColor(p.avatarColor);
  };

  const handleUpdateParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantToEdit) return;
    try {
      await updateParticipant(participantToEdit.id, {
        name: editName.trim(),
        company: editCompany.trim(),
        role: editRole.trim(),
        avatarColor: editAvatarColor,
      });
      setParticipantToEdit(null);
      fetchParticipants();
    } catch {
      console.error('Failed to update participant');
    }
  };

  const handleConfirmDelete = async () => {
    if (!participantToDelete) return;
    try {
      await deleteParticipant(participantToDelete.id);
      setParticipantToDelete(null);
      fetchParticipants();
    } catch {
      console.error('Failed to delete participant');
    }
  };

  if (loading) return <div>Loading...</div>;

  const completedCount = participants.filter((p) => getCompletionPct(p.mods) === 100).length;
  const onTrackCount = participants.filter((p) => {
    const pct = getCompletionPct(p.mods);
    return pct >= 60 && pct < 100;
  }).length;
  const atRiskCount = participants.filter((p) => getCompletionPct(p.mods) < 60).length;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Participants</h1>
          <p className="page-subtitle">Individual progress and status across all enrolled participants.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', background: '#4f46e5', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
          }}
        >
          <IconPlus size={18} /> Add Participant
        </button>
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
        <DataTable
          columns={[
            ...columns,
            {
              key: 'actions',
              label: '',
              width: '72px',
              render: (p: Participant) => (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => openEditModal(p)}
                    title="Edit participant"
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
                    onClick={() => setParticipantToDelete(p)}
                    title="Delete participant"
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
              ),
            },
          ]}
          data={participants}
          keyFn={(p) => p.id}
        />
      </Panel>

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
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>Add Participant</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', padding: 0, display: 'flex' }}
              >
                <IconX size={24} stroke={1.5} />
              </button>
            </div>
            <form onSubmit={handleCreateParticipant} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                placeholder="Full Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', border: '1px solid #d1d5db',
                  borderRadius: '6px', fontSize: '15px', outline: 'none',
                  boxSizing: 'border-box', color: '#374151'
                }}
                autoFocus
              />
              <select
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', border: '1px solid #d1d5db',
                  borderRadius: '6px', fontSize: '15px', outline: 'none',
                  boxSizing: 'border-box', color: '#374151', background: 'white'
                }}
              >
                <option value="">Select a company...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', border: '1px solid #d1d5db',
                  borderRadius: '6px', fontSize: '15px', outline: 'none',
                  boxSizing: 'border-box', color: '#374151'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
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

      {participantToEdit && (
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
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>Edit Participant</h2>
              <button
                onClick={() => setParticipantToEdit(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', padding: 0, display: 'flex' }}
              >
                <IconX size={24} stroke={1.5} />
              </button>
            </div>
            <form onSubmit={handleUpdateParticipant} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                placeholder="Full Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', border: '1px solid #d1d5db',
                  borderRadius: '6px', fontSize: '15px', outline: 'none',
                  boxSizing: 'border-box', color: '#374151'
                }}
                autoFocus
              />
              <select
                value={editCompany}
                onChange={(e) => setEditCompany(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', border: '1px solid #d1d5db',
                  borderRadius: '6px', fontSize: '15px', outline: 'none',
                  boxSizing: 'border-box', color: '#374151', background: 'white'
                }}
              >
                <option value="">Select a company...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Role"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', border: '1px solid #d1d5db',
                  borderRadius: '6px', fontSize: '15px', outline: 'none',
                  boxSizing: 'border-box', color: '#374151'
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '14px', color: '#374151', whiteSpace: 'nowrap' }}>Avatar Color</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditAvatarColor(color)}
                      style={{
                        width: 28, height: 28, borderRadius: '50%', background: color,
                        border: editAvatarColor === color ? '3px solid #111827' : '3px solid transparent',
                        cursor: 'pointer', padding: 0
                      }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
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

      {participantToDelete && (
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
                Delete Participant
              </h2>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
                Are you sure you want to delete <strong>{participantToDelete.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 20px', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={() => setParticipantToDelete(null)}
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
    </>
  );
}
