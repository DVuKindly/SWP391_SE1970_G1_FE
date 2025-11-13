import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../providers/AuthContext';

function PatientAppointments() {
  const { tokens } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [tokens]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patient/appointments', {
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data || []);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetail = async (appointmentId) => {
    try {
      const res = await fetch(`/api/patient/appointment-detail/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setSelectedAppointment(data.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error loading appointment detail:', error);
      alert('Không thể tải chi tiết lịch hẹn');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': { class: 'patient-status-pending', text: 'Chờ xác nhận' },
      'Confirmed': { class: 'patient-status-confirmed', text: 'Đã xác nhận' },
      'Completed': { class: 'patient-status-completed', text: 'Hoàn thành' },
      'Cancelled': { class: 'patient-status-cancelled', text: 'Đã hủy' },
    };
    const statusInfo = statusMap[status] || { class: 'patient-status-pending', text: status };
    return <span className={`patient-status ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <div>Đang tải...</div>
      </div>
    );
  }

  return (
    <>
      <div className="patient-card">
        <h3>Danh sách lịch hẹn</h3>
        
        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
            <div>Chưa có lịch hẹn nào</div>
          </div>
        ) : (
          <table className="patient-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Ngày hẹn</th>
                <th>Giờ</th>
                <th>Bác sĩ</th>
                <th>Chuyên khoa</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt, idx) => (
                <tr key={apt.appointmentId || idx}>
                  <td>{idx + 1}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td>{apt.timeSlot || 'N/A'}</td>
                  <td style={{ fontWeight: 500 }}>{apt.doctorName || 'N/A'}</td>
                  <td>{apt.departmentName || 'N/A'}</td>
                  <td>{getStatusBadge(apt.status)}</td>
                  <td>
                    <button
                      className="patient-btn patient-btn-primary"
                      onClick={() => viewDetail(apt.appointmentId)}
                      style={{ fontSize: 13 }}
                    >
                      👁️ Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedAppointment && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 12,
              maxWidth: 600,
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: 24, borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Chi tiết lịch hẹn</h3>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 24,
                    cursor: 'pointer',
                    color: '#6b7280',
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Ngày hẹn</div>
                  <div style={{ fontWeight: 500 }}>
                    {selectedAppointment.appointmentDate
                      ? new Date(selectedAppointment.appointmentDate).toLocaleString('vi-VN')
                      : 'N/A'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Bác sĩ</div>
                  <div style={{ fontWeight: 500 }}>{selectedAppointment.doctorName || 'N/A'}</div>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Chuyên khoa</div>
                  <div style={{ fontWeight: 500 }}>{selectedAppointment.departmentName || 'N/A'}</div>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Trạng thái</div>
                  <div>{getStatusBadge(selectedAppointment.status)}</div>
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Ghi chú</div>
                    <div style={{ fontWeight: 500 }}>{selectedAppointment.notes}</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: 24, borderTop: '1px solid #e5e7eb', textAlign: 'right' }}>
              <button className="patient-btn patient-btn-secondary" onClick={() => setShowModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PatientAppointments;
