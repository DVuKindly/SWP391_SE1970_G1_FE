import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../providers/AuthContext'
import './StaffDoctorDashboard.css'
import { useNavigate } from 'react-router-dom'
import StaffAccountManagement from './StaffAccountManagement'
import StaffDoctorCreate from './StaffDoctorCreate'
import StaffProfileManagement from './StaffProfileManagement'

function StaffDoctorDashboard() {
  const { logout, tokens } = useContext(AuthContext)
  const [active, setActive] = useState('staff-accounts')
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
    window.addEventListener('sd.navigate', handler)
    return () => window.removeEventListener('sd.navigate', handler)
  }, [])

  return (
    <div className="sd-wrap">
      {/* Sidebar */}
      <aside className="sd-sidebar">
        <div className="sd-logo-row">
          <div className="sd-logo">👨‍⚕️</div>
          <div>
            <div style={{ fontWeight: 700 }}>eClinic</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Staff Doctor Panel</div>
          </div>
        </div>
        <nav style={{ marginTop: 14 }}>
          {[ 
            { key: 'staff-accounts', label: 'Quản lý tài khoản', icon: '👨‍⚕️' },
            { key: 'staff-profile', label: 'Thông tin cá nhân', icon: '👤' },
            { key: 'create-doctor', label: 'Tạo bác sĩ', icon: '➕' },
          ].map((i) => (
            <button
              key={i.key}
              onClick={() => setActive(i.key)}
              className={`sd-side-item ${active === i.key ? 'active' : ''}`}
            >
              <span style={{ width: 22 }}>{i.icon}</span>
              <span>{i.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="sd-main">
        <div className="sd-topbar">
          <div></div>
          <button onClick={handleLogout} className="sd-logout">Logout</button>
        </div>


        {active === 'staff-accounts' && (
          <StaffAccountManagement />
        )}

        {active === 'staff-profile' && (
          <StaffProfileManagement />
        )}
        {active === 'create-doctor' && (
          <StaffDoctorCreate />
        )}
      </main>
    </div>
  )
}

export default StaffDoctorDashboard
