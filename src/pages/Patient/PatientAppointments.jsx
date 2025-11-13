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
      // Debug: log raw response so developer can see actual field names
      console.debug('PatientAppointments - raw response:', data);

      if (data && data.success) {
        // Support several possible response shapes from backend
        let rawList = [];
        if (Array.isArray(data.data)) rawList = data.data;
        else if (Array.isArray(data)) rawList = data;
        else if (data.data && Array.isArray(data.data.appointments)) rawList = data.data.appointments;
        else if (Array.isArray(data.appointments)) rawList = data.appointments;
        else if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
          // sometimes backend returns { data: { items: [...] } }
          rawList = Array.isArray(data.data.items) ? data.data.items : [];
        }

        // Map fields to the names used in UI to avoid N/A when backend uses different property names
        const mapped = (rawList || []).map((item) => {
          const appointmentId = item.appointmentId || item.id || item.appointment_id || item.appointmentID || null;
          // possible raw date/time fields
          const rawDateField = item.appointmentDate || item.date || item.scheduledDate || item.startDate || item.scheduledDateTime || item.start_time || item.startTime || null;
          const rawTimeField = item.timeSlot || item.time || item.timeslot || item.scheduledTime || item.slot || null;

          let appointmentDate = rawDateField || null;
          let timeSlot = rawTimeField || null;

          // If backend returned a single ISO datetime in either field, split into date + time
          const isoCandidate = appointmentDate || timeSlot;
          if (isoCandidate && typeof isoCandidate === 'string' && isoCandidate.includes('T')) {
            const parts = isoCandidate.split('T');
            // keep full ISO for date so Date parsing works
            appointmentDate = parts[0];
            // take only HH:MM from time part
            const timePart = parts[1] || '';
            const hhmm = timePart.split(':').slice(0, 2).join(':');
            timeSlot = hhmm;
          }

          // If appointmentDate is a date-only string without timezone, keep it as-is (Date can parse it)
          // Fallbacks for doctor and department names
          const doctorName = item.doctorName || (item.doctor && (item.doctor.fullName || item.doctor.name)) || item.doctor_name || null;
          const departmentName = item.departmentName || (item.department && (item.department.name || item.departmentName)) || item.department_name || item.specialty || item.speciality || null;

          return {
            appointmentId,
            appointmentDate,
            timeSlot,
            doctorName,
            departmentName,
            status: item.status || item.state || item.statusName || item.status_name || null,
            notes: item.notes || item.note || null,
          };
        });

        console.debug('PatientAppointments - mapped appointments:', mapped);
        setAppointments(mapped);
      } else if (data && !data.success) {
        // backend returned success:false with message
        console.warn('PatientAppointments - backend returned success:false', data);
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
      console.debug('PatientAppointments - detail raw response:', data);
      if (data && data.success) {
        const raw = data.data || data;

        // similar parsing as list mapping: find raw date/time fields and split ISO if needed
        const rawDateField = raw.appointmentDate || raw.date || raw.scheduledDate || raw.startDate || raw.scheduledDateTime || raw.start_time || raw.startTime || raw.appointmentDateTime || raw.dateTime || null;
        const rawTimeField = raw.timeSlot || raw.time || raw.timeslot || raw.scheduledTime || raw.slot || null;

        let appointmentDate = rawDateField || null;
        let timeSlot = rawTimeField || null;
        const isoCandidate = appointmentDate || timeSlot;
        if (isoCandidate && typeof isoCandidate === 'string' && isoCandidate.includes('T')) {
          const parts = isoCandidate.split('T');
          appointmentDate = parts[0];
          const timePart = parts[1] || '';
          const hhmm = timePart.split(':').slice(0, 2).join(':');
          timeSlot = hhmm;
        }

        const mapped = {
          appointmentId: raw.appointmentId || raw.id || raw.appointment_id || null,
          appointmentDate,
          timeSlot,
          doctorName: raw.doctorName || (raw.doctor && (raw.doctor.fullName || raw.doctor.name)) || raw.doctor_name || null,
          departmentName: raw.departmentName || (raw.department && (raw.department.name || raw.departmentName)) || raw.department_name || raw.specialty || raw.speciality || null,
          status: raw.status || raw.state || raw.statusName || null,
          notes: raw.notes || raw.note || null,
        };
        setSelectedAppointment(mapped);
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
        
        {/* hide department column if backend doesn't provide it */}
        {/** compute presence of department column */}
        
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
                {appointments.some(a => a.departmentName) && <th>Chuyên khoa</th>}
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
                  {appointments.some(a => a.departmentName) && <td>{apt.departmentName || ''}</td>}
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

                {selectedAppointment.departmentName && (
                  <div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Chuyên khoa</div>
                    <div style={{ fontWeight: 500 }}>{selectedAppointment.departmentName}</div>
                  </div>
                )}

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
