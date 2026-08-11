import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase/supabase';
import RollingThreeLogo from '../../../../assets/rolling-three-whitebg-logo.png'

import '../styles/login.css'

// Bumped whenever the placeholder ToS/Privacy copy is replaced with
// reviewed legal language.
const TOS_VERSION = 'v1-placeholder';
const PRIVACY_VERSION = 'v1-placeholder';

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [jobTitle, setJobTitle] = useState<string>('');
  const [employer, setEmployer] = useState<string>('');
  const [tosAccepted, setTosAccepted] = useState<boolean>(false);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!tosAccepted || !privacyAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setSubmitting(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/project-compass/auth/confirmed`,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          job_title: jobTitle.trim() || null,
          employer: employer.trim() || null,
          tos_accepted: tosAccepted,
          tos_version: TOS_VERSION,
          privacy_accepted: privacyAccepted,
          privacy_version: PRIVACY_VERSION,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }

    console.log('Signup.tsx > signUp() result', data);
    navigate('/verify-email', { state: { email: email.trim() } })
    setSubmitting(false);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value);
  };

  const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
  };

  const handleJobTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setJobTitle(e.target.value);
  };

  const handleEmployerChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmployer(e.target.value);
  };

  const handleTosChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTosAccepted(e.target.checked);
  };

  const handlePrivacyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrivacyAccepted(e.target.checked);
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
          <div className="login-eyebrow">Get started</div>
          <h1 className="login-title">Create your account</h1>
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

            <div className="field-group">
              <label className="field-label">Confirm password</label>
              <input
                className="field-input"
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label">First name</label>
              <input
                className="field-input"
                type="text"
                value={firstName}
                onChange={handleFirstNameChange}
                placeholder="Jane"
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label">Last name</label>
              <input
                className="field-input"
                type="text"
                value={lastName}
                onChange={handleLastNameChange}
                placeholder="Doe"
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label">Job title <span className="field-optional">(optional)</span></label>
              <input
                className="field-input"
                type="text"
                value={jobTitle}
                onChange={handleJobTitleChange}
                placeholder="Internal Auditor"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Employer <span className="field-optional">(optional)</span></label>
              <input
                className="field-input"
                type="text"
                value={employer}
                onChange={handleEmployerChange}
                placeholder="Acme Corp"
              />
            </div>

            <div className="field-group field-checkbox">
              <label>
                <input type="checkbox" checked={tosAccepted} onChange={handleTosChange} required />
                {' '}I agree to the{' '}
                <a href="/legal/terms" target="_blank" rel="noreferrer">Terms of Service</a>
              </label>
            </div>

            <div className="field-group field-checkbox">
              <label>
                <input type="checkbox" checked={privacyAccepted} onChange={handlePrivacyChange} required />
                {' '}I agree to the{' '}
                <a href="/legal/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" className="btn-login" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Continue'}
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
