import { useNavigate } from 'react-router-dom';

// ------------------------------------------------------------
// Settings — landing page listing all five sub-sections.
// Only "User Info" is currently built and routable; the other
// four render as disabled rows with a "Coming soon" badge until
// their own sub-sections are built out.
// ------------------------------------------------------------

interface SettingsSection {
  key: string;
  label: string;
  description: string;
  path: string | null; // null = not yet built, not clickable
}

const SECTIONS: SettingsSection[] = [
  {
    key: 'user-info',
    label: 'User Info',
    description: 'Name, company, industry, contact details, and preferences.',
    path: '/settings/user-info',
  },
  {
    key: 'security',
    label: 'Security Settings',
    description: 'Username, password, and two-factor authentication.',
    path: null,
  },
  {
    key: 'credentials',
    label: 'Credentials',
    description: 'Manage your professional credentials and reporting cycles.',
    path: null,
  },
  {
    key: 'payment',
    label: 'Payment Methods',
    description: 'Manage cards on file.',
    path: null,
  },
  {
    key: 'notifications',
    label: 'Notifications',
    description: 'Email/SMS preferences and reporting deadline reminders.',
    path: null,
  },
];

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold text-[#0D1B4B]">Settings</h1>

        <div className="space-y-3">
          {SECTIONS.map((section) => {
            const isEnabled = section.path !== null;

            return (
              <div
                key={section.key}
                role={isEnabled ? 'button' : undefined}
                tabIndex={isEnabled ? 0 : -1}
                onClick={() => isEnabled && navigate(section.path!)}
                onKeyDown={(e) => {
                  if (isEnabled && (e.key === 'Enter' || e.key === ' ')) {
                    navigate(section.path!);
                  }
                }}
                className={[
                  'flex items-center justify-between rounded-lg border px-5 py-4 transition',
                  isEnabled
                    ? 'cursor-pointer border-gray-200 bg-white hover:border-[#1DC8A8] hover:shadow-sm'
                    : 'cursor-not-allowed border-gray-100 bg-white opacity-60',
                ].join(' ')}
              >
                <div>
                  <div className="font-semibold text-[#0D1B4B]">{section.label}</div>
                  <div className="text-sm text-gray-500">{section.description}</div>
                </div>

                {isEnabled ? (
                  <span className="text-[#1DC8A8]">&rarr;</span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                    Coming soon
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
