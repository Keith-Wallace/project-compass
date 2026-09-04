import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../../../supabase/supabase';

import '../styles/navigation.css';

// `end: true` on Dashboard only — otherwise every route would match "/"
// as a prefix. Settings intentionally has no `end`, so it stays active
// on /settings/user-info and any future sub-section routes too.
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/courses', label: 'Courses' },
  { to: '/credentials', label: 'Credentials' },
  { to: '/settings', label: 'Settings' },
];

export default function Navigation() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="sidenav" aria-label="Primary">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            isActive ? 'sidenav__item sidenav__item--active' : 'sidenav__item'
          }
        >
          <span className="icon" aria-hidden="true">&#9635;</span>
          {item.label}
        </NavLink>
      ))}

      {/* Sign out is an action, not a route — it needs to actually call
          supabase.auth.signOut(), which a NavLink to /login never did.
          Kept as the visually "last" item via sidenav__item--last, the
          same spot the old fake link occupied. Browser button resets are
          inline since a <button> won't pick up any styling navigation.css
          scopes specifically to `a.sidenav__item`. */}
      <button
        type="button"
        onClick={handleLogout}
        className="sidenav__item sidenav__item--last"
      >
        <span className="icon" aria-hidden="true">&#9635;</span>
        Sign out
      </button>
    </nav>
  );
}
