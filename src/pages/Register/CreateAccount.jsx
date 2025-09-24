import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import LoginChoiceModal from '../../components/LoginChoiceModal'
import '../../styles/theme.css'
import './CreateAccount.css'

const CreateAccount = () => {
  const navigate = useNavigate()
  const [showLoginChoice, setShowLoginChoice] = useState(false)
  const openLoginChoice = () => setShowLoginChoice(true)
  const closeLoginChoice = () => setShowLoginChoice(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const errors = {}
    if (!email.trim()) {
      errors.email = 'Vui lòng nhập email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Email không hợp lệ'
    }
    if (!password || password.length < 8) {
      errors.password = 'Mật khẩu tối thiểu 8 ký tự'
    }
    if (!name.trim()) {
      errors.name = 'Vui lòng nhập họ tên'
    }
    if (!phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại'
    } else if (!/^[0-9]{8,15}$/.test(phone.replace(/\D/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ'
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/patient/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName: name, phone })
      })
      let envelope
      if (!res.ok) {
        let message = ''
        try {
          const j = await res.clone().json()
          message = j?.message || j?.error || j?.title || j?.detail || ''
          if (j?.errors && typeof j.errors === 'object') {
            const fieldErrors = Object.entries(j.errors)
              .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(', ') : errs}`)
              .join('; ')
            message = fieldErrors || message
          }
        } catch (_) {
          message = await res.text().catch(() => '')
        }
        throw new Error(message || `Tạo tài khoản thất bại (${res.status})`)
      } else {
        envelope = await res.json()
      }

      if (!envelope?.success) {
        throw new Error(envelope?.message || 'Tạo tài khoản thất bại')
      }
      setSuccessMessage(envelope?.message || 'Đăng ký thành công. Vui lòng đăng nhập.')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setFormErrors({ api: err?.message || 'Có lỗi xảy ra' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <Header onLoginClick={openLoginChoice} />
      <div className="register-container">
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-header">
            <h2 style={{ margin: 0 }}>Tạo tài khoản</h2>
            <button
              type="button"
              onClick={() => navigate('/')}
              title="Về trang chủ"
              className="back-home-btn"
            >
              ← Về trang chủ
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="email" style={{ display: 'block', marginBottom: 6 }}>Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required className="text-input" />
            {formErrors.email && (<div className="error-text">{formErrors.email}</div>)}
          </div>

          <div className="form-group">
            <label htmlFor="password" style={{ display: 'block', marginBottom: 6 }}>Mật khẩu</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu" required className="text-input" />
            {formErrors.password && (<div className="error-text">{formErrors.password}</div>)}
          </div>

          <div className="form-group">
            <label htmlFor="name" style={{ display: 'block', marginBottom: 6 }}>Họ tên</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" required className="text-input" />
            {formErrors.name && (<div className="error-text">{formErrors.name}</div>)}
          </div>

          <div className="form-group">
            <label htmlFor="phone" style={{ display: 'block', marginBottom: 6 }}>Số điện thoại</label>
            <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912345678" required className="text-input" />
            {formErrors.phone && (<div className="error-text">{formErrors.phone}</div>)}
          </div>

          {formErrors.api && (<div className="error-text" style={{ marginTop: 8 }}>{formErrors.api}</div>)}
          {successMessage && (<div className="success-text">{successMessage}</div>)}

          <button type="submit" disabled={isSubmitting} className="submit-btn">
            {isSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'}
          </button>
        </form>
      </div>
      <LoginChoiceModal
        open={showLoginChoice}
        onClose={closeLoginChoice}
        onPatient={() => { setShowLoginChoice(false); navigate('/login?role=patient') }}
        onStaff={() => { setShowLoginChoice(false); navigate('/login-system') }}
      />
    </div>
  )
}

export default CreateAccount


