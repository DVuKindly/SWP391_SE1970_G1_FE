import { useContext, useState } from 'react'
import { AuthContext } from '../../providers/AuthContext'
import './DoctorDashboard.css'
import { useNavigate } from 'react-router-dom'

function DoctorDashboard() {
  const { logout, tokens } = useContext(AuthContext)
  const [active, setActive] = useState('dashboard')
  const navigate = useNavigate()

  const latestBookings = [
    { id: 1, patient: 'Avinash Kr', date: '5 Oct 2024', status: 'Pending' },
    { id: 2, patient: 'GreatStack', date: '26 Sep 2024', status: 'Cancelled' },
    { id: 3, patient: 'GreatStack', date: '25 Sep 2024', status: 'Completed' },
    { id: 4, patient: 'GreatStack', date: '23 Sep 2024', status: 'Completed' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="dd-wrap">
      {/* Header */}
      <header className="dd-header">
        <div className="dd-header-left">
          <div className="dd-header-logo">
            <div className="dd-header-logo-icon">P</div>
            <div className="dd-header-logo-text">
              <div>Prescripto</div>
              <div>Dashboard Panel</div>
            </div>
          </div>
          <div className="dd-role-badge">Doctor</div>
        </div>
        <button onClick={handleLogout} className="dd-logout">Logout</button>
      </header>

      {/* Sidebar */}
      <aside className="dd-sidebar">
        <div className="dd-logo-row">
          <div className="dd-logo">P</div>
          <div>
            <div style={{ fontWeight: 700 }}>Prescripto</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Dashboard Panel</div>
          </div>
          <div className="dd-role-badge">Doctor</div>
        </div>
        <nav style={{ marginTop: 14 }}>
          {[
            { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
            { key: 'appointments', label: 'Appointments', icon: '📅' },
            { key: 'profile', label: 'Profile', icon: '👤' },
          ].map((i) => (
            <button
              key={i.key}
              onClick={() => setActive(i.key)}
              className={`dd-side-item ${active === i.key ? 'active' : ''}`}
            >
              <span style={{ width: 22 }}>{i.icon}</span>
              <span>{i.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="dd-main">
        {active === 'dashboard' && (
          <>
            <div className="dd-cards">
              <div className="dd-card">
                <div className="dd-card-icon">💰</div>
                <div>
                  <div className="dd-card-num">$ 80</div>
                  <div className="dd-card-label">Earnings</div>
                </div>
              </div>
              <div className="dd-card">
                <div className="dd-card-icon">📘</div>
                <div>
                  <div className="dd-card-num">4</div>
                  <div className="dd-card-label">Appointments</div>
                </div>
              </div>
              <div className="dd-card">
                <div className="dd-card-icon">👥</div>
                <div>
                  <div className="dd-card-num">2</div>
                  <div className="dd-card-label">Patients</div>
                </div>
              </div>
            </div>

            <section className="dd-panel">
              <div className="dd-panel-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="dd-badge">📋</span>
                  <h3 style={{ margin: 0 }}>Latest Bookings</h3>
                </div>
              </div>
              <div>
                {latestBookings.map((b, idx) => (
                  <div key={b.id} className="dd-booking-row" style={{ borderTop: idx === 0 ? 'none' : undefined }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="dd-avatar">👤</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{b.patient}</div>
                        <div style={{ color: '#64748b', fontSize: 13 }}>Booking on {b.date}</div>
                      </div>
                    </div>
                    <div>
                      {b.status === 'Cancelled' ? (
                        <span className="dd-status-danger">Cancelled</span>
                      ) : b.status === 'Completed' ? (
                        <span className="dd-status-success">Completed</span>
                      ) : b.status === 'Pending' ? (
                        <div className="dd-status-pending">
                          <button className="dd-action-btn danger">✕</button>
                          <button className="dd-action-btn success">✓</button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {active === 'appointments' && (
          <div className="dd-content">
            <h2>Appointments</h2>
            <p>Appointment management content will be displayed here.</p>
          </div>
        )}

        {active === 'profile' && (
          <div className="dd-content">
            <h2>Profile</h2>
            <p>Profile management content will be displayed here.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default DoctorDashboard