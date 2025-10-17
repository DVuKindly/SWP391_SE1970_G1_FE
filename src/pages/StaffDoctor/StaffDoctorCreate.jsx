import { useContext, useState } from 'react'
import { AuthContext } from '../../providers/AuthContext'
import { createDoctorAccount } from '../../services/staffdoctor.api'
import './StaffDoctorCreate.css'

function StaffDoctorCreate() {
  const { tokens } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
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

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        experienceYears: Number(form.experienceYears || 0),
        departments: (form.departments || [])
          .filter((d) => String(d.departmentId).trim() !== '')
          .map((d) => ({ departmentId: Number(d.departmentId), isPrimary: Boolean(d.isPrimary) })),
      }
      const res = await createDoctorAccount(payload, tokens)
      if (res?.success === false) {
        alert(res?.message || 'Tạo bác sĩ thất bại')
      } else {
        alert('Tạo bác sĩ thành công')
        setForm({
          email: '', password: '', fullName: '', phone: '', title: '', biography: '', degree: '', education: '', experienceYears: '', certifications: '',
          departments: [{ departmentId: '', isPrimary: true }],
        })
      }
    } catch (e1) {
      alert(e1?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="sdc-wrap">
      <div className="sdc-title">Tạo bác sĩ</div>
      <form onSubmit={submit} className="sdc-grid">
        <div className="sdc-card">
          <div className="sdc-card-title">Thông tin tài khoản</div>
          <div className="sdc-row-2">
            <div>
              <label>Email</label>
              <input className="sdc-input" type="email" value={form.email} onChange={update('email')} required />
            </div>
            <div>
              <label>Mật khẩu</label>
              <input className="sdc-input" type="password" value={form.password} onChange={update('password')} required minLength={6} />
            </div>
            <div>
              <label>Họ tên</label>
              <input className="sdc-input" type="text" value={form.fullName} onChange={update('fullName')} required />
            </div>
            <div>
              <label>Số điện thoại</label>
              <input className="sdc-input" type="tel" value={form.phone} onChange={update('phone')} placeholder="0901234567" />
            </div>
          </div>
        </div>

        <div className="sdc-card">
          <div className="sdc-card-title">Hồ sơ chuyên môn</div>
          <div className="sdc-row-2">
            <div>
              <label>Chức danh</label>
              <input className="sdc-input" type="text" value={form.title} onChange={update('title')} />
            </div>
            <div>
              <label>Bằng cấp</label>
              <input className="sdc-input" type="text" value={form.degree} onChange={update('degree')} />
            </div>
            <div>
              <label>Học vấn</label>
              <input className="sdc-input" type="text" value={form.education} onChange={update('education')} />
            </div>
            <div>
              <label>Số năm kinh nghiệm</label>
              <input className="sdc-input" type="number" min={0} value={form.experienceYears} onChange={update('experienceYears')} />
            </div>
            <div className="sdc-col-2">
              <label>Chứng chỉ</label>
              <input className="sdc-input" type="text" value={form.certifications} onChange={update('certifications')} />
            </div>
            <div className="sdc-col-2">
              <label>Tiểu sử</label>
              <textarea className="sdc-input" rows={4} value={form.biography} onChange={update('biography')} />
            </div>
          </div>
        </div>

        <div className="sdc-card">
          <div className="sdc-card-title">Khoa/Phòng ban</div>
          {form.departments.map((d, idx) => (
            <div key={idx} className="sdc-dept-row">
              <div>
                <label>Department ID</label>
                <input className="sdc-input" type="number" min={0} value={d.departmentId} onChange={updateDept(idx, 'departmentId')} />
              </div>
              <label className="sdc-checkbox">
                <input type="checkbox" checked={!!d.isPrimary} onChange={updateDept(idx, 'isPrimary')} /> Là khoa chính
              </label>
              {form.departments.length > 1 && (
                <button type="button" className="sdc-btn sdc-btn-danger" onClick={() => removeDept(idx)}>Xóa</button>
              )}
            </div>
          ))}
          <div>
            <button type="button" className="sdc-btn" onClick={addDept}>+ Thêm khoa</button>
          </div>
        </div>

        <div className="sdc-actions">
          <button type="submit" className="sdc-btn sdc-btn-primary" disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo bác sĩ'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default StaffDoctorCreate


