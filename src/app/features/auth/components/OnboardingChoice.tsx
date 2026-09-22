import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/button/Button';

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
            <Button onClick={() => navigate('/credentials/new')}>
              Add a credential
            </Button>
            <Button onClick={() => navigate('/courses/new')}>
              Add a course
            </Button>
            <Button onClick={() => navigate('/')}>
              Skip to dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
