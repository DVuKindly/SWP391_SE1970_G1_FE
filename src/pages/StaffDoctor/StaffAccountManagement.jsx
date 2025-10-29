import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../providers/AuthContext';
import {
  getStaffAccountsWithPagination,
  updateStaffAccountStatus,
  bulkUpdateStaffAccountStatus,
  resetStaffPassword,

}
  from '../../services/staffdoctor.api';
import './StaffAccountManagement.css';
import EditDoctorMockup from './EditDoctorMockup';

function StaffAccountManagement() {
  const { tokens } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editPreset, setEditPreset] = useState(null);


  const loadAccounts = async () => {
    setLoading(true);
    try {
      const params = {
        keyword: searchKeyword,
        page: pagination.page,
        pageSize: pagination.pageSize,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };

      const result = await getStaffAccountsWithPagination(params, tokens);
      setAccounts(result.items || []);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [searchKeyword, statusFilter, pagination.page, pagination.pageSize]);

  const handleStatusChange = async (accountId, newStatus) => {
    try {
      await updateStaffAccountStatus(accountId, newStatus, tokens);
      loadAccounts();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Removed mock create handlers

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedAccounts.length === 0) return;

    try {
      await bulkUpdateStaffAccountStatus(selectedAccounts, newStatus, tokens);
      setSelectedAccounts([]);
      loadAccounts();
    } catch (error) {
      console.error('Error bulk updating status:', error);
    }
  };

  const handleResetPassword = async (accountId) => {
    if (!window.confirm('Bạn có chắc chắn muốn reset mật khẩu cho tài khoản này?')) {
      return;
    }

    try {
      await resetStaffPassword(accountId, tokens);
      alert('Mật khẩu đã được reset thành công!');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Có lỗi xảy ra khi reset mật khẩu!');
    }
  };

  const handleSelectAccount = (accountId) => {
    setSelectedAccounts(prev =>
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAccounts.length === accounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(accounts.map(account => account.id));
    }
  };

  return (
    <div className="sam-container">
      <div className="sam-header">
        <h2>Quản lý tài khoản Bác sĩ</h2>
        <div className="sam-actions">
          {selectedAccounts.length > 0 && (
            <div className="sam-bulk-actions">
              <button
                className="sam-btn sam-btn-success"
                onClick={() => handleBulkStatusChange(true)}
              >
                Kích hoạt ({selectedAccounts.length})
              </button>
              <button
                className="sam-btn sam-btn-danger"
                onClick={() => handleBulkStatusChange(false)}
              >
                Vô hiệu hóa ({selectedAccounts.length})
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="sam-filters">
        <div className="sam-search">
          <input
            type="text"
            placeholder="Tìm kiếm theo email, tên..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="sam-input"
          />
        </div>
        <div className="sam-filter">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="sam-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Bị vô hiệu hóa</option>
          </select>
        </div>
      </div>

      <div className="sam-table-container">
        <table className="sam-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedAccounts.length === accounts.length && accounts.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Email</th>
              <th>Họ tên</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="sam-loading">Đang tải...</td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan="7" className="sam-empty">Không có dữ liệu</td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedAccounts.includes(account.id)}
                      onChange={() => handleSelectAccount(account.id)}
                    />
                  </td>
                  <td>{account.email}</td>
                  <td>{account.name || account.fullName || (account.firstName || '') + ' ' + (account.lastName || '')}</td>
                  <td>
                    <div className="sam-roles">
                      {account.roles?.map((role, index) => (
                        <span key={index} className="sam-role-tag">
                          {typeof role === 'string' ? role : role.name}
                        </span>
                      ))}
                      {account.role && !account.roles && (
                        <span className="sam-role-tag">
                          {account.role}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`sam-status ${account.isActive ? 'active' : 'inactive'}`}>
                      {account.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </span>
                  </td>
                  <td>{account.createdAt ? new Date(account.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                  <td>
                    <div className="sam-actions-cell">
                      <button
                        className={`sam-btn ${account.isActive ? 'sam-btn-warning' : 'sam-btn-success'}`}
                        onClick={() => handleStatusChange(account.id, !account.isActive)}
                      >
                        {account.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      </button>
                      <button
                        className="sam-btn sam-btn-secondary"
                        onClick={() => handleResetPassword(account.id)}
                      >
                        Reset mật khẩu
                      </button>
                      <button
                        className="sam-btn sam-btn-success"
                        onClick={() => {
                          setEditPreset({
                            email: account.email,
                            fullName: account.name || account.fullName || '',
                            phone: account.phone || '',
                            id: account.id,
                          })
                          setEditOpen(true)
                        }}
                      >
                        Chỉnh sửa bác sĩ
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="sam-pagination">
        <div className="sam-pagination-info">
          Hiển thị {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)}
          trong tổng số {pagination.total} bản ghi
        </div>
        <div className="sam-pagination-controls">
          <button
            className="sam-btn sam-btn-secondary"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Trước
          </button>
          <span className="sam-page-info">
            Trang {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
          </span>
          <button
            className="sam-btn sam-btn-secondary"
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Sau
          </button>
        </div>
      </div>

      {editOpen && (
        <EditDoctorMockup
          open={editOpen}
          onClose={() => setEditOpen(false)}
          preset={editPreset}
        />
      )}
    </div>
  );
}

export default StaffAccountManagement;
