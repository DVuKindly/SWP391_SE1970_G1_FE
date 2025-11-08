import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../providers/AuthContext'
import {
  getExaminedPatients,
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  sendPrescriptionEmail
} from '../../services/prescription.api'
import './PrescriptionManagement.css'

function PrescriptionManagement() {
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
  const [showViewModal, setShowViewModal] = useState(false)

  // Load examined patients
  const loadExaminedPatients = async () => {
    if (!tokens) return; // Don't load if no token
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
    if (!tokens) return; // Don't load if no token
    try {
      const staffId = user?.staffId || user?.id
      const data = await getPrescriptions({ doctorId: staffId }, tokens)
      console.log('📋 My prescriptions data:', data)
      if (data && data.length > 0) {
        console.log('📋 First prescription:', data[0])
      }
      setMyPrescriptions(data)
    } catch (e) {
      console.error('Error loading prescriptions:', e)
    }
  }

  // Search with debounce
  useEffect(() => {
    if (!tokens) return; // Don't run if no token
    const timer = setTimeout(() => loadExaminedPatients(), 500)
    return () => clearTimeout(timer)
  }, [keyword, tokens])

  // Initial load
  useEffect(() => {
    if (!tokens) return; // Don't run if no token
    loadExaminedPatients()
    loadMyPrescriptions()
  }, [tokens])

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
      // Backend cần appointmentId
      const appointmentId = selectedPatient.appointmentId || selectedPatient.id

      const payload = {
        appointmentId: appointmentId,
        diagnosis: prescriptionData.diagnosis,
        note: prescriptionData.notes || null,
        medicines: validMedications.map(med => ({
          medicineName: med.medicineName,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instruction: med.instructions || null
        }))
      }

      console.log('📤 Sending payload:', payload)
      const result = await createPrescription(payload, null, tokens)
      
      console.log('✅ Success result:', result)
      const message = result?.message || result?.data?.message
      if (message) alert(message)
      setShowPrescriptionModal(false)
      setSelectedPatient(null)
      loadExaminedPatients()
      loadMyPrescriptions()
    } catch (e) {
      console.error('❌ Error creating prescription:', e)
      console.error('❌ Error response:', e?.response)
      const errorMsg = e?.response?.data?.message || e?.message
      if (errorMsg) alert(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  // View prescription details
  const viewPrescriptionDetail = async (prescriptionId) => {
    try {
      const detail = await getPrescriptionById(prescriptionId, tokens)
      console.log('📋 Prescription detail:', detail)
      setViewingPrescription(detail)
      setShowViewModal(true)
    } catch (e) {
      console.error('Error loading prescription:', e)
      const errorMsg = e?.response?.data?.message || e?.message || 'Không thể tải chi tiết đơn thuốc'
      alert(errorMsg)
    }
  }

  // Send prescription email
  const handleSendEmail = async (prescriptionId) => {
    if (!window.confirm('Gửi email đơn thuốc cho bệnh nhân?')) return
    try {
      const result = await sendPrescriptionEmail(prescriptionId, tokens)
      const message = result?.message || result?.data?.message
      if (message) alert(message)
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message
      if (errorMsg) alert(errorMsg)
    }
  }

  return (
    <div className="prescription-container">
      <div className="prescription-header">
        <h2>Quản lý Kê đơn thuốc</h2>
        <div className="prescription-tabs">
          <button 
            className={`tab-btn ${!showMyPrescriptions ? 'active' : ''}`}
            onClick={() => setShowMyPrescriptions(false)}
          >
            Bệnh nhân đã khám
          </button>
          <button 
            className={`tab-btn ${showMyPrescriptions ? 'active' : ''}`}
            onClick={() => setShowMyPrescriptions(true)}
          >
            Đơn thuốc của tôi
          </button>
        </div>
      </div>

      {!showMyPrescriptions ? (
        <>
          {/* Examined Patients Section */}
          <div className="prescription-filters">
            <div className="prescription-search">
              <input
                className="prescription-input"
                placeholder="Tìm kiếm bệnh nhân..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>

          <div className="prescription-table-container">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>Đang tải...</div>
              </div>
            ) : examinedPatients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>Không có bệnh nhân nào đã khám</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>Danh sách bệnh nhân sẽ hiển thị ở đây</div>
              </div>
            ) : (
              <table className="prescription-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Tên cuộc khám</th>
                    <th>Ngày khám</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {examinedPatients.map((patient, idx) => (
                    <tr key={patient.appointmentId || patient.id || idx}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 500 }}>{patient.fullName || patient.name || 'N/A'}</td>
                      <td>{patient.email || 'N/A'}</td>
                      <td>{patient.examName || 'N/A'}</td>
                      <td>
                        {patient.examinedAt
                          ? new Date(patient.examinedAt).toLocaleString('vi-VN')
                          : 'N/A'}
                      </td>
                      <td>
                        <span className="prescription-status-examined">
                          Đã khám
                        </span>
                      </td>
                      <td>
                        <button 
                          className="prescription-btn prescription-btn-primary"
                          onClick={() => openPrescriptionModal(patient)}
                          title="Kê đơn thuốc cho bệnh nhân"
                        >
                          💊 Kê đơn thuốc
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <>
          {/* My Prescriptions Section */}
          <div className="prescription-filters">
            <div style={{ color: '#6b7280', fontSize: 14 }}>
              Tổng số đơn thuốc: <strong>{myPrescriptions.length}</strong>
            </div>
          </div>

          <div className="prescription-table-container">
            {myPrescriptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>Chưa có đơn thuốc nào</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>Các đơn thuốc bạn kê sẽ hiển thị ở đây</div>
              </div>
            ) : (
              <table className="prescription-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Bệnh nhân</th>
                    <th>Chẩn đoán</th>
                    <th>Ghi chú</th>
                    <th>Số thuốc</th>
                    <th>Ngày kê đơn</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {myPrescriptions.map((prescription, idx) => (
                    <tr key={prescription.prescriptionId || idx}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 500 }}>{prescription.patientName || 'N/A'}</td>
                      <td>{prescription.diagnosis || 'N/A'}</td>
                      <td>{prescription.note || '-'}</td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {prescription.medicines?.length || 0} loại
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {prescription.createdAtUtc
                          ? new Date(prescription.createdAtUtc).toLocaleString('vi-VN')
                          : 'N/A'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', whiteSpace: 'nowrap' }}>
                          <button 
                            className="prescription-btn prescription-btn-info"
                            onClick={() => viewPrescriptionDetail(prescription.prescriptionId)}
                            title="Xem chi tiết đơn thuốc"
                          >
                            👁️ Xem
                          </button>
                          <button 
                            className="prescription-btn prescription-btn-success"
                            onClick={() => handleSendEmail(prescription.prescriptionId)}
                            title="Gửi đơn thuốc qua email"
                          >
                            📧 Email
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && selectedPatient && (
        <div className="prescription-modal-overlay">
          <div className="prescription-modal">
            <div className="prescription-modal-header">
              <h3>Kê đơn thuốc</h3>
              <button 
                className="prescription-modal-close"
                onClick={() => setShowPrescriptionModal(false)}
              >
                ×
              </button>
            </div>

            <div className="prescription-modal-body">
              {/* Patient Info */}
              <div className="patient-info-box">
                <h4>Thông tin bệnh nhân</h4>
                <div className="patient-info-grid">
                  <div><strong>Họ tên:</strong> {selectedPatient.fullName || selectedPatient.name}</div>
                  <div><strong>Email:</strong> {selectedPatient.email}</div>
                  <div><strong>SĐT:</strong> {selectedPatient.phone || selectedPatient.phoneNumber}</div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="form-group">
                <label>Chẩn đoán <span className="required">*</span></label>
                <textarea
                  className="prescription-textarea"
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
                  className="prescription-textarea"
                  rows={2}
                  value={prescriptionData.notes}
                  onChange={(e) => setPrescriptionData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ghi chú thêm (nếu có)..."
                />
              </div>

              {/* Medications */}
              <div className="medications-section">
                <div className="medications-header">
                  <h4>Danh sách thuốc</h4>
                  <button 
                    className="prescription-btn prescription-btn-success"
                    onClick={addMedication}
                  >
                    + Thêm thuốc
                  </button>
                </div>

                {prescriptionData.medications.map((med, index) => (
                  <div key={index} className="medication-row">
                    <div className="medication-number">{index + 1}</div>
                    <div className="medication-fields">
                      <div className="form-row">
                        <div className="form-col">
                          <label>Tên thuốc <span className="required">*</span></label>
                          <input
                            type="text"
                            className="prescription-input"
                            value={med.medicineName}
                            onChange={(e) => updateMedication(index, 'medicineName', e.target.value)}
                            placeholder="Tên thuốc"
                          />
                        </div>
                        <div className="form-col">
                          <label>Liều lượng</label>
                          <input
                            type="text"
                            className="prescription-input"
                            value={med.dosage}
                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                            placeholder="VD: 500mg"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-col">
                          <label>Tần suất</label>
                          <input
                            type="text"
                            className="prescription-input"
                            value={med.frequency}
                            onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                            placeholder="VD: 2 lần/ngày"
                          />
                        </div>
                        <div className="form-col">
                          <label>Thời gian</label>
                          <input
                            type="text"
                            className="prescription-input"
                            value={med.duration}
                            onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                            placeholder="VD: 7 ngày"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-col-full">
                          <label>Hướng dẫn sử dụng</label>
                          <input
                            type="text"
                            className="prescription-input"
                            value={med.instructions}
                            onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                            placeholder="VD: Uống sau bữa ăn"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {prescriptionData.medications.length > 1 && (
                      <button
                        className="prescription-btn prescription-btn-danger medication-remove"
                        onClick={() => removeMedication(index)}
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="prescription-modal-footer">
              <button
                className="prescription-btn prescription-btn-secondary"
                onClick={() => setShowPrescriptionModal(false)}
              >
                Hủy
              </button>
              <button
                className="prescription-btn prescription-btn-primary"
                onClick={handleSavePrescription}
                disabled={saving}
              >
                {saving ? 'Đang lưu...' : 'Lưu đơn thuốc'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Prescription Modal */}
      {showViewModal && viewingPrescription && (
        <div className="prescription-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="prescription-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="prescription-modal-header">
              <h3>📋 Chi tiết đơn thuốc</h3>
              <button 
                className="prescription-modal-close"
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>

            <div className="prescription-modal-body">
              {/* Patient & Prescription Info */}
              <div className="patient-info-box" style={{ marginBottom: 20 }}>
                <h4>Thông tin đơn thuốc</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                  <div><strong>Bệnh nhân:</strong> {viewingPrescription.patientName || 'N/A'}</div>
                  <div><strong>Ngày kê:</strong> {viewingPrescription.createdAtUtc ? new Date(viewingPrescription.createdAtUtc).toLocaleString('vi-VN') : 'N/A'}</div>
                  <div style={{ gridColumn: '1 / -1' }}><strong>Chẩn đoán:</strong> {viewingPrescription.diagnosis || 'N/A'}</div>
                  {viewingPrescription.note && (
                    <div style={{ gridColumn: '1 / -1' }}><strong>Ghi chú:</strong> {viewingPrescription.note}</div>
                  )}
                </div>
              </div>

              {/* Medicines List */}
              <div>
                <h4 style={{ marginBottom: 12 }}>Danh sách thuốc</h4>
                {viewingPrescription.medicines && viewingPrescription.medicines.length > 0 ? (
                  <table className="prescription-table" style={{ fontSize: 14 }}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Tên thuốc</th>
                        <th>Liều lượng</th>
                        <th>Tần suất</th>
                        <th>Thời gian</th>
                        <th>Hướng dẫn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingPrescription.medicines.map((med, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: 500 }}>{med.medicineName || 'N/A'}</td>
                          <td>{med.dosage || 'N/A'}</td>
                          <td>{med.frequency || 'N/A'}</td>
                          <td>{med.duration || 'N/A'}</td>
                          <td>{med.instruction || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>
                    Không có thuốc nào trong đơn
                  </div>
                )}
              </div>
            </div>

            <div className="prescription-modal-footer">
              <button
                className="prescription-btn prescription-btn-secondary"
                onClick={() => setShowViewModal(false)}
              >
                Đóng
              </button>
              <button
                className="prescription-btn prescription-btn-success"
                onClick={() => {
                  setShowViewModal(false)
                  handleSendEmail(viewingPrescription.prescriptionId)
                }}
              >
                📧 Gửi Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PrescriptionManagement
