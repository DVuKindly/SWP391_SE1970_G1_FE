import { useState, useContext } from 'react'
import { AuthContext } from '../../providers/AuthContext'
import { updatePatientAccount } from '../../services/staffpatient.api'
import './EditPatientModal.css'

function EditPatientModal({ open, onClose, preset }) {
  const { tokens } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    phone: '',
    id: null
  })

  const update = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  // Update form when preset changes
  useState(() => {
    if (preset) {
      setForm({
        email: preset.email || '',
        fullName: preset.fullName || '',
        phone: preset.phone || '',
        id: preset.id || null
      })
    }
  }, [preset])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.id) return
    
    setLoading(true)
    try {
      const payload = {
        email: form.email,
        fullName: form.fullName,
        phone: form.phone
      }
      await updatePatientAccount(form.id, payload, tokens)
      alert('Cập nhật thông tin bệnh nhân thành công!')
      onClose()
    } catch (e1) {
      alert(e1?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="epm-overlay">
      <div className="epm-modal">
        <div className="epm-header">
          <h3>Chỉnh sửa thông tin bệnh nhân</h3>
          <button className="epm-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={submit} className="epm-form">
          <div className="epm-form-group">
            <label>Email</label>
            <input 
              className="epm-input" 
              type="email" 
              value={form.email} 
              onChange={update('email')} 
              required 
            />
          </div>
          
          <div className="epm-form-group">
            <label>Họ tên</label>
            <input 
              className="epm-input" 
              type="text" 
              value={form.fullName} 
              onChange={update('fullName')} 
              required 
            />
          </div>
          
          <div className="epm-form-group">
            <label>Số điện thoại</label>
            <input 
              className="epm-input" 
              type="tel" 
              value={form.phone} 
              onChange={update('phone')} 
              placeholder="0901234567" 
            />
          </div>
          
          <div className="epm-actions">
            <button 
              type="button" 
              className="epm-btn epm-btn-secondary" 
              onClick={onClose}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="epm-btn epm-btn-primary" 
              disabled={loading}
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPatientModal
