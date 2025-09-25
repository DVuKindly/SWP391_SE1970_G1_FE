import { useContext, useMemo, useState } from 'react'
import { AuthContext } from '../../../providers/AuthContext'
import { createStaff } from '../../../services/accounts.api'
import useAccountsManager from '../../../hooks/useAccountsManager'
import Filters from './Filters'
import SearchBar from './SearchBar'
import AccountsTable from './AccountsTable'
import Pagination from './Pagination'
import './AccountManager.css'
import CreateStaffModal from '../CreateStaffModal'



// const initialQuery = { role: '', keyword: '', page: 1, pageSize: 10 }

function AccountManager() {
  const { tokens } = useContext(AuthContext)
  const {
    roles, query, setQuery, data, setData, loading,
    message, messageType, selected,
    toggleSelect, selectAllOnPage, clearSelection,
    fetchAccounts, searchByEmail, updateStatus, updateStatusBulk,
    showMessage, sortDir, toggleSort,
    hasNextPage,
  } = useAccountsManager(tokens)
  const [emailLookup, setEmailLookup] = useState('')
  const [emailResult, setEmailResult] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createForm, setCreateForm] = useState({ email: '', password: '', fullName: '', phone: '', roleName: '' })

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    ...(tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
  }), [tokens])

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

  const getFullName = (a) => {
    if (!a) return ''
    const name = a.fullName || a.FullName || a.fullname || a.name || a.Name
    if (name) return name
    const first = a.firstName || a.FirstName || a.givenName || ''
    const last = a.lastName || a.LastName || a.surname || ''
    const combined = [first, last].filter(Boolean).join(' ')
    return combined || '-'
  }

  const doSearchByEmail = async () => { await searchByEmail(emailLookup) }

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / (query.pageSize || 10)))
  const effectiveTotalPages = Math.max(
    1,
    totalPages,
    hasNextPage ? (query.page + 1) : query.page
  )

  return (
    <section className="ad-panel">
      <div className="ad-panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Account Manager</h3>
        <button className="ad-logout" onClick={() => { setCreateForm({ email: '', password: '', fullName: '', phone: '', roleName: '' }); setCreateOpen(true); }}>Create Staff</button>
      </div>
      <div className="am-subtitle">Quản lý tài khoản nhân viên và bệnh nhân</div>

      {message && (
        <div style={{
          marginTop: 8,
          marginBottom: 8,
          color: messageType === 'success' ? '#16a34a' : (messageType === 'error' ? '#ef4444' : '#0f172a'),
          backgroundColor: messageType === 'success' ? '#f0fdf4' : (messageType === 'error' ? '#fef2f2' : '#f1f5f9'),
          border: `1px solid ${messageType === 'success' ? '#bbf7d0' : (messageType === 'error' ? '#fecaca' : '#e2e8f0')}`,
          borderRadius: 8,
          padding: '10px 12px',
        }}>{message}</div>
      )}

      {/* Filters */}
      <Filters roles={roles} query={query} setQuery={setQuery} loading={loading} onSort={toggleSort} sortDir={sortDir} />

      {/* Search by email */}
      <SearchBar value={emailLookup} onChange={setEmailLookup} onSearch={doSearchByEmail} />

      {/* Create Staff Modal */}
      {createOpen && (
        <CreateStaffModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          loading={createLoading}
          onSubmit={async (form, reset) => {
            setCreateLoading(true)
            try {
              await createStaff(form, tokens)
              showMessage('Tạo nhân viên thành công!', 'success')
              reset?.()
              setTimeout(() => setCreateOpen(false), 1200)
              fetchAccounts()
            } catch (err) {
              showMessage(err?.message || 'Có lỗi xảy ra', 'error')
            } finally {
              setCreateLoading(false)
            }
          }}
        />
      )}
      {/* Email quick-result section removed; results now injected into the table above */}

      {/* Table */}
      <AccountsTable
        items={data.items}
        loading={loading}
        selected={selected}
        toggleSelect={toggleSelect}
        updateStatus={updateStatus}
        selectAllOnPage={selectAllOnPage}
        updateStatusBulk={updateStatusBulk}
      />

      {/* Pagination */}
      <Pagination
        total={data.total}
        page={query.page}
        totalPages={effectiveTotalPages}
        setPage={(next) => setQuery((p) => ({ ...p, page: next }))}
        onClearSelection={clearSelection}
        hasNextPage={hasNextPage}
      />
    </section>
  )
}

export default AccountManager


