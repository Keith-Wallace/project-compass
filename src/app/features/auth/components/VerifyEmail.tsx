import { useLocation, Navigate } from 'react-router-dom';

import '../styles/login.css'

interface LocationState {
  email?: string;
}

export default function VerifyEmail() {
  const location = useLocation();
  const email = (location.state as LocationState | null)?.email;

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="login-root">
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
    </div>
  );
}
