import { useState, useEffect } from 'react';
import { IconX } from '@tabler/icons-react';
import { calculateRebate } from './RebateCalculationEngine';
import type { RebateType, RebateCalculations } from './RebateCalculationEngine';

interface AddClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (claim: any) => void;
  includeSST: boolean;
}

export default function AddClaimModal({ isOpen, onClose, onSave, includeSST }: AddClaimModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [unit, setUnit] = useState<number>(0);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [rebateType, setRebateType] = useState<RebateType>('Subscription (Monthly)');
  const [outstandingDebt, setOutstandingDebt] = useState<number>(0);

  const [calculations, setCalculations] = useState<RebateCalculations>({
    totalClaimValue: 0,
    invoiceBeforeDeduction: 0,
    hrdfCoverage: 0,
    remainingBalance1: 0,
    invoiceAfterDeduction: 0,
    monthsCovered: null,
    remainingBalance2: null,
  });

  useEffect(() => {
    const calc = calculateRebate({
      rebateType,
      units: unit,
      participants: participantCount,
      outstandingBalance: outstandingDebt,
      includeSST,
    });
    setCalculations(calc);
  }, [unit, participantCount, rebateType, outstandingDebt, includeSST]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: `rc_${Date.now()}`,
      companyName,
      unit,
      participantCount,
      outstandingDebt,
      rebateType,
      package: rebateType === 'Subscription (Monthly)' ? 'A (Monthly)' : rebateType === 'Subscription (Yearly)' ? 'B (Yearly)' : '-',
      ...calculations,
    });
    setCompanyName('');
    setUnit(0);
    setParticipantCount(0);
    setOutstandingDebt(0);
    setRebateType('Subscription (Monthly)');
  };

  const formatRM = (val: number | null) => {
    if (val === null) return '-';
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'white', borderRadius: '8px', width: '100%', maxWidth: '600px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>Add New Claim</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <IconX size={24} stroke={1.5} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto' }}>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Company Name</label>
              <input
                type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: 14 }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Rebate Type</label>
                <select 
                  value={rebateType} onChange={e => setRebateType(e.target.value as RebateType)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: 14, background: 'white' }}
                >
                  <option value="Subscription (Monthly)">Subscription (Monthly) - Pkg A</option>
                  <option value="Subscription (Yearly)">Subscription (Yearly) - Pkg B</option>
                  <option value="Device">Device</option>
                  <option value="Outstanding">Outstanding Balance</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Participant Count</label>
                <input
                  type="number" min="0" required value={participantCount} onChange={e => setParticipantCount(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: 14 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Units / Devices</label>
                <input
                  type="number" min="0" required value={unit} onChange={e => setUnit(Number(e.target.value))}
                  disabled={rebateType === 'Outstanding'}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: 14, background: rebateType === 'Outstanding' ? '#f3f4f6' : 'white' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Outstanding Debt (RM)</label>
                <input
                  type="number" min="0" required value={outstandingDebt} onChange={e => setOutstandingDebt(Number(e.target.value))}
                  disabled={rebateType !== 'Outstanding'}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: 14, background: rebateType !== 'Outstanding' ? '#f3f4f6' : 'white' }}
                />
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginTop: 8 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>Live Calculation Result</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Total Claim Value:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatRM(calculations.totalClaimValue)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Invoice Before:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatRM(calculations.invoiceBeforeDeduction)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>HRDF Coverage:</span>
                  <span style={{ fontWeight: 600, color: '#059669' }}>{formatRM(calculations.hrdfCoverage)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Remaining Bal 1:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatRM(calculations.remainingBalance1)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Invoice After:</span>
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>{formatRM(calculations.invoiceAfterDeduction)}</span>
                </div>
                {rebateType === 'Subscription (Monthly)' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Months Covered:</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{calculations.monthsCovered}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Remaining Bal 2:</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatRM(calculations.remainingBalance2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontWeight: 500, color: '#374151' }}>
              Cancel
            </button>
            <button type="submit" style={{ padding: '8px 24px', background: '#4f46e5', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500, color: 'white' }}>
              Save Claim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
