import { progressColor } from '@/shared/constants/status';

interface ProgressBarProps {
  value: number; // 0–100
  size?: 'sm' | 'md' | 'lg';
  color?: 'green' | 'yellow' | 'red' | 'blue';
  showLabel?: boolean;
}

export default function ProgressBar({ value, size = 'md', color, showLabel = false }: ProgressBarProps) {
  const fill = color ?? progressColor(value);
  const sizeClass = size === 'sm' ? 'progress-bar-sm' : size === 'lg' ? 'progress-bar-lg' : '';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
      <div className={`progress-bar ${sizeClass}`} style={{ flex: 1 }}>
        <div className={`progress-fill ${fill}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 28, textAlign: 'right' }}>
          {value}%
        </span>
      )}
    </div>
  );
}
