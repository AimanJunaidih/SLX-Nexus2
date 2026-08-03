import { useState, useEffect } from 'react';
import {
  IconAward,
  IconCircleCheck,
  IconClock,
  IconPlus,
  IconX,
  IconPrinter,
  IconChevronDown,
} from '@tabler/icons-react';
import StatCard from '@/shared/ui/StatCard';
import Panel from '@/shared/ui/Panel';
import Pill from '@/shared/ui/Pill';
import AvatarBadge from '@/shared/ui/AvatarBadge';
import { getCertificates, createCertificate, updateCertificateStatus } from '@/data-access/certificates';
import { getParticipants } from '@/data-access/participants';
import { getTrainingSessions } from '@/data-access/training-sessions';
import type { Certificate, CertificateStatus } from '@/entities/certificate';
import type { Participant } from '@/entities/participant';
import type { TrainingSession } from '@/entities/training-session';
import { CERT_STATUS_PILL, CERT_STATUS_LABEL, scoreColor } from '@/shared/constants/status';

const STATUS_OPTIONS: CertificateStatus[] = ['pending', 'ready', 'issued'];

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addParticipantId, setAddParticipantId] = useState('');
  const [addScore, setAddScore] = useState('');
  const [addStatus, setAddStatus] = useState<CertificateStatus>('pending');

  const fetchData = async () => {
    const [certsData, partsData, sessionsData] = await Promise.all([getCertificates(), getParticipants(), getTrainingSessions()]);
    setCertificates(certsData);
    setParticipants(partsData);
    setSessions(sessionsData);
    if (sessionsData.length > 0 && !selectedSessionId) setSelectedSessionId(sessionsData[0].id);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  const sessionParticipantIds = new Set(
    selectedSession?.companies.flatMap((c) => c.participants.map((p) => p.id)) ?? []
  );
  const sessionParticipants = participants.filter((p) => sessionParticipantIds.has(p.id));
  const usedParticipantIds = new Set(
    certificates.filter((c) => c.sessionId === selectedSessionId).map((c) => c.participantId)
  );
  const availableParticipants = sessionParticipants.filter((p) => !usedParticipantIds.has(p.id));

  const sessionCerts = certificates.filter((c) => c.sessionId === selectedSessionId);
  const issuedCount = sessionCerts.filter((c) => c.status === 'issued').length;
  const readyCount = sessionCerts.filter((c) => c.status === 'ready').length;
  const pendingCount = sessionCerts.filter((c) => c.status === 'pending').length;

  const avatarColors = Object.fromEntries(participants.map((p) => [p.id, p.avatarColor]));

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    const participant = participants.find((p) => p.id === addParticipantId);
    if (!participant || !selectedSessionId) return;
    await createCertificate({
      sessionId: selectedSessionId,
      participantId: participant.id,
      participantName: participant.name,
      company: participant.company,
      role: participant.role,
      score: parseInt(addScore) || 0,
      status: addStatus,
    });
    setIsAddOpen(false);
    setAddParticipantId('');
    setAddScore('');
    setAddStatus('pending');
    fetchData();
  };

  const handleStatusChange = async (certId: string, newStatus: CertificateStatus) => {
    await updateCertificateStatus(certId, newStatus);
    fetchData();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Certificates</h1>
          <p className="page-subtitle">Certificate status per training session.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          disabled={!selectedSessionId || availableParticipants.length === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px',
            background: !selectedSessionId || availableParticipants.length === 0 ? '#e5e7eb' : '#4f46e5',
            color: !selectedSessionId || availableParticipants.length === 0 ? '#9ca3af' : 'white',
            border: 'none', borderRadius: '8px',
            cursor: !selectedSessionId || availableParticipants.length === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 600, fontSize: 14,
          }}
        >
          <IconPlus size={18} /> Add Certificate
        </button>
      </div>

      {/* Session Selector */}
      <div style={{
        background: 'white', borderRadius: 8, border: '1px solid #e5e7eb',
        padding: '16px 20px', marginBottom: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
            Current Session:
          </label>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            style={{
              padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 6,
              fontSize: 14, outline: 'none', background: 'white', color: '#374151',
              minWidth: 200,
            }}
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>{s.name} — {s.date}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="stat-grid stat-grid-3">
        <StatCard icon={<IconAward size={20} stroke={1.8} />} iconColor="green" value={issuedCount} label="Certificates Issued" />
        <StatCard icon={<IconCircleCheck size={20} stroke={1.8} />} iconColor="teal" value={readyCount} label="Ready to Issue" />
        <StatCard icon={<IconClock size={20} stroke={1.8} />} iconColor="yellow" value={pendingCount} label="Pending Completion" />
      </div>

      {/* Certificate Table */}
      <Panel title="Certificate Registry" className="full-panel" bodyClass="panel-body-sm">
        {sessionCerts.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            No certificates for this session yet. Click "Add Certificate" to create one.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Company</th>
                <th>Score</th>
                <th>Date</th>
                <th style={{ width: 120 }}>Status</th>
                <th style={{ width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {sessionCerts.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="table-name-cell">
                      <AvatarBadge name={c.participantName} color={avatarColors[c.participantId] ?? '#6b7280'} />
                      <div className="table-name-info">
                        <span className="table-name-primary">{c.participantName}</span>
                        <span className="table-name-secondary">{c.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell-muted">{c.company}</td>
                  <td><span className={`score-badge ${scoreColor(c.score)}`}>{c.score}</span></td>
                  <td className="table-cell-muted">{c.completionDate || '—'}</td>
                  <td>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value as CertificateStatus)}
                        style={{
                          appearance: 'none', width: '100%',
                          padding: '6px 28px 6px 10px', border: 'none', borderRadius: 6,
                          fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none',
                          background: c.status === 'issued' ? '#dcfce7' : c.status === 'ready' ? '#dbeafe' : '#f3f4f6',
                          color: c.status === 'issued' ? '#166534' : c.status === 'ready' ? '#1e40af' : '#6b7280',
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{CERT_STATUS_LABEL[s]}</option>
                        ))}
                      </select>
                      <IconChevronDown size={14} style={{
                        position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                        pointerEvents: 'none', color: '#9ca3af',
                      }} />
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => window.open(`/certificates/${c.id}/print`, '_blank')}
                      title="Download / Print Certificate"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '6px 10px', background: '#f3f4f6', border: '1px solid #e5e7eb',
                        borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#374151',
                        fontWeight: 500,
                      }}
                    >
                      <IconPrinter size={14} />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {/* Add Certificate Modal */}
      {isAddOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'modalFadeIn 0.2s ease-out forwards',
        }}>
          <div style={{
            background: 'white', borderRadius: 8, width: '100%', maxWidth: '480px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>Add Certificate</h2>
              <button onClick={() => setIsAddOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', padding: 0, display: 'flex' }}>
                <IconX size={24} stroke={1.5} />
              </button>
            </div>
            <form onSubmit={handleAddCertificate} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Participant</label>
                <select
                  value={addParticipantId}
                  onChange={(e) => setAddParticipantId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, outline: 'none', color: '#374151', background: 'white' }}
                >
                  <option value="">Select participant...</option>
                  {availableParticipants.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.company}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Score</label>
                <input
                  type="number" min="0" max="100" value={addScore}
                  onChange={(e) => setAddScore(e.target.value)}
                  placeholder="e.g. 85"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, outline: 'none', color: '#374151', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Status</label>
                <select
                  value={addStatus}
                  onChange={(e) => setAddStatus(e.target.value as CertificateStatus)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, outline: 'none', color: '#374151', background: 'white' }}
                >
                  <option value="pending">Pending</option>
                  <option value="ready">Ready to Issue</option>
                  <option value="issued">Issued</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8, borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                <button type="button" onClick={() => setIsAddOpen(false)} style={{ padding: '10px 20px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontWeight: 500, fontSize: 14 }}>Cancel</button>
                <button type="submit" disabled={!addParticipantId || !addScore} style={{ padding: '10px 28px', background: !addParticipantId || !addScore ? '#9ca3af' : '#002842', color: 'white', border: 'none', borderRadius: 6, cursor: !addParticipantId || !addScore ? 'not-allowed' : 'pointer', fontWeight: 500, fontSize: 14 }}>ADD</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
