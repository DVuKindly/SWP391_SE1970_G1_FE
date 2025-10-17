import { useCallback } from 'react';

const getFullName = (a) => {
  if (!a) return ''
  const name = a.fullName || a.FullName || a.fullname || a.name || a.Name
  if (name) return name
  const first = a.firstName || a.FirstName || a.givenName || ''
  const last = a.lastName || a.LastName || a.surname || ''
  const combined = [first, last].filter(Boolean).join(' ')
  return combined || '-'
}

function PatientsTable({ items, loading, selected, toggleSelect, updateStatus, selectAllOnPage, clearSelection, onReset }) {
  const handleSelectPage = useCallback(() => selectAllOnPage(items), [selectAllOnPage, items]);

  return (
    <div className="pm-table-wrap">
      {/* No bulk */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr className="pm-thead">
            <th style={{ padding: '10px 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={handleSelectPage} className="dd-logout" style={{ padding: '4px 10px' }}>Chọn trang</button>
                <button className="dd-logout pm-btn-muted" style={{ padding: '4px 10px' }} onClick={clearSelection}>Bỏ chọn</button>
              </div>
            </th>
            <th style={{ padding: '10px 8px' }}>Email</th>
            <th style={{ padding: '10px 8px' }}>Họ tên</th>
            <th style={{ padding: '10px 8px' }}>Số điện thoại</th>
            <th style={{ padding: '10px 8px' }}>Trạng thái</th>
            <th style={{ padding: '10px 8px', textAlign: 'right' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={6} style={{ padding: 12, color: '#64748b' }}>Đang tải...</td></tr>}
          {!loading && items.map((a, idx) => {
            const id = a.id ?? a.accountId;
            const isActive = a.isActive ?? false;
            const selectedOnRow = selected.has(id);
            return (
              <tr key={id ?? idx} className={`${selectedOnRow ? 'pm-row-selected' : ''} ${idx % 2 !== 0 ? 'pm-row-alt' : ''}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px' }}><input type="checkbox" checked={selectedOnRow} onChange={() => toggleSelect(id)} /></td>
                <td style={{ padding: '8px' }}>{a.email}</td>
                <td style={{ padding: '8px' }}>{getFullName(a)}</td>
                <td style={{ padding: '8px' }}>{a.phone || '-'}</td>
                <td style={{ padding: '8px' }}>{isActive ? <span className="dd-status-success">Active</span> : <span className="dd-status-danger">Inactive</span>}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="dd-logout" onClick={() => onReset(id)} style={{ background: '#eab308', padding: '6px 12px', fontSize: '12px' }}>Reset Password</button>
                    {isActive ? (
                      <button className="dd-logout" onClick={() => updateStatus(id, false)} style={{ background: '#ef4444', padding: '6px 12px', fontSize: '12px' }}>Deactivate</button>
                    ) : (
                      <button className="dd-logout" onClick={() => updateStatus(id, true)} style={{ padding: '6px 12px', fontSize: '12px' }}>Activate</button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          {!loading && items.length === 0 && <tr><td colSpan={6} style={{ padding: 12, color: '#64748b' }}>Không có dữ liệu.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default PatientsTable;