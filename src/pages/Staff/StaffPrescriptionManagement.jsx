import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../providers/AuthContext'
import {
  getExaminedPatients,
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  sendPrescriptionEmail
} from '../../services/prescription.api'
import './StaffPrescriptionManagement.css'

function StaffPrescriptionManagement() {
  const { tokens, user } = useContext(AuthContext)
  
  // State management
  const [examinedPatients, setExaminedPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: '',
    notes: '',
    medications: [{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
  })
  const [saving, setSaving] = useState(false)
  const [myPrescriptions, setMyPrescriptions] = useState([])
  const [showMyPrescriptions, setShowMyPrescriptions] = useState(false)
  const [viewingPrescription, setViewingPrescription] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Load examined patients
  const loadExaminedPatients = async () => {
    setLoading(true)
    try {
      const data = await getExaminedPatients(keyword.trim(), tokens)
      setExaminedPatients(data)
    } catch (e) {
      console.error('Error loading examined patients:', e)
      const errorMsg = e?.response?.data?.message || e?.message || 'Không thể tải danh sách bệnh nhân đã khám'
      alert(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Load my prescriptions
  const loadMyPrescriptions = async () => {
    try {
      const staffId = user?.staffId || user?.id
      const data = await getPrescriptions({ doctorId: staffId }, tokens)
      setMyPrescriptions(data)
    } catch (e) {
      console.error('Error loading prescriptions:', e)
      const errorMsg = e?.response?.data?.message || e?.message
      if (errorMsg) alert(errorMsg)
    }
  }

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => loadExaminedPatients(), 500)
    return () => clearTimeout(timer)
  }, [keyword])

  // Initial load
  useEffect(() => {
    loadExaminedPatients()
    loadMyPrescriptions()
  }, [])

  // Open prescription modal
  const openPrescriptionModal = (patient) => {
    setSelectedPatient(patient)
    setShowPrescriptionModal(true)
    setPrescriptionData({
      diagnosis: '',
      notes: '',
      medications: [{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    })
  }

  // Add medication row
  const addMedication = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: [...prev.medications, { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }))
  }

  // Remove medication row
  const removeMedication = (index) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }))
  }

  // Update medication field
  const updateMedication = (index, field, value) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }))
  }

  // Save prescription
  const handleSavePrescription = async () => {
    if (!selectedPatient) return

    // Validation
    if (!prescriptionData.diagnosis.trim()) {
      alert('Vui lòng nhập chẩn đoán')
      return
    }

    const validMedications = prescriptionData.medications.filter(m => m.medicineName.trim())
    if (validMedications.length === 0) {
      alert('Vui lòng thêm ít nhất 1 loại thuốc')
      return
    }

    setSaving(true)
    try {
      const staffId = user?.staffId || user?.id
      const appointmentId = selectedPatient.AppointmentId || selectedPatient.appointmentId
      
      if (!appointmentId) {
        alert('Không tìm thấy thông tin cuộc hẹn')
        setSaving(false)
        return
      }

      const payload = {
        appointmentId: appointmentId,
        diagnosis: prescriptionData.diagnosis,
        note: prescriptionData.notes,
        medicines: validMedications.map(med => ({
          medicineName: med.medicineName,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instruction: med.instructions
        }))
      }

      const result = await createPrescription(payload, staffId, tokens)
      
      if (result?.success || result?.data) {
        const message = result?.message || result?.data?.message || 'Kê đơn thuốc thành công!'
        alert(message)
        setShowPrescriptionModal(false)
        setSelectedPatient(null)
        loadExaminedPatients()
        loadMyPrescriptions()
      } else {
        const errorMsg = result?.message || 'Có lỗi xảy ra khi kê đơn thuốc'
        alert(errorMsg)
      }
    } catch (e) {
      console.error('Error creating prescription:', e)
      const errorMsg = e?.response?.data?.message || e?.message || 'Không thể tạo đơn thuốc'
      alert(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  // View prescription details
  const viewPrescriptionDetail = async (prescriptionId) => {
    try {
      const detail = await getPrescriptionById(prescriptionId, tokens)
      setViewingPrescription(detail)
      setShowDetailModal(true)
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || 'Không thể xem chi tiết đơn thuốc'
      alert(errorMsg)
    }
  }

  // Send prescription email
  const handleSendEmail = async (prescriptionId) => {
    if (!window.confirm('Gửi email đơn thuốc cho bệnh nhân?')) return
    try {
      const result = await sendPrescriptionEmail(prescriptionId, tokens)
      const message = result?.message || result?.data?.message || 'Đã gửi email thành công!'
      alert(message)
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || 'Không thể gửi email'
      alert(errorMsg)
    }
  }

  return (
    <div className="spr-container">
      <div className="spr-header">
        <h2>Kê đơn thuốc</h2>
        <div className="spr-tabs">
          <button 
            className={`spr-tab-btn ${!showMyPrescriptions ? 'active' : ''}`}
            onClick={() => setShowMyPrescriptions(false)}
          >
            Bệnh nhân đã khám ({examinedPatients.length})
          </button>
          <button 
            className={`spr-tab-btn ${showMyPrescriptions ? 'active' : ''}`}
            onClick={() => setShowMyPrescriptions(true)}
          >
            Đơn thuốc đã kê ({myPrescriptions.length})
          </button>
        </div>
      </div>

      {!showMyPrescriptions ? (
        <>
          {/* Examined Patients Section */}
          <div className="spr-filters">
            <div className="spr-search">
              <input
                className="spr-input"
                placeholder="🔍 Tìm kiếm bệnh nhân theo tên, email, số điện thoại..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>

          <div className="spr-table-container">
            <table className="spr-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>HỌ TÊN</th>
                  <th>EMAIL</th>
                  <th>GÓI KHÁM</th>
                  <th>NGÀY KHÁM</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="spr-loading" colSpan="7">Đang tải...</td></tr>
                ) : examinedPatients.length === 0 ? (
                  <tr><td className="spr-empty" colSpan="7">Chưa có bệnh nhân nào đã khám</td></tr>
                ) : (
                  examinedPatients.map((patient, idx) => {
                    // Backend returns: AppointmentId, FullName, Email, ExamName, ExaminedAt
                    const dateValue = patient.ExaminedAt || patient.examinedAt || patient.ProcessedAt || patient.processedAt;
                    
                    return (
                      <tr key={patient.AppointmentId || patient.appointmentId || idx}>
                        <td>{idx + 1}</td>
                        <td>{patient.FullName || patient.fullName || 'N/A'}</td>
                        <td>{patient.Email || patient.email || 'N/A'}</td>
                        <td>{patient.ExamName || patient.examName || 'N/A'}</td>
                        <td>
                          {dateValue
                            ? new Date(dateValue).toLocaleString('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'N/A'}
                        </td>
                        <td>
                          <span className="spr-status spr-status-examined">
                            ✓ Đã khám
                          </span>
                        </td>
                        <td>
                          <button 
                            className="spr-btn spr-btn-primary"
                            onClick={() => openPrescriptionModal(patient)}
                          >
                            💊 Kê đơn thuốc
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* My Prescriptions Section */}
          <div className="spr-table-container">
            <table className="spr-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>BỆNH NHÂN</th>
                  <th>CHẨN ĐOÁN</th>
                  <th>SỐ LOẠI THUỐC</th>
                  <th>NGÀY KÊ ĐơN</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {myPrescriptions.length === 0 ? (
                  <tr><td className="spr-empty" colSpan="6">Chưa có đơn thuốc nào</td></tr>
                ) : (
                  myPrescriptions.map((prescription, idx) => {
                    const createdDate = prescription.CreatedAtUtc || prescription.createdAtUtc || 
                                       prescription.createdDate || prescription.prescriptionDate;
                    
                    return (
                      <tr key={prescription.PrescriptionId || prescription.prescriptionId || idx}>
                        <td>{idx + 1}</td>
                        <td>{prescription.PatientName || prescription.patientName || 'N/A'}</td>
                        <td>
                          <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {prescription.Diagnosis || prescription.diagnosis || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <span className="spr-badge">
                            {prescription.Medicines?.length || prescription.medicines?.length || 0} loại
                          </span>
                        </td>
                        <td>
                          {createdDate
                            ? new Date(createdDate).toLocaleString('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'N/A'}
                        </td>
                        <td>
                          <div className="spr-actions-cell">
                            <button 
                              className="spr-btn spr-btn-info"
                              onClick={() => viewPrescriptionDetail(prescription.PrescriptionId || prescription.prescriptionId)}
                            >
                              Xem
                            </button>
                            <button 
                              className="spr-btn spr-btn-success"
                              onClick={() => handleSendEmail(prescription.PrescriptionId || prescription.prescriptionId)}
                            >
                              Gửi Email
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Prescription Creation Modal */}
      {showPrescriptionModal && selectedPatient && (
        <div className="staff-prescription-modal-overlay">
          <div className="staff-prescription-modal">
            <div className="staff-prescription-modal-header">
              <div className="modal-header-content">
                <span className="modal-icon">💊</span>
                <h3>Kê đơn thuốc</h3>
              </div>
              <button 
                className="staff-prescription-modal-close"
                onClick={() => setShowPrescriptionModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="staff-prescription-modal-body">
              {/* Patient Info */}
              <div className="patient-info-box">
                <div className="patient-info-header">
                  <span className="info-icon">👤</span>
                  <h4>Thông tin bệnh nhân</h4>
                </div>
                <div className="patient-info-grid">
                  <div className="info-item">
                    <label>Họ tên:</label>
                    <span>{selectedPatient.FullName || selectedPatient.fullName || selectedPatient.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{selectedPatient.Email || selectedPatient.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Gói khám:</label>
                    <span>{selectedPatient.ExamName || selectedPatient.examName || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="form-group">
                <label>Chẩn đoán <span className="required">*</span></label>
                <textarea
                  className="staff-prescription-textarea"
                  rows={3}
                  value={prescriptionData.diagnosis}
                  onChange={(e) => setPrescriptionData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Nhập chẩn đoán bệnh..."
                />
              </div>

              {/* Notes */}
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  className="staff-prescription-textarea"
                  rows={2}
                  value={prescriptionData.notes}
                  onChange={(e) => setPrescriptionData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ghi chú thêm cho bệnh nhân (nếu có)..."
                />
              </div>

              {/* Medications */}
              <div className="medications-section">
                <div className="medications-header">
                  <div className="medications-title">
                    <span className="medications-icon">💊</span>
                    <h4>Danh sách thuốc</h4>
                  </div>
                  <button 
                    className="staff-prescription-btn staff-prescription-btn-success"
                    onClick={addMedication}
                  >
                    ➕ Thêm thuốc
                  </button>
                </div>

                <div className="medications-list">
                  {prescriptionData.medications.map((med, index) => (
                    <div key={index} className="medication-card">
                      <div className="medication-card-header">
                        <span className="medication-number">Thuốc {index + 1}</span>
                        {prescriptionData.medications.length > 1 && (
                          <button
                            className="medication-remove-btn"
                            onClick={() => removeMedication(index)}
                            title="Xóa thuốc này"
                          >
                            🗑️ Xóa
                          </button>
                        )}
                      </div>

                      <div className="medication-fields">
                        <div className="field-row">
                          <div className="field-col">
                            <label>Tên thuốc <span className="required">*</span></label>
                            <input
                              type="text"
                              className="staff-prescription-input"
                              value={med.medicineName}
                              onChange={(e) => updateMedication(index, 'medicineName', e.target.value)}
                              placeholder="VD: Paracetamol"
                            />
                          </div>
                          <div className="field-col">
                            <label>Liều lượng</label>
                            <input
                              type="text"
                              className="staff-prescription-input"
                              value={med.dosage}
                              onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                              placeholder="VD: 500mg"
                            />
                          </div>
                        </div>

                        <div className="field-row">
                          <div className="field-col">
                            <label>Tần suất sử dụng</label>
                            <input
                              type="text"
                              className="staff-prescription-input"
                              value={med.frequency}
                              onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                              placeholder="VD: 2 lần/ngày"
                            />
                          </div>
                          <div className="field-col">
                            <label>Thời gian sử dụng</label>
                            <input
                              type="text"
                              className="staff-prescription-input"
                              value={med.duration}
                              onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                              placeholder="VD: 7 ngày"
                            />
                          </div>
                        </div>

                        <div className="field-row">
                          <div className="field-col-full">
                            <label>Hướng dẫn sử dụng</label>
                            <input
                              type="text"
                              className="staff-prescription-input"
                              value={med.instructions}
                              onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                              placeholder="VD: Uống sau bữa ăn"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="staff-prescription-modal-footer">
              <button
                className="staff-prescription-btn staff-prescription-btn-secondary"
                onClick={() => setShowPrescriptionModal(false)}
              >
                Hủy
              </button>
              <button
                className="staff-prescription-btn staff-prescription-btn-primary"
                onClick={handleSavePrescription}
                disabled={saving}
              >
                {saving ? '⏳ Đang lưu...' : '💾 Lưu đơn thuốc'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Detail Modal */}
      {showDetailModal && viewingPrescription && (
        <div className="staff-prescription-modal-overlay">
          <div className="staff-prescription-modal detail-modal">
            <div className="staff-prescription-modal-header">
              <div className="modal-header-content">
                <span className="modal-icon">📄</span>
                <h3>Chi tiết đơn thuốc</h3>
              </div>
              <button 
                className="staff-prescription-modal-close"
                onClick={() => { setShowDetailModal(false); setViewingPrescription(null); }}
              >
                ✕
              </button>
            </div>

            <div className="staff-prescription-modal-body">
              <div className="detail-section">
                <h4>Thông tin chung</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Bệnh nhân:</label>
                    <span>{viewingPrescription.PatientName || viewingPrescription.patientName || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ngày kê đơn:</label>
                    <span>
                      {(viewingPrescription.CreatedAtUtc || viewingPrescription.createdAtUtc || viewingPrescription.createdDate)
                        ? new Date(viewingPrescription.CreatedAtUtc || viewingPrescription.createdAtUtc || viewingPrescription.createdDate).toLocaleString('vi-VN')
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Chẩn đoán:</label>
                    <span>{viewingPrescription.Diagnosis || viewingPrescription.diagnosis || 'N/A'}</span>
                  </div>
                  {(viewingPrescription.Note || viewingPrescription.note) && (
                    <div className="detail-item full-width">
                      <label>Ghi chú:</label>
                      <span>{viewingPrescription.Note || viewingPrescription.note}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h4>Danh sách thuốc</h4>
                {(viewingPrescription.Medicines?.length || viewingPrescription.medicines?.length) > 0 ? (
                  <div className="medications-detail-list">
                    {(viewingPrescription.Medicines || viewingPrescription.medicines).map((med, idx) => (
                      <div key={idx} className="medication-detail-card">
                        <div className="med-detail-header">
                          <span className="med-detail-number">💊 {idx + 1}</span>
                          <h5>{med.MedicineName || med.medicineName}</h5>
                        </div>
                        <div className="med-detail-info">
                          {(med.Dosage || med.dosage) && <div><strong>Liều lượng:</strong> {med.Dosage || med.dosage}</div>}
                          {(med.Frequency || med.frequency) && <div><strong>Tần suất:</strong> {med.Frequency || med.frequency}</div>}
                          {(med.Duration || med.duration) && <div><strong>Thời gian:</strong> {med.Duration || med.duration}</div>}
                          {(med.Instruction || med.instruction) && <div><strong>Hướng dẫn:</strong> {med.Instruction || med.instruction}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-meds">Không có thông tin thuốc</div>
                )}
              </div>
            </div>

            <div className="staff-prescription-modal-footer">
              <button
                className="staff-prescription-btn staff-prescription-btn-secondary"
                onClick={() => { setShowDetailModal(false); setViewingPrescription(null); }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffPrescriptionManagement
