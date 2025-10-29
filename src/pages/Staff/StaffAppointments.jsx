import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../providers/AuthContext';
import { getRegistrations } from '../../services/staffpatient.api';
import BookAppointmentModal from './BookAppointmentModal';
import './StaffAppointments.css';

function StaffAppointments() {
  const { tokens } = useContext(AuthContext);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    total: 0
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  const loadPaidRegistrations = async () => {
    setLoading(true);
    try {
      // Backend may return multiple payment-related statuses (e.g. 'Paid' and 'Direct_Payment').
      // Some registrations marked as Direct_Payment should also be bookable — fetch the page
      // then filter client-side for the payment statuses we care about.
      const params = {
        keyword: searchKeyword,
        page: pagination.page,
        pageSize: pagination.pageSize,
        // do not pass status here so we can include multiple payment statuses
      };

      const result = await getRegistrations(params, tokens);
      const allItems = result.items || [];
      // Keep registrations that are either Paid or Direct_Payment
      const payableStatuses = new Set(['Paid', 'Direct_Payment']);
      const filtered = allItems.filter(item => payableStatuses.has(item?.status));
      setRegistrations(filtered);
      setPagination(prev => ({ ...prev, total: result.total || 0 }));
    } catch (error) {
      console.error('Error loading paid registrations:', error);
      
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        alert('Lỗi khi tải dữ liệu: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaidRegistrations();
  }, [searchKeyword, pagination.page, tokens]);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'Pending': 'Chờ xử lý',
      'Approved': 'Đã duyệt',
      'Paid': 'Đã thanh toán',
      'Completed': 'Hoàn thành',
      'Cancelled': 'Đã hủy',
      'Invalid': 'Không hợp lệ',
      'Direct_Payment': 'Thanh Toán Trực Tiếp'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const statusClassMap = {
      'Pending': 'pending',
      'Approved': 'approved',
      'Paid': 'confirmed',
      'Completed': 'completed',
      'Cancelled': 'cancelled',
      'Invalid': 'rejected',
      'Direct_Payment': 'direct_payment'
    };
    return statusClassMap[status] || 'pending';
  };

  const handleBookAppointment = (registration) => {
    setSelectedRegistration(registration);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedRegistration(null);
  };

  const handleAppointmentSuccess = () => {
    loadPaidRegistrations(); // Reload data after successful booking
  };

  return (
    <div className="sa-container">
      <div className="sa-header">
        <h2>Đặt Lịch Khám</h2>
        <p className="sa-subtitle">Danh sách người đã thanh toán từ màn Đăng ký khám</p>
      </div>

      <div className="sa-filters">
        <div className="sa-search">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="sa-input"
          />
        </div>
      </div>

      <div className="sa-table-container">
        <table className="sa-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>SĐT</th>
              {/* <th>Ngày đăng ký</th> */}
              <th>Trạng thái</th>
              <th>Ghi chú</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="sa-loading">Đang tải...</td>
              </tr>
            ) : registrations.length === 0 ? (
              <tr>
                <td colSpan="8" className="sa-empty">
                  {searchKeyword ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có đăng ký nào đã thanh toán'}
                </td>
              </tr>
            ) : (
              registrations.map((reg, index) => (
                <tr key={reg.id || index}>
                  <td>{(pagination.page - 1) * pagination.pageSize + index + 1}</td>
                  <td>{reg.fullName || reg.name || 'N/A'}</td>
                  <td>{reg.email || 'N/A'}</td>
                  <td>{reg.phoneNumber || reg.phone || 'N/A'}</td>
                  {/* <td>{formatDateTime(reg.registrationDate || reg.createdAt)}</td> */}
                  <td>
                    <span className={`sa-status ${getStatusClass(reg.status)}`}>
                      {getStatusLabel(reg.status)}
                    </span>
                  </td>
                  <td className="sa-note">{reg.note || '-'}</td>
                  <td>
                    <button 
                      className="sa-btn-book"
                      onClick={() => handleBookAppointment(reg)}
                    >
                      📅 Đặt lịch khám
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="sa-pagination">
        <div className="sa-pagination-info">
          Hiển thị {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)}
          trong tổng số {pagination.total} bản ghi
        </div>
        <div className="sa-pagination-controls">
          <button
            className="sa-btn sa-btn-secondary"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Trước
          </button>
          <span className="sa-page-info">
            Trang {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize) || 1}
          </span>
          <button
            className="sa-btn sa-btn-secondary"
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Sau
          </button>
        </div>
      </div>

      <div className="sa-summary">
        <div className="sa-summary-item">
          <span className="sa-summary-label">Tổng số đăng ký đã thanh toán:</span>
          <span className="sa-summary-value">{pagination.total}</span>
        </div>
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        open={modalOpen}
        onClose={handleModalClose}
        registration={selectedRegistration}
        onSuccess={handleAppointmentSuccess}
      />
    </div>
  );
}

export default StaffAppointments;
