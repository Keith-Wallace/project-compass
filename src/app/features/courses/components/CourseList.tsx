import { useState } from 'react'
import type { Course, CourseCategoryCredit } from '../api/coursesAPI'
import { Button } from "../../../shared/components/button/Button";

import '../styles/course-list.css'

interface CourseListProps {
  courses: Course[]
  onEdit: (course: Course) => void
  onDelete: (id: string) => Promise<void>
  disabled: boolean
}

export default function CourseList({ courses, onEdit, onDelete, disabled }: CourseListProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDeleteClick = (id: string) => setConfirmId(id)
  const handleCancel = () => setConfirmId(null)

  const handleConfirmDelete = async (id: string) => {
    setConfirmId(null)
    setDeletingId(id)
    await onDelete(id)
    setDeletingId(null)
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const getTotalCredits = (course: Course) => {
    const credits = course.course_category_credits
    if (!credits || credits.length === 0) return '—'
    const total = credits.reduce((sum: number, c: CourseCategoryCredit) => sum + parseFloat(String(c.credits_earned ?? 0)), 0)
    return total % 1 === 0 ? String(total) : total.toFixed(1)
  }

  return (
    <>
      <div className="course-list-header">
        <span>Course</span>
        <span>Date</span>
        <span className="col-center">Credits</span>
        <span>Certification Attached</span>
        <span className="col-right">Actions</span>
      </div>
      <div className="course-list">
        {courses.map((course) => (
          <div
            key={course.id}
            className={`course-row ${deletingId === course.id ? 'deleting' : ''}`}
          >
            {/* Confirm Delete Overlay */}
            {confirmId === course.id && (
              <div className="confirm-overlay">
                <span className="confirm-text">Delete this course?</span>
                <Button variant="cancel" onClick={() => handleConfirmDelete(course.id)}>
                  Delete
                </Button>
                <Button variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            )}

            {/* Course info */}
            <div>
              <div className="course-title">{course.course_title}</div>
              {course.provider && (
                <div className="course-provider">{course.provider}</div>
              )}
            </div>

            <div className="course-date">{formatDate(course.completion_date)}</div>

            <div>
              <div className="course-credits">{getTotalCredits(course)}</div>
              <div className="course-credits-label">credits</div>
            </div>

            <div>
              {course.certificate_url ? (
                <span className='cert-attached'>Attached</span>
              ) : (
                <span className='cert-not-attached'>Not Attached</span>
              )}
              {/* {getAllCategories(course).length > 0
                ? getAllCategories(course).map((name, i) => (
                    <span key={i} className="category-badge" style={{ marginBottom: 2, display: 'inline-block' }}>
                      {name}
                    </span>
                  ))
                : <span style={{ color: '#2e3344', fontSize: 12 }}>—</span>
              } */}
            </div>

            <div className="course-actions">
              <Button onClick={() => onEdit(course)}>Edit</Button>
              <Button variant="cancel" onClick={() => handleDeleteClick(course.id)}>✕</Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
