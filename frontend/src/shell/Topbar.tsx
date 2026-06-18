import { useLocation } from 'react-router-dom';
import { IconBell, IconSearch } from '@tabler/icons-react';
import { NAV_ROUTES } from '@/shared/constants/routes';

export default function Topbar() {
  const { pathname } = useLocation();
  const current = NAV_ROUTES.find((r) => r.path === pathname);
  const title = current?.title ?? 'Dashboard';

  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <span className="topbar-meta">SLX Nexus · Training Ops</span>

      <div className="topbar-right">
        <button className="topbar-btn" type="button" aria-label="Search">
          <IconSearch size={18} stroke={1.8} />
        </button>
        <button className="topbar-btn" type="button" aria-label="Notifications">
          <IconBell size={18} stroke={1.8} />
        </button>
        <div className="topbar-avatar" title="Admin">A</div>
      </div>
    </header>
  );
}
