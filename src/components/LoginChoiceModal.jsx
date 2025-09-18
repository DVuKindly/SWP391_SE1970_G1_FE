import React from 'react'

const LoginChoiceModal = ({ open, onClose, onPatient, onStaff }) => {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ width: 'min(92vw, 640px)', background: 'white', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', overflow: 'hidden' }} onClick={(e)=>e.stopPropagation()}>
        <div style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #eee' }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: '#e7f2f0', display: 'grid', placeItems: 'center', color: 'var(--primary)', fontWeight: 700 }}>E</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2937' }}>ĐĂNG NHẬP</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Chọn loại tài khoản để tiếp tục</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: 22, lineHeight: 1, cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <button onClick={onPatient} style={{ padding: '20px 16px', border: '1px solid #e5e7eb', borderRadius: 10, background: '#f8fafc', cursor: 'pointer', fontSize: 16, fontWeight: 600, color: '#0b5d50' }}>Bệnh nhân</button>
          <button onClick={onStaff} style={{ padding: '20px 16px', border: '1px solid #e5e7eb', borderRadius: 10, background: '#f8fafc', cursor: 'pointer', fontSize: 16, fontWeight: 600, color: '#0b5d50' }}>Nhân viên</button>
        </div>
      </div>
    </div>
  )
}

export default LoginChoiceModal


