import { useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../../providers/AuthContext'
import {
  getRegistrations,
  getRegistrationById,
  putRegistrationStatus,
  postRegistrationNote,
  putRegistrationInvalid,
} from '../../services/staffpatient.api'
import { getExams } from '../../services/exam.api'
import { createPaymentForRegistration } from '../../services/payment.api'
import './StaffPatientRegistrations.css'

function DetailModal({ open, onClose, registration, mode, onSaveNoteRef, onSaveNoteHandler, onUpdateStatus, onMarkInvalid, saving }) {
  if (!open) return null
  const cleanNoteForView = (raw) => {
    if (!raw || typeof raw !== 'string') return ''
    // Keep ONLY user-entered notes; filter out audit/system lines
    const systemKeywords = [
      'Đánh dấu không hợp lệ',
      'Không hợp lệ',
      'Contacted',
      'Kết nối',
      'Approved',
      'Đã duyệt',
      'Pending',
      'Đang xử lý',
      'Cập nhật trạng thái',
    ]
    const lines = raw.split(/\r?\n/)
    const stripPrefix = (line) => line.replace(/^\s*\[[^\]]+\]\s*[^:]*:\s*/, '')
    const cleaned = lines
      .map((line) => {
        const isTimestamped = /^\s*\[[^\]]+\]/.test(line)
        if (!isTimestamped) return line
        const hasSystem = systemKeywords.some((kw) => line.toLowerCase().includes(kw.toLowerCase()))
        if (hasSystem) return ''
        return stripPrefix(line)
      })
      .filter(Boolean)
      .join('\n')
      .trim()
    return cleaned
  }
  return (
    <div className="sprm-overlay">
      <div className="sprm-modal">
        <div className="sprm-header">
          <h3>{mode === 'note' ? 'Ghi chú đăng ký' : 'Chi tiết đăng ký'}</h3>
          <button className="sprm-close" onClick={onClose}>×</button>
        </div>
        <div className="sprm-body">
          {!registration ? (
            <div className="sprm-loading">Đang tải...</div>
          ) : (
            <>
              {mode !== 'note' && (
                <div className="sprm-grid">
                  <div className="sprm-field"><span>Họ tên</span><b>{registration.fullName || registration.name || 'N/A'}</b></div>
                  <div className="sprm-field"><span>Email</span><b>{registration.email || 'N/A'}</b></div>
                  <div className="sprm-field"><span>Số điện thoại</span><b>{registration.phone || registration.phoneNumber || 'N/A'}</b></div>
                  <div className="sprm-field"><span>Ngày đăng ký</span><b>{(registration.createdAt || registration.startDate) ? new Date(registration.createdAt || registration.startDate).toLocaleString('vi-VN') : 'N/A'}</b></div>
                  <div className="sprm-field"><span>Trạng thái</span><b>{registration.status || 'N/A'}</b></div>
                </div>
              )}

              <div className="sprm-section">
                <label>Ghi chú</label>
                {mode === 'note' ? (
                  <textarea
                    className="sprm-input"
                    rows={3}
                    defaultValue={''}
                    onChange={(e) => { onSaveNoteRef.current = e.target.value }}
                    placeholder="Nhập ghi chú..."
                  />
                ) : (
                  <textarea
                    className="sprm-input"
                    rows={3}
                    value={cleanNoteForView(registration.note || registration.internalNote || registration.notes || registration.noteText || registration.remark || '')}
                    readOnly
                  />
                )}
              </div>

              <div className="sprm-actions">
                {mode === 'note' ? (
                  <>
                    <button className="sprm-btn sprm-btn-success" onClick={onSaveNoteHandler} disabled={saving}>Lưu ghi chú</button>
                    <button className="sprm-btn sprm-btn-secondary" onClick={onClose}>Đóng</button>
                  </>
                ) : (
                  <>
                    <button className="sprm-btn sprm-btn-secondary" onClick={onClose}>Đóng</button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function StaffPatientRegistrations() {
  const { tokens } = useContext(AuthContext)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 })
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('all')
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [saving, setSaving] = useState(false)
  const [modalMode, setModalMode] = useState('view')
  const noteBuffer = useMemo(() => ({ current: '' }), [])
  const [showExamModal, setShowExamModal] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [exams, setExams] = useState([])
  const [loadingExams, setLoadingExams] = useState(false)
  const [sendingPayment, setSendingPayment] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date())

  const cleanNoteForView = (raw) => {
    if (!raw || typeof raw !== 'string') return ''
    // Remove leading metadata like: [13/10/2025 22:07] Nguyen Thanh Phuc:
    return raw.replace(/^\s*\[[^\]]+\]\s+[^:]+:\s*/, '')
  }

  const load = async () => {
    setLoading(true)
    try {
      const res = await getRegistrations({
        keyword,
        page: pagination.page,
        pageSize: pagination.pageSize,
        status: status !== 'all' ? status : undefined,
      }, tokens)
      setItems(res.items || [])
      setPagination((p) => ({ ...p, total: res.total || 0 }))
      setLastUpdateTime(new Date())
    } catch (e) {
      console.error('Error loading registrations:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    load() 
    
    // Auto-refresh mỗi 30 giây
    const intervalId = setInterval(() => {
      load()
    }, 30000) // 30 seconds
    
    return () => clearInterval(intervalId)
  }, [keyword, status, pagination.page, pagination.pageSize, tokens])

  const openDetail = async (rawId) => {
    const id = rawId ?? 0
    setOpen(true)
    setModalMode('view')
    // seed with id so action buttons have a valid id immediately
    setDetail({ id })
    try {
      const data = await getRegistrationById(id, tokens)
      const normalizedId = data?.id ?? data?.registrationRequestId ?? data?.requestId ?? id
      setDetail({ id: normalizedId, ...data })
    } catch (e) {
      console.error('Error loading registration detail:', e)
    }
  }

  const openNote = async (rawId) => {
    const id = rawId ?? 0
    setOpen(true)
    setModalMode('note')
    setDetail({ id, note: '' })
    try {
      const data = await getRegistrationById(id, tokens)
      const normalizedId = data?.id ?? data?.registrationRequestId ?? data?.requestId ?? id
      setDetail({ id: normalizedId, ...data })
      noteBuffer.current = ''
    } catch (e) {
      console.error('Error loading registration for note:', e)
    }
  }

  const handleUpdateStatus = async (newStatus) => {
    if (!detail?.id) return
    setSaving(true)
    try {
      const res = await putRegistrationStatus(detail.id, { status: newStatus }, tokens)
      await load()
      setDetail((d) => d ? { ...d, status: newStatus } : d)
      if (res?.message) alert(res.message)
    } catch (e) {
      console.error('Error updating status:', e)
      alert(e?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateStatusFor = async (id, newStatus) => {
    setSaving(true)
    try {
      const res = await putRegistrationStatus(id, { status: newStatus }, tokens)
      await load()
      if (detail?.id === id) setDetail((d) => d ? { ...d, status: newStatus } : d)
      if (res?.message) alert(res.message)
    } catch (e) {
      console.error(e)
      alert(e?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNote = async () => {
    if (!detail?.id) return
    const note = noteBuffer.current ?? ''
    if (!note.trim()) { alert('Vui lòng nhập ghi chú'); return }
    setSaving(true)
    try {
      const res = await postRegistrationNote(detail.id, { note }, tokens)
      // Cập nhật UI ngay lập tức để modal Xem thấy nội dung mới
      setDetail((d) => d ? { ...d, note } : d)
      await load()
      if (res?.message) alert(res.message)
      setOpen(false)
    } catch (e) {
      alert(e?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleMarkInvalid = async () => {
    if (!detail?.id) return
    if (!window.confirm('Đánh dấu đăng ký này là không hợp lệ?')) return
    setSaving(true)
    try {
      const res = await putRegistrationInvalid(detail.id, tokens)
      await load()
      setDetail((d) => d ? { ...d, status: 'Invalid' } : d)
      if (res?.message) alert(res.message)
    } catch (e) {
      alert(e?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const openExamSelection = async (registration) => {
    setSelectedRegistration(registration)
    setShowExamModal(true)
    setLoadingExams(true)
    try {
      const examsData = await getExams(tokens)
      setExams(examsData)
    } catch (e) {
      alert('Không thể tải danh sách gói khám: ' + (e?.message || 'Có lỗi xảy ra'))
      setShowExamModal(false)
    } finally {
      setLoadingExams(false)
    }
  }

  const handleSendPayment = async (exam) => {
    if (!selectedRegistration) return
    
    // Kiểm tra trạng thái đăng ký
    if (selectedRegistration.status !== 'Contacted') {
      alert('Chỉ có thể gửi thanh toán khi đăng ký đã ở trạng thái "Kết nối". Vui lòng cập nhật trạng thái trước.')
      return
    }
    
    setSendingPayment(true)
    try {
      const registrationId = selectedRegistration.id || selectedRegistration.registrationRequestId || selectedRegistration.requestId
      const examId = exam.id || exam.examId
      
      if (!registrationId || !examId) {
        alert('Thiếu thông tin đăng ký hoặc gói khám')
        return
      }
      
      const result = await createPaymentForRegistration(registrationId, examId, tokens)
      
      if (result?.paymentUrl) {
        alert(`Gửi yêu cầu thanh toán thành công! Liên hệ với khách hàng để kiểm tra thanh toán`)
      } else {
        alert('Gửi yêu cầu thanh toán thành công!')
      }
      
      setShowExamModal(false)
      setSelectedRegistration(null)
      // Refresh the registration list
      await load()
    } catch (e) {
      alert('Gửi yêu cầu thanh toán thất bại: ' + (e?.message || 'Có lỗi xảy ra'))
    } finally {
      setSendingPayment(false)
    }
  }

  return (
    <div className="spr-container">
      <div className="spr-header">
        <h2>Đăng ký khám</h2>
      </div>

      <div className="spr-filters">
        <div className="spr-search">
          <input className="spr-input" placeholder="Tìm kiếm theo tên, email, sđt..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
        <div className="spr-filter">
          <select className="spr-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="Pending">Đang xử lý</option>
            <option value="Approved">Đã duyệt</option>
            <option value="Invalid">Không hợp lệ</option>
          </select>
        </div>
      </div>

      <div className="spr-table-container">
        <table className="spr-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Ngày đăng ký</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="spr-loading" colSpan="7">Đang tải...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="spr-empty" colSpan="7">Không có dữ liệu</td></tr>
            ) : (
              items.map((r, idx) => {
                const rid = r?.id ?? r?.registrationRequestId ?? r?.requestId
                return (
                <tr key={rid || idx}>
                  <td>{(pagination.page - 1) * pagination.pageSize + idx + 1}</td>
                  <td>{r.fullName || r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.phone || r.phoneNumber}</td>
                  <td>{(r.createdAt || r.startDate) ? new Date(r.createdAt || r.startDate).toLocaleString('vi-VN') : 'N/A'}</td>
                  <td>
                    <span className={`spr-status spr-status-${(r.status || '').toLowerCase()}`}>{r.status || 'N/A'}</span>
                  </td>
                  <td>
                    <div className="spr-actions-cell">
                      <button className="spr-btn" onClick={() => openDetail(rid)}>Xem</button>
                      <button className="spr-btn spr-btn-success" onClick={() => openNote(rid)}>Ghi chú</button>
                      <button className="spr-btn" onClick={async () => { await handleUpdateStatusFor(rid, 'Contacted') }}>Kết nối</button>
                      <button className="spr-btn spr-btn-danger" onClick={async () => { if (window.confirm('Đánh dấu không hợp lệ?')) { await putRegistrationInvalid(rid, tokens); load(); }}}>Không hợp lệ</button>
                      <button className="spr-btn spr-btn-warning" onClick={() => openExamSelection(r)}>Gửi Thanh Toán</button>
                    </div>
                  </td>
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>

      <div className="spr-pagination">
        <div className="spr-pagination-info">
          Hiển thị {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)}
          trong tổng số {pagination.total} bản ghi
        </div>
        <div className="spr-pagination-controls">
          <button className="spr-btn spr-btn-secondary" disabled={pagination.page === 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>Trước</button>
          <span className="spr-page-info">Trang {pagination.page} / {Math.ceil((pagination.total || 0) / pagination.pageSize || 1)}</span>
          <button className="spr-btn spr-btn-secondary" disabled={pagination.page >= Math.ceil((pagination.total || 0) / pagination.pageSize || 1)} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Sau</button>
        </div>
      </div>

      <DetailModal
        open={open}
        onClose={() => setOpen(false)}
        registration={detail}
        mode={modalMode}
        onSaveNoteRef={noteBuffer}
        onSaveNoteHandler={handleSaveNote}
        onUpdateStatus={handleUpdateStatus}
        onMarkInvalid={handleMarkInvalid}
        saving={saving}
      />

      {/* Exam Selection Modal */}
      {showExamModal && (
        <div className="sprm-overlay">
          <div className="sprm-modal">
            <div className="sprm-header">
              <h3>Chọn Gói Khám</h3>
              <button className="sprm-close" onClick={() => { setShowExamModal(false); setSelectedRegistration(null); }}>×</button>
            </div>
            <div className="sprm-body">
              {selectedRegistration && (
                <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                  <strong>Bệnh nhân:</strong> {selectedRegistration.fullName || selectedRegistration.name}<br/>
                  <strong>Email:</strong> {selectedRegistration.email}<br/>
                  <strong>SĐT:</strong> {selectedRegistration.phone || selectedRegistration.phoneNumber}<br/>
                  <strong>Trạng thái:</strong> <span style={{ 
                    color: selectedRegistration.status === 'Contacted' ? '#16a34a' : '#dc2626',
                    fontWeight: 'bold'
                  }}>{selectedRegistration.status}</span>
                  {selectedRegistration.status !== 'Contacted' && (
                    <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#fef2f2', borderRadius: '4px', border: '1px solid #fecaca' }}>
                      <small style={{ color: '#dc2626' }}>
                        ⚠️ Chỉ có thể gửi thanh toán khi đăng ký ở trạng thái "Contacted". Vui lòng cập nhật trạng thái trước.
                      </small>
                    </div>
                  )}
                </div>
              )}
              
              {loadingExams ? (
                <div className="sprm-loading">Đang tải danh sách gói khám...</div>
              ) : exams.length === 0 ? (
                <div className="sprm-loading">Không có gói khám nào</div>
              ) : (
                <div className="exam-list">
                  {exams.map((exam) => (
                    <div key={exam.id} className="exam-item">
                      <div className="exam-info">
                        <h4>{exam.name || exam.title}</h4>
                        <p className="exam-description">{exam.description}</p>
                        <div className="exam-price">
                          <strong>Số tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(exam.price || exam.amount || 0)}</strong>
                        </div>
                      </div>
                      <button 
                        className="spr-btn spr-btn-success"
                        onClick={() => handleSendPayment(exam)}
                        disabled={sendingPayment || selectedRegistration?.status !== 'Contacted'}
                      >
                        {sendingPayment ? 'Đang gửi...' : 'Chọn Gói'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffPatientRegistrations
