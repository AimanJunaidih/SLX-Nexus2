import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCertificates } from '@/data-access/certificates';
import { getTrainingSessions } from '@/data-access/training-sessions';
import type { Certificate } from '@/entities/certificate';
import type { TrainingSession } from '@/entities/training-session';

export default function CertificatePrintPage() {
  const { certId } = useParams<{ certId: string }>();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [session, setSession] = useState<TrainingSession | null>(null);

  useEffect(() => {
    if (!certId) return;
    Promise.all([getCertificates(), getTrainingSessions()]).then(([certs, sessions]) => {
      const found = certs.find((c) => c.id === certId);
      setCert(found ?? null);
      if (found) {
        setSession(sessions.find((s) => s.id === found.sessionId) ?? null);
      }
    });
  }, [certId]);

  useEffect(() => {
    if (cert) {
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [cert]);

  if (!cert) return <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>Loading certificate...</div>;

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: '#f3f4f6', padding: 40,
    }}>
      <div style={{
        width: 800, background: 'white', borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)', overflow: 'hidden',
        fontFamily: 'Georgia, serif',
      }}>
        {/* Header border */}
        <div style={{ height: 8, background: 'linear-gradient(90deg, #4f46e5, #059669)' }} />

        <div style={{ padding: '60px 60px 40px', textAlign: 'center' }}>
          {/* Logo area */}
          <div style={{ fontSize: 14, letterSpacing: '4px', color: '#4f46e5', fontWeight: 700, marginBottom: 8 }}>
            SLX NEXUS
          </div>

          <h1 style={{
            fontSize: 36, fontWeight: 700, color: '#111827', margin: '0 0 8px',
            letterSpacing: '2px',
          }}>
            CERTIFICATE
          </h1>
          <div style={{ fontSize: 16, color: '#6b7280', letterSpacing: '1px' }}>
            OF COMPLETION
          </div>

          {/* Divider */}
          <div style={{
            width: 80, height: 2, background: '#4f46e5', margin: '32px auto',
          }} />

          <p style={{ fontSize: 16, color: '#6b7280', margin: '0 0 16px' }}>
            This is to certify that
          </p>

          {/* Participant name */}
          <div style={{
            fontSize: 32, fontWeight: 700, color: '#111827',
            borderBottom: '2px solid #e5e7eb', paddingBottom: 8,
            marginBottom: 16, display: 'inline-block',
          }}>
            {cert.participantName}
          </div>

          <p style={{ fontSize: 16, color: '#6b7280', margin: '0 0 8px' }}>
            from <strong style={{ color: '#374151' }}>{cert.company}</strong>
          </p>

          <p style={{ fontSize: 16, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.6 }}>
            has successfully completed the training program
            {session && <><br /><strong style={{ color: '#374151' }}>{session.name}</strong> held on {session.date}</>}
          </p>

          {/* Score */}
          <div style={{
            display: 'inline-block', padding: '8px 24px',
            background: cert.score >= 80 ? '#dcfce7' : cert.score >= 60 ? '#fef9c3' : '#fee2e2',
            borderRadius: 8, marginBottom: 32,
          }}>
            <span style={{ fontSize: 14, color: '#6b7280' }}>Score: </span>
            <span style={{
              fontSize: 20, fontWeight: 700,
              color: cert.score >= 80 ? '#166534' : cert.score >= 60 ? '#854d0e' : '#991b1b',
            }}>
              {cert.score}%
            </span>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            marginTop: 48, paddingTop: 24, borderTop: '1px solid #e5e7eb',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #374151', width: 160, marginBottom: 8 }} />
              <div style={{ fontSize: 12, color: '#6b7280' }}>Program Director</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>
                {cert.completionDate || new Date().toLocaleDateString()}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Date</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #374151', width: 160, marginBottom: 8 }} />
              <div style={{ fontSize: 12, color: '#6b7280' }}>Training Manager</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
