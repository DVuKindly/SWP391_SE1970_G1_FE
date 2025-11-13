import { useContext, useState } from 'react';
import { AuthContext } from '../../providers/AuthContext';
import { useNavigate } from 'react-router-dom';
import PatientProfile from './PatientProfile';
import PatientAppointments from './PatientAppointments';
import PatientPrescriptions from './PatientPrescriptions';
import './PatientDashboard.css';

function PatientDashboard() {
  const { logout, user } = useContext(AuthContext);
  const [active, setActive] = useState('profile');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="patient-dashboard">
      {/* Sidebar */}
      <aside className="patient-sidebar">
        <div className="patient-logo-row">
          <div className="patient-logo">🏥</div>
          <div>
            <div style={{ fontWeight: 700 }}>eClinic</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Bệnh nhân</div>
          </div>
        </div>
        
        <div className="patient-user-info">
          <div className="patient-avatar">{user?.fullName?.charAt(0) || 'P'}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.fullName || 'Bệnh nhân'}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{user?.email}</div>
          </div>
        </div>

        <nav style={{ marginTop: 24 }}>
          {[
            { key: 'profile', label: 'Hồ sơ', icon: '👤' },
            { key: 'appointments', label: 'Lịch hẹn', icon: '📅' },
            { key: 'prescriptions', label: 'Đơn thuốc', icon: '💊' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`patient-nav-item ${active === item.key ? 'active' : ''}`}
            >
              <span style={{ width: 22 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="patient-main">
        <div className="patient-topbar">
          <h2 className="patient-page-title">
            {active === 'profile' && 'Hồ sơ của tôi'}
            {active === 'appointments' && 'Lịch hẹn'}
            {active === 'prescriptions' && 'Đơn thuốc'}
          </h2>
          <button onClick={handleLogout} className="patient-logout-btn">
            Đăng xuất
          </button>
        </div>

        <div className="patient-content">
          {active === 'profile' && <PatientProfile />}
          {active === 'appointments' && <PatientAppointments />}
          {active === 'prescriptions' && <PatientPrescriptions />}
        </div>
      </main>
    </div>
  );
}

export default PatientDashboard;
