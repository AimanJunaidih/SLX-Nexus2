import type { ReactNode } from 'react';
import { progressColor } from '@/shared/constants/status';

interface StatCardProps {
  icon: ReactNode;
  iconColor: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'teal';
  value: string | number;
  label: string;
  sub?: string;
}

export default function StatCard({ icon, iconColor, value, label, sub }: StatCardProps) {
  return (
    <div className="scard">
      <div className="scard-header">
        <div className={`scard-icon ${iconColor}`}>{icon}</div>
      </div>
      <div className="scard-value">{value}</div>
      <div className="scard-label">{label}</div>
      {sub && <div className="scard-trend neutral">{sub}</div>}
    </div>
  );
}

// Convenience: stat card where icon color follows a numeric percentage
export function StatCardPct({
  icon,
  value,
  label,
  pct,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  pct: number;
}) {
  const c = progressColor(pct);
  const iconColor = c === 'green' ? 'green' : c === 'yellow' ? 'yellow' : 'red';
  return <StatCard icon={icon} iconColor={iconColor} value={value} label={label} />;
}
