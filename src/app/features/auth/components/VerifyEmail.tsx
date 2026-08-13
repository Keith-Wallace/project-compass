import { useLocation, Navigate } from 'react-router-dom';
import RollingThreeLogo from '../../../../assets/rolling-three-whitebg-logo.png'

import '../styles/login.css'

interface LocationState {
  email?: string;
}

export default function VerifyEmail() {
  const location = useLocation();
  const email = (location.state as LocationState | null)?.email;

  // No email in state means the user landed here without an in-progress
  // signup (direct nav, stale bookmark, etc.) — bounce to login.
  if (!email) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="login-root">
      <header className="login-header">
        <div className="login-logo">
          <img src={RollingThreeLogo} alt="Rolling Three" height={125} />
        </div>
      </header>

      <main className="login-body">
        <div className="login-card">
          <div className="login-eyebrow">Almost there</div>
          <h1 className="login-title">Check your inbox</h1>
          <p className="login-subtitle">
            We sent a confirmation link to {email}. Click it to finish
            creating your account.
          </p>
        </div>
      </main>

      <footer className="login-footer">
        Rolling Three — continuing education record keeper
      </footer>
    </div>
  );
}
