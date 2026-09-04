import { Outlet } from 'react-router-dom';
import Header from '../page-layout/header/components/Header';
import Footer from '../page-layout/footer/components/Footer';
import Navigation from '../page-layout/side-navigation/components/Navigation';

import './styles/app-layout.css';


// ------------------------------------------------------------
// TODO (follow-up, logged 2026-08-25): Dashboard, Courses,
// Credentials, and Settings/User Info currently render their own
// full-page wrappers (background, padding, back-buttons). Until
// each of those is cleaned up to assume it's already rendering
// inside `.content` here, expect doubled-up chrome (nested
// backgrounds/padding) on those pages. Clean up page-by-page as
// each is touched rather than in one pass.
// ------------------------------------------------------------

type AppLayoutProps = {
  variant?: 'app' | 'public';
};

export default function AppLayout({ variant = 'app' }: AppLayoutProps) {
  const isPublic = variant === 'public';

  return (
    <div className={`app-shell${isPublic ? ' app-shell--public' : ''}`}>
      <Header isPublic={isPublic} />
      <div className="body">
				{!isPublic && <Navigation />}
				<main className="content">
					<Outlet />
				</main>
      </div>
      <Footer />
    </div>
  );
}
