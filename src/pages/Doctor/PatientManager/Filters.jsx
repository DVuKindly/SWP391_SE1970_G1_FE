// src/pages/Doctor/PatientManager/Filters.jsx (adapted, no roles/sort)
function Filters({ query, setQuery, loading }) {
  return (
    <div className="pm-filters">
      <div className="pm-filters-grid">
        <input className="pm-input" placeholder="Tìm theo keyword (email, tên, sđt ...)" value={query.keyword} onChange={(e) => setQuery((p) => ({ ...p, keyword: e.target.value, page: 1 }))} />
      </div>
    </div>
  );
}

export default Filters;