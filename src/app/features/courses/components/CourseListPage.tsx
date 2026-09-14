// src/app/features/courses/components/CourseListPage.tsx
// /courses — full list of all logged CPE courses.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCourses, deleteCourse } from '../api/coursesAPI'
import type { Course } from '../api/coursesAPI'
import CourseList from './CourseList'
import { Button } from '../../../shared/components/buttons/Buttons';

import '../styles/course-list-page.css'


export default function CourseListPage() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCourses()
      setCourses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCourses() }, [])

  const handleEdit = (course: Course) => {
    navigate(`/courses/edit/${course.id}`, { state: { course } })
  }

  const handleDelete = async (id: string): Promise<void> => {
    setSubmitting(true)
    try {
      await deleteCourse(id)
      setCourses(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="main-content-area">
      <div className="main-content-header">
        <div>
          <h1>My Courses</h1>
          <p className="main-content-header-subtitle">
            Manage your professional credentials.
          </p>
        </div>
        <div className="header-actions">
          <Button
            variant="primary"
            onClick={() => navigate('/courses/new')}
          >
            Add Course
          </Button>
        </div>
      </div>

      <div className="main-content-body">
        {/* Error */}
        {error && <div className="error-msg">Error: {error}</div>}

        {/* Section header — mirrors Dashboard "Course History" section */}
        <div className="section-header">
          <span className="section-title">Course History</span>
          <span className="section-count">{courses.length} records</span>
        </div>

        {/* States */}
        {loading ? (
          <div className="loading-state">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <p>No courses logged yet.</p>
            <span>Start tracking your continuing education credits.</span>
            <button
              className="btn-primary"
              onClick={() => navigate('/courses/new')}
            >
              Add Your First Course
            </button>
          </div>
        ) : (
          <CourseList
            courses={courses}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  )
}
