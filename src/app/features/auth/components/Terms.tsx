import RollingThreeLogo from '../../../../assets/rolling-three-whitebg-logo.png'

import '../styles/login.css'

const LAST_UPDATED = 'August 2026';

export default function Terms() {
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
          <h1 className="login-title">Terms of Service</h1>
          <p className="login-subtitle">
            Placeholder — last updated {LAST_UPDATED}. This is not final
            legal language and will be replaced before production launch.
          </p>

          <div className="legal-body">
            <p>
              This is placeholder legal text for Rolling Three&apos;s
              Terms of Service. By creating an account, you agree to use
              this service in accordance with applicable law and the
              platform&apos;s intended purpose of tracking continuing
              professional education credits. This placeholder will be
              replaced with reviewed legal language prior to production
              launch.
            </p>

            <h2>Sections to be added</h2>
            <ul>
              <li>Acceptable use</li>
              <li>Account responsibilities</li>
              <li>Data handling and retention</li>
              <li>Liability limitations</li>
              <li>Termination conditions</li>
              <li>Governing law and dispute resolution</li>
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
