import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { TbDeviceDesktopAnalytics } from 'react-icons/tb';
import { FiBookOpen, FiAward, FiSettings, FiUser, FiLogOut } from 'react-icons/fi';
import { FaCaretDown, FaCaretUp } from "react-icons/fa6";
import { supabase } from '../../../../supabase/supabase';

import '../styles/navigation.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true, icon: TbDeviceDesktopAnalytics },
  { to: '/courses', label: 'Courses', icon: FiBookOpen },
  { to: '/credentials', label: 'Credentials', icon: FiAward },
  {
    to: '/settings',
    label: 'Settings',
    icon: FiSettings,
    children: [{ to: '/settings/user-info', label: 'User Info', icon: FiUser }],
  },
];

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [manuallyExpanded, setManuallyExpanded] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="sidenav" aria-label="Primary">
      {NAV_ITEMS.map((item) => {
        const hasChildren = Boolean(item.children?.length);
        const isOnSection = hasChildren && location.pathname.startsWith(item.to);
        const isExpanded = isOnSection || manuallyExpanded;

        return (
          <div key={item.to} className="sidenav__group">
            {hasChildren ? (
              <button
                type="button"
                className={
                  isOnSection
                    ? 'sidenav__item sidenav__item--active'
                    : 'sidenav__item'
                }
                aria-expanded={isExpanded}
                onClick={() => setManuallyExpanded((prev) => !prev)}
              >
                <span className="sidenav__item-content">
                  <item.icon className="icon" aria-hidden="true" />
                  {item.label}
                </span>
                {isExpanded ? <FaCaretDown /> : <FaCaretUp />}
              </button>
            ) : (
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? 'sidenav__item sidenav__item--active' : 'sidenav__item'
                }
              >
                <item.icon className="icon" aria-hidden="true" />
                {item.label}
              </NavLink>
            )}

            {hasChildren && isExpanded && (
              <div className="sidenav__subnav">
                {item.children?.map((child) => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    className={({ isActive }) =>
                      isActive
                        ? 'sidenav__subitem sidenav__subitem--active'
                        : 'sidenav__subitem'
                    }
                  >
                    <child.icon className="icon" aria-hidden="true" />
                    {child.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <a
        onClick={handleLogout}
        className="sidenav__item sidenav__item--last"
      >
        <FiLogOut className="icon" aria-hidden="true" />
        Sign out
      </a>
    </nav>
  );
}