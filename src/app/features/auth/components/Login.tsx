import { useState, type SubmitEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase/supabase';
import RollingThreeLogo from '../../../../assets/rolling-three-whitebg-logo.png'

import '../styles/login.css'

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    console.log('Login.tsx > handleSubmit()')
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(authError.message);
      setSubmitting(false);
      return;
    }

    navigate('/');
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
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
          <div className="login-eyebrow">Welcome back</div>
          <h1 className="login-title">Sign in</h1>
          <p className="login-subtitle">
            Track your continuing education credits.
          </p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label">Email</label>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <input
                className="field-input"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={submitting}
            >
              {submitting ? 'Signing in...' : 'Sign in'}
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
