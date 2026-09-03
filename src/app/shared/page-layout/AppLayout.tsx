import { Outlet } from 'react-router-dom';
import Header from '../page-layout/header/components/Header';
import Footer from '../page-layout/footer/components/Footer';
import Navigation from '../page-layout/side-navigation/components/Navigation';

import '../../features/layout/css/layout-preview.css'
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

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Header />
      <div className="body">
				<Navigation />
				<main className="content">
					<Outlet />
				</main>
      </div>
      <Footer />
    </div>
  );
}
