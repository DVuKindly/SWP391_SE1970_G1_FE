import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import { AuthContext } from '../../providers/AuthContext'

const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Doctor', label: 'Doctor' },
  { value: 'Staff_Doctor', label: 'Staff_Doctor' },
  { value: 'Staff_Patient', label: 'Staff_Patient' },
]

const LoginSystem = () => {
  const navigate = useNavigate()
  const { loginEmployee, logout } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const errors = {}
    if (!email.trim()) {
      errors.email = 'Vui lòng nhập email ...'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Email không hợp lệ ...'
    }
    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu'
    }
    if (!role) {
      errors.role = 'Vui lòng chọn vai trò đăng nhập'
    }
    return errors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const errors = validate()
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      const result = await loginEmployee({ email, password })
      const serverRoles = result?.user?.roles || []
      if (!serverRoles.includes(role)) {
        await Promise.resolve(logout())
        setFormErrors({ api: 'Tài khoản không thuộc vai trò đã chọn.' })
        return
      }
      if (role === 'Admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (error) {
      setFormErrors({ api: error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <Header />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 420, padding: 24, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: 0, marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Đăng nhập hệ thống</h2>
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
                padding: 0,
              }}
            >
              ← Về trang chủ
            </button>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: 6 }}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhap@email.com"
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6 }}
            />
            {formErrors.email && (
              <div style={{ color: '#b91c1c', marginTop: 6, fontSize: 13 }}>{formErrors.email}</div>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: 6 }}>Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6 }}
            />
            {formErrors.password && (
              <div style={{ color: '#b91c1c', marginTop: 6, fontSize: 13 }}>{formErrors.password}</div>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="role" style={{ display: 'block', marginBottom: 6 }}>Vai trò</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, background: 'white' }}
            >
              <option value="">-- Chọn vai trò --</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {formErrors.role && (
              <div style={{ color: '#b91c1c', marginTop: 6, fontSize: 13 }}>{formErrors.role}</div>
            )}
          </div>

          {formErrors.api && (
            <div style={{ color: '#b91c1c', margin: '8px 0 0', fontSize: 13 }}>{formErrors.api}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: isSubmitting ? '#9ca3af' : 'linear-gradient(135deg, var(--primary), #0b5d50)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginSystem


