import { useState } from 'react'

function CreateStaffModal({ open, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '', roleName: '' })

  if (!open) return null

  const update = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    onSubmit?.(form, () => setForm({ email: '', password: '', fullName: '', phone: '', roleName: '' }))
  }

  return (
    <div className="am-modal-overlay">
      <div className="am-modal">
        <div className="ad-panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0 }}>Create Staff</h4>
          <button className="am-modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit} className="am-modal-grid">
          <div>
            <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
            <input className="am-input" type="email" value={form.email} onChange={update('email')} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6 }}>Mật khẩu</label>
            <input className="am-input" type="password" value={form.password} onChange={update('password')} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6 }}>Họ tên</label>
            <input className="am-input" type="text" value={form.fullName} onChange={update('fullName')} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6 }}>Số điện thoại</label>
            <input className="am-input" type="tel" value={form.phone} onChange={update('phone')} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6 }}>Vai trò</label>
            <select className="am-select" value={form.roleName} onChange={update('roleName')} required>
              <option value="">-- Chọn vai trò --</option>
              <option value="Staff_Doctor">Staff Doctor</option>
              <option value="Staff_Patient">Staff Patient</option>
            </select>
          </div>
          <div style={{ alignSelf: 'end' }}>
            <button type="submit" className="ad-logout" disabled={loading}>{loading ? 'Đang tạo...' : 'Tạo Staff'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateStaffModal


