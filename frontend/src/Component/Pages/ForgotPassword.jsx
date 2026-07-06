import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Gem,
  Shield,
  KeyRound,
} from 'lucide-react'
import { BRAND_NAME } from '../../config/brand'
import './AuthPages.css'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched(true)

    if (!email) {
      setError('Email is required')
      return
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setError('')
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1200)
  }

  const handleResend = () => {
    setIsSubmitted(false)
    setEmail('')
    setTouched(false)
    setError('')
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-logo">
              <div className="auth-logo-icon">
                <Gem size={24} />
              </div>
              <div className="auth-logo-text">
                QASR-E-<span>LIBAS</span>
              </div>
            </div>
            <div className="auth-badge">
              <KeyRound size={13} />
              Account Recovery
            </div>
            <h1>Reset Password</h1>
            <p className="auth-left-desc">
              No worries — we&apos;ll send you a secure link to reset your password and get you back to shopping.
            </p>
            <div className="auth-features">
              <div className="auth-feature">
                <div className="auth-feature-icon"><Shield size={16} /></div>
                <div>
                  <strong>Secure Process</strong>
                  <span>Link expires in 1 hour</span>
                </div>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon"><Mail size={16} /></div>
                <div>
                  <strong>Check Inbox</strong>
                  <span>Also check spam folder</span>
                </div>
              </div>
            </div>
          </div>
          <div className="auth-left-footer">
            <p>© 2026 {BRAND_NAME}. All rights reserved.</p>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-wrap">
            <Link to="/login" className="auth-back-link">
              <ArrowLeft size={16} /> Back to Sign In
            </Link>

            {!isSubmitted ? (
              <>
                <div className="auth-form-header">
                  <h2>Forgot Password?</h2>
                  <p>Enter your email and we&apos;ll send a reset link</p>
                </div>

                {error && (
                  <div className="auth-error">
                    <span>⚠️</span>
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="auth-field">
                    <label htmlFor="email"><Mail size={16} /> Email Address</label>
                    <div className="auth-input-wrap">
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setError('')
                        }}
                        onBlur={() => setTouched(true)}
                        placeholder="you@example.com"
                        className={touched && error ? 'error' : ''}
                      />
                    </div>
                    {touched && error && (
                      <span className="auth-field-error">{error}</span>
                    )}
                  </div>

                  <button type="submit" className="auth-submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="auth-spinner" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <div className="auth-form-footer">
                    <p>
                      Remember your password? <Link to="/login">Sign In</Link>
                    </p>
                  </div>
                </form>
              </>
            ) : (
              <div className="auth-success">
                <div className="auth-success-icon">
                  <CheckCircle size={40} />
                </div>
                <h2>Check Your Email</h2>
                <p>
                  We&apos;ve sent a password reset link to <strong>{email}</strong>.
                  Please check your inbox and spam folder.
                </p>
                <div className="auth-success-actions">
                  <button type="button" className="auth-text-btn" onClick={handleResend}>
                    Didn&apos;t receive it? Try again
                  </button>
                  <Link to="/login" className="auth-submit" style={{ textDecoration: 'none' }}>
                    Back to Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
