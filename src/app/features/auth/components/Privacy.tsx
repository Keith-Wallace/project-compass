import RollingThreeLogo from '../../../../assets/rolling-three-whitebg-logo.png'

import '../styles/login.css'

const LAST_UPDATED = 'August 2026';

export default function Privacy() {
  return (
    <div className="login-root">
      <header className="login-header">
        <div className="login-logo">
          <img src={RollingThreeLogo} alt="Rolling Three" height={125} />
        </div>
      </header>

      <main className="login-body">
        <div className="login-card legal-card">
          <div className="login-eyebrow">Legal</div>
          <h1 className="login-title">Privacy Policy</h1>
          <p className="login-subtitle">
            Placeholder — last updated {LAST_UPDATED}. This is not final
            legal language and will be replaced before production launch.
          </p>

          <div className="legal-body">
            <p>
              This is placeholder legal text for Rolling Three&apos;s
              Privacy Policy. We collect account information (name,
              email, job title, employer) and credential/course data you
              provide in order to operate the service. This placeholder
              will be replaced with reviewed legal language prior to
              production launch.
            </p>

            <h2>Sections to be added</h2>
            <ul>
              <li>What data is collected and why</li>
              <li>How data is stored and secured</li>
              <li>Data retention and deletion</li>
              <li>Third-party services (Supabase, Resend, Cloudflare Turnstile)</li>
              <li>User rights and how to exercise them</li>
              <li>Contact information for privacy inquiries</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="login-footer">
        Rolling Three — continuing education record keeper
      </footer>
    </div>
  );
}
