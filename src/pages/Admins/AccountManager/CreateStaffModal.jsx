import { useState, useEffect } from 'react'
import { getRoles } from '../../../services/accounts.api'

function CreateStaffModal({ open, onClose, onSubmit, loading, tokens, editMode = false, accountData = null }) {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '', roleNames: [] })
  const [availableRoles, setAvailableRoles] = useState([])
  const [loadingRoles, setLoadingRoles] = useState(false)

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
      // Filter only Staff_Patient and Staff_Doctor roles
      const filteredRoles = roles.filter(role => 
        (role.name || role.Name) === 'Staff_Patient' || 
        (role.name || role.Name) === 'Staff_Doctor'
      )
      setAvailableRoles(filteredRoles)
    } catch (error) {
      console.error('Error loading roles:', error)
      // Fallback to hardcoded roles if API fails
      setAvailableRoles([
        { name: 'Staff_Patient', description: 'Staff Patient Role' },
        { name: 'Staff_Doctor', description: 'Staff Doctor Role' }
      ])
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

    const submitData = editMode 
      ? { 
          email: form.email, 
          fullName: form.fullName, 
          phone: form.phone, 
          roleNames: form.roleNames 
        }
      : form
    
    console.log('Submit data:', submitData) // Debug log
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
            <label style={{ display: 'block', marginBottom: 6 }}>Vai trò (có thể chọn 1 hoặc 2 vai trò)</label>
            {loadingRoles ? (
              <div style={{ padding: '8px', color: '#64748b' }}>Đang tải danh sách vai trò...</div>
            ) : (
              <div style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '8px' }}>
                {availableRoles.map((role) => (
                  <label key={role.roleId || role.RoleId} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      checked={form.roleNames.includes(role.name || role.Name)}
                      onChange={(e) => handleRoleChange(role.name || role.Name, e.target.checked)}
                      style={{ margin: 0 }}
                    />
                    <span style={{ fontWeight: '500' }}>
                      {role.name === 'Staff_Patient' ? 'Staff Patient' : 
                       role.name === 'Staff_Doctor' ? 'Staff Doctor' : 
                       role.name || role.Name}
                    </span>
                    {(role.description || role.Description) && (
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        - {role.description || role.Description}
                      </span>
                    )}
                  </label>
                ))}
                {availableRoles.length === 0 && (
                  <div style={{ color: '#64748b', fontSize: '14px' }}>Không có vai trò nào</div>
                )}
              </div>
            )}
            {form.roleNames.length > 0 && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#059669' }}>
                Đã chọn: {form.roleNames.map(name => 
                  name === 'Staff_Patient' ? 'Staff Patient' : 
                  name === 'Staff_Doctor' ? 'Staff Doctor' : name
                ).join(', ')}
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


