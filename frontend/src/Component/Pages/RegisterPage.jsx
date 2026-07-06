// src/Component/Pages/RegisterPage.jsx

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Gem,
  Shield,
  Truck,
  Gift,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { register, clearError } from '../../redux/slices/authSlice'
import { BRAND_NAME } from '../../config/brand'
import toast from 'react-hot-toast'
import './AuthPages.css'

const RegisterPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userInfo, loading, error, success } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // ✅ Redirect on success
  useEffect(() => {
    if (userInfo) {
      if (userInfo.isAdmin) {
        navigate('/admin/dashboard')
      } else {
        navigate('/')
      }
    }
  }, [userInfo, navigate])

  // ✅ Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  // ✅ Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // ✅ Show success toast
  useEffect(() => {
    if (success) {
      toast.success('Registration successful! Welcome to QASR-E-LIBAS')
    }
  }, [success])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    validateField(name, formData[name])
  }

  const validateField = (name, value) => {
    let err = ''
    switch (name) {
      case 'name':
        if (!value.trim()) err = 'Full name is required'
        else if (value.trim().length < 3) err = 'Name must be at least 3 characters'
        break
      case 'email':
        if (!value) err = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) err = 'Please enter a valid email'
        break
      case 'password':
        if (!value) err = 'Password is required'
        else if (value.length < 6) err = 'At least 6 characters required'
        else if (!/(?=.*[A-Z])/.test(value)) err = 'Include one uppercase letter'
        else if (!/(?=.*[0-9])/.test(value)) err = 'Include one number'
        break
      case 'confirmPassword':
        if (!value) err = 'Please confirm your password'
        else if (value !== formData.password) err = 'Passwords do not match'
        break
      default:
        break
    }
    setErrors((prev) => ({ ...prev, [name]: err }))
    return err
  }

  const validateForm = () => {
    let ok = true
    ;['name', 'email', 'password', 'confirmPassword'].forEach((f) => {
      if (validateField(f, formData[f])) ok = false
    })
    if (!formData.agreeTerms) {
      setErrors((prev) => ({ ...prev, agreeTerms: 'You must agree to the terms' }))
      ok = false
    }
    return ok
  }

  // ✅ FIXED: Handle submit - NO next() calls
  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true, confirmPassword: true })
    
    if (validateForm()) {
      // ✅ Dispatch register - this will trigger the thunk
      dispatch(register({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      }))
    }
  }

  const pw = formData.password

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
              <Sparkles size={13} />
              Join Us
            </div>
            <h1>Create Your Account</h1>
            <p className="auth-left-desc">
              Become part of {BRAND_NAME} — enjoy premium shopping, member offers, and early access to new collections.
            </p>
            <div className="auth-features">
              <div className="auth-feature">
                <div className="auth-feature-icon"><Gift size={16} /></div>
                <div>
                  <strong>Welcome Offer</strong>
                  <span>Exclusive member deals</span>
                </div>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon"><Truck size={16} /></div>
                <div>
                  <strong>Free Shipping</strong>
                  <span>On orders over £50</span>
                </div>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon"><Shield size={16} /></div>
                <div>
                  <strong>Secure Shopping</strong>
                  <span>100% protected checkout</span>
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
            <div className="auth-form-header">
              <h2>Register</h2>
              <p>
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </div>

            {error && (
              <div className="auth-error">
                <AlertCircle size={18} />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="name"><User size={16} /> Full Name</label>
                <div className="auth-input-wrap">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Your full name"
                    className={touched.name && errors.name ? 'error' : ''}
                    disabled={loading}
                  />
                </div>
                {touched.name && errors.name && (
                  <span className="auth-field-error">{errors.name}</span>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="email"><Mail size={16} /> Email Address</label>
                <div className="auth-input-wrap">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="you@example.com"
                    className={touched.email && errors.email ? 'error' : ''}
                    disabled={loading}
                  />
                </div>
                {touched.email && errors.email && (
                  <span className="auth-field-error">{errors.email}</span>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="password"><Lock size={16} /> Password</label>
                <div className="auth-input-wrap has-toggle">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Create a password"
                    className={touched.password && errors.password ? 'error' : ''}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="auth-toggle-pw"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <span className="auth-field-error">{errors.password}</span>
                )}
                <div className="auth-pw-hints">
                  <span className={pw.length >= 6 ? 'valid' : ''}>
                    {pw.length >= 6 ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    6+ characters
                  </span>
                  <span className={/(?=.*[A-Z])/.test(pw) ? 'valid' : ''}>
                    {/(?=.*[A-Z])/.test(pw) ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    Uppercase
                  </span>
                  <span className={/(?=.*[0-9])/.test(pw) ? 'valid' : ''}>
                    {/(?=.*[0-9])/.test(pw) ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    Number
                  </span>
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="confirmPassword"><Lock size={16} /> Confirm Password</label>
                <div className="auth-input-wrap has-toggle">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Repeat your password"
                    className={touched.confirmPassword && errors.confirmPassword ? 'error' : ''}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="auth-toggle-pw"
                    onClick={() => setShowConfirm(!showConfirm)}
                    disabled={loading}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <span className="auth-field-error">{errors.confirmPassword}</span>
                )}
              </div>

              <label className="auth-check">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span>
                  I agree to the <Link to="/terms">Terms</Link> and{' '}
                  <Link to="/privacy">Privacy Policy</Link>
                </span>
              </label>
              {errors.agreeTerms && (
                <span className="auth-field-error">{errors.agreeTerms}</span>
              )}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="auth-secure">
                <Shield size={14} />
                <span>Your data is kept private & secure</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage