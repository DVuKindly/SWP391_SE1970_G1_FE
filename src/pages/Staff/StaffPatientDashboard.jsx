import { useContext, useState } from 'react'
import { AuthContext } from '../../providers/AuthContext'
import './StaffPatientDashboard.css'
import { useNavigate } from 'react-router-dom'

function StaffPatientDashboard() {
  const { logout, tokens } = useContext(AuthContext)
  const [active, setActive] = useState('appointments')
  const navigate = useNavigate()

  const latestAppointments = [
    { id: 1, doctor: 'Dr. Richard James', date: '26 Sep 2024', time: '09:00 AM', status: 'Scheduled' },
    { id: 2, doctor: 'Dr. Sarah Wilson', date: '25 Sep 2024', time: '02:30 PM', status: 'Completed' },
    { id: 3, doctor: 'Dr. Michael Brown', date: '27 Sep 2024', time: '11:00 AM', status: 'Scheduled' },
    { id: 4, doctor: 'Dr. Emily Davis', date: '24 Sep 2024', time: '03:00 PM', status: 'Cancelled' },
    { id: 5, doctor: 'Dr. David Lee', date: '28 Sep 2024', time: '10:00 AM', status: 'Scheduled' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

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
            { key: 'appointments', label: 'My Appointments', icon: '📅' },
            { key: 'doctors', label: 'Available Doctors', icon: '👨‍⚕️' },
            { key: 'medical-records', label: 'Medical Records', icon: '📋' },
            { key: 'profile', label: 'Profile', icon: '👤' },
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

        {active === 'appointments' && (
          <>
            <div className="sp-cards">
              <div className="sp-card">
                <div className="sp-card-icon">📅</div>
                <div>
                  <div className="sp-card-num">3</div>
                  <div className="sp-card-label">Upcoming Appointments</div>
                </div>
              </div>
              <div className="sp-card">
                <div className="sp-card-icon">✅</div>
                <div>
                  <div className="sp-card-num">5</div>
                  <div className="sp-card-label">Completed</div>
                </div>
              </div>
              <div className="sp-card">
                <div className="sp-card-icon">❌</div>
                <div>
                  <div className="sp-card-num">1</div>
                  <div className="sp-card-label">Cancelled</div>
                </div>
              </div>
            </div>

            <section className="sp-panel">
              <div className="sp-panel-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="sp-badge">▣</span>
                  <h3 style={{ margin: 0 }}>My Appointments</h3>
                </div>
              </div>
              <div>
                {latestAppointments.map((a, idx) => (
                  <div key={a.id} className="sp-appointment-row" style={{ borderTop: idx === 0 ? 'none' : undefined }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src="/orthoc/images/t1.jpg" alt="doctor" style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.doctor}</div>
                        <div style={{ color: '#64748b', fontSize: 13 }}>{a.date} at {a.time}</div>
                      </div>
                    </div>
                    <div>
                      {a.status === 'Cancelled' ? (
                        <span className="sp-status-danger">Cancelled</span>
                      ) : a.status === 'Completed' ? (
                        <span className="sp-status-success">Completed</span>
                      ) : (
                        <span className="sp-status-warning">Scheduled</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {active === 'doctors' && (
          <div className="sp-content">
            <h2>Available Doctors</h2>
            <p>Doctor listing and booking content will be displayed here.</p>
          </div>
        )}

        {active === 'medical-records' && (
          <div className="sp-content">
            <h2>Medical Records</h2>
            <p>Medical records and history content will be displayed here.</p>
          </div>
        )}

        {active === 'profile' && (
          <div className="sp-content">
            <h2>Profile</h2>
            <p>Profile management content will be displayed here.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default StaffPatientDashboard
