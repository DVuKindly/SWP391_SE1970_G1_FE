import { useEffect, useState } from 'react'
import './EditDoctorMockup.css'

function EditDoctorMockup({ open, onClose, preset }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    title: '',
    biography: '',
    degree: '',
    education: '',
    experienceYears: '',
    certifications: '',
    departments: [{ departmentId: '', isPrimary: true }],
  })

  useEffect(() => {
    if (!open) return
    setForm((p) => ({
      ...p,
      email: preset?.email || '',
      fullName: preset?.fullName || preset?.name || '',
      phone: preset?.phone || '',
    }))
  }, [open, preset])

  if (!open) return null

  const update = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))
  const updateDept = (idx, k) => (e) => {
    const v = k === 'isPrimary' ? e.target.checked : e.target.value
    setForm((p) => {
      const next = [...p.departments]
      next[idx] = { ...next[idx], [k]: v }
      return { ...p, departments: next }
    })
  }
  const addDept = () => setForm((p) => ({ ...p, departments: [...p.departments, { departmentId: '', isPrimary: false }] }))
  const removeDept = (idx) => setForm((p) => ({ ...p, departments: p.departments.filter((_, i) => i !== idx) }))

  const submit = (e) => {
    e.preventDefault()
    alert('Mockup chỉnh sửa bác sĩ (không gọi API).')
    onClose?.()
  }

  return (
    <div className="sdm-overlay">
      <div className="sdm-modal">
        <div className="sdm-header">
          <h4 style={{ margin: 0 }}>Chỉnh sửa bác sĩ (Mockup)</h4>
          <button className="sdm-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit} className="sdm-grid">
          <div className="sdm-section-title">Thông tin tài khoản</div>
          <div className="sdm-row-2">
            <div>
              <label>Email</label>
              <input className="sdm-input" type="email" value={form.email} onChange={update('email')} required />
            </div>
            <div>
              <label>Mật khẩu</label>
              <input className="sdm-input" type="password" value={form.password} onChange={update('password')} placeholder="••••••" />
            </div>
            <div>
              <label>Họ tên</label>
              <input className="sdm-input" type="text" value={form.fullName} onChange={update('fullName')} required />
            </div>
            <div>
              <label>Số điện thoại</label>
              <input className="sdm-input" type="tel" value={form.phone} onChange={update('phone')} placeholder="0901234567" />
            </div>
          </div>

          <div className="sdm-section-title">Hồ sơ chuyên môn</div>
          <div className="sdm-row-2">
            <div>
              <label>Chức danh</label>
              <input className="sdm-input" type="text" value={form.title} onChange={update('title')} />
            </div>
            <div>
              <label>Bằng cấp</label>
              <input className="sdm-input" type="text" value={form.degree} onChange={update('degree')} />
            </div>
            <div>
              <label>Học vấn</label>
              <input className="sdm-input" type="text" value={form.education} onChange={update('education')} />
            </div>
            <div>
              <label>Số năm kinh nghiệm</label>
              <input className="sdm-input" type="number" min={0} value={form.experienceYears} onChange={update('experienceYears')} />
            </div>
            <div className="sdm-col-2">
              <label>Chứng chỉ</label>
              <input className="sdm-input" type="text" value={form.certifications} onChange={update('certifications')} />
            </div>
            <div className="sdm-col-2">
              <label>Tiểu sử</label>
              <textarea className="sdm-input" rows={4} value={form.biography} onChange={update('biography')} />
            </div>
          </div>

          <div className="sdm-section-title">Khoa/Phòng ban</div>
          {form.departments.map((d, idx) => (
            <div key={idx} className="sdm-dept-row">
              <div>
                <label>Department ID</label>
                <input className="sdm-input" type="number" min={0} value={d.departmentId} onChange={updateDept(idx, 'departmentId')} />
              </div>
              <label className="sdm-checkbox">
                <input type="checkbox" checked={!!d.isPrimary} onChange={updateDept(idx, 'isPrimary')} /> Là khoa chính
              </label>
              {form.departments.length > 1 && (
                <button type="button" className="sdm-btn sdm-btn-danger" onClick={() => removeDept(idx)}>Xóa</button>
              )}
            </div>
          ))}
          <div>
            <button type="button" className="sdm-btn" onClick={addDept}>+ Thêm khoa</button>
          </div>

          <div className="sdm-actions">
            <button type="button" className="sdm-btn" onClick={onClose}>Hủy</button>
            <button type="submit" className="sdm-btn sdm-btn-primary">Lưu (Mockup)</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditDoctorMockup


