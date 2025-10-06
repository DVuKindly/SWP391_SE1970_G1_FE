import { useState, useEffect } from 'react'
import { getRoles } from '../../../services/accounts.api'

function CreateStaffModal({ open, onClose, onSubmit, loading, tokens, editMode = false, accountData = null }) {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '', roleNames: [] })
  const [availableRoles, setAvailableRoles] = useState([])
  const [loadingRoles, setLoadingRoles] = useState(false)
  const BLOCKED_ROLE_NAMES = ['Admin']

  // Load roles when modal opens
  useEffect(() => {
    if (open && tokens) {
      loadRoles()
    }
  }, [open, tokens])

  // Load account data when in edit mode
  useEffect(() => {
    if (open && editMode && accountData) {
      console.log('Account data in edit mode:', accountData) // Debug log
      setForm({
        email: accountData.email || accountData.Email || '',
        password: '', // Don't show password in edit mode
        fullName: accountData.fullName || accountData.FullName || accountData.name || accountData.Name || '',
        phone: accountData.phone || accountData.Phone || '',
        roleNames: getCurrentRoles(accountData)
      })
    } else if (open && !editMode) {
      // Reset form for create mode
      setForm({ email: '', password: '', fullName: '', phone: '', roleNames: [] })
    }
  }, [open, editMode, accountData])

  // Helper function to get current roles from account data
  const getCurrentRoles = (account) => {
    if (!account) return []

    const roles = account.roles || account.Role || account.role
    if (Array.isArray(roles)) {
      return roles.map(r => typeof r === 'string' ? r : (r?.name || r?.Name || ''))
    }
    if (typeof roles === 'string') {
      return [roles]
    }
    return []
  }

  const loadRoles = async () => {
    setLoadingRoles(true)
    try {
      const roles = await getRoles(tokens)
      const safeRoles = Array.isArray(roles) ? roles.filter(r => !BLOCKED_ROLE_NAMES.includes(r?.name)) : []
      setAvailableRoles(safeRoles)
    } catch (error) {
      console.error('Error loading roles:', error)
      setAvailableRoles([])
    } finally {
      setLoadingRoles(false)
    }
  }

  if (!open) return null

  const update = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleRoleChange = (roleName, checked) => {
    setForm(prev => ({
      ...prev,
      roleNames: checked
        ? [...prev.roleNames, roleName]
        : prev.roleNames.filter(name => name !== roleName)
    }))
  }

  const submit = (e) => {
    e.preventDefault()
    if (form.roleNames.length === 0) {
      alert('Vui lòng chọn ít nhất một vai trò')
      return
    }

    // Ensure blocked roles are not submitted even if somehow present
    const sanitizedRoleNames = (form.roleNames || []).filter(name => !BLOCKED_ROLE_NAMES.includes(name))

    const submitData = editMode 
      ? {
        email: form.email,
        fullName: form.fullName,
        phone: form.phone,
          roleNames: sanitizedRoleNames 
      }
      : { ...form, roleNames: sanitizedRoleNames }

    console.log('Submit data:', submitData)
    onSubmit?.(submitData, () => setForm({ email: '', password: '', fullName: '', phone: '', roleNames: [] }))
  }

  return (
    <div className="am-modal-overlay">
      <div className="am-modal">
        <div className="ad-panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0 }}>{editMode ? 'Chỉnh sửa Staff' : 'Create Staff'}</h4>
          <button className="am-modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit} className="am-modal-grid">
          <div>
            <label style={{ display: 'block', marginBottom: 6 }}>
              Email {editMode && <span style={{ color: '#6b7280', fontSize: '12px' }}>(Không thể thay đổi)</span>}
            </label>
            <input
              className="am-input"
              type="email"
              value={form.email}
              onChange={update('email')}
              disabled={editMode}
              style={editMode ? {
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                cursor: 'not-allowed'
              } : {}}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6 }}>
              Mật khẩu {editMode && <span style={{ color: '#6b7280', fontSize: '12px' }}>(Không thể thay đổi)</span>}
            </label>
            <input
              className="am-input"
              type="password"
              value={editMode ? '••••••••' : form.password}
              onChange={update('password')}
              disabled={editMode}
              style={editMode ? {
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                cursor: 'not-allowed'
              } : {}}
              required={!editMode}
            />
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
            <label style={{ display: 'block', marginBottom: 6 }}>
              Vai trò (có thể chọn 1 hoặc 2 vai trò) {editMode && <span style={{ color: '#6b7280', fontSize: '12px' }}>(Không thể thay đổi)</span>}
            </label>
            {loadingRoles ? (
              <div style={{ padding: '8px', color: '#64748b' }}>Đang tải danh sách vai trò...</div>
            ) : (
              <div style={{
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '8px',
                backgroundColor: editMode ? '#f3f4f6' : 'white'
              }}>
                {availableRoles.map((role) => {
                  return (
                    <label key={role.roleId || role.name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      cursor: editMode ? 'not-allowed' : 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={form.roleNames.includes(role.name)}
                        onChange={(e) => handleRoleChange(role.name, e.target.checked)}
                        disabled={editMode}
                        style={{
                          margin: 0,
                          cursor: editMode ? 'not-allowed' : 'pointer'
                        }}
                      />
                      <span style={{
                        fontWeight: '500',
                        color: editMode ? '#6b7280' : 'inherit'
                      }}>
                        {role.name}
                      </span>
                      {role.description && (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          - {role.description}
                        </span>
                      )}
                    </label>
                  )
                })}
                {availableRoles.length === 0 && (
                  <div style={{ color: '#64748b', fontSize: '14px' }}>Không có vai trò nào</div>
                )}
              </div>
            )}
            {form.roleNames.length > 0 && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#059669' }}>
                Đã chọn: {form.roleNames.join(', ')}
              </div>
            )}
          </div>
          <div style={{ alignSelf: 'end' }}>
            <button type="submit" className="ad-logout" disabled={loading}>
              {loading
                ? (editMode ? 'Đang cập nhật...' : 'Đang tạo...')
                : (editMode ? 'Cập nhật Staff' : 'Tạo Staff')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateStaffModal


