import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Crown,
  Shield,
  Gem,
  ShoppingBag,
} from 'lucide-react'
import { login, clearError } from '../../redux/slices/authSlice'
import { BRAND_NAME } from '../../config/brand'
import './AuthPages.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { userInfo, loading, error } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const redirect = location.search ? location.search.split('=')[1] : '/'

  useEffect(() => {
    if (userInfo) {
      navigate(userInfo.isAdmin ? '/admin/dashboard' : redirect)
    }
  }, [userInfo, navigate, redirect])

  useEffect(() => () => dispatch(clearError()), [dispatch])

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
    if (name === 'email') {
      if (!value) err = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) err = 'Please enter a valid email'
    }
    if (name === 'password') {
      if (!value) err = 'Password is required'
      else if (value.length < 6) err = 'Password must be at least 6 characters'
    }
    setErrors((prev) => ({ ...prev, [name]: err }))
    return err
  }

  const validateForm = () => {
    let ok = true
    ;['email', 'password'].forEach((f) => {
      if (validateField(f, formData[f])) ok = false
    })
    return ok
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (validateForm()) {
      dispatch(login({ email: formData.email, password: formData.password }))
    }
  }

  const fillDemoCredentials = () => {
    setFormData({ email: 'qasrelibasltd@gmail.com', password: 'Admin@123', rememberMe: false })
    setTouched({ email: true, password: true })
    setErrors({})
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
              <Sparkles size={13} />
              Luxury Collection
            </div>
            <h1>Welcome Back</h1>
            <p className="auth-left-desc">
              Sign in to shop premium Afghani dresses, menswear, jewellery and exclusive rental pieces.
            </p>
            <div className="auth-features">
              <div className="auth-feature">
                <div className="auth-feature-icon"><Shield size={16} /></div>
                <div>
                  <strong>Secure Access</strong>
                  <span>Encrypted & protected</span>
                </div>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon"><Crown size={16} /></div>
                <div>
                  <strong>Member Benefits</strong>
                  <span>Exclusive offers</span>
                </div>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon"><ShoppingBag size={16} /></div>
                <div>
                  <strong>Fast Checkout</strong>
                  <span>Save your favourites</span>
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
              <h2>Sign In</h2>
              <p>Enter your details to access your account</p>
            </div>

            <div className="auth-demo">
              <div className="auth-logo-icon" style={{ width: 34, height: 34 }}>
                <Sparkles size={16} />
              </div>
              <div className="auth-demo-text">
                <p>Demo login available</p>
                <small>For admin / testing</small>
              </div>
              <button type="button" className="auth-demo-btn" onClick={fillDemoCredentials}>
                Fill <ArrowRight size={12} />
              </button>
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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="you@example.com"
                    className={touched.email && errors.email ? 'error' : ''}
                    autoComplete="email"
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
                    placeholder="Your password"
                    className={touched.password && errors.password ? 'error' : ''}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-toggle-pw"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <span className="auth-field-error">{errors.password}</span>
                )}
              </div>

              <div className="auth-row">
                <label className="auth-check">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="auth-form-footer">
                <p>
                  New customer? <Link to="/register">Create an account</Link>
                </p>
              </div>

              <div className="auth-secure">
                <Shield size={14} />
                <span>Secure encrypted connection</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
