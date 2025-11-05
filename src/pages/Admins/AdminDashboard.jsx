import { useContext, useState } from 'react'
import { AuthContext } from '../../providers/AuthContext'
import './AdminDashboard.css'
import AccountManager from './AccountManager/AccountManager'
import RolesPage from './Roles/RolesPage'
import ExamManager from './ExamManager/ExamManager'
import DepartmentManager from './DepartmentManager/DepartmentManager'
import RevenueDashboard from './RevenueDashboard'
import { useNavigate } from 'react-router-dom'

function AdminDashboard() {
  const { logout, tokens } = useContext(AuthContext)
  const [active, setActive] = useState('accounts')
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
            <div style={{ fontSize: 12, color: '#64748b' }}>Admin Panel</div>
          </div>
        </div>
        <nav style={{ marginTop: 14 }}>
          {[
            { key: 'accounts', label: 'Accounts', icon: '👥' },
            { key: 'roles', label: 'Roles', icon: '🔐' },
            { key: 'departments', label: 'Departments', icon: '🏢' },
            { key: 'exams', label: 'Exam Packages', icon: '🏥' },
            { key: 'revenue', label: 'Revenue', icon: '💰' },
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

        {active === 'accounts' && (
          <AccountManager />
        )}
        {active === 'roles' && (
          <RolesPage />
        )}
        {active === 'departments' && (
          <DepartmentManager />
        )}
        {active === 'exams' && (
          <ExamManager />
        )}
        {active === 'revenue' && (
          <RevenueDashboard />
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
