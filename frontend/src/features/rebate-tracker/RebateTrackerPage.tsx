import { useState, useMemo } from 'react';
import { IconCalculator, IconPlus, IconReceiptTax } from '@tabler/icons-react';
import AddClaimModal from './AddClaimModal';
import { calculateRebate } from './RebateCalculationEngine';
import type { RebateType } from './RebateCalculationEngine';

interface ClaimInput {
  id: string;
  companyName: string;
  unit: number;
  participantCount: number;
  outstandingDebt: number;
  rebateType: RebateType;
}

const INITIAL_CLAIMS: ClaimInput[] = [
  { id: '1', companyName: 'Alpha Security', unit: 15, participantCount: 15, outstandingDebt: 0, rebateType: 'Subscription (Monthly)' },
  { id: '2', companyName: 'Beta Protection', unit: 7, participantCount: 7, outstandingDebt: 0, rebateType: 'Subscription (Yearly)' },
  { id: '3', companyName: 'Gamma Guards', unit: 9, participantCount: 1, outstandingDebt: 0, rebateType: 'Subscription (Yearly)' },
  { id: '4', companyName: 'Delta Force', unit: 4, participantCount: 4, outstandingDebt: 0, rebateType: 'Device' },
  { id: '5', companyName: 'Epsilon Secure', unit: 20, participantCount: 4, outstandingDebt: 40000, rebateType: 'Outstanding' },
];

export default function RebateTrackerPage() {
  const [includeSST, setIncludeSST] = useState(false);
  const [claims, setClaims] = useState<ClaimInput[]>(INITIAL_CLAIMS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatRM = (val: number | null) => {
    if (val === null) return '-';
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val);
  };

  const processedClaims = useMemo(() => {
    return claims.map(claim => {
      const calcs = calculateRebate({
        rebateType: claim.rebateType,
        units: claim.unit,
        participants: claim.participantCount,
        outstandingBalance: claim.outstandingDebt,
        includeSST,
      });
      const pkg = claim.rebateType === 'Subscription (Monthly)' ? 'A (Monthly)' : claim.rebateType === 'Subscription (Yearly)' ? 'B (Yearly)' : '-';
      return { ...claim, package: pkg, ...calcs };
    });
  }, [claims, includeSST]);

  const handleSaveClaim = (claim: any) => {
    const newClaim: ClaimInput = {
      id: claim.id,
      companyName: claim.companyName,
      unit: claim.unit,
      participantCount: claim.participantCount,
      outstandingDebt: claim.outstandingDebt,
      rebateType: claim.rebateType,
    };
    setClaims([...claims, newClaim]);
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Training Rebate Tracker</h1>
          <p className="page-subtitle">Track and process HRDF training rebate claims and calculations.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setIncludeSST(!includeSST)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px', background: includeSST ? '#eef2ff' : 'white',
              color: includeSST ? '#4f46e5' : '#374151',
              border: `1px solid ${includeSST ? '#4f46e5' : '#d1d5db'}`,
              borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: 13
            }}
          >
            <IconReceiptTax size={18} />
            {includeSST ? '8% SST Included (Main Tracker)' : 'Base Rates (Copy Tracker)'}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px', background: '#4f46e5', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: 13
            }}
          >
            <IconPlus size={18} /> New Claim
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconCalculator size={20} color="#6b7280" />
          <span style={{ fontWeight: 600, color: '#111827', fontSize: 15 }}>Rebate Calculations Table</span>
        </div>
        
        <div style={{ overflowX: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1400, textAlign: 'left' }}>
            <thead>
              <tr>
                {/* Stage 1 */}
                <th colSpan={4} style={{ background: '#eff6ff', color: '#1e40af', padding: '10px 16px', fontSize: 12, borderBottom: '2px solid #bfdbfe', borderRight: '1px solid #bfdbfe', textAlign: 'center', textTransform: 'uppercase' }}>Stage 1: Claim Verification</th>
                {/* Stage 2/3 */}
                <th colSpan={3} style={{ background: '#fdf4ff', color: '#86198f', padding: '10px 16px', fontSize: 12, borderBottom: '2px solid #f5d0fe', borderRight: '1px solid #f5d0fe', textAlign: 'center', textTransform: 'uppercase' }}>Stage 2 & 3: Info & Rebate Type</th>
                {/* Stage 4 */}
                <th colSpan={6} style={{ background: '#f0fdf4', color: '#166534', padding: '10px 16px', fontSize: 12, borderBottom: '2px solid #bbf7d0', textAlign: 'center', textTransform: 'uppercase' }}>Stage 4: Processing Engine</th>
              </tr>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 12, color: '#475569' }}>
                <th style={{ padding: '12px 16px', position: 'sticky', left: 0, background: '#f8fafc', zIndex: 1, borderRight: '1px solid #e2e8f0', boxShadow: '2px 0 4px -2px rgba(0,0,0,0.1)' }}>Company Name</th>
                <th style={{ padding: '12px 16px' }}>Unit</th>
                <th style={{ padding: '12px 16px' }}>Participants</th>
                <th style={{ padding: '12px 16px', borderRight: '1px solid #e2e8f0' }}>Total Claim Value</th>
                
                <th style={{ padding: '12px 16px' }}>Outstanding Debt</th>
                <th style={{ padding: '12px 16px' }}>Rebate Type</th>
                <th style={{ padding: '12px 16px', borderRight: '1px solid #e2e8f0' }}>Package</th>
                
                <th style={{ padding: '12px 16px' }}>Invoice Before</th>
                <th style={{ padding: '12px 16px' }}>HRDF Coverage</th>
                <th style={{ padding: '12px 16px' }}>Remaining Bal 1</th>
                <th style={{ padding: '12px 16px' }}>Invoice After</th>
                <th style={{ padding: '12px 16px' }}>Months Covered</th>
                <th style={{ padding: '12px 16px' }}>Remaining Bal 2</th>
              </tr>
            </thead>
            <tbody>
              {processedClaims.map((claim, idx) => (
                <tr key={claim.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? 'white' : '#f8fafc', fontSize: 13, color: '#334155' }}>
                  <td style={{ padding: '12px 16px', position: 'sticky', left: 0, background: idx % 2 === 0 ? 'white' : '#f8fafc', zIndex: 1, borderRight: '1px solid #e2e8f0', fontWeight: 600, color: '#0f172a', boxShadow: '2px 0 4px -2px rgba(0,0,0,0.1)' }}>
                    {claim.companyName}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{claim.unit}</td>
                  <td style={{ padding: '12px 16px' }}>{claim.participantCount}</td>
                  <td style={{ padding: '12px 16px', borderRight: '1px solid #e2e8f0', fontWeight: 600, color: '#0f172a' }}>{formatRM(claim.totalClaimValue)}</td>
                  
                  <td style={{ padding: '12px 16px', color: claim.outstandingDebt > 0 ? '#dc2626' : 'inherit' }}>{formatRM(claim.outstandingDebt)}</td>
                  <td style={{ padding: '12px 16px' }}>{claim.rebateType}</td>
                  <td style={{ padding: '12px 16px', borderRight: '1px solid #e2e8f0' }}>{claim.package}</td>
                  
                  <td style={{ padding: '12px 16px' }}>{formatRM(claim.invoiceBeforeDeduction)}</td>
                  <td style={{ padding: '12px 16px', color: '#059669', fontWeight: 500 }}>{formatRM(claim.hrdfCoverage)}</td>
                  <td style={{ padding: '12px 16px' }}>{formatRM(claim.remainingBalance1)}</td>
                  <td style={{ padding: '12px 16px', color: claim.invoiceAfterDeduction > 0 ? '#dc2626' : 'inherit', fontWeight: claim.invoiceAfterDeduction > 0 ? 600 : 400 }}>{formatRM(claim.invoiceAfterDeduction)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{claim.monthsCovered ?? '-'}</td>
                  <td style={{ padding: '12px 16px' }}>{formatRM(claim.remainingBalance2)}</td>
                </tr>
              ))}
              {processedClaims.length === 0 && (
                <tr>
                  <td colSpan={13} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No claims recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddClaimModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClaim}
        includeSST={includeSST}
      />
    </div>
  );
}
