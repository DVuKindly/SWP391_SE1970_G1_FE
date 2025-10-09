import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../providers/AuthContext';
import { getStaffAccountsByStatus, updateStaffAccountStatus, bulkUpdateStaffAccountStatus } from '../../services/staffdoctor.api';
import './StaffStatusManagement.css';

function StaffStatusManagement() {
  const { tokens } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  const statusOptions = [
    { value: 'all', label: 'Tất cả', color: '#6b7280' },
    { value: 'true', label: 'Đang hoạt động', color: '#16a34a' },
    { value: 'false', label: 'Bị vô hiệu hóa', color: '#dc2626' }
  ];

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await getStaffAccountsByStatus(selectedStatus, tokens);
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [allData, activeData, inactiveData] = await Promise.all([
        getStaffAccountsByStatus('all', tokens),
        getStaffAccountsByStatus('true', tokens),
        getStaffAccountsByStatus('false', tokens)
      ]);
      
      setStats({
        total: allData?.length || 0,
        active: activeData?.length || 0,
        inactive: inactiveData?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [selectedStatus]);

  useEffect(() => {
    loadStats();
  }, []);

  const handleStatusChange = async (accountId, newStatus) => {
    try {
      await updateStaffAccountStatus(accountId, newStatus, tokens);
      loadAccounts();
      loadStats();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái!');
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedAccounts.length === 0) return;
    
    try {
      await bulkUpdateStaffAccountStatus(selectedAccounts, newStatus, tokens);
      setSelectedAccounts([]);
      loadAccounts();
      loadStats();
      alert(`Đã cập nhật trạng thái cho ${selectedAccounts.length} tài khoản!`);
    } catch (error) {
      console.error('Error bulk updating status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái hàng loạt!');
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

  const getStatusColor = (isActive) => {
    return isActive ? '#16a34a' : '#dc2626';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Đang hoạt động' : 'Bị vô hiệu hóa';
  };

  return (
    <div className="ssm-container">
      <div className="ssm-header">
        <h2>Quản lý trạng thái tài khoản</h2>
        <div className="ssm-filter">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="ssm-select"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ssm-stats">
        <div className="ssm-stat-card">
          <div className="ssm-stat-icon">👥</div>
          <div className="ssm-stat-content">
            <div className="ssm-stat-number">{stats.total}</div>
            <div className="ssm-stat-label">Tổng số tài khoản</div>
          </div>
        </div>
        <div className="ssm-stat-card">
          <div className="ssm-stat-icon" style={{ color: '#16a34a' }}>✅</div>
          <div className="ssm-stat-content">
            <div className="ssm-stat-number" style={{ color: '#16a34a' }}>{stats.active}</div>
            <div className="ssm-stat-label">Đang hoạt động</div>
          </div>
        </div>
        <div className="ssm-stat-card">
          <div className="ssm-stat-icon" style={{ color: '#dc2626' }}>❌</div>
          <div className="ssm-stat-content">
            <div className="ssm-stat-number" style={{ color: '#dc2626' }}>{stats.inactive}</div>
            <div className="ssm-stat-label">Bị vô hiệu hóa</div>
          </div>
        </div>
      </div>

      {selectedAccounts.length > 0 && (
        <div className="ssm-bulk-actions">
          <div className="ssm-bulk-info">
            Đã chọn {selectedAccounts.length} tài khoản
          </div>
          <div className="ssm-bulk-buttons">
            <button 
              className="ssm-btn ssm-btn-success"
              onClick={() => handleBulkStatusChange(true)}
            >
              Kích hoạt tất cả
            </button>
            <button 
              className="ssm-btn ssm-btn-danger"
              onClick={() => handleBulkStatusChange(false)}
            >
              Vô hiệu hóa tất cả
            </button>
            <button 
              className="ssm-btn ssm-btn-secondary"
              onClick={() => setSelectedAccounts([])}
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      <div className="ssm-table-container">
        <table className="ssm-table">
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
                <td colSpan="7" className="ssm-loading">Đang tải...</td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan="7" className="ssm-empty">Không có dữ liệu</td>
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
                    <div className="ssm-roles">
                      {account.roles?.map((role, index) => (
                        <span key={index} className="ssm-role-tag">
                          {typeof role === 'string' ? role : role.name}
                        </span>
                      ))}
                      {account.role && !account.roles && (
                        <span className="ssm-role-tag">
                          {account.role}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span 
                      className="ssm-status"
                      style={{ 
                        backgroundColor: getStatusColor(account.isActive) + '20',
                        color: getStatusColor(account.isActive)
                      }}
                    >
                      {getStatusText(account.isActive)}
                    </span>
                  </td>
                  <td>{account.createdAt ? new Date(account.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                  <td>
                    <div className="ssm-actions-cell">
                      <button
                        className={`ssm-btn ${account.isActive ? 'ssm-btn-danger' : 'ssm-btn-success'}`}
                        onClick={() => handleStatusChange(account.id, !account.isActive)}
                      >
                        {account.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StaffStatusManagement;
