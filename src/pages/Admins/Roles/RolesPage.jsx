import { useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../../../providers/AuthContext'
import { fetchAllRoles, createRole, updateRole } from '../../../services/roles.api'

function RolesPage() {
  const { tokens } = useContext(AuthContext)
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')

  const [form, setForm] = useState({ name: '', description: '' })
  const [editId, setEditId] = useState(null)
  const isEdit = useMemo(() => Boolean(editId), [editId])

  const showMessage = (msg, type = 'info') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 3000)
  }

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchAllRoles(tokens)
      setRoles(data)
    } catch (e) {
      showMessage(e?.message || 'Không thể tải danh sách role', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm({ name: '', description: '' })
    setEditId(null)
  }

  const submit = async (e) => {
    e.preventDefault()
    try {
      if (isEdit) {
        await updateRole(editId, form, tokens)
        showMessage('Cập nhật role thành công', 'success')
      } else {
        await createRole(form, tokens)
        showMessage('Tạo role thành công', 'success')
      }
      resetForm()
      load()
    } catch (err) {
      showMessage(err?.message || 'Thao tác thất bại', 'error')
    }
  }

  return (
    <section className="ad-panel">
      <div className="ad-panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Roles Manager</h3>
      </div>

      {message && (
        <div style={{
          marginTop: 8,
          marginBottom: 8,
          color: messageType === 'success' ? '#16a34a' : (messageType === 'error' ? '#ef4444' : '#0f172a'),
          backgroundColor: messageType === 'success' ? '#f0fdf4' : (messageType === 'error' ? '#fef2f2' : '#f1f5f9'),
          border: `1px solid ${messageType === 'success' ? '#bbf7d0' : (messageType === 'error' ? '#fecaca' : '#e2e8f0')}`,
          borderRadius: 8,
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: messageType === 'error' ? '0 2px 4px rgba(239, 68, 68, 0.1)' : '0 2px 4px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {messageType === 'error' ? '⚠️' : (messageType === 'success' ? '✅' : 'ℹ️')}
          {message}
        </div>
      )}

      {/* Create / Update section (top) */}
      <div className="ad-card" style={{ padding: 16, marginBottom: 16 }}>
        <h4 style={{ marginTop: 0 }}>{isEdit ? 'Cập nhật Role' : 'Tạo Role'}</h4>
        <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6 }}>Tên role</label>
              <input className="am-input" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6 }}>Mô tả</label>
            <input 
              className="am-input" 
              value={form.description} 
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              style={{ whiteSpace: 'nowrap', overflowX: 'auto' }}
            />
            </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="ad-logout" type="submit">{isEdit ? 'Lưu' : 'Tạo'}</button>
            {isEdit && (
              <button type="button" onClick={resetForm} className="ad-side-item">Hủy</button>
            )}
          </div>
        </form>
      </div>

      {/* Table section (bottom) */}
      <div className="ad-card" style={{ padding: 0 }}>
        <div className="am-table-wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
            <h4 style={{ margin: 0, fontSize: 16 }}>Danh sách Roles</h4>
            <button className="ad-side-item" onClick={load} disabled={loading} aria-label="Tải lại" title="Tải lại" style={{ width: 36, height: 36, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18 }}>{loading ? '⏳' : '⟳'}</span>
            </button>
          </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr className="am-thead">
                  <th style={{ padding: '10px 8px', width: 220 }}>Tên</th>
                  <th style={{ padding: '10px 8px' }}>Mô tả</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right', width: 140 }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={3} style={{ padding: 12, color: '#64748b' }}>Đang tải dữ liệu...</td>
                  </tr>
                )}
                {!loading && roles.map((r, idx) => (
                  <tr key={r.id || idx} className={`${idx % 2 !== 0 ? 'am-row-alt' : ''}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}>{r.name}</td>
                    <td style={{ padding: '8px', color: '#475569' }}>{r.description}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>
                      <button className="ad-logout" onClick={() => { setEditId(r.id); setForm({ name: r.name, description: r.description }) }} style={{ padding: '6px 12px', fontSize: '12px' }}>Sửa</button>
                    </td>
                  </tr>
                ))}
                {!loading && roles.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: 12, color: '#64748b' }}>Chưa có role nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>
    </section>
  )
}

export default RolesPage


