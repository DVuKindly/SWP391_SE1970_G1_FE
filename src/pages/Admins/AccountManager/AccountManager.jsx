import { useContext, useMemo, useState } from 'react'
import { AuthContext } from '../../../providers/AuthContext'
import { createStaff, createAccountWithRoles } from '../../../services/accounts.api'
import useAccountsManager from '../../../hooks/useAccountsManager'
import Filters from './Filters'
import AccountsTable from './AccountsTable'
import Pagination from './Pagination'
import './AccountManager.css'
import CreateStaffModal from './CreateStaffModal'

function AccountManager() {
  const { tokens } = useContext(AuthContext)
  const {
    roles, query, setQuery, data, setData, loading,
    message, messageType, selected,
    toggleSelect, selectAllOnPage, clearSelection,
    fetchAccounts, searchByEmail, updateStatus, updateStatusBulk,
    showMessage, sortDir, toggleSort,
    hasNextPage, updateAccount,
  } = useAccountsManager(tokens)
  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createForm, setCreateForm] = useState({ email: '', password: '', fullName: '', phone: '', roleName: '' })
  
  // Edit modal state
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)


// Hàm xử lý chỉnh sửa tài khoản
  const handleEditAccount = (account) => {
    console.log('Selected account for edit:', account)
    setSelectedAccount(account)
    setEditOpen(true)
  }

// Hàm xử lý cập nhật tài khoản
  const handleUpdateAccount = async (formData) => {
    setEditLoading(true)
    try {
      const accountId = selectedAccount?.id ?? selectedAccount?.accountId
      // Loại bỏ roleNames khỏi formData vì role không thể thay đổi trong edit mode
      const { roleNames, ...updateData } = formData
      await updateAccount(accountId, updateData)
      setEditOpen(false)
      setSelectedAccount(null)
    } catch (err) {
      // Error đã được xử lý trong updateAccount
    } finally {
      setEditLoading(false)
    }
  }

// Hàm xử lý submit cho cả create và edit
  const handleSubmit = async (formData, reset) => {
    if (editOpen && selectedAccount) {
      // Edit mode
      await handleUpdateAccount(formData)
    } else {
      // Create mode
      setCreateLoading(true)
      try {
        await createAccountWithRoles(formData, tokens)
        showMessage('Tạo nhân viên thành công!', 'success')
        reset?.()
        setCreateOpen(false)
        fetchAccounts()
      } catch (err) {
        showMessage(err?.message, 'error')
        setCreateOpen(false)
      } finally {
        setCreateLoading(false)
      }
    }
  }
// Tính toán tổng số trang
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
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: messageType === 'error' ? '0 2px 4px rgba(239, 68, 68, 0.1)' : '0 2px 4px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {messageType === 'error' && (
            <span style={{ fontSize: '16px' }}>⚠️</span>
          )}
          {messageType === 'success' && (
            <span style={{ fontSize: '16px' }}>✅</span>
          )}
          {message}
        </div>
      )}

      {/* Filters */}
      <Filters roles={roles} query={query} setQuery={setQuery} loading={loading} onSort={toggleSort} sortDir={sortDir} />

      {/* Create Staff Modal */}
      {createOpen && (
        <CreateStaffModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          loading={createLoading}
          tokens={tokens}
          editMode={false}
          onSubmit={handleSubmit}
        />
      )}

      {/* Edit Staff Modal */}
      {editOpen && (
        <CreateStaffModal
          open={editOpen}
          onClose={() => {
            setEditOpen(false)
            setSelectedAccount(null)
          }}
          loading={editLoading}
          tokens={tokens}
          editMode={true}
          accountData={selectedAccount}
          onSubmit={handleSubmit}
        />
      )}

      {/* Table */}
      <AccountsTable
        items={data.items}
        loading={loading}
        selected={selected}
        toggleSelect={toggleSelect}
        updateStatus={updateStatus}
        selectAllOnPage={selectAllOnPage}
        updateStatusBulk={updateStatusBulk}
        clearSelection={clearSelection}
        onEdit={handleEditAccount}
      />

      {/* Pagination */}
      <Pagination
        total={data.total}
        page={query.page}
        totalPages={effectiveTotalPages}
        setPage={(next) => setQuery((p) => ({ ...p, page: next }))}
        hasNextPage={hasNextPage}
      />

    </section>
  )
}

export default AccountManager