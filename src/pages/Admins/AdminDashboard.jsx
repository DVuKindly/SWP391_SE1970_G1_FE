import { useContext, useState } from 'react'
import { AuthContext } from '../../providers/AuthContext'
import './AdminDashboard.css'
import ManageStaff from './ManageStaff'
import { useNavigate } from 'react-router-dom'

function AdminDashboard() {
  const { logout, tokens } = useContext(AuthContext)
  const [active, setActive] = useState('dashboard')
  const navigate = useNavigate()

  const latestBookings = [
    { id: 1, doctor: 'Dr. Richard James', date: '26 Sep 2024', status: 'Cancelled' },
    { id: 2, doctor: 'Dr. Christopher Davis', date: '23 Sep 2024', status: 'Completed' },
    { id: 3, doctor: 'Dr. Richard James', date: '25 Sep 2024', status: 'Completed' },
    { id: 4, doctor: 'Dr. Richard James', date: '23 Sep 2024', status: 'Completed' },
    { id: 5, doctor: 'Dr. Emily Larson', date: '22 Sep 2024', status: 'Completed' },
  ]

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
            { key: 'appointments', label: 'Appointments', icon: '📅' },
            { key: 'add-doctor', label: 'Add Doctor', icon: '➕' },
            { key: 'create-staff', label: 'Manage Staff', icon: '🧑‍💼' },
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

            <section className="ad-panel">
              <div className="ad-panel-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="ad-badge">▣</span>
                  <h3 style={{ margin: 0 }}>Latest Bookings</h3>
                </div>
              </div>
              <div>
                {latestBookings.map((b, idx) => (
                  <div key={b.id} className="ad-booking-row" style={{ borderTop: idx === 0 ? 'none' : undefined }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src="/orthoc/images/t1.jpg" alt="doc" style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{b.doctor}</div>
                        <div style={{ color: '#64748b', fontSize: 13 }}>Booking on {b.date}</div>
                      </div>
                    </div>
                    <div>
                      {b.status === 'Cancelled' ? (
                        <span className="ad-status-danger">Cancelled</span>
                      ) : (
                        <span className="ad-status-success">Completed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
  
        {active === 'create-staff' && (
          <ManageStaff />
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
