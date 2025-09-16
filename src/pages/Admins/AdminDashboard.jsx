import { useState } from 'react'

function AdminDashboard() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Staff_Patient')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      // Mock only: simulate network delay and success without calling backend
      await new Promise((resolve) => setTimeout(resolve, 700))
      console.log('Mock create staff payload:', { email, password, staffRoleName: role })
      setMessage('Tạo staff thành công (mock)')
      setEmail('')
      setPassword('')
      setRole('Staff_Patient')
      setOpen(false)
    } catch (err) {
      setMessage(`Lỗi tạo staff: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Dashboard</h2>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <button onClick={() => setOpen(true)} style={styles.primaryBtn}>+ Create Staff</button>
        {message && <span style={{ color: '#0b5d50' }}>{message}</span>}
      </div>

      {/* API test image placeholder */}
      <div style={{ marginTop: 24 }}>
        <h4>API Test (Swagger)</h4>
        <p style={{ color: '#666', marginTop: 6 }}>Bạn có thể thay hình này bằng ảnh test API của bạn bằng cách sửa thuộc tính src.</p>
        <img src="/orthoc/images/about-img.jpg" alt="api test" style={{ maxWidth: '100%', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,.08)' }} />
      </div>

      {open && (
        <div style={styles.backdrop} onClick={() => setOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Create Staff</h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.field}> 
                <label style={styles.label}>Email</label>
                <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div style={styles.field}> 
                <label style={styles.label}>Password</label>
                <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div style={styles.field}> 
                <label style={styles.label}>Role</label>
                <select style={styles.input} value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="Staff_Patient">Staff_Patient</option>
                  <option value="Staff_Doctor">Staff_Doctor</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button type="button" onClick={() => setOpen(false)} style={styles.ghostBtn}>Cancel</button>
                <button type="submit" disabled={loading} style={styles.primaryBtn}>{loading ? 'Saving...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  primaryBtn: { background: '#0b5d50', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer' },
  ghostBtn: { background: '#f1f5f9', color: '#111', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer' },
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  modal: { width: 420, background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 10px 30px rgba(0,0,0,.2)' },
  field: { display: 'flex', flexDirection: 'column', marginTop: 10 },
  label: { fontSize: 14, marginBottom: 4 },
  input: { border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 14 },
}

export default AdminDashboard


