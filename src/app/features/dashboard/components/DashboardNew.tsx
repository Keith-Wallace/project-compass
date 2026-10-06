import { useNavigate } from 'react-router-dom'
import { Button } from "../../../shared/components/button/Button";
// import { FiAward } from 'react-icons/fi';
// import { TbFileCertificate } from "react-icons/tb";
import { PiCertificate } from "react-icons/pi";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { GrDocumentDownload } from "react-icons/gr";
import { MdAdd } from "react-icons/md";
import { CircularProgressBar } from '../../../shared/components/progress-bar/CircleProgressBar';
import clsx from 'clsx';
import '../styles/dashboard-new.css';


export default function DashboardNew() {
  const navigate = useNavigate()

  const stubCredentials = [
    {
      credential_name: "Certified Public Accountant (CPA-NY)",
      governing_authority: "New York State",
      cpe_annual_current: 14,
      cpe_annual_required: 40,
      cpe_cycle_current: 14,
      cpe_cycle_required: 40,
      cycle_period: "2026",
      cpe_rules: [
        "Option A: 40 hours in recognized subject areas annually; OR",
        "Option B: 24 hours concentrated in one recognized subject area annually",
        "4 hours Ethics per 3-year period (can count toward annual hours)"
      ],
      onTrack: true
    },
    {
      credential_name: "Certified Public Accountant (CPA-CA)",
      governing_authority: "California State",
      cpe_annual_current: 14,
      cpe_annual_required: 40,
      cpe_cycle_current: 14,
      cpe_cycle_required: 80,
      cycle_period: "2026 - 2027",
      cpe_rules: [
        "80 hours every two years.",
        "At least 20 hours in each year of the renewal period.",
        "At least 12 technical hours within each annual 20-hour minimum.",
        "At least 40 technical hours during the full biennium.",
        "Four ethics hours per renewal period."
      ],
      onTrack: true
    },
    {
      credential_name: "Certified Information Systems Auditor (CISA)",
      governing_authority: "ISACA",
      cpe_annual_current: 8,
      cpe_annual_required: 20,
      cpe_cycle_current: 78,
      cpe_cycle_required: 120,
      cycle_period: "2025 - 2027",
      cpe_rules: [
        "20 hours per year minimum; AND",
        "120 hours minimum per static 3-year reporting period"
      ],
      onTrack: true
    },
    {
      credential_name: "Chartered Global Management Accountant (CGMA)",
      governing_authority: "AICPA",
      cpe_annual_current: 12,
      cpe_annual_required: 20,
      cpe_cycle_current: 68,
      cpe_cycle_required: 120,
      cycle_period: "2024 - 2026",
      cpe_rules: [
        "20 hours per year minimum; AND",
        "120 hours minimum per static 3-year reporting period",
        "At least 2 hours in ethics per year"
      ],
      onTrack: false
    }
  ];

  return (
    <article className='dashboard-wrapper'>
      <header>
        <div>
          <h1>My Dashboard</h1>
          <p className="header-subtitle">
            Compliance at a glance
          </p>
        </div>
        <div className="header-actions">
          <Button
            onClick={() => navigate('/courses/new')}
          >
            <MdAdd /> Add Course
          </Button>
          <Button
            onClick={() => navigate('/courses/new')}
          >
            <GrDocumentDownload /> Download Report
          </Button>
        </div>
      </header>

      <div className='credentials-list'>
        {stubCredentials.map((credential, index) => (
          <div className={clsx('dashboard-card', (credential.onTrack ? 'status-on-track' : 'status-at-risk'))}>
            <div className='card-header'>
              <PiCertificate className={clsx(`icon-${index+1}`)} aria-hidden="true" />
              <div className='card-header-name'>
                <h2>{credential.credential_name}</h2>
                <span>{credential.governing_authority}</span>
              </div>
              <div className='credential-status'>
                {
                  credential.onTrack
                  ? <><FaCheckCircle aria-hidden='true' /> On Track</>
                  : <><FaExclamationCircle aria-hidden='true' /> At Risk</>
                }
              </div>
            </div>

            <div className='card-area'>
              <div className='card-progress-bar'>
                <CircularProgressBar value={credential.cpe_annual_current} size={160} strokeWidth={16} max={credential.cpe_annual_required} label="Upload progress" className={`fill-color-${index+1}`}>
                  <div className='progress-values'>
                    <span className='progress-value-current'>{credential.cpe_annual_current}</span>
                    <span className='progress-value-total'>of {credential.cpe_annual_required} hours</span>
                    <span className='progress-value-year'>2026</span>
                  </div>
                </CircularProgressBar>
                <div>Annual Requirements</div>
              </div>
              
              <div className='card-progress-bar'>
                <CircularProgressBar value={credential.cpe_cycle_current} size={160} strokeWidth={16} max={credential.cpe_cycle_required} label="Upload progress" className={`fill-color-${index+1}`}>
                  <div className='progress-values'>
                    <span className='progress-value-current'>{credential.cpe_cycle_current}</span>
                    <span className='progress-value-total'>of {credential.cpe_cycle_required} hours</span>
                    <span className='progress-value-year'>{credential.cycle_period}</span>
                  </div>
                </CircularProgressBar>
                <div>Full Reporting Period</div>
              </div>

              <div className='card-compliance-rules'>
                <h3>Compliance Rules</h3>
                <ul role='list'>
                  {
                    credential.cpe_rules.map((cpeRule) => (
                      <li>
                        {
                          credential.onTrack
                          ? <FaCheckCircle aria-hidden='true' />
                          : <FaExclamationCircle aria-hidden='true' />
                        }
                        {cpeRule}
                      </li>
                    ))
                  }
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
};
