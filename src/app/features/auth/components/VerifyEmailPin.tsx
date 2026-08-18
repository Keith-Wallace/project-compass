import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { supabase } from '../../../supabase/supabase';
import RollingThreeLogo from '../../../../assets/rolling-three-whitebg-logo.png'

import '../styles/login.css'

interface LocationState {
  email?: string;
}

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as LocationState | null)?.email;

  const [code, setCode] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // No email in state means the user landed here without an in-progress
  // signup (direct nav, stale bookmark, etc.) — bounce to login rather
  // than showing a code screen that can't succeed.
  if (!email) {
    return <Navigate to="/login" replace />;
  }

  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    });

    if (verifyError) {
      setError(verifyError.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    navigate('/');
  };

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
            We sent a 6-digit code to {email}.
          </p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label">Verification code</label>
              <input
                className="field-input"
                type="text"
                inputMode="numeric"
                value={code}
                onChange={handleCodeChange}
                placeholder="123456"
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn-login" disabled={submitting}>
              {submitting ? 'Verifying...' : 'Verify email'}
            </button>
          </form>
        </div>
      </main>

      <footer className="login-footer">
        Rolling Three — continuing education record keeper
      </footer>
    </div>
  );
}
