import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../providers/AuthContext';
import {
  getPatientAccountsWithPagination,
  updatePatientAccountStatus,
  bulkUpdatePatientAccountStatus,
  resetPatientPassword,
  updatePatientAccount,
} from '../../services/staffpatient.api';
import './StaffPatientManagement.css';
import EditPatientModal from './EditPatientModal';

function StaffPatientManagement() {
  const { tokens } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editPreset, setEditPreset] = useState(null);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const params = {
        keyword: searchKeyword,
        page: pagination.page,
        pageSize: pagination.pageSize,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };

      const result = await getPatientAccountsWithPagination(params, tokens);
      setPatients(result.items || []);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [searchKeyword, statusFilter, pagination.page, pagination.pageSize]);

  const handleStatusChange = async (patientId, newStatus) => {
    try {
      await updatePatientAccountStatus(patientId, newStatus, tokens);
      loadPatients();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedPatients.length === 0) return;

    try {
      await bulkUpdatePatientAccountStatus(selectedPatients, newStatus, tokens);
      setSelectedPatients([]);
      loadPatients();
    } catch (error) {
      console.error('Error bulk updating status:', error);
    }
  };

  const handleResetPassword = async (patientId) => {
    if (!window.confirm('Bạn có chắc chắn muốn reset mật khẩu cho tài khoản này?')) {
      return;
    }

    try {
      await resetPatientPassword(patientId, tokens);
      alert('Mật khẩu đã được reset thành công!');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Có lỗi xảy ra khi reset mật khẩu!');
    }
  };

  const handleSelectPatient = (patientId) => {
    setSelectedPatients(prev =>
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === patients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(patients.map(patient => patient.id));
    }
  };

  return (
    <div className="spm-container">
      <div className="spm-header">
        <h2>Quản lý tài khoản Bệnh nhân</h2>
        <div className="spm-actions">
          {selectedPatients.length > 0 && (
            <div className="spm-bulk-actions">
              <button
                className="spm-btn spm-btn-success"
                onClick={() => handleBulkStatusChange(true)}
              >
                Kích hoạt ({selectedPatients.length})
              </button>
              <button
                className="spm-btn spm-btn-danger"
                onClick={() => handleBulkStatusChange(false)}
              >
                Vô hiệu hóa ({selectedPatients.length})
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="spm-filters">
        <div className="spm-search">
          <input
            type="text"
            placeholder="Tìm kiếm theo email, tên..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="spm-input"
          />
        </div>
        <div className="spm-filter">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="spm-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Bị vô hiệu hóa</option>
          </select>
        </div>
      </div>

      <div className="spm-table-container">
        <table className="spm-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedPatients.length === patients.length && patients.length > 0}
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
                <td colSpan="7" className="spm-loading">Đang tải...</td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan="7" className="spm-empty">Không có dữ liệu</td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedPatients.includes(patient.id)}
                      onChange={() => handleSelectPatient(patient.id)}
                    />
                  </td>
                  <td>{patient.email}</td>
                  <td>{patient.name || patient.fullName || (patient.firstName || '') + ' ' + (patient.lastName || '')}</td>
                  <td>
                    <div className="spm-roles">
                      {patient.roles?.map((role, index) => (
                        <span key={index} className="spm-role-tag">
                          {typeof role === 'string' ? role : role.name}
                        </span>
                      ))}
                      {patient.role && !patient.roles && (
                        <span className="spm-role-tag">
                          {patient.role}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`spm-status ${patient.isActive ? 'active' : 'inactive'}`}>
                      {patient.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </span>
                  </td>
                  <td>{patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                  <td>
                    <div className="spm-actions-cell">
                      <button
                        className={`spm-btn ${patient.isActive ? 'spm-btn-warning' : 'spm-btn-success'}`}
                        onClick={() => handleStatusChange(patient.id, !patient.isActive)}
                      >
                        {patient.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      </button>
                      <button
                        className="spm-btn spm-btn-secondary"
                        onClick={() => handleResetPassword(patient.id)}
                      >
                        Reset mật khẩu
                      </button>
                      <button
                        className="spm-btn spm-btn-success"
                        onClick={() => {
                          setEditPreset({
                            email: patient.email,
                            fullName: patient.name || patient.fullName || '',
                            phone: patient.phone || '',
                            id: patient.id,
                          })
                          setEditOpen(true)
                        }}
                      >
                        Chỉnh sửa bệnh nhân
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="spm-pagination">
        <div className="spm-pagination-info">
          Hiển thị {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)}
          trong tổng số {pagination.total} bản ghi
        </div>
        <div className="spm-pagination-controls">
          <button
            className="spm-btn spm-btn-secondary"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Trước
          </button>
          <span className="spm-page-info">
            Trang {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
          </span>
          <button
            className="spm-btn spm-btn-secondary"
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Sau
          </button>
        </div>
      </div>

      {editOpen && (
        <EditPatientModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          preset={editPreset}
        />
      )}
    </div>
  );
}

export default StaffPatientManagement;
