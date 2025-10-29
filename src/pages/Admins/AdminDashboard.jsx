import { useContext, useState } from 'react'
import { AuthContext } from '../../providers/AuthContext'
import './AdminDashboard.css'
import AccountManager from './AccountManager/AccountManager'
import RolesPage from './Roles/RolesPage'
import ExamManager from './ExamManager/ExamManager'
import { useNavigate } from 'react-router-dom'

function AdminDashboard() {
  const { logout, tokens } = useContext(AuthContext)
  const [active, setActive] = useState('dashboard')
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="ad-wrap">
      {/* Sidebar */}
      <aside className="ad-sidebar">
        <div className="ad-logo-row">
          <div className="ad-logo">🏥</div>
          <div>
            <div style={{ fontWeight: 700 }}>eClinic</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Dashboard Panel</div>
          </div>
        </div>
        <nav style={{ marginTop: 14 }}>
          {[
            { key: 'dashboard', label: 'Dashboard', icon: '📂' },
            { key: 'accounts', label: 'Accounts', icon: '👥' },
            { key: 'roles', label: 'Roles', icon: '🔐' },
            { key: 'exams', label: 'Exam Packages', icon: '🏥' },
            { key: 'appointments', label: 'Appointments', icon: '📅' },
          ].map((i) => (
            <button
              key={i.key}
              onClick={() => setActive(i.key)}
              className={`ad-side-item ${active === i.key ? 'active' : ''}`}
            >
              <span style={{ width: 22 }}>{i.icon}</span>
              <span>{i.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* nhánh main */}
      <main className="ad-main">
        <div className="ad-topbar">
          <div></div>
          <button onClick={handleLogout} className="ad-logout">Logout</button>
        </div>

        {active === 'dashboard' && (
          <>
            <div className="ad-cards">
              <div className="ad-card">
                <div className="ad-card-icon">🧑‍⚕️</div>
                <div>
                  <div className="ad-card-num">15</div>
                  <div className="ad-card-label">Doctors</div>
                </div>
              </div>
              <div className="ad-card">
                <div className="ad-card-icon">📘</div>
                <div>
                  <div className="ad-card-num">5</div>
                  <div className="ad-card-label">Appointments</div>
                </div>
              </div>
              <div className="ad-card">
                <div className="ad-card-icon">🧑</div>
                <div>
                  <div className="ad-card-num">3</div>
                  <div className="ad-card-label">Patients</div>
                </div>
              </div>
            </div>

          </>
        )}
  
        {/* Manage Staff view removed */}
        {active === 'accounts' && (
          <AccountManager />
        )}
        {active === 'roles' && (
          <RolesPage />
        )}
        {active === 'exams' && (
          <ExamManager />
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
