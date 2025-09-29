import React, { useEffect, useMemo, useState } from 'react'

const defaultForm = { fullName: '', email: '', phone: '', content: '', appointmentDate: '' }

const FloatingRegister = () => {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState({ type: '', message: '' })

  // Tính toán ngày mai và ngày tối thiểu cho input date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0] // Format: YYYY-MM-DD

  const onChange = (field) => (e) => {
    const value = e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validate = useMemo(() => {
    return () => {
      const next = {}
      if (!form.fullName.trim()) next.fullName = 'Vui lòng nhập họ và tên'
      if (!form.email.trim()) next.email = 'Vui lòng nhập email'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Email không hợp lệ'
      if (!form.phone.trim()) next.phone = 'Vui lòng nhập số điện thoại'
      if (!form.content.trim()) next.content = 'Vui lòng nhập nội dung'
      if (!form.appointmentDate.trim()) next.appointmentDate = 'Vui lòng chọn ngày khám'
      return next
    }
  }, [form])

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [open])

  // Set default appointment date to tomorrow when modal opens
  useEffect(() => {
    if (open && !form.appointmentDate) {
      setForm(prev => ({ ...prev, appointmentDate: minDate }))
    }
  }, [open, minDate, form.appointmentDate])

  const submit = async (e) => {
    e?.preventDefault?.()
    setNotice({ type: '', message: '' })
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length > 0) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/public/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          content: form.content,
          appointmentDate: form.appointmentDate,
        }),
      })

      let envelope
      if (!res.ok) {
        let message = ''
        try {
          const j = await res.clone().json()
          message = j?.message || j?.error || ''
          if (j?.errors && typeof j.errors === 'object') {
            const flat = Object.entries(j.errors)
              .map(([f, errs]) => `${f}: ${Array.isArray(errs) ? errs.join(', ') : errs}`)
              .join('; ')
            message = flat || message
          }
        } catch (_) {
          message = await res.text().catch(() => '')
        }
        throw new Error(message || `Gửi đăng ký thất bại (${res.status})`)
      } else {
        envelope = await res.json()
      }

      if (!envelope?.success) {
        throw new Error(envelope?.message || 'Gửi đăng ký thất bại')
      }

      setNotice({ type: 'success', message: envelope?.message || 'Đăng ký thành công. Chúng tôi sẽ liên hệ sớm.' })
      setForm(defaultForm)
      // Tự đóng sau 1.5s
      setTimeout(() => setOpen(false), 1500)
    } catch (err) {
      setNotice({ type: 'error', message: err?.message || 'Có lỗi xảy ra, vui lòng thử lại.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        aria-label="Đăng ký ngay"
        onClick={() => setOpen(true)}
        className="floating-register-btn"
      >
        Đăng ký ngay
      </button>

      {open && (
        <div className="fr-overlay" role="dialog" aria-modal="true">
          <div className="fr-modal">
            <button
              className="fr-close"
              aria-label="Đóng"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <h3 className="fr-title">Đăng ký ngay</h3>
            {notice.message && (
              <div className={notice.type === 'success' ? 'fr-success' : 'fr-error-banner'}>{notice.message}</div>
            )}
            <form onSubmit={submit} className="fr-form">
              <div className="fr-field">
                <label>Họ và tên*</label>
                <input value={form.fullName} onChange={onChange('fullName')} placeholder="Nguyễn Văn A" />
                {errors.fullName && <div className="fr-error">{errors.fullName}</div>}
              </div>
              <div className="fr-field">
                <label>Email*</label>
                <input type="email" value={form.email} onChange={onChange('email')} placeholder="email@example.com" />
                {errors.email && <div className="fr-error">{errors.email}</div>}
              </div>
              <div className="fr-field">
                <label>Số điện thoại*</label>
                <input type="tel" value={form.phone} onChange={onChange('phone')} placeholder="0912345678" />
                {errors.phone && <div className="fr-error">{errors.phone}</div>}
              </div>
              <div className="fr-field">
                <label>Nội dung*</label>
                <textarea rows={3} value={form.content} onChange={onChange('content')} placeholder="Nội dung tư vấn" />
                {errors.content && <div className="fr-error">{errors.content}</div>}
              </div>
              <div className="fr-field">
                <label>Ngày khám*</label>
                <input 
                  type="date" 
                  value={form.appointmentDate} 
                  onChange={onChange('appointmentDate')} 
                  min={minDate}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: '#fff'
                  }}
                />
                {errors.appointmentDate && <div className="fr-error">{errors.appointmentDate}</div>}
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Chỉ có thể chọn từ ngày mai trở đi
                </div>
              </div>
              <button className="fr-submit" type="submit" disabled={submitting}>
                {submitting ? 'Đang gửi...' : 'Gửi thông tin'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default FloatingRegister


