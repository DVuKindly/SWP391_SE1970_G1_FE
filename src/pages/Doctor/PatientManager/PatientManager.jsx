import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../providers/AuthContext';
import { getExaminedPatients } from '../../../services/prescription.api';
import './PatientManager.css';

function PatientManager() {
  const { tokens } = useContext(AuthContext);
  const [examinedPatients, setExaminedPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  // Load examined patients
  const loadExaminedPatients = async () => {
    if (!tokens) return; // Don't load if no token
    setLoading(true);
    try {
      const data = await getExaminedPatients(keyword.trim(), tokens);
      console.log('🔍 Examined patients data:', data);
      if (data && data.length > 0) {
        console.log('🔍 First patient object:', data[0]);
      }
      setExaminedPatients(data);
    } catch (e) {
      console.error('Error loading examined patients:', e);
      alert('Không thể tải danh sách bệnh nhân đã khám');
    } finally {
      setLoading(false);
    }
  };

  // Search with debounce
  useEffect(() => {
    if (!tokens) return; // Don't run if no token
    const timer = setTimeout(() => loadExaminedPatients(), 500);
    return () => clearTimeout(timer);
  }, [keyword, tokens]);

  // Initial load
  useEffect(() => {
    if (!tokens) return; // Don't run if no token
    loadExaminedPatients();
  }, [tokens]);

  return (
    <section className="dd-panel">
      <div className="dd-panel-title">
        <h3 style={{ margin: 0 }}>Bệnh nhân đã khám</h3>
      </div>
      <div className="pm-subtitle">Danh sách bệnh nhân đã được khám bệnh</div>

      {/* Search box */}
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Tìm kiếm bệnh nhân (tên, email, số điện thoại)..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 16px',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            fontSize: 14
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
          Đang tải...
        </div>
      ) : examinedPatients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
          Không có bệnh nhân nào đã khám
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>#</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Họ tên</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Tên cuộc khám</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Ngày khám</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {examinedPatients.map((patient, index) => (
                <tr key={patient.appointmentId || patient.patientId || patient.id || index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px' }}>{index + 1}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                    {patient.fullName || patient.name || 'N/A'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                    {patient.email || 'N/A'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {patient.examName || 'N/A'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {patient.examinedAt
                      ? new Date(patient.examinedAt).toLocaleString('vi-VN')
                      : 'N/A'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                      backgroundColor: '#d1fae5',
                      color: '#065f46'
                    }}>
                      Đã khám
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 16, color: '#6b7280', fontSize: 14 }}>
        Tổng: {examinedPatients.length} bệnh nhân
      </div>
    </section>
  );
}

export default PatientManager;