import { useState } from 'react'
import StarRating from './StarRating'
import './FeedbackForm.css'

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/feedback'

const initialForm = {
  studentName: '',
  email: '',
  courseName: '',
  rating: 0,
  feedbackMessage: '',
}

function validate(form) {
  const errors = {}
  if (!form.studentName.trim()) {
    errors.studentName = 'Student name is required.'
  }
  if (!form.email.trim()) {
    errors.email = 'Email address is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address.'
  }
  if (!form.courseName.trim()) {
    errors.courseName = 'Course name is required.'
  }
  if (form.rating === 0) {
    errors.rating = 'Please select a rating.'
  }
  if (!form.feedbackMessage.trim()) {
    errors.feedbackMessage = 'Feedback message is required.'
  } else if (form.feedbackMessage.trim().length < 10) {
    errors.feedbackMessage = 'Feedback must be at least 10 characters.'
  }
  return errors
}

export default function FeedbackForm() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null) // 'success' | 'error' | null
  const [statusMessage, setStatusMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  function handleRatingChange(value) {
    setForm(prev => ({ ...prev, rating: value }))
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus(null)
    setStatusMessage('')

    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: form.studentName.trim(),
          email: form.email.trim(),
          courseName: form.courseName.trim(),
          rating: form.rating,
          feedbackMessage: form.feedbackMessage.trim(),
        }),
      })

      let data
      try {
        data = await response.json()
      } catch {
        throw new Error(`Server error (${response.status})`)
      }

      if (!response.ok) {
        throw new Error(data.message || `Server error (${response.status})`)
      }

      setStatus('success')
      setStatusMessage(data.message || 'Thank you for your feedback!')
      setForm(initialForm)
    } catch (err) {
      setStatus('error')
      setStatusMessage(
        err.message || 'Something went wrong. Please try again later.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="feedback-form" onSubmit={handleSubmit} noValidate>
      {status && (
        <div className={`status-banner status-${status}`}>
          {statusMessage}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="studentName">Student Name</label>
        <input
          id="studentName"
          name="studentName"
          type="text"
          placeholder="e.g. Jane Doe"
          value={form.studentName}
          onChange={handleChange}
          className={errors.studentName ? 'input-error' : ''}
        />
        {errors.studentName && <span className="field-error">{errors.studentName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="e.g. jane@example.com"
          value={form.email}
          onChange={handleChange}
          className={errors.email ? 'input-error' : ''}
        />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="courseName">Course Name</label>
        <input
          id="courseName"
          name="courseName"
          type="text"
          placeholder="e.g. Web Development Bootcamp"
          value={form.courseName}
          onChange={handleChange}
          className={errors.courseName ? 'input-error' : ''}
        />
        {errors.courseName && <span className="field-error">{errors.courseName}</span>}
      </div>

      <div className="form-group">
        <label>Rating</label>
        <StarRating value={form.rating} onChange={handleRatingChange} />
        {errors.rating && <span className="field-error">{errors.rating}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="feedbackMessage">Feedback Message</label>
        <textarea
          id="feedbackMessage"
          name="feedbackMessage"
          rows="5"
          placeholder="Tell us about your experience..."
          value={form.feedbackMessage}
          onChange={handleChange}
          className={errors.feedbackMessage ? 'input-error' : ''}
        />
        {errors.feedbackMessage && <span className="field-error">{errors.feedbackMessage}</span>}
      </div>

      <button type="submit" className="submit-btn" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  )
}
