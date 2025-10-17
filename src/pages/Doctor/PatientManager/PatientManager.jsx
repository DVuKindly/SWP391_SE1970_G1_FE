import { useContext, useState } from 'react';
import { AuthContext } from '../../../providers/AuthContext';
import usePatientsManager from '../../../hooks/usePatientsManager';
import Filters from './Filters'; // Adapted, no roles/sort
import PatientsTable from './PatientsTable';
import Pagination from './Pagination';
import './PatientManager.css'; // Create similar CSS

function PatientManager() {
  const { tokens } = useContext(AuthContext);
  const {
    query, setQuery, data, loading,
    message, messageType, selected,
    toggleSelect, selectAllOnPage, clearSelection,
    fetchPatients, updateStatus, resetPassword,
    hasNextPage,
  } = usePatientsManager(tokens);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetId, setResetId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const handleReset = (id) => {
    setResetId(id);
    setResetOpen(true);
  };

  const submitReset = async () => {
    if (newPassword && resetId) {
      await resetPassword(resetId, newPassword);
      setResetOpen(false);
      setNewPassword('');
      setResetId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / (query.pageSize || 10)));
  const effectiveTotalPages = Math.max(1, totalPages, hasNextPage ? (query.page + 1) : query.page);

  return (
    <section className="dd-panel">
      <div className="dd-panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Patient Manager</h3>
      </div>
      <div className="pm-subtitle">Quản lý bệnh nhân</div>

      {message && (
        <div style={{
          marginTop: 8, marginBottom: 8,
          color: messageType === 'success' ? '#16a34a' : '#ef4444',
          backgroundColor: messageType === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${messageType === 'success' ? '#bbf7d0' : '#fecaca'}`,
          borderRadius: 8, padding: '12px 16px', fontSize: '14px', fontWeight: '500',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          {messageType === 'success' ? '✅' : '⚠️'} {message}
        </div>
      )}

      <Filters query={query} setQuery={setQuery} loading={loading} />

      {resetOpen && (
        <div className="modal"> {/* Simple modal, style as needed */}
          <input 
            type="text" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            placeholder="New Password" 
          />
          <button onClick={submitReset}>Reset</button>
          <button onClick={() => setResetOpen(false)}>Cancel</button>
        </div>
      )}

      <PatientsTable
        items={data.items}
        loading={loading}
        selected={selected}
        toggleSelect={toggleSelect}
        updateStatus={updateStatus}
        selectAllOnPage={selectAllOnPage}
        clearSelection={clearSelection}
        onReset={handleReset}
      />

      <Pagination
        total={data.total}
        page={query.page}
        totalPages={effectiveTotalPages}
        setPage={(next) => setQuery((p) => ({ ...p, page: next }))}
        hasNextPage={hasNextPage}
      />
    </section>
  );
}

export default PatientManager;