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
      // Không cần load eligible patients, dùng trực tiếp registration ID
      console.log('Registration for appointment:', registration);
    }
  }, [open, registration]);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      console.log('Loading doctors with tokens:', tokens ? 'Available' : 'Missing');
      const result = await getDoctorsWithSchedules(tokens);
      console.log('Doctors with schedules:', result);
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
      console.log('Loading eligible patients with tokens:', tokens ? 'Available' : 'Missing');
      const result = await getEligiblePatients(tokens);
      console.log('Eligible patients response:', result);
      
      const patients = Array.isArray(result) ? result : [];
      setEligiblePatients(patients);
      
      // Tự động chọn patient dựa trên email/phone từ registration
      if (registration && patients.length > 0) {
        console.log('Looking for patient matching registration:', {
          email: registration.email,
          phone: registration.phoneNumber || registration.phone
        });
        
        const matchedPatient = patients.find(
          p => {
            const match = p.email?.toLowerCase() === registration.email?.toLowerCase() || 
                   p.phoneNumber === registration.phoneNumber ||
                   p.phone === registration.phoneNumber ||
                   p.phoneNumber === registration.phone ||
                   p.phone === registration.phone;
            if (match) {
              console.log('Found matching patient:', p);
            }
            return match;
          }
        );
        
        if (matchedPatient) {
          console.log('✅ Auto-selected patient:', matchedPatient);
          setSelectedPatient(matchedPatient);
        } else {
          console.warn('❌ No matching patient found');
          console.warn('Registration data:', registration);
          console.warn('Available patients:', patients.map(p => ({ 
            id: p.patientId || p.id, 
            name: p.fullName || p.name,
            email: p.email, 
            phone: p.phoneNumber || p.phone 
          })));
          
          // Thử tìm bằng tên
          const nameMatch = patients.find(p => 
            (p.name || p.fullName)?.toLowerCase().includes(registration.fullName?.toLowerCase()) ||
            registration.fullName?.toLowerCase().includes((p.name || p.fullName)?.toLowerCase())
          );
          
          if (nameMatch) {
            console.log('✅ Found patient by name match:', nameMatch);
            setSelectedPatient(nameMatch);
          }
        }
      }
    } catch (error) {
      console.error('Error loading eligible patients:', error);
      console.error('Error details:', error.response || error.message);
    }
  };

  const handleSelectDoctor = async (doctor) => {
    setSelectedDoctor(doctor);
    setLoading(true);
    
    try {
      // Load tất cả appointments hiện có
      const allAppointments = await getAppointments({}, tokens);
      console.log('=== DEBUG APPOINTMENTS ===');
      console.log('All appointments:', allAppointments);
      console.log('All appointments array?', Array.isArray(allAppointments));
      console.log('Number of appointments:', allAppointments?.length);
      
      // Log first appointment để xem structure
      if (allAppointments?.length > 0) {
        console.log('First appointment structure:', allAppointments[0]);
        console.log('Available fields:', Object.keys(allAppointments[0]));
      }
      
      // Đảm bảo allAppointments là array
      const appointmentsArray = Array.isArray(allAppointments) ? allAppointments : [];
      
      // Lọc appointments của doctor này
      const selectedDoctorId = doctor.doctorId || doctor.DoctorId || doctor.id || doctor.Id;
      console.log('Selected doctor ID:', selectedDoctorId);
      
      const doctorAppointments = appointmentsArray.filter(apt => {
        const aptDoctorId = apt.doctorId || apt.DoctorId || apt.doctor_id || apt.Doctor_Id;
        console.log('Comparing:', aptDoctorId, '===', selectedDoctorId, '?', aptDoctorId === selectedDoctorId);
        return aptDoctorId === selectedDoctorId;
      });
      console.log('Doctor appointments:', doctorAppointments);
      console.log('Number of doctor appointments:', doctorAppointments.length);
      
      // Parse work patterns to available slots
      const slots = [];
      console.log('Doctor selected:', doctor);
      console.log('Work patterns:', doctor.workPatterns);
      
      if (doctor.workPatterns && Array.isArray(doctor.workPatterns)) {
        doctor.workPatterns.forEach(pattern => {
          console.log('Processing pattern:', pattern);
          
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
              
              // Kiểm tra xem slot này đã được đặt chưa
              const isBooked = doctorAppointments.some(apt => {
                const aptStart = new Date(apt.startTime);
                const aptEnd = new Date(apt.endTime);
                
                // Check overlap: slot bị book nếu có appointment trùng thời gian
                const hasOverlap = (slotStart < aptEnd && slotEnd > aptStart);
                
                if (hasOverlap) {
                  console.log('🔴 OVERLAP DETECTED:', {
                    slot: { start: slotStart.toISOString(), end: slotEnd.toISOString() },
                    appointment: { start: aptStart.toISOString(), end: aptEnd.toISOString() }
                  });
                }
                
                return hasOverlap;
              });
              
              slots.push({
                startTime: slotStart.toISOString(),
                endTime: slotEnd.toISOString(),
                doctorId: doctor.doctorId || doctor.id,
                doctorName: doctor.fullName || doctor.doctorName || doctor.name,
                dayOfWeek: pattern.dayOfWeek,
                dayName: pattern.dayName,
                timeRange: `${start} - ${end}`,
                isBooked: isBooked
              });
            }
          }
          
          // Nếu có availableSlots trong pattern (cấu trúc cũ)
          if (pattern.availableSlots && Array.isArray(pattern.availableSlots)) {
            pattern.availableSlots.forEach(slot => {
              // Check nếu slot đã được đặt
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
      
      console.log('Generated slots:', slots);
      console.log('Total slots:', slots.length);
      console.log('Booked slots:', slots.filter(s => s.isBooked).length);
      
      setAvailableSlots(slots);
      setStep(2);
    } catch (error) {
      console.error('Error loading appointments:', error);
      alert('Không thể tải thông tin lịch hẹn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = (slot) => {
    if (slot.isBooked) {
      alert('⚠️ Lịch này đã được đặt. Vui lòng chọn lịch khác.');
      return;
    }
    setSelectedSlot(slot);
  };

  const handleConfirm = async () => {
    console.log('=== CONFIRM APPOINTMENT ===');
    console.log('Registration:', registration);
    console.log('Selected Doctor:', selectedDoctor);
    console.log('Selected Slot:', selectedSlot);
    
    if (!selectedDoctor || !selectedSlot) {
      alert('Vui lòng chọn bác sĩ và lịch khám');
      return;
    }

    setLoading(true);
    try {
      // Dùng registrationRequestId từ registration
      const registrationRequestId = registration?.registrationRequestId || registration?.id;
      
      const doctorId = selectedDoctor.doctorId || 
                      selectedDoctor.id || 
                      selectedDoctor.Id || 
                      selectedDoctor.DoctorId;
      
      console.log('Using registrationRequestId:', registrationRequestId);
      console.log('Doctor ID:', doctorId);
      
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
        registrationRequestId: registrationRequestId,  // Đổi từ patientId sang registrationRequestId
        doctorId: doctorId,
        // Convert to local datetime string without timezone (YYYY-MM-DDTHH:mm:ss)
        startTime: new Date(selectedSlot.startTime).toISOString().slice(0, 19),
        endTime: new Date(selectedSlot.endTime).toISOString().slice(0, 19),
        note: note || `Đặt lịch từ đăng ký ${registration?.fullName || registration?.email || ''}`
      };

      console.log('Creating appointment with payload:', payload);
      
      const result = await createAppointment(payload, tokens);
      console.log('Appointment created successfully:', result);
      
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
                <div className="bam-empty">Bác sĩ này chưa có lịch làm việc</div>
              ) : (
                <div className="bam-slots-container">
                  {availableSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`bam-slot-card ${slot.isBooked ? 'booked' : ''} ${
                        selectedSlot === slot ? 'selected' : ''
                      }`}
                      onClick={() => !slot.isBooked && handleSelectSlot(slot)}
                      style={slot.isBooked ? { pointerEvents: 'none' } : {}}
                    >
                      <div className="bam-slot-date">
                        {formatDate(slot.startTime)} - {getDayOfWeekLabel(slot.dayOfWeek)}
                      </div>
                      <div className="bam-slot-time">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                      {slot.isBooked && (
                        <div className="bam-slot-status">Đã đặt</div>
                      )}
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
