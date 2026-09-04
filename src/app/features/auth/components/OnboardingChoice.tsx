import { useNavigate } from 'react-router-dom';

import '../styles/login.css'

export default function OnboardingChoice() {
  const navigate = useNavigate();

  return (
    <div className="login-root">

      <main className="login-body">
        <div className="login-card">
          <div className="login-eyebrow">You&apos;re all set</div>
          <h1 className="login-title">Add your first record?</h1>
          <p className="login-subtitle">
            Want to add a credential or course now, or head straight to
            your dashboard?
          </p>

          <div className="onboarding-actions">
            <button className="btn-login" onClick={() => navigate('/credentials/new')}>
              Add a credential
            </button>
            <button className="btn-login btn-secondary" onClick={() => navigate('/courses/new')}>
              Add a course
            </button>
            <button className="btn-link" onClick={() => navigate('/')}>
              Skip to dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
