import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../providers/AuthContext'
import { getExams, getExamById, createExam, updateExam, deleteExam } from '../../../services/exam.api'
import { getDepartments } from '../../../services/department.api'
import './ExamManager.css'

function ExamModal({ open, onClose, exam, onSave, saving, departments }) {
  const [formData, setFormData] = useState({
    examName: '',
    description: '',
    price: '',
    duration: '',
    departmentId: '',
    ...exam
  })

  useEffect(() => {
    if (exam) {
      setFormData({
        examName: exam.examName || exam.name || '',
        description: exam.description || '',
        price: exam.price || '',
        duration: exam.duration || '',
        departmentId: exam.departmentId || '',
        ...exam
      })
    }
  }, [exam])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!open) return null

  return (
    <div className="exam-modal-overlay">
      <div className="exam-modal">
        <div className="exam-modal-header">
          <h3>{exam?.id ? 'Chỉnh sửa Gói Khám' : 'Tạo Gói Khám Mới'}</h3>
          <button className="exam-modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="exam-modal-body">
            <div className="exam-form-group">
              <label>Tên gói khám <span className="required">*</span></label>
              <input
                type="text"
                className="exam-input"
                value={formData.examName}
                onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                required
                placeholder="Nhập tên gói khám..."
              />
            </div>

            <div className="exam-form-group">
              <label>Mô tả</label>
              <textarea
                className="exam-textarea"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả gói khám..."
              />
            </div>

            <div className="exam-form-group">
              <label>Khoa khám <span className="required">*</span></label>
              <select
                className="exam-input"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                required
              >
                <option value="">-- Chọn khoa khám --</option>
                {departments.map((dept) => (
                  <option key={dept.id || dept.departmentId} value={dept.id || dept.departmentId}>
                    {dept.name || dept.departmentName}
                  </option>
                ))}
              </select>
            </div>

            <div className="exam-form-row">
              <div className="exam-form-group">
                <label>Giá tiền (VNĐ) <span className="required">*</span></label>
                <input
                  type="number"
                  className="exam-input"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="exam-form-group">
                <label>Thời gian (phút)</label>
                <input
                  type="number"
                  className="exam-input"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="exam-modal-footer">
            <button type="button" className="exam-btn exam-btn-secondary" onClick={onClose} disabled={saving}>
              Hủy
            </button>
            <button type="submit" className="exam-btn exam-btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ExamManager() {
  const { tokens } = useContext(AuthContext)
  const [exams, setExams] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)
  const [saving, setSaving] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')

  const loadExams = async () => {
    setLoading(true)
    try {
      const data = await getExams(tokens)
      setExams(data)
    } catch (e) {
      console.error('Error loading exams:', e)
      alert('Không thể tải danh sách gói khám: ' + (e?.message || 'Có lỗi xảy ra'))
    } finally {
      setLoading(false)
    }
  }

  const loadDepartments = async () => {
    try {
      const data = await getDepartments(tokens)
      setDepartments(data)
    } catch (e) {
      console.error('Error loading departments:', e)
      // Không hiển thị alert để không làm phiền user
    }
  }

  useEffect(() => {
    loadExams()
    loadDepartments()
  }, [tokens])

  const handleCreate = () => {
    setSelectedExam(null)
    setShowModal(true)
  }

  const handleEdit = async (exam) => {
    try {
      const fullData = await getExamById(exam.id, tokens)
      setSelectedExam(fullData)
      setShowModal(true)
    } catch (e) {
      alert('Không thể tải thông tin gói khám: ' + (e?.message || 'Có lỗi xảy ra'))
    }
  }

  const handleSave = async (formData) => {
    setSaving(true)
    try {
      // Transform data to match backend expected format (PascalCase)
      const dataToSend = {
        ExamName: formData.examName,
        Description: formData.description,
        Price: parseFloat(formData.price) || 0,
        Duration: parseInt(formData.duration) || 0,
        DepartmentId: parseInt(formData.departmentId) || null
      }

      if (selectedExam?.id) {
        await updateExam(selectedExam.id, dataToSend, tokens)
        alert('Cập nhật gói khám thành công!')
      } else {
        await createExam(dataToSend, tokens)
        alert('Tạo gói khám mới thành công!')
      }
      setShowModal(false)
      setSelectedExam(null)
      await loadExams()
    } catch (e) {
      alert('Lỗi: ' + (e?.message || 'Có lỗi xảy ra'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (exam) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa gói khám "${exam.examName || exam.name}"?`)) return

    try {
      await deleteExam(exam.id, tokens)
      alert('Xóa gói khám thành công!')
      await loadExams()
    } catch (e) {
      alert('Không thể xóa gói khám: ' + (e?.message || 'Có lỗi xảy ra'))
    }
  }

  const filteredExams = exams.filter(exam => {
    if (!searchKeyword) return true
    const keyword = searchKeyword.toLowerCase()
    return (
      (exam.examName || exam.name || '')?.toLowerCase().includes(keyword) ||
      exam.description?.toLowerCase().includes(keyword)
    )
  })

  return (
    <div className="exam-manager-container">
      <div className="exam-manager-header">
        <h2>Quản Lý Gói Khám</h2>
        <button className="exam-btn exam-btn-primary" onClick={handleCreate}>
          <span className="exam-btn-icon">+</span>
          Tạo Gói Khám Mới
        </button>
      </div>

      <div className="exam-manager-toolbar">
        <div className="exam-search-box">
          <input
            type="text"
            className="exam-search-input"
            placeholder="Tìm kiếm theo tên gói khám..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
      </div>

      <div className="exam-manager-content">
        {loading ? (
          <div className="exam-loading">Đang tải...</div>
        ) : filteredExams.length === 0 ? (
          <div className="exam-empty">
            {searchKeyword ? 'Không tìm thấy gói khám nào' : 'Chưa có gói khám nào'}
          </div>
        ) : (
          <div className="exam-grid">
            {filteredExams.map((exam) => (
              <div key={exam.id} className="exam-card">
                <div className="exam-card-header">
                  <h3 className="exam-card-title">{exam.examName || exam.name}</h3>
                  <div className="exam-card-actions">
                    <button
                      className="exam-btn-icon-small exam-btn-edit"
                      onClick={() => handleEdit(exam)}
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    <button
                      className="exam-btn-icon-small exam-btn-delete"
                      onClick={() => handleDelete(exam)}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="exam-card-body">
                  <p className="exam-card-description">
                    {exam.description || 'Chưa có mô tả'}
                  </p>
                  <div className="exam-card-info">
                    {exam.departmentId && (
                      <div className="exam-info-item">
                        <span className="exam-info-label">Khoa:</span>
                        <span className="exam-info-value">
                          {departments.find(d => (d.id || d.departmentId) === exam.departmentId)?.name || 
                           departments.find(d => (d.id || d.departmentId) === exam.departmentId)?.departmentName || 
                           `Khoa #${exam.departmentId}`}
                        </span>
                      </div>
                    )}
                    <div className="exam-info-item">
                      <span className="exam-info-label">Giá:</span>
                      <span className="exam-info-value exam-price">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(exam.price || 0)}
                      </span>
                    </div>
                    {exam.duration && (
                      <div className="exam-info-item">
                        <span className="exam-info-label">Thời gian:</span>
                        <span className="exam-info-value">{exam.duration} phút</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ExamModal
        open={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedExam(null)
        }}
        exam={selectedExam}
        onSave={handleSave}
        saving={saving}
        departments={departments}
      />
    </div>
  )
}

export default ExamManager
