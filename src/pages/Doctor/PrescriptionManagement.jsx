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
      const registrationId = selectedPatient.registrationRequestId || selectedPatient.requestId || selectedPatient.id
      const patientId = selectedPatient.patientId || selectedPatient.accountId

      const payload = {
        registrationRequestId: registrationId,
        patientId: patientId,
        diagnosis: prescriptionData.diagnosis,
        notes: prescriptionData.notes,
        prescriptionDetails: validMedications.map(med => ({
          medicineName: med.medicineName,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions
        }))
      }

      const result = await createPrescription(payload, staffId, tokens)
      
      const message = result?.message || result?.data?.message || 'Kê đơn thuốc thành công!'
      alert(message)
      setShowPrescriptionModal(false)
      setSelectedPatient(null)
      loadExaminedPatients()
      loadMyPrescriptions()
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
      alert(JSON.stringify(detail, null, 2)) // Simple display, you can create a modal
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
            <table className="prescription-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Ngày đăng ký</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="prescription-loading" colSpan="7">Đang tải...</td></tr>
                ) : examinedPatients.length === 0 ? (
                  <tr><td className="prescription-empty" colSpan="7">Không có bệnh nhân nào đã khám</td></tr>
                ) : (
                  examinedPatients.map((patient, idx) => (
                    <tr key={patient.id || idx}>
                      <td>{idx + 1}</td>
                      <td>{patient.fullName || patient.name || 'N/A'}</td>
                      <td>{patient.email || 'N/A'}</td>
                      <td>{patient.phone || patient.phoneNumber || 'N/A'}</td>
                      <td>
                        {patient.createdAt || patient.registrationDate
                          ? new Date(patient.createdAt || patient.registrationDate).toLocaleString('vi-VN')
                          : 'N/A'}
                      </td>
                      <td>
                        <span className="prescription-status-examined">
                          {patient.status || 'Examined'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="prescription-btn prescription-btn-primary"
                          onClick={() => openPrescriptionModal(patient)}
                        >
                          Kê đơn thuốc
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* My Prescriptions Section */}
          <div className="prescription-table-container">
            <table className="prescription-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Bệnh nhân</th>
                  <th>Chẩn đoán</th>
                  <th>Ngày kê đơn</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {myPrescriptions.length === 0 ? (
                  <tr><td className="prescription-empty" colSpan="5">Chưa có đơn thuốc nào</td></tr>
                ) : (
                  myPrescriptions.map((prescription, idx) => (
                    <tr key={prescription.prescriptionId || idx}>
                      <td>{idx + 1}</td>
                      <td>{prescription.patientName || 'N/A'}</td>
                      <td>{prescription.diagnosis || 'N/A'}</td>
                      <td>
                        {prescription.createdDate || prescription.prescriptionDate
                          ? new Date(prescription.createdDate || prescription.prescriptionDate).toLocaleString('vi-VN')
                          : 'N/A'}
                      </td>
                      <td>
                        <button 
                          className="prescription-btn prescription-btn-info"
                          onClick={() => viewPrescriptionDetail(prescription.prescriptionId)}
                        >
                          Xem chi tiết
                        </button>
                        <button 
                          className="prescription-btn prescription-btn-success"
                          onClick={() => handleSendEmail(prescription.prescriptionId)}
                        >
                          Gửi Email
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
    </div>
  )
}

export default PrescriptionManagement
