import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../providers/AuthContext';

function PatientPrescriptions() {
  const { tokens } = useContext(AuthContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadPrescriptions();
  }, [tokens]);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patient/prescriptions', {
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setPrescriptions(data.data || []);
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetail = async (prescriptionId) => {
    try {
      const res = await fetch(`/api/patient/prescription-detail/${prescriptionId}`, {
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setSelectedPrescription(data.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error loading prescription detail:', error);
      alert('Không thể tải chi tiết đơn thuốc');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <div>Đang tải...</div>
      </div>
    );
  }

  return (
    <>
      <div className="patient-card">
        <h3>Đơn thuốc của tôi</h3>
        
        {prescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💊</div>
            <div>Chưa có đơn thuốc nào</div>
          </div>
        ) : (
          <table className="patient-table">
            <thead>
              <tr>
                <th style={{ width: 50, textAlign: 'center' }}>#</th>
                <th style={{ minWidth: 150 }}>Bác sĩ</th>
                <th style={{ minWidth: 200 }}>Chẩn đoán</th>
                <th style={{ minWidth: 150 }}>Ghi chú</th>
                <th style={{ width: 100, textAlign: 'center' }}>Số thuốc</th>
                <th style={{ width: 150 }}>Ngày kê đơn</th>
                <th style={{ width: 150, textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((presc, idx) => (
                <tr key={presc.prescriptionId || idx}>
                  <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 500 }}>{presc.doctorName || 'N/A'}</td>
                  <td>{presc.diagnosis || 'N/A'}</td>
                  <td>{presc.note || '-'}</td>
                  <td style={{ textAlign: 'center' }}>
                    {presc.medicineCount || presc.medicines?.length || 0}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {presc.createdAt
                      ? new Date(presc.createdAt).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button
                      className="patient-btn patient-btn-primary"
                      onClick={() => viewDetail(presc.prescriptionId)}
                      style={{ fontSize: 13 }}
                    >
                      👁️ Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedPrescription && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 12,
              maxWidth: 800,
              width: '90%',
              maxHeight: '85vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: 24, borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Chi tiết đơn thuốc</h3>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 24,
                    cursor: 'pointer',
                    color: '#6b7280',
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Bác sĩ</div>
                    <div style={{ fontWeight: 500 }}>{selectedPrescription.doctorName || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Ngày kê đơn</div>
                    <div style={{ fontWeight: 500 }}>
                      {selectedPrescription.createdAt
                        ? new Date(selectedPrescription.createdAt).toLocaleString('vi-VN')
                        : 'N/A'}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Chẩn đoán</div>
                  <div style={{ fontWeight: 500 }}>{selectedPrescription.diagnosis || 'N/A'}</div>
                </div>

                {selectedPrescription.note && (
                  <div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Ghi chú</div>
                    <div style={{ fontWeight: 500 }}>{selectedPrescription.note}</div>
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ marginBottom: 12, fontSize: 16 }}>Danh sách thuốc</h4>
                {selectedPrescription.medicines && selectedPrescription.medicines.length > 0 ? (
                  <table className="patient-table" style={{ fontSize: 14 }}>
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>#</th>
                        <th>Tên thuốc</th>
                        <th style={{ width: 120 }}>Liều lượng</th>
                        <th style={{ width: 120 }}>Tần suất</th>
                        <th style={{ width: 100 }}>Thời gian</th>
                        <th>Hướng dẫn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPrescription.medicines.map((med, idx) => (
                        <tr key={idx}>
                          <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ fontWeight: 500 }}>{med.medicineName || 'N/A'}</td>
                          <td>{med.dosage || 'N/A'}</td>
                          <td>{med.frequency || 'N/A'}</td>
                          <td>{med.duration || 'N/A'}</td>
                          <td>{med.instruction || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: 'center', padding: 24, color: '#6b7280' }}>
                    Không có thuốc nào
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: 24, borderTop: '1px solid #e5e7eb', textAlign: 'right' }}>
              <button className="patient-btn patient-btn-secondary" onClick={() => setShowModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PatientPrescriptions;
