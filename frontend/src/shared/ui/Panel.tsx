import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
  children: ReactNode;
  className?: string;
  bodyClass?: string;
}

export default function Panel({ title, subtitle, action, children, className = '', bodyClass = '' }: PanelProps) {
  return (
    <div className={`panel ${className}`}>
      <div className="panel-header">
        <div>
          <div className="panel-title">{title}</div>
          {subtitle && <div className="panel-subtitle">{subtitle}</div>}
        </div>
        {action && (
          <button className="panel-action" onClick={action.onClick} type="button">
            {action.label}
          </button>
        )}
      </div>
      <div className={`panel-body ${bodyClass}`}>{children}</div>
    </div>
  );
}
