import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../providers/AuthContext'
import { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } from '../../../services/department.api'
import './DepartmentManager.css'

function DepartmentModal({ open, onClose, department, onSave, saving }) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    ...department
  })

  useEffect(() => {
    if (department) {
      setFormData({
        code: department.code || '',
        name: department.name || department.departmentName || '',
        description: department.description || '',
        ...department
      })
    } else {
      setFormData({
        code: '',
        name: '',
        description: ''
      })
    }
  }, [department])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!open) return null

  return (
    <div className="dept-modal-overlay">
      <div className="dept-modal">
        <div className="dept-modal-header">
          <h3>{department?.id ? 'Chỉnh sửa Khoa' : 'Tạo Khoa Mới'}</h3>
          <button className="dept-modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="dept-modal-body">
            <div className="dept-form-group">
              <label>Mã khoa <span className="required">*</span></label>
              <input
                type="text"
                className="dept-input"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                placeholder="Ví dụ: TIM, MAT, XN..."
                maxLength={10}
                disabled={!!department}
              />
              <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Mã viết tắt của khoa (tối đa 10 ký tự)
                {department && <span style={{ color: '#dc2626', marginLeft: '8px' }}>⚠️ Không thể sửa mã khoa</span>}
              </small>
            </div>

            <div className="dept-form-group">
              <label>Tên khoa <span className="required">*</span></label>
              <input
                type="text"
                className="dept-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Nhập tên khoa..."
              />
            </div>

            <div className="dept-form-group">
              <label>Mô tả</label>
              <textarea
                className="dept-textarea"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả khoa..."
              />
            </div>
          </div>

          <div className="dept-modal-footer">
            <button type="button" className="dept-btn dept-btn-secondary" onClick={onClose} disabled={saving}>
              Hủy
            </button>
            <button type="submit" className="dept-btn dept-btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DepartmentManager() {
  const { tokens } = useContext(AuthContext)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [saving, setSaving] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')

  const loadDepartments = async () => {
    setLoading(true)
    try {
      const data = await getDepartments(tokens)
      setDepartments(data)
    } catch (e) {
      console.error('Error loading departments:', e)
      alert('Không thể tải danh sách khoa: ' + (e?.message || 'Có lỗi xảy ra'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [tokens])

  const handleCreate = () => {
    setSelectedDepartment(null)
    setShowModal(true)
  }

  const handleEdit = async (department) => {
    try {
      const deptId = department.id || department.departmentId
      console.log('handleEdit - Loading department:', { deptId, department })
      
      const fullData = await getDepartmentById(deptId, tokens)
      console.log('handleEdit - Loaded data:', fullData)
      
      setSelectedDepartment(fullData)
      setShowModal(true)
    } catch (e) {
      console.error('handleEdit error:', e)
      alert('Không thể tải thông tin khoa: ' + (e?.message || 'Có lỗi xảy ra'))
    }
  }

  const handleSave = async (formData) => {
    setSaving(true)
    try {
      const deptId = selectedDepartment?.id || selectedDepartment?.departmentId
      
      console.log('Saving department:', { 
        isUpdate: !!deptId, 
        deptId, 
        formData,
        selectedDepartment 
      })

      if (deptId) {
        // Update existing department - Backend DTO: DepartmentId, Name, Description, IsActive
        const updateData = {
          DepartmentId: deptId,
          Name: formData.name,
          Description: formData.description || '',
          IsActive: true
        }
        await updateDepartment(deptId, updateData, tokens)
        alert('Cập nhật khoa thành công!')
      } else {
        // Create new department - Backend DTO: Code, Name, Description, IsActive
        const createData = {
          Code: formData.code,
          Name: formData.name,
          Description: formData.description || '',
          IsActive: true
        }
        await createDepartment(createData, tokens)
        alert('Tạo khoa mới thành công!')
      }
      setShowModal(false)
      setSelectedDepartment(null)
      await loadDepartments()
    } catch (e) {
      console.error('Error saving department:', e)
      alert('Lỗi: ' + (e?.message || 'Có lỗi xảy ra'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (department) => {
    const deptId = department.id || department.departmentId
    const deptName = department.name || department.departmentName
    
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khoa "${deptName}"?\n\nLưu ý: Xóa khoa có thể ảnh hưởng đến các gói khám và bác sĩ liên quan.`)) return

    try {
      await deleteDepartment(deptId, tokens)
      alert('Xóa khoa thành công!')
      await loadDepartments()
    } catch (e) {
      alert('Không thể xóa khoa: ' + (e?.message || 'Có lỗi xảy ra'))
    }
  }

  const filteredDepartments = departments.filter(dept => {
    if (!searchKeyword) return true
    const keyword = searchKeyword.toLowerCase()
    const name = (dept.name || dept.departmentName || '').toLowerCase()
    const description = (dept.description || '').toLowerCase()
    return name.includes(keyword) || description.includes(keyword)
  })

  return (
    <div className="dept-manager-container">
      <div className="dept-manager-header">
        <h2>Quản Lý Khoa</h2>
        <button className="dept-btn dept-btn-primary" onClick={handleCreate}>
          <span className="dept-btn-icon">+</span>
          Tạo Khoa Mới
        </button>
      </div>

      <div className="dept-manager-toolbar">
        <div className="dept-search-box">
          <input
            type="text"
            className="dept-search-input"
            placeholder="Tìm kiếm theo tên khoa..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
      </div>

      <div className="dept-manager-content">
        {loading ? (
          <div className="dept-loading">Đang tải...</div>
        ) : filteredDepartments.length === 0 ? (
          <div className="dept-empty">
            {searchKeyword ? 'Không tìm thấy khoa nào' : 'Chưa có khoa nào'}
          </div>
        ) : (
          <div className="dept-grid">
            {filteredDepartments.map((dept) => (
              <div key={dept.id || dept.departmentId} className="dept-card">
                <div className="dept-card-header">
                  <div className="dept-card-title-row">
                    <span className="dept-card-icon">🏥</span>
                    <div>
                      <h3 className="dept-card-title">{dept.name || dept.departmentName}</h3>
                      <p className="dept-card-code">Mã: {dept.code || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="dept-card-actions">
                    <button
                      className="dept-btn-icon-small dept-btn-edit"
                      onClick={() => handleEdit(dept)}
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    <button
                      className="dept-btn-icon-small dept-btn-delete"
                      onClick={() => handleDelete(dept)}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="dept-card-body">
                  <p className="dept-card-description">
                    {dept.description || 'Chưa có mô tả'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DepartmentModal
        open={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedDepartment(null)
        }}
        department={selectedDepartment}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  )
}

export default DepartmentManager
