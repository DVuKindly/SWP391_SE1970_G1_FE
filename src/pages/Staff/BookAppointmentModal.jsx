import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../providers/AuthContext';
import { 
  getDoctorsWithSchedules, 
  createAppointment,
  getAppointments
} from '../../services/appointment.api';
import './BookAppointmentModal.css';

function BookAppointmentModal({ open, onClose, registration, onSuccess }) {
  const { tokens } = useContext(AuthContext);
  const [step, setStep] = useState(1); // 1: Chọn bác sĩ, 2: Chọn lịch
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eligiblePatients, setEligiblePatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open && registration) {
      loadDoctors();
    }
  }, [open, registration]);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const result = await getDoctorsWithSchedules(tokens);
      setDoctors(result || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      alert('Lỗi khi tải danh sách bác sĩ: ' + (error.message || 'Unauthorized'));
    } finally {
      setLoading(false);
    }
  };

  const loadEligiblePatients = async () => {
    try {
      const result = await getEligiblePatients(tokens);
      const patients = Array.isArray(result) ? result : [];
      setEligiblePatients(patients);
      
      if (registration && patients.length > 0) {
        const matchedPatient = patients.find(
          p => {
            const match = p.email?.toLowerCase() === registration.email?.toLowerCase() || 
                   p.phoneNumber === registration.phoneNumber ||
                   p.phone === registration.phoneNumber ||
                   p.phoneNumber === registration.phone ||
                   p.phone === registration.phone;
            return match;
          }
        );
        
        if (matchedPatient) {
          setSelectedPatient(matchedPatient);
        } else {
          const nameMatch = patients.find(p => 
            (p.name || p.fullName)?.toLowerCase().includes(registration.fullName?.toLowerCase()) ||
            registration.fullName?.toLowerCase().includes((p.name || p.fullName)?.toLowerCase())
          );
          
          if (nameMatch) {
            setSelectedPatient(nameMatch);
          }
        }
      }
    } catch (error) {
      console.error('Error loading eligible patients:', error);
    }
  };

  const handleSelectDoctor = async (doctor) => {
    setSelectedDoctor(doctor);
    setLoading(true);
    
    try {
      const allAppointments = await getAppointments({}, tokens);
      const appointmentsArray = Array.isArray(allAppointments) ? allAppointments : [];
      
      const selectedDoctorId = doctor.doctorId || doctor.DoctorId || doctor.id || doctor.Id;
      const doctorAppointments = appointmentsArray.filter(apt => {
        const aptDoctorId = apt.doctorId || apt.DoctorId || apt.doctor_id || apt.Doctor_Id;
        return aptDoctorId === selectedDoctorId;
      });
      
      const slots = [];
      
      if (doctor.workPatterns && Array.isArray(doctor.workPatterns)) {
        doctor.workPatterns.forEach(pattern => {
          
          // Nếu pattern có isWorking = true, tạo slots từ startTime/endTime
          if (pattern.isWorking) {
            const start = pattern.startTime || "08:00";
            const end = pattern.endTime || "17:00";
            
            // Tạo date cho tuần sau với dayOfWeek
            const today = new Date();
            let daysUntilNext = pattern.dayOfWeek - today.getDay();
            if (daysUntilNext <= 0) daysUntilNext += 7; // Nếu đã qua thứ đó trong tuần, lấy tuần sau
            
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + daysUntilNext);
            
            // Parse start và end time
            const [startHour, startMin] = start.split(':').map(Number);
            const [endHour, endMin] = end.split(':').map(Number);
            
            // Tạo slots theo giờ (mỗi slot 1 tiếng)
            for (let hour = startHour; hour < endHour; hour++) {
              const slotStart = new Date(nextDate);
              slotStart.setHours(hour, startMin || 0, 0, 0);
              
              const slotEnd = new Date(nextDate);
              slotEnd.setHours(hour + 1, startMin || 0, 0, 0);
              
              // Format local datetime string (YYYY-MM-DDTHH:mm:ss) - không có timezone
              const formatLocalDateTime = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
              };
              
              const isBooked = doctorAppointments.some(apt => {
                const aptStart = new Date(apt.startTime);
                const aptEnd = new Date(apt.endTime);
                
                if (isNaN(aptStart.getTime()) || isNaN(aptEnd.getTime())) {
                  return false;
                }
                
                return (slotStart < aptEnd && slotEnd > aptStart);
              });
              
              // Lưu thời gian dưới dạng local datetime string (không có timezone)
              slots.push({
                startTime: formatLocalDateTime(slotStart),
                endTime: formatLocalDateTime(slotEnd),
                doctorId: doctor.doctorId || doctor.id,
                doctorName: doctor.fullName || doctor.doctorName || doctor.name,
                dayOfWeek: pattern.dayOfWeek,
                dayName: pattern.dayName,
                timeRange: `${start} - ${end}`,
                isBooked: isBooked
              });
            }
          }
          
          if (pattern.availableSlots && Array.isArray(pattern.availableSlots)) {
            pattern.availableSlots.forEach(slot => {
              const slotStart = new Date(slot.startTime);
              const slotEnd = new Date(slot.endTime);
              
              const isBooked = doctorAppointments.some(apt => {
                const aptStart = new Date(apt.startTime);
                const aptEnd = new Date(apt.endTime);
                return (slotStart < aptEnd && slotEnd > aptStart);
              });
              
              slots.push({
                ...slot,
                doctorId: doctor.doctorId || doctor.id,
                doctorName: doctor.fullName || doctor.doctorName || doctor.name,
                dayOfWeek: pattern.dayOfWeek,
                dayName: pattern.dayName,
                isBooked: isBooked || slot.isBooked || false
              });
            });
          }
        });
      }
      
      const availableOnlySlots = slots.filter(slot => !slot.isBooked);
      
      setAvailableSlots(availableOnlySlots);
      setStep(2);
    } catch (error) {
      console.error('Error loading appointments:', error);
      alert('Không thể tải thông tin lịch hẹn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
  };

  const handleConfirm = async () => {
    if (!selectedDoctor || !selectedSlot) {
      alert('Vui lòng chọn bác sĩ và lịch khám');
      return;
    }

    setLoading(true);
    try {
      const registrationRequestId = registration?.registrationRequestId || registration?.id;
      const doctorId = selectedDoctor.doctorId || 
                      selectedDoctor.id || 
                      selectedDoctor.Id || 
                      selectedDoctor.DoctorId;
      
      if (!registrationRequestId) {
        alert('Không tìm thấy ID đăng ký. Vui lòng kiểm tra lại.');
        setLoading(false);
        return;
      }
      
      if (!doctorId) {
        alert('Không tìm thấy ID bác sĩ. Vui lòng kiểm tra lại.');
        setLoading(false);
        return;
      }
      
      const payload = {
        registrationRequestId: registrationRequestId,
        doctorId: doctorId,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        note: note || `Đặt lịch từ đăng ký ${registration?.fullName || registration?.email || ''}`
      };
      
      const result = await createAppointment(payload, tokens);
      
      alert('Đặt lịch khám thành công!');
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Lỗi khi đặt lịch khám';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = JSON.stringify(error.response.data.errors);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
    setNote('');
    onClose();
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getDayOfWeekLabel = (dayOfWeek) => {
    const days = {
      0: 'Chủ nhật',
      1: 'Thứ 2',
      2: 'Thứ 3',
      3: 'Thứ 4',
      4: 'Thứ 5',
      5: 'Thứ 6',
      6: 'Thứ 7'
    };
    return days[dayOfWeek] || `Thứ ${dayOfWeek + 1}`;
  };

  if (!open) return null;

  return (
    <div className="bam-overlay">
      <div className="bam-modal">
        <div className="bam-header">
          <h2>Đặt lịch khám cho {registration?.fullName || registration?.name}</h2>
          <button className="bam-close" onClick={handleClose}>×</button>
        </div>

        <div className="bam-body">
          {/* Hiển thị thông tin từ registration */}
          {registration && (
            <div className="bam-patient-info">
              <div className="bam-patient-label">Bệnh nhân:</div>
              <div className="bam-patient-details">
                <span className="bam-patient-name">
                  {registration.fullName || registration.name}
                </span>
                <span className="bam-patient-contact">
                  {registration.email} • {registration.phoneNumber || registration.phone}
                </span>
              </div>
            </div>
          )}

          {/* Step 1: Chọn bác sĩ */}
          {step === 1 && (
            <div className="bam-section">
              <h3 className="bam-step-title">Bước 1: Chọn bác sĩ</h3>
              {loading ? (
                <div className="bam-loading">Đang tải danh sách bác sĩ...</div>
              ) : doctors.length === 0 ? (
                <div className="bam-empty">Không có bác sĩ nào khả dụng</div>
              ) : (
                <div className="bam-doctors-grid">
                  {doctors.map(doctor => (
                    <div 
                      key={doctor.doctorId || doctor.id}
                      className="bam-doctor-card"
                      onClick={() => handleSelectDoctor(doctor)}
                    >
                      <div className="bam-doctor-avatar">👨‍⚕️</div>
                      <div className="bam-doctor-info">
                        <div className="bam-doctor-name">{doctor.fullName || doctor.doctorName || doctor.name}</div>
                        <div className="bam-doctor-specialty">{doctor.departmentName || doctor.specialty || doctor.department || 'Bác sĩ'}</div>
                        <div className="bam-doctor-slots">
                          {doctor.workPatterns?.filter(p => p.isWorking).length || 0} ngày làm việc
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Chọn lịch */}
          {step === 2 && (
            <div className="bam-section">
              <div className="bam-step-header">
                <button 
                  className="bam-btn-back"
                  onClick={() => setStep(1)}
                >
                  ← Quay lại
                </button>
                <h3 className="bam-step-title">
                  Bước 2: Chọn lịch khám với {selectedDoctor?.fullName || selectedDoctor?.doctorName || selectedDoctor?.name}
                </h3>
              </div>

              {availableSlots.length === 0 ? (
                <div className="bam-empty">Không còn lịch trống. Vui lòng chọn bác sĩ khác.</div>
              ) : (
                <div className="bam-slots-container">
                  {availableSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`bam-slot-card ${
                        selectedSlot === slot ? 'selected' : ''
                      }`}
                      onClick={() => handleSelectSlot(slot)}
                      title="Click để chọn lịch này"
                    >
                      <div className="bam-slot-date">
                        {formatDate(slot.startTime)} - {getDayOfWeekLabel(slot.dayOfWeek)}
                      </div>
                      <div className="bam-slot-time">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Note */}
              <div className="bam-note-section">
                <label className="bam-label">Ghi chú:</label>
                <textarea
                  className="bam-textarea"
                  placeholder="Nhập ghi chú cho lịch khám..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bam-footer">
          <button 
            className="bam-btn bam-btn-cancel" 
            onClick={handleClose}
            disabled={loading}
          >
            Hủy
          </button>
          {step === 2 && (
            <button 
              className="bam-btn bam-btn-confirm" 
              onClick={handleConfirm}
              disabled={loading || !selectedSlot}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookAppointmentModal;
