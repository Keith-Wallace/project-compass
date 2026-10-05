import { useNavigate } from 'react-router-dom'
import { Button } from "../../../shared/components/button/Button";
// import { FiAward } from 'react-icons/fi';
// import { TbFileCertificate } from "react-icons/tb";
import { PiCertificate } from "react-icons/pi";
import { FaCheckCircle } from "react-icons/fa";
import { GrDocumentDownload } from "react-icons/gr";
import { MdAdd } from "react-icons/md";
import { CircularProgressBar } from '../../../shared/components/progress-bar/CircleProgressBar';
import clsx from 'clsx';
import '../styles/dashboard-new.css';


export default function DashboardNew() {
  const navigate = useNavigate()

  const stubCredentials = ['1', '2', '3'];

  return (
    <article className='dashboard-wrapper'>
      <header>
        <div>
          <h1>My Dashboard</h1>
          <p className="header-subtitle">
            All of your logged continuing education courses.
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
        {stubCredentials.map((credential) => (
          <div className='dashboard-card'>
            <div className='card-header'>
              <PiCertificate className={clsx(`icon-${credential}`)} aria-hidden="true" />
              <div className='card-header-name'>
                <h2>Credential Name #{credential}</h2>
                <span>Governing Authority</span>
              </div>
              <div className='credential-status'>
                <FaCheckCircle aria-hidden='true' /> On Track
              </div>
            </div>

            <div className='card-area'>
              <div className='card-progress-bar'>
                <CircularProgressBar value={14} size={160} strokeWidth={16} max={40} label="Upload progress" className={`fill-color-${credential}`}>
                  <div className='progress-values'>
                    <span className='progress-value-current'>14</span>
                    <span className='progress-value-total'>of 40 hours</span>
                    <span className='progress-value-year'>2026</span>
                  </div>
                </CircularProgressBar>
                <div>Annual Requirements</div>
              </div>
              
              <div className='card-progress-bar'>
                <CircularProgressBar value={78} size={160} strokeWidth={16} max={120} label="Upload progress" className={`fill-color-${credential}`}>
                  <div className='progress-values'>
                    <span className='progress-value-current'>78</span>
                    <span className='progress-value-total'>of 120 hours</span>
                    <span className='progress-value-year'>2025 - 2027</span>
                  </div>
                </CircularProgressBar>
                <div>Full Reporting Period</div>
              </div>

              <div className='card-compliance-rules'>
                <h3>Compliance Rules</h3>
                <ul role='list'>
                  <li><FaCheckCircle aria-hidden='true' />Compliance rule 1</li>
                  <li><FaCheckCircle aria-hidden='true' />Compliance rule 2</li>
                  <li><FaCheckCircle aria-hidden='true' />Compliance rule 3</li>
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
};
