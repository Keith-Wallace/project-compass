import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCourses, deleteCourse, type Course } from '../../courses/api/coursesAPI'
import { supabase } from '../../../supabase/supabase'
import CourseList from '../../courses/components/CourseList'
import RollingThreeLogo from '../../../../assets/rolling-three-whitebg-logo.png'

import { useAuth } from '../../auth/hooks/useAuth';

import '../styles/dashboard.css'

function DebugAuthState() {
  const { session, loading } = useAuth();
  console.log('auth state:', { loading, session });
  return null;
}


export default function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCourses()
      setCourses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteCourse(id)
      setCourses(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  }

  const handleEdit = (course: Course): void => {
    navigate(`/courses/edit/${course.id}`, { state: { course } })
  }

  // Helper: sum credits across course_category_credits rows for one course
  const getCourseCredits = (course: Course): number =>
    (course.course_category_credits || [])
      .reduce((sum, credit) => sum + Number(credit.credits_earned || 0), 0)

  // Compute stats
  const currentYear = new Date().getFullYear()
  const totalCredits = courses.reduce((sum, c) => sum + getCourseCredits(c), 0)
  const creditsThisYear = courses
    .filter(c => new Date(c.completion_date).getFullYear() === currentYear)
    .reduce((sum, c) => sum + getCourseCredits(c), 0)
  const uniqueProviders = new Set(courses.map(c => c.provider).filter(Boolean)).size

  // Format: whole number if no decimal, otherwise 1 decimal place
  const fmt = (val: number): string | number => val % 1 === 0 ? val : val.toFixed(1)

  return (
    <>
      <div className="dashboard-root">
        <header className="dashboard-header">
          <div className="dashboard-logo">
            <img src={RollingThreeLogo} alt="Rolling Three" height="100" />
          </div>
          <div className="header-actions">
            <button
              onClick={() => navigate('/credentials/')}
              className="btn-primary"
            >
              Credentials
            </button>
            <button className="btn-primary" onClick={() => navigate('/courses/new')}>
              + Add Course
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </header>

        <main className="dashboard-body">
          <h1 className="dashboard-title">My CPE Dashboard</h1>
          <p className="dashboard-subtitle">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* Stats Row */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Total Credits</div>
              <div className="stat-value accent">{fmt(totalCredits)}</div>
              <div className="stat-sub">all time</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Credits {currentYear}</div>
              <div className="stat-value">{fmt(creditsThisYear)}</div>
              <div className="stat-sub">this year</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Courses Logged</div>
              <div className="stat-value">{courses.length}</div>
              <div className="stat-sub">total entries</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Providers</div>
              <div className="stat-value">{uniqueProviders}</div>
              <div className="stat-sub">unique sources</div>
            </div>
          </div>

          {/* Error */}
          {error && <div className="error-msg">Error: {error}</div>}

          {/* Course List Section */}
          <div className="section-header">
            <span className="section-title">Course History</span>
            <div className="section-header-right">
              <span className="section-count">{courses.length} records</span>
              {courses.length > 0 && (
                <button className="btn-link" onClick={() => navigate('/courses')}>
                  View All →
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <p>No courses logged yet.</p>
              <span>Start tracking your continuing education credits.</span>
              <button className="btn-primary" onClick={() => navigate('/courses/new')}>
                Add Your First Course
              </button>
            </div>
          ) : (
            <CourseList
              courses={courses.slice(0, 3)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          <DebugAuthState />
        </main>
      </div>
    </>
  )
}
