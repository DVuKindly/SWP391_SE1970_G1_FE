import { useContext, useState } from 'react'
import { AuthContext } from '../../providers/AuthContext'
import './StaffDoctorDashboard.css'
import { useNavigate } from 'react-router-dom'

function StaffDoctorDashboard() {
  const { logout, tokens } = useContext(AuthContext)
  const [active, setActive] = useState('appointments')
  const navigate = useNavigate()

  const latestAppointments = [
    { id: 1, patient: 'John Smith', date: '26 Sep 2024', time: '09:00 AM', status: 'Scheduled' },
    { id: 2, patient: 'Sarah Johnson', date: '26 Sep 2024', time: '10:30 AM', status: 'Completed' },
    { id: 3, patient: 'Mike Wilson', date: '27 Sep 2024', time: '02:00 PM', status: 'Scheduled' },
    { id: 4, patient: 'Emily Brown', date: '27 Sep 2024', time: '03:30 PM', status: 'Cancelled' },
    { id: 5, patient: 'David Lee', date: '28 Sep 2024', time: '11:00 AM', status: 'Scheduled' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

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
            { key: 'appointments', label: 'My Appointments', icon: '📅' },
            { key: 'patients', label: 'My Patients', icon: '👥' },
            { key: 'schedule', label: 'Schedule', icon: '📋' },
            { key: 'profile', label: 'Profile', icon: '👤' },
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

        {active === 'appointments' && (
          <>
            <div className="sd-cards">
              <div className="sd-card">
                <div className="sd-card-icon">📅</div>
                <div>
                  <div className="sd-card-num">12</div>
                  <div className="sd-card-label">Today's Appointments</div>
                </div>
              </div>
              <div className="sd-card">
                <div className="sd-card-icon">✅</div>
                <div>
                  <div className="sd-card-num">8</div>
                  <div className="sd-card-label">Completed</div>
                </div>
              </div>
              <div className="sd-card">
                <div className="sd-card-icon">⏰</div>
                <div>
                  <div className="sd-card-num">4</div>
                  <div className="sd-card-label">Pending</div>
                </div>
              </div>
            </div>

            <section className="sd-panel">
              <div className="sd-panel-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="sd-badge">▣</span>
                  <h3 style={{ margin: 0 }}>My Appointments</h3>
                </div>
              </div>
              <div>
                {latestAppointments.map((a, idx) => (
                  <div key={a.id} className="sd-appointment-row" style={{ borderTop: idx === 0 ? 'none' : undefined }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src="/orthoc/images/t1.jpg" alt="patient" style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.patient}</div>
                        <div style={{ color: '#64748b', fontSize: 13 }}>{a.date} at {a.time}</div>
                      </div>
                    </div>
                    <div>
                      {a.status === 'Cancelled' ? (
                        <span className="sd-status-danger">Cancelled</span>
                      ) : a.status === 'Completed' ? (
                        <span className="sd-status-success">Completed</span>
                      ) : (
                        <span className="sd-status-warning">Scheduled</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {active === 'patients' && (
          <div className="sd-content">
            <h2>My Patients</h2>
            <p>Patient management content will be displayed here.</p>
          </div>
        )}

        {active === 'schedule' && (
          <div className="sd-content">
            <h2>Schedule</h2>
            <p>Schedule management content will be displayed here.</p>
          </div>
        )}

        {active === 'profile' && (
          <div className="sd-content">
            <h2>Profile</h2>
            <p>Profile management content will be displayed here.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default StaffDoctorDashboard
