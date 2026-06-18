import { NavLink } from 'react-router-dom';
import { NAV_ROUTES, NAV_SECTIONS } from '@/shared/constants/routes';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-name">SLX Nexus</div>
        <div className="brand-sub">Training Operations</div>
      </div>

      {NAV_SECTIONS.map((section) => {
        const items = NAV_ROUTES.filter((r) => r.section === section);
        if (items.length === 0) return null;

        return (
          <div className="nav-section" key={section}>
            <div className="nav-section-label">{section}</div>
            {items.map(({ path, title, Icon, badge }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="nav-item-icon">
                  <Icon size={17} stroke={1.8} />
                </span>
                {title}
                {badge !== undefined && <span className="nav-badge">{badge}</span>}
              </NavLink>
            ))}
          </div>
        );
      })}
    </aside>
  );
}
