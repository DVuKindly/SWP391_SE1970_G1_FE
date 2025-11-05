import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../providers/AuthContext'
import './StaffPatientDashboard.css'
import { useNavigate } from 'react-router-dom'
import StaffPatientManagement from './StaffPatientManagement'
import StaffPatientRegistrations from './StaffPatientRegistrations'
import StaffPatientCreate from './StaffPatientCreate'
import StaffAppointments from './StaffAppointments'
import StaffBookedAppointments from './StaffBookedAppointments'
import StaffPrescriptionManagement from './StaffPrescriptionManagement'

function StaffPatientDashboard() {
  const { logout, tokens } = useContext(AuthContext)
  const [active, setActive] = useState('patient-registrations')
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  useEffect(() => {
    const handler = (e) => {
      const key = e?.detail?.key
      if (key) setActive(key)
    }
    window.addEventListener('sp.navigate', handler)
    return () => window.removeEventListener('sp.navigate', handler)
  }, [])

  return (
    <div className="sp-wrap">
      {/* Sidebar */}
      <aside className="sp-sidebar">
        <div className="sp-logo-row">
          <div className="sp-logo">👩‍⚕️</div>
          <div>
            <div style={{ fontWeight: 700 }}>eClinic</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Staff Patient Panel</div>
          </div>
        </div>
        <nav style={{ marginTop: 14 }}>
          {[ 
            { key: 'patient-registrations', label: 'Đăng ký khám', icon: '📝' },
            { key: 'appointments', label: 'Đặt Lịch Khám', icon: '📅' },
            { key: 'booked-appointments', label: 'Lịch hẹn đã đặt', icon: '✅' },
            { key: 'prescriptions', label: 'Kê đơn thuốc', icon: '💊' },
            { key: 'patient-accounts', label: 'Quản lý tài khoản bệnh nhân', icon: '👩‍⚕️' },
            { key: 'create-patient', label: 'Tạo bệnh nhân', icon: '➕' },
          ].map((i) => (
            <button
              key={i.key}
              onClick={() => setActive(i.key)}
              className={`sp-side-item ${active === i.key ? 'active' : ''}`}
            >
              <span style={{ width: 22 }}>{i.icon}</span>
              <span>{i.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="sp-main">
        <div className="sp-topbar">
          <div></div>
          <button onClick={handleLogout} className="sp-logout">Logout</button>
        </div>

        {active === 'patient-registrations' && (
          <StaffPatientRegistrations />
        )}
        {active === 'appointments' && (
          <StaffAppointments />
        )}
        {active === 'booked-appointments' && (
          <StaffBookedAppointments />
        )}
        {active === 'prescriptions' && (
          <StaffPrescriptionManagement />
        )}
        {active === 'patient-accounts' && (
          <StaffPatientManagement />
        )}

        {active === 'create-patient' && (
          <StaffPatientCreate />
        )}
      </main>
    </div>
  )
}

export default StaffPatientDashboard
