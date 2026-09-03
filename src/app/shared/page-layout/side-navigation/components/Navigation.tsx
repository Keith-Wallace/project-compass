import { NavLink } from 'react-router-dom';
import '../styles/navigation.css';


// `end: true` on Dashboard only — otherwise every route would match "/"
// as a prefix. Settings intentionally has no `end`, so it stays active
// on /settings/user-info and any future sub-section routes too.
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/courses', label: 'Courses' },
  { to: '/credentials', label: 'Credentials' },
  { to: '/settings', label: 'Settings' },
  { to: '/login', label: 'Sign Out' },
];

export default function Navigation() {
  return (
    <nav className="sidenav" aria-label="Primary">
      {NAV_ITEMS.map((item, index) => {
        const isLast = index === NAV_ITEMS.length - 1;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `${isLast && 'sidenav__item--last'} ${isActive ? 'sidenav__item sidenav__item--active' : 'sidenav__item'}`
            }
          >
            <span className="icon" aria-hidden="true">&#9635;</span>
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  );
}