import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase/supabase';
import RollingThreeLogo from '../../../../assets/rolling-three-whitebg-logo.png'

import '../styles/login.css'

export default function ConfirmedEmail() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'success' | 'failed'>('checking');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setStatus('failed');
        return;
      }

      // Insert the consent record now that auth.uid() will actually
      // match — this couldn't happen right after signUp() since no
      // session exists until this point. Guard against duplicate rows
      // on repeat visits/refreshes of this page.
      const meta = session.user.user_metadata;
      const { data: existing } = await supabase
        .from('user_consents')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!existing) {
        const { error: consentError } = await supabase.from('user_consents').insert({
          user_id: session.user.id,
          tos_accepted: meta.tos_accepted ?? false,
          tos_version: meta.tos_version ?? 'unknown',
          privacy_accepted: meta.privacy_accepted ?? false,
          privacy_version: meta.privacy_version ?? 'unknown',
        });

        if (consentError) {
          console.error('Failed to record consent:', consentError);
        }
      }

      setStatus('success');
    });
  }, []);

  return (
    <div className="login-root">
      <header className="login-header">
        <div className="login-logo">
          <img src={RollingThreeLogo} alt="Rolling Three" height={125} />
        </div>
      </header>

      <main className="login-body">
        <div className="login-card">
          {status === 'checking' && (
            <>
              <h1 className="login-title">Confirming your email…</h1>
              <p className="login-subtitle">One moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <h1 className="login-title">Email confirmed</h1>
              <p className="login-subtitle">Your account is ready to go.</p>
              <button className="btn-login" onClick={() => navigate('/')}>
                Continue to dashboard
              </button>
            </>
          )}

          {status === 'failed' && (
            <>
              <h1 className="login-title">Confirmation failed</h1>
              <p className="login-subtitle">
                This link may have expired or already been used.
              </p>
              <button className="btn-login" onClick={() => navigate('/login')}>
                Back to login
              </button>
            </>
          )}
        </div>
      </main>

      <footer className="login-footer">
        Rolling Three — continuing education record keeper
      </footer>
    </div>
  );
}
