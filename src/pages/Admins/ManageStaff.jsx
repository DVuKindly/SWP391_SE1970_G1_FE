import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../providers/AuthContext'

function CreateStaff() {
  const { tokens } = useContext(AuthContext)
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '', roleName: '' })
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'
  const [loading, setLoading] = useState(false)
  const [staffs, setStaffs] = useState([])
  const [open, setOpen] = useState(false)
// Hàm cập nhật trường form
  const updateField = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))
// Hàm lấy danh sách staff
  const fetchStaffs = async () => {
    try {
      const res = await fetch('/api/admin/staffs', {
        headers: {
          ...(tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
        },
      })
      if (!res.ok) return
      const data = await res.json()
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
      setStaffs(list)
    } catch (_) {
    }
  }
// Tải danh sách staff khi component được mount
  useEffect(() => {
    fetchStaffs()
  }, [])
// Hàm xử lý submit form
  const submit = async (e) => {
    e.preventDefault()
    setMessage('')
    setMessageType('')
    if (!form.email || !form.password || !form.fullName || !form.phone || !form.roleName) {
      setMessage('Vui lòng nhập đầy đủ thông tin')
      setMessageType('error')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/employee/auth/create-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
        },
        body: JSON.stringify(form),
      })
      let envelope
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Bạn cần đăng nhập tài khoản Admin để tạo Staff')
        }
        let msg = ''
        try {
          const j = await res.clone().json()
          msg = j?.message || j?.error || ''
        } catch (_) {
          msg = await res.text().catch(() => '')
        }
        throw new Error(msg || `Tạo staff thất bại (${res.status})`)
      } else {
        envelope = await res.json()
      }
      if (!envelope?.success) throw new Error(envelope?.message || 'Tạo staff thất bại')
      setMessage('Tạo nhân viên thành công!')
      setMessageType('success')
      setForm({ email: '', password: '', fullName: '', phone: '', roleName: '' })
      fetchStaffs()
      setTimeout(() => {
        setOpen(false)
        setMessage('')
        setMessageType('')
      }, 5000)
    } catch (err) {
      setMessage(err?.message || 'Có lỗi xảy ra')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="ad-panel">
      <div className="ad-panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Manage Staff</h3>
        <button className="ad-logout" onClick={() => { setMessage(''); setMessageType(''); setForm({ email: '', password: '', fullName: '', phone: '', roleName: '' }); setOpen(true) }}>Create Staff</button>
      </div>

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div style={{ width: 'min(92vw, 900px)', background: '#fff', borderRadius: 12, padding: 16 }}>
            <div className="ad-panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0 }}>Create Staff</h4>
              <button onClick={() => { setOpen(false); setMessage(''); setMessageType(''); }} style={{ background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>×</button>
            </div>
            {message && (
              <div style={{ 
                marginTop: 8, 
                marginBottom: 8, 
                color: messageType === 'success' ? '#16a34a' : '#ef4444',
                backgroundColor: messageType === 'success' ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${messageType === 'success' ? '#bbf7d0' : '#fecaca'}`,
                borderRadius: 8,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{ fontSize: '16px' }}>
                  {messageType === 'success' ? '✅' : '❌'}
                </span>
                {message}
              </div>
            )}
            <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
                <input type="email" value={form.email} onChange={updateField('email')} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6 }}>Mật khẩu</label>
                <input type="password" value={form.password} onChange={updateField('password')} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6 }}>Họ tên</label>
                <input type="text" value={form.fullName} onChange={updateField('fullName')} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6 }}>Số điện thoại</label>
                <input type="tel" value={form.phone} onChange={updateField('phone')} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6 }}>Vai trò</label>
                <select value={form.roleName} onChange={updateField('roleName')} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }} required>
                  <option value="">-- Chọn vai trò --</option>
                  <option value="Staff_Doctor">Staff Doctor</option>
                  <option value="Staff_Patient">Staff Patient</option>
                </select>
              </div>
              <div style={{ alignSelf: 'end' }}>
                <button type="submit" className="ad-logout" disabled={loading}>
                  {loading ? 'Đang tạo...' : 'Tạo Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <div className="ad-panel-title">
          <h4 style={{ margin: 0 }}>Danh sách Staff</h4>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '10px 8px' }}>Email</th>
                <th style={{ padding: '10px 8px' }}>Họ tên</th>
                <th style={{ padding: '10px 8px' }}>Số điện thoại</th>
                <th style={{ padding: '10px 8px' }}>Roles</th>
              </tr>
            </thead>
            <tbody>
              {staffs.map((s, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px' }}>{s.email || s.Email}</td>
                  <td style={{ padding: '8px' }}>{s.fullName || s.FullName}</td>
                  <td style={{ padding: '8px' }}>{s.phone || s.Phone}</td>
                  <td style={{ padding: '8px' }}>{Array.isArray(s.roles) ? s.roles.join(', ') : (s.Roles ? s.Roles.join(', ') : '')}</td>
                </tr>
              ))}
              {staffs.length === 0 && (
                <tr>
                  <td style={{ padding: '12px', color: '#64748b' }} colSpan={4}>Chưa có dữ liệu staff.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default CreateStaff
