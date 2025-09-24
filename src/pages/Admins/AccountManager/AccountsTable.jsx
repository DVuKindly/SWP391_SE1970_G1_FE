import { useCallback } from 'react'

const getFullName = (a) => {
  if (!a) return ''
  const name = a.fullName || a.FullName || a.fullname || a.name || a.Name
  if (name) return name
  const first = a.firstName || a.FirstName || a.givenName || ''
  const last = a.lastName || a.LastName || a.surname || ''
  const combined = [first, last].filter(Boolean).join(' ')
  return combined || '-'
}

const stringifyRoles = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value?.Role === 'string') return value.Role
  if (typeof value?.role === 'string') return value.role
  const arr = Array.isArray(value)
    ? value
    : (Array.isArray(value?.roles)
      ? value.roles
      : (Array.isArray(value?.Roles) ? value.Roles : []))
  const names = arr.map((r) => {
    if (typeof r === 'string') return r
    return r?.roleName || r?.name || r?.displayName || r?.RoleName || r?.Code || ''
  }).filter(Boolean)
  return names.join(', ')
}

function AccountsTable({ items, loading, selected, toggleSelect, updateStatus, selectAllOnPage }) {
  const handleSelectPage = useCallback(() => selectAllOnPage(items), [selectAllOnPage, items])

  return (
    <div className="am-table-wrap">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr className="am-thead">
            <th style={{ padding: '10px 8px' }}>
              <button onClick={handleSelectPage} className="ad-logout" style={{ padding: '4px 10px' }}>Chọn trang</button>
            </th>
            <th style={{ padding: '10px 8px' }}>Email</th>
            <th style={{ padding: '10px 8px' }}>Họ tên</th>
            <th style={{ padding: '10px 8px' }}>Số điện thoại</th>
            <th style={{ padding: '10px 8px' }}>Roles</th>
            <th style={{ padding: '10px 8px' }}>Trạng thái</th>
            <th style={{ padding: '10px 8px', textAlign: 'right' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={7} style={{ padding: 12, color: '#64748b' }}>Đang tải dữ liệu...</td>
            </tr>
          )}
          {!loading && items.map((a, idx) => {
            const id = a.id ?? a.accountId
            const isActive = (typeof a.isActive === 'boolean') ? a.isActive : (a.IsActive ?? false)
            const selectedOnRow = selected.has(id)
            return (
              <tr key={id ?? idx} className={`${selectedOnRow ? 'am-row-selected' : ''} ${idx % 2 !== 0 ? 'am-row-alt' : ''}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px' }}>
                  <input type="checkbox" checked={selectedOnRow} onChange={() => toggleSelect(id)} />
                </td>
                <td style={{ padding: '8px' }}>{a.email || a.Email}</td>
                <td style={{ padding: '8px' }}>{getFullName(a)}</td>
                <td style={{ padding: '8px' }}>{a.phone || a.Phone || '-'}</td>
                <td style={{ padding: '8px' }}>
                  <span className="am-role-badge">{stringifyRoles(a.roles || a.Role || a.role || a)}</span>
                </td>
                <td style={{ padding: '8px' }}>
                  {isActive ? <span className="ad-status-success">Active</span> : <span className="ad-status-danger">Inactive</span>}
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  {isActive ? (
                    <button className="ad-logout" onClick={() => updateStatus(id, false)} style={{ background: '#ef4444' }}>Deactivate</button>
                  ) : (
                    <button className="ad-logout" onClick={() => updateStatus(id, true)}>Activate</button>
                  )}
                </td>
              </tr>
            )
          })}
          {!loading && items.length === 0 && (
            <tr>
              <td colSpan={7} style={{ padding: 12, color: '#64748b' }}>Không có dữ liệu.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default AccountsTable


