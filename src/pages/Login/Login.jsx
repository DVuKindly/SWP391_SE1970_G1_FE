import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../providers/AuthContext'
import Header from '../../components/Header'
import { GoogleLogin } from '@react-oauth/google'
import '../../styles/theme.css'

const Login = () => {
  const navigate = useNavigate()
  const { loginPatient, loginWithGoogle } = useContext(AuthContext)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // validate dữ liệu form
  const validate = () => {
    const errors = {}
    if (!email.trim()) {
      errors.email = 'Vui lòng nhập email.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Email không hợp lệ.'
    }

    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu.'
    }
    return errors
  }

  // handle submit với email/password
  const handleSubmit = async (event) => {
    event.preventDefault()
    const errors = validate()
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      await loginPatient({ email, password })
      navigate('/')
    } catch (error) {
      setFormErrors({
        api: error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // handle submit với Google
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const idToken = credentialResponse?.credential
      if (!idToken) throw new Error('Không lấy được token từ Google')

      await loginWithGoogle(idToken)
      navigate('/')
    } catch (err) {
      setFormErrors({
        api: err?.message || 'Google login thất bại. Vui lòng thử lại.'
      })
    }
  }

  return (
    <div>
      <Header />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            maxWidth: 380,
            padding: 24,
            border: '1px solid #e5e7eb',
            borderRadius: 8
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16
            }}
          >
            <h2 style={{ margin: 0 }}>Đăng nhập</h2>
            <button
              type="button"
              onClick={() => navigate('/')}
              title="Về trang chủ"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontSize: 13,
                cursor: 'pointer',
                padding: 0
              }}
            >
              ← Về trang chủ
            </button>
          </div>

          {/* Email input */}
          <div style={{ marginBottom: 12 }}>
            <label
              htmlFor="email"
              style={{ display: 'block', marginBottom: 6 }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhap@email.com"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6
              }}
            />
            {formErrors.email && (
              <div style={{ color: '#b91c1c', marginTop: 6, fontSize: 13 }}>
                {formErrors.email}
              </div>
            )}
          </div>

          {/* Password input */}
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="password"
              style={{ display: 'block', marginBottom: 6 }}
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6
              }}
            />
            {formErrors.password && (
              <div style={{ color: '#b91c1c', marginTop: 6, fontSize: 13 }}>
                {formErrors.password}
              </div>
            )}
          </div>

          {/* API error */}
          {formErrors.api && (
            <div style={{ color: '#b91c1c', marginBottom: 12, fontSize: 13 }}>
              {formErrors.api}
            </div>
          )}

          {/* Quên mật khẩu */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                padding: 0,
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              Quên mật khẩu?
            </button>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: isSubmitting
                ? '#9ca3af'
                : 'linear-gradient(135deg, var(--primary), #0b5d50)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginTop: 12
            }}
          >
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          {/* Google login */}
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() =>
                setFormErrors({ api: 'Google Login không thành công' })
              }
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
