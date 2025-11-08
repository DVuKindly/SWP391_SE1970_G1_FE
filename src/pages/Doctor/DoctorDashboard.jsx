import { useContext, useState } from 'react';
import { AuthContext } from '../../providers/AuthContext';
import './DoctorDashboard.css';
import { useNavigate } from 'react-router-dom';
import PatientManager from './PatientManager/PatientManager';
import PrescriptionManagement from './PrescriptionManagement';

function DoctorDashboard() {
  const { logout, tokens } = useContext(AuthContext);
  const [active, setActive] = useState('prescriptions');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dd-wrap">
      {/* Sidebar */}
      <aside className="dd-sidebar">
        <div className="dd-logo-row">
          <div className="dd-logo">🏥</div>
          <div>
            <div style={{ fontWeight: 700 }}>eClinic</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Bác sĩ</div>
          </div>
        </div>
        <nav style={{ marginTop: 14 }}>
          {[
            { key: 'prescriptions', label: 'Kê đơn thuốc', icon: '�' },
            { key: 'patients', label: 'Bệnh nhân', icon: '👥' },
            { key: 'appointments', label: 'Lịch hẹn', icon: '�' },
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

      {/* Main Content */}
      <main className="dd-main">
        <div className="dd-topbar">
          <div></div>
          <button onClick={handleLogout} className="dd-logout">Đăng xuất</button>
        </div>

        {active === 'prescriptions' && <PrescriptionManagement />}

        {active === 'patients' && <PatientManager />}

        {active === 'appointments' && (
          <div className="dd-content">
            <h2>Lịch hẹn</h2>
            <p>Nội dung quản lý lịch hẹn sẽ hiển thị ở đây.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default DoctorDashboard;