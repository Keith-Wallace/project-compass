import { useState } from 'react'

import '../styles/course-list.css'


export default function CourseList({ courses, onEdit, onDelete }) {
  const [confirmId, setConfirmId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const handleDeleteClick = (id) => setConfirmId(id)
  const handleCancel = () => setConfirmId(null)

  const handleConfirmDelete = async (id) => {
    setConfirmId(null)
    setDeletingId(id)
    await onDelete(id)
    setDeletingId(null)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const getTotalCredits = (course) => {
    const credits = course.course_category_credits
    if (!credits || credits.length === 0) return '—'
    const total = credits.reduce((sum, c) => sum + parseFloat(c.credits_earned || 0), 0)
    return total % 1 === 0 ? String(total) : total.toFixed(1)
  }

  const getAllCategories = (course) => {
    const credits = course.course_category_credits
    if (!credits || credits.length === 0) return []
    return credits
      .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
      .map(c => c.course_categories?.name)
      .filter(Boolean)
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
                <button className="btn-confirm-delete" onClick={() => handleConfirmDelete(course.id)}>
                  Delete
                </button>
                <button className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
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
              <button className="btn-edit" onClick={() => onEdit(course)}>Edit</button>
              <button className="btn-delete" onClick={() => handleDeleteClick(course.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
