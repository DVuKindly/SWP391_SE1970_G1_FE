import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../providers/AuthContext';

function PatientProfile() {
  const { tokens } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    birthDate: '',
    gender: '',
  });

  // Load profile
  useEffect(() => {
    loadProfile();
  }, [tokens]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patient/profile', {
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken}`,
        },
      });
      const data = await res.json();
      console.log('Profile API Response:', data);
      if (data.success) {
        console.log('Profile data:', data.data);
        setProfile(data.data);
        setFormData({
          fullName: data.data.fullName || '',
          phone: data.data.phone || '',
          address: data.data.address || '',
          birthDate: data.data.birthDate?.split('T')[0] || '',
          gender: data.data.gender || '',
        });
      } else {
        console.error('API returned success=false:', data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Format birthDate to ISO string if exists
    const payload = {
      fullName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      gender: formData.gender || null,
      birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
    };
    
    console.log('Sending update with data:', payload);
    try {
      const res = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log('Update response:', data);
      if (data.success) {
        alert('Cập nhật thành công!');
        setEditing(false);
        await loadProfile(); // Đợi reload xong
      } else {
        alert(data.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Có lỗi xảy ra khi cập nhật');
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
    <div className="patient-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ margin: 0 }}>Thông tin cá nhân</h3>
        {!editing && (
          <button className="patient-btn patient-btn-primary" onClick={() => setEditing(true)}>
            ✏️ Chỉnh sửa
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleUpdate}>
          <div style={{ display: 'grid', gap: 20 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Họ tên</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Email</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  background: '#f9fafb',
                  color: '#6b7280',
                }}
              />
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Email không thể thay đổi</div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Giới tính</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                }}
              >
                <option value="">Chọn giới tính</option>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Ngày sinh</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Địa chỉ</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="patient-btn patient-btn-primary">
                💾 Lưu thay đổi
              </button>
              <button
                type="button"
                className="patient-btn patient-btn-secondary"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    fullName: profile?.fullName || '',
                    phone: profile?.phone || '',
                    address: profile?.address || '',
                    birthDate: profile?.birthDate?.split('T')[0] || '',
                    gender: profile?.gender || '',
                  });
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Họ tên</div>
            <div style={{ fontWeight: 500 }}>{profile?.fullName || '-'}</div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Email</div>
            <div style={{ fontWeight: 500 }}>{profile?.email || '-'}</div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Số điện thoại</div>
            <div style={{ fontWeight: 500 }}>{profile?.phone || '-'}</div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Giới tính</div>
            <div style={{ fontWeight: 500 }}>
              {profile?.gender === 'Male' ? 'Nam' : profile?.gender === 'Female' ? 'Nữ' : profile?.gender || '-'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Ngày sinh</div>
            <div style={{ fontWeight: 500 }}>
              {profile?.birthDate ? new Date(profile.birthDate).toLocaleDateString('vi-VN') : '-'}
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Địa chỉ</div>
            <div style={{ fontWeight: 500 }}>{profile?.address || '-'}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientProfile;
