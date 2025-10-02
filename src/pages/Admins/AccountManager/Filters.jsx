function Filters({ roles, query, setQuery, loading, onSort, sortDir }) {
  return (
    <div className="am-filters">
      <div className="am-filters-grid">
        <select className="am-select" value={query.role} onChange={(e) => setQuery((p) => ({ ...p, role: e.target.value, page: 1 }))}>
          <option value="">Tất cả roles</option>
          {roles.map((r) => {
            const label = typeof r === 'string' ? r : (r?.roleName || r?.name || r?.displayName || r?.RoleName || r?.Code || String(r))
            return (
              <option key={label} value={label}>{label}</option>
            )
          })}
        </select>
        <input className="am-input" placeholder="Tìm theo keyword (email, tên, sđt ...)" value={query.keyword} onChange={(e) => setQuery((p) => ({ ...p, keyword: e.target.value, page: 1 }))} />
        <div className="am-actions">
          <button className="ad-logout" onClick={onSort} disabled={loading}>{sortDir === 'asc' ? 'Sắp xếp A-Z' : 'Sắp xếp Z-A'}</button>
        </div>
      </div>
    </div>
  )
}

export default Filters