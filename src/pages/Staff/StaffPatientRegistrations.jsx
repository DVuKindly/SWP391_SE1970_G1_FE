import { useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../../providers/AuthContext'
import {
  getRegistrations,
  getRegistrationsFiltered,
  getRegistrationById,
  putRegistrationStatus,
  postRegistrationNote,
  putRegistrationInvalid,
  setDirectPayment,
} from '../../services/staffpatient.api'
import { getExams } from '../../services/exam.api'
import { createPaymentForRegistration } from '../../services/payment.api'
import './StaffPatientRegistrations.css'

/* ============================================
 * 📌 Modal hiển thị chi tiết và ghi chú đăng ký
 * ============================================ */
function DetailModal({ open, onClose, registration, onSaveNoteRef, onSaveNoteHandler, onUpdateStatus, onMarkInvalid, saving }) {
  if (!open) return null

  // 🧹 Làm sạch text ghi chú (ẩn log hệ thống)
  const cleanNoteForView = (raw) => {
    if (!raw || typeof raw !== 'string') return ''
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
          <h3>Chi tiết đăng ký</h3>
          <button className="sprm-close" onClick={onClose}>×</button>
        </div>

        <div className="sprm-body">
          {!registration ? (
            <div className="sprm-loading">Đang tải...</div>
          ) : (
            <>
              <div className="sprm-grid">
                <div className="sprm-field"><span>Họ tên</span><b>{registration.fullName || registration.name || 'N/A'}</b></div>
                <div className="sprm-field"><span>Email</span><b>{registration.email || 'N/A'}</b></div>
                <div className="sprm-field"><span>Số điện thoại</span><b>{registration.phone || registration.phoneNumber || 'N/A'}</b></div>
                <div className="sprm-field"><span>Ngày đăng ký</span><b>{(registration.createdAt || registration.startDate) ? new Date(registration.createdAt || registration.startDate).toLocaleString('vi-VN') : 'N/A'}</b></div>
                <div className="sprm-field"><span>Trạng thái</span><b>{registration.status || 'N/A'}</b></div>
              </div>

              {/* 🔸 Khu vực ghi chú - Có thể chỉnh sửa */}
              <div className="sprm-section">
                <label>Ghi chú</label>
                <textarea
                  className="sprm-input"
                  rows={4}
                  defaultValue={cleanNoteForView(registration.note || registration.internalNote || registration.notes || registration.noteText || registration.remark || '')}
                  onChange={(e) => { onSaveNoteRef.current = e.target.value }}
                  placeholder="Nhập ghi chú..."
                />
              </div>

              {/* 🔘 Nút hành động */}
              <div className="sprm-actions">
                <button className="sprm-btn sprm-btn-success" onClick={onSaveNoteHandler} disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu ghi chú'}
                </button>
                <button className="sprm-btn sprm-btn-secondary" onClick={onClose}>Đóng</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ============================================
 * 🧾 Component chính: StaffPatientRegistrations
 * ============================================ */
function StaffPatientRegistrations() {
  const { tokens } = useContext(AuthContext)

  // ⚙️ State quản lý
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 })
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('all')
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [saving, setSaving] = useState(false)
  const noteBuffer = useMemo(() => ({ current: '' }), [])
  const [showExamModal, setShowExamModal] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [exams, setExams] = useState([])
  const [loadingExams, setLoadingExams] = useState(false)
  const [sendingPayment, setSendingPayment] = useState(false)
  const [isDirectPayment, setIsDirectPayment] = useState(false) // true = thanh toán trực tiếp, false = thanh toán online
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date())

  // 🔹 Xử lý hiển thị ghi chú
  const cleanNoteForView = (raw) => {
    if (!raw || typeof raw !== 'string') return ''
    return raw.replace(/^\s*\[[^\]]+\]\s+[^:]+:\s*/, '')
  }

  // 🔄 Load danh sách đăng ký
  const load = async () => {
    setLoading(true)
    try {
      const res = await getRegistrationsFiltered({
        email: keyword.trim(),
        status: status !== 'all' ? status : undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
      }, tokens)
      console.log('🔍 Registration data sample:', res.items?.[0]) // Debug payment status
      setItems(res.items || [])
      setPagination((p) => ({ ...p, total: res.total || 0 }))
      setLastUpdateTime(new Date())
    } catch (e) {
      console.error('Error loading registrations:', e)
    } finally {
      setLoading(false)
    }
  }

  // 🕒 Debounce tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => load(), 500)
    return () => clearTimeout(timer)
  }, [keyword])

  // 🔁 Reload khi đổi trạng thái / phân trang
  useEffect(() => { load() }, [status, pagination.page, pagination.pageSize])

  // ⏱️ Tự refresh mỗi 30 giây
  useEffect(() => {
    const intervalId = setInterval(() => load(), 30000)
    return () => clearInterval(intervalId)
  }, [])

  // 🔍 Xem chi tiết đăng ký (bao gồm cả ghi chú)
  const openDetail = async (rawId) => {
    const id = rawId ?? 0
    setOpen(true)
    setDetail({ id }) // seed id
    try {
      const data = await getRegistrationById(id, tokens)
      const normalizedId = data?.id ?? data?.registrationRequestId ?? data?.requestId ?? id
      setDetail({ id: normalizedId, ...data })
      // Khởi tạo noteBuffer với ghi chú hiện tại
      noteBuffer.current = data?.note || data?.internalNote || data?.notes || data?.noteText || data?.remark || ''
    } catch (e) {
      console.error('Error loading registration detail:', e)
    }
  }

  // ✅ Cập nhật trạng thái chi tiết
  const handleUpdateStatus = async (newStatus) => {
    if (!detail?.id) return
    setSaving(true)
    try {
      const res = await putRegistrationStatus(detail.id, { status: newStatus }, tokens)
      await load()
      setDetail((d) => d ? { ...d, status: newStatus } : d)
      const message = res?.message || 'Cập nhật trạng thái thành công'
      alert(message)
    } catch (e) {
      console.error('Error updating status:', e)
      const errorMsg = e?.response?.data?.message || e?.message || 'Có lỗi xảy ra'
      alert(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  // 🔄 Cập nhật trạng thái chung (dùng cho bảng)
  const handleUpdateStatusFor = async (id, newStatus) => {
    setSaving(true)
    try {
      const res = await putRegistrationStatus(id, { status: newStatus }, tokens)
      await load()
      if (detail?.id === id) setDetail((d) => d ? { ...d, status: newStatus } : d)
      const message = res?.message || 'Cập nhật trạng thái thành công'
      alert(message)
    } catch (e) {
      console.error(e)
      const errorMsg = e?.response?.data?.message || e?.message || 'Có lỗi xảy ra'
      alert(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  // 🧾 Lưu ghi chú
  const handleSaveNote = async () => {
    if (!detail?.id) return
    const note = noteBuffer.current ?? ''
    if (!note.trim()) { alert('Vui lòng nhập ghi chú'); return }
    setSaving(true)
    try {
      const res = await postRegistrationNote(detail.id, { note }, tokens)
      setDetail((d) => d ? { ...d, note } : d) // cập nhật local
      await load()
      const message = res?.message || 'Lưu ghi chú thành công'
      alert(message)
      setOpen(false)
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || 'Có lỗi xảy ra'
      alert(errorMsg)
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
    const message = res?.message || 'Đã đánh dấu không hợp lệ'
    alert(message)
  } catch (e) {
    const errorMsg = e?.response?.data?.message || e?.message || 'Có lỗi xảy ra'
    alert(errorMsg)
  } finally {
    setSaving(false)
  }
}

// 🧾 Mở popup chọn gói khám
const openExamSelection = async (registration, isDirect = false) => {
  setSelectedRegistration(registration)
  setIsDirectPayment(isDirect)
  setShowExamModal(true)
  setLoadingExams(true)
  try {
    const examsData = await getExams(tokens)
    setExams(examsData)
  } catch (e) {
    const errorMsg = e?.response?.data?.message || e?.message || 'Không thể tải danh sách gói khám'
    alert(errorMsg)
    setShowExamModal(false)
  } finally {
    setLoadingExams(false)
  }
}

// 📤 Gửi thanh toán online (VNPay)
const handleSendPayment = async (exam) => {
  if (!selectedRegistration) return

  // Kiểm tra điều kiện
  if (selectedRegistration.status !== 'Contacted') {
    alert('Chỉ có thể gửi thanh toán khi đăng ký đã ở trạng thái "Contacted".')
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
    const message = result?.message || 'Gửi yêu cầu thanh toán thành công!'
    alert(message)

    setShowExamModal(false)
    setSelectedRegistration(null)
    await load()
  } catch (e) {
    const errorMsg = e?.response?.data?.message || e?.message || 'Gửi yêu cầu thanh toán thất bại'
    alert(errorMsg)
  } finally {
    setSendingPayment(false)
  }
}

// 💵 Đánh dấu thanh toán trực tiếp
const handleDirectPayment = async (exam) => {
  if (!selectedRegistration) return

  if (selectedRegistration.status !== 'Contacted') {
    alert('Chỉ có thể thanh toán trực tiếp khi đăng ký ở trạng thái "Contacted".')
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

    const result = await setDirectPayment(registrationId, examId, tokens)
    const message = result?.message || 'Đã chuyển sang thanh toán trực tiếp thành công!'
    alert(message)

    setShowExamModal(false)
    setSelectedRegistration(null)
    await load()
  } catch (e) {
    const errorMsg = e?.response?.data?.message || e?.message || 'Cập nhật thanh toán trực tiếp thất bại'
    alert(errorMsg)
  } finally {
    setSendingPayment(false)
  }
}

/* =======================================================
 * 📋 Giao diện chính: danh sách đăng ký + bộ lọc + actions
 * ======================================================= */
return (
  <div className="spr-container">
    <div className="spr-header">
      <h2>Đăng ký khám</h2>
    </div>

    {/* 🔍 Bộ lọc tìm kiếm */}
    <div className="spr-filters">
      <div className="spr-search">
        <input
          className="spr-input"
          placeholder="Tìm kiếm theo tên, email, sđt..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>
      <div className="spr-filter">
        <select
          className="spr-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="Pending">Đang xử lý</option>
          <option value="Contacted">Đã kết nối</option>
          <option value="Direct_Payment">Thanh toán trực tiếp</option>
          <option value="Approved">Đã duyệt</option>
          {/* ➕ Trạng thái mới */}
          <option value="Examined">Đã đến khám</option>
          <option value="Invalid">Không hợp lệ</option>
        </select>
      </div>
    </div>

    {/* 🧾 Bảng danh sách đăng ký */}
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
            <th>TT Thanh toán</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td className="spr-loading" colSpan="8">Đang tải...</td></tr>
          ) : items.length === 0 ? (
            <tr><td className="spr-empty" colSpan="8">Không có dữ liệu</td></tr>
          ) : (
            items.map((r, idx) => {
              const rid = r?.id ?? r?.registrationRequestId ?? r?.requestId
              return (
                <tr key={rid || idx}>
                  <td>{(pagination.page - 1) * pagination.pageSize + idx + 1}</td>
                  <td>{r.fullName || r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.phone || r.phoneNumber}</td>
                  <td>{(r.createdAt || r.startDate)
                    ? new Date(r.createdAt || r.startDate).toLocaleString('vi-VN')
                    : 'N/A'}
                  </td>
                  <td>
                    <span className={`spr-status spr-status-${(r.status || '').toLowerCase()}`}>
                      {r.status || 'N/A'}
                    </span>
                  </td>
                  <td>
                    {(() => {
                      // Kiểm tra cả camelCase và PascalCase
                      const paymentStatus = r.paymentStatus || r.PaymentStatus || '';
                      const statusLower = paymentStatus.toLowerCase();
                      return (
                        <span className={`spr-status spr-payment-${statusLower}`}>
                          {
                            paymentStatus === 'Unpaid' ? 'Chưa thanh toán' :
                            paymentStatus === 'DirectPaid' ? 'TT trực tiếp' :
                            paymentStatus === 'VnPayPaid' ? 'TT VNPay' :
                            paymentStatus === 'Refunded' ? 'Đã hoàn tiền' :
                            paymentStatus || 'N/A'
                          }
                        </span>
                      )
                    })()}
                  </td>
                  <td>
                    <div className="spr-actions-cell">
                      {/* 🔹 Các nút hành động - Màu sắc phân biệt rõ ràng */}
                      <button className="spr-btn spr-btn-info" onClick={() => openDetail(rid)}>Xem</button>
                      <button className="spr-btn spr-btn-primary" onClick={async () => { await handleUpdateStatusFor(rid, 'Contacted') }}>Kết nối</button>
                      <button className="spr-btn spr-btn-danger" onClick={async () => {
                        if (window.confirm('Đánh dấu không hợp lệ?')) {
                          await putRegistrationInvalid(rid, tokens)
                          load()
                        }
                      }}>Không hợp lệ</button>
                      <button className="spr-btn spr-btn-warning" onClick={() => openExamSelection(r, false)}>Gửi Thanh Toán</button>
                      <button className="spr-btn spr-btn-orange" onClick={() => openExamSelection(r, true)}>Thanh Toán Trực Tiếp</button>
                      <button className="spr-btn spr-btn-success" onClick={() => openExamSelection(r, true)}>Xuất Hóa Đơn</button>
                      <button className="spr-btn spr-btn-purple" onClick={async () => { await handleUpdateStatusFor(rid, 'Examined') }}>Đã khám</button>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>

    {/* 🔄 Phân trang */}
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

    {/* 📋 Modal chi tiết và ghi chú */}
    <DetailModal
      open={open}
      onClose={() => setOpen(false)}
      registration={detail}
      onSaveNoteRef={noteBuffer}
      onSaveNoteHandler={handleSaveNote}
      onUpdateStatus={handleUpdateStatus}
      onMarkInvalid={handleMarkInvalid}
      saving={saving}
    />

    {/* 💰 Modal chọn gói khám */}
    {showExamModal && (
      <div className="sprm-overlay">
        <div className="sprm-modal">
          <div className="sprm-header">
            <h3>{isDirectPayment ? 'Chọn Gói Khám - Thanh Toán Trực Tiếp' : 'Chọn Gói Khám - Gửi Link Thanh Toán'}</h3>
            <button className="sprm-close" onClick={() => { setShowExamModal(false); setSelectedRegistration(null); setIsDirectPayment(false); }}>×</button>
          </div>
          <div className="sprm-body">
            {selectedRegistration && (
              <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <strong>Bệnh nhân:</strong> {selectedRegistration.fullName || selectedRegistration.name}<br />
                <strong>Email:</strong> {selectedRegistration.email}<br />
                <strong>SĐT:</strong> {selectedRegistration.phone || selectedRegistration.phoneNumber}<br />
                <strong>Trạng thái:</strong>{' '}
                <span style={{
                  color: selectedRegistration.status === 'Contacted' ? '#16a34a' : '#dc2626',
                  fontWeight: 'bold'
                }}>{selectedRegistration.status}</span>

                {/* ⚠️ Cảnh báo điều kiện thanh toán */}
                {selectedRegistration.status !== 'Contacted' && (
                  <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#fef2f2', borderRadius: '4px', border: '1px solid #fecaca' }}>
                    <small style={{ color: '#dc2626' }}>
                      ⚠️ Chỉ có thể {isDirectPayment ? 'thanh toán trực tiếp' : 'gửi thanh toán'} khi đăng ký ở trạng thái "Contacted".
                    </small>
                  </div>
                )}

                {/* ℹ️ Gợi ý nếu là thanh toán trực tiếp */}
                {isDirectPayment && selectedRegistration.status === 'Contacted' && (
                  <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                    <small style={{ color: '#0369a1' }}>
                      ℹ️ Sau khi chọn gói, trạng thái sẽ được chuyển sang "Direct_Payment".
                    </small>
                  </div>
                )}
              </div>
            )}

            {/* Danh sách gói khám */}
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
                        <strong>
                          Giá:{' '}
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(exam.price || exam.amount || 0)}
                        </strong>
                      </div>
                    </div>
                    <button
                      className="spr-btn spr-btn-success"
                      onClick={() => isDirectPayment ? handleDirectPayment(exam) : handleSendPayment(exam)}
                      disabled={sendingPayment || selectedRegistration?.status !== 'Contacted'}
                    >
                      {sendingPayment ? 'Đang xử lý...' : (isDirectPayment ? 'Chọn Gói' : 'Gửi Thanh Toán')}
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
