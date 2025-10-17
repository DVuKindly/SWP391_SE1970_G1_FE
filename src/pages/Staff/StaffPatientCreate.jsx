import { useContext, useState } from 'react'
import { AuthContext } from '../../providers/AuthContext'
import { createPatientAccount } from '../../services/staffpatient.api'
import './StaffPatientCreate.css'

function StaffPatientCreate() {
  const { tokens } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: '',
    medicalHistory: '',
    allergies: '',
    medications: ''
  })

  const update = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : null,
      }
      const res = await createPatientAccount(payload, tokens)
      if (res?.success === false) {
        alert(res?.message || 'Tạo bệnh nhân thất bại')
      } else {
        alert('Tạo bệnh nhân thành công')
        setForm({
          email: '',
          password: '',
          fullName: '',
          phone: '',
          address: '',
          dateOfBirth: '',
          gender: '',
          emergencyContact: '',
          medicalHistory: '',
          allergies: '',
          medications: ''
        })
      }
    } catch (e1) {
      alert(e1?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="spc-wrap">
      <div className="spc-title">Tạo bệnh nhân</div>
      <form onSubmit={submit} className="spc-grid">
        <div className="spc-card">
          <div className="spc-card-title">Thông tin tài khoản</div>
          <div className="spc-row-2">
            <div>
              <label>Email</label>
              <input className="spc-input" type="email" value={form.email} onChange={update('email')} required />
            </div>
            <div>
              <label>Mật khẩu</label>
              <input className="spc-input" type="password" value={form.password} onChange={update('password')} required minLength={6} />
            </div>
            <div>
              <label>Họ tên</label>
              <input className="spc-input" type="text" value={form.fullName} onChange={update('fullName')} required />
            </div>
            <div>
              <label>Số điện thoại</label>
              <input className="spc-input" type="tel" value={form.phone} onChange={update('phone')} placeholder="0901234567" />
            </div>
          </div>
        </div>

        <div className="spc-card">
          <div className="spc-card-title">Thông tin cá nhân</div>
          <div className="spc-row-2">
            <div>
              <label>Ngày sinh</label>
              <input className="spc-input" type="date" value={form.dateOfBirth} onChange={update('dateOfBirth')} />
            </div>
            <div>
              <label>Giới tính</label>
              <select className="spc-input" value={form.gender} onChange={update('gender')}>
                <option value="">Chọn giới tính</option>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            </div>
            <div className="spc-col-2">
              <label>Địa chỉ</label>
              <textarea className="spc-input" rows={3} value={form.address} onChange={update('address')} />
            </div>
          </div>
        </div>

        <div className="spc-card">
          <div className="spc-card-title">Thông tin y tế</div>
          <div className="spc-row-2">
            <div className="spc-col-2">
              <label>Liên hệ khẩn cấp</label>
              <input className="spc-input" type="text" value={form.emergencyContact} onChange={update('emergencyContact')} placeholder="Tên và số điện thoại" />
            </div>
            <div className="spc-col-2">
              <label>Tiền sử bệnh</label>
              <textarea className="spc-input" rows={3} value={form.medicalHistory} onChange={update('medicalHistory')} placeholder="Các bệnh đã mắc phải trước đây..." />
            </div>
            <div className="spc-col-2">
              <label>Dị ứng</label>
              <textarea className="spc-input" rows={2} value={form.allergies} onChange={update('allergies')} placeholder="Các loại dị ứng..." />
            </div>
            <div className="spc-col-2">
              <label>Thuốc đang sử dụng</label>
              <textarea className="spc-input" rows={2} value={form.medications} onChange={update('medications')} placeholder="Các loại thuốc đang sử dụng..." />
            </div>
          </div>
        </div>

        <div className="spc-actions">
          <button type="submit" className="spc-btn spc-btn-primary" disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo bệnh nhân'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default StaffPatientCreate
