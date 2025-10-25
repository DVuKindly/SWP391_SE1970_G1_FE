import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../providers/AuthContext';
import { getAppointments } from '../../services/appointment.api';
import './StaffBookedAppointments.css';

function StaffBookedAppointments() {
  const { tokens } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadAppointments = async () => {
    setLoading(true);
    try {
      console.log('=== LOADING APPOINTMENTS ===');
      console.log('Tokens:', tokens);
      console.log('Status filter:', statusFilter);
      
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const result = await getAppointments(params, tokens);
      console.log('Appointments result:', result);
      
      setAppointments(result || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  // Filter appointments by search keyword
  const filteredAppointments = appointments.filter(app => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
      app.patientName?.toLowerCase().includes(keyword) ||
      app.doctorName?.toLowerCase().includes(keyword) ||
      app.examName?.toLowerCase().includes(keyword) ||
      app.transactionCode?.toLowerCase().includes(keyword)
    );
  });

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
      'Pending': 'Chờ xác nhận',
      'Approved': 'Đã duyệt',
      'Confirmed': 'Đã xác nhận',
      'Rejected': 'Từ chối',
      'Cancelled': 'Đã hủy',
      'Completed': 'Hoàn thành'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const statusClassMap = {
      'Pending': 'pending',
      'Approved': 'approved',
      'Confirmed': 'confirmed',
      'Rejected': 'rejected',
      'Cancelled': 'cancelled',
      'Completed': 'completed'
    };
    return statusClassMap[status] || 'pending';
  };

  return (
    <div className="sba-container">
      <div className="sba-header">
        <h2>Lịch hẹn đã đặt</h2>
        <p className="sba-subtitle">Danh sách các lịch hẹn khám bệnh đã được đặt</p>
      </div>

      <div className="sba-filters">
        <div className="sba-search">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân, bác sĩ, mã giao dịch..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="sba-input"
          />
        </div>
        <div className="sba-filter">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="sba-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Pending">Chờ xác nhận</option>
            <option value="Confirmed">Đã xác nhận</option>
            <option value="Approved">Đã duyệt</option>
            <option value="Completed">Hoàn thành</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="sba-stats">
        <div className="sba-stat-card">
          <div className="sba-stat-icon">📅</div>
          <div className="sba-stat-info">
            <div className="sba-stat-value">{filteredAppointments.length}</div>
            <div className="sba-stat-label">Tổng lịch hẹn</div>
          </div>
        </div>
        <div className="sba-stat-card pending">
          <div className="sba-stat-icon">⏳</div>
          <div className="sba-stat-info">
            <div className="sba-stat-value">
              {filteredAppointments.filter(a => a.status === 'Pending').length}
            </div>
            <div className="sba-stat-label">Chờ xác nhận</div>
          </div>
        </div>
        <div className="sba-stat-card confirmed">
          <div className="sba-stat-icon">✅</div>
          <div className="sba-stat-info">
            <div className="sba-stat-value">
              {filteredAppointments.filter(a => a.status === 'Confirmed' || a.status === 'Approved').length}
            </div>
            <div className="sba-stat-label">Đã xác nhận</div>
          </div>
        </div>
        <div className="sba-stat-card completed">
          <div className="sba-stat-icon">🎉</div>
          <div className="sba-stat-info">
            <div className="sba-stat-value">
              {filteredAppointments.filter(a => a.status === 'Completed').length}
            </div>
            <div className="sba-stat-label">Hoàn thành</div>
          </div>
        </div>
      </div>

      <div className="sba-table-container">
        <table className="sba-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Mã lịch hẹn</th>
              <th>Bệnh nhân</th>
              <th>Bác sĩ</th>
              <th>Loại khám</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Thanh toán</th>
              <th>Phí</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="sba-loading">Đang tải...</td>
              </tr>
            ) : filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="10" className="sba-empty">
                  {searchKeyword ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có lịch hẹn nào'}
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appointment, index) => (
                <tr key={appointment.appointmentId}>
                  <td>{index + 1}</td>
                  <td className="sba-id">#{appointment.appointmentId}</td>
                  <td className="sba-name">{appointment.patientName}</td>
                  <td className="sba-name">{appointment.doctorName}</td>
                  <td>{appointment.examName}</td>
                  <td>
                    <div className="sba-datetime">
                      <div className="sba-date">{formatDateTime(appointment.startTime).split(',')[0]}</div>
                      <div className="sba-time">
                        {new Date(appointment.startTime).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false 
                        })}
                        {' - '}
                        {new Date(appointment.endTime).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false 
                        })}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`sba-status ${getStatusClass(appointment.status)}`}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </td>
                  <td>
                    <span className={`sba-payment ${appointment.isPaid ? 'paid' : 'unpaid'}`}>
                      {appointment.isPaid ? '✓ Đã thanh toán' : '✗ Chưa thanh toán'}
                    </span>
                  </td>
                  <td className="sba-fee">
                    {appointment.totalFee ? 
                      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(appointment.totalFee) 
                      : 'N/A'
                    }
                  </td>
                  <td className="sba-note">{appointment.note || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StaffBookedAppointments;
