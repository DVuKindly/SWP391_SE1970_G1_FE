import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../providers/AuthContext';
import { getStaffProfile, updateStaffProfile } from '../../services/staffdoctor.api';
import './StaffProfileManagement.css';

function StaffProfileManagement() {
  const { tokens } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    specialization: '',
    experience: '',
    education: '',
    bio: ''
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getStaffProfile(tokens);
      console.log('Profile data from API:', data); // Debug log
      setProfile(data);
      
      // Parse name field from API response
      const fullName = data.name || data.fullName || '';
      console.log('Full name from API:', fullName); // Debug log
      const nameParts = fullName.split(' ');
      const firstName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : '';
      const lastName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';

      setFormData({
        firstName: firstName || data.firstName || '',
        lastName: lastName || data.lastName || '',
        email: data.email || '',
        phoneNumber: data.phone || data.phoneNumber || '',
        address: data.address || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        gender: data.gender || '',
        specialization: data.specialization || '',
        experience: data.experience || '',
        education: data.education || '',
        bio: data.bio || ''
      });
      
      console.log('Form data set:', {
        firstName,
        lastName,
        email: data.email,
        phoneNumber: data.phone
      }); // Debug log
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStaffProfile(formData, tokens);
      setEditMode(false);
      loadProfile();
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin!');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      phoneNumber: profile.phoneNumber || '',
      address: profile.address || '',
      dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
      gender: profile.gender || '',
      specialization: profile.specialization || '',
      experience: profile.experience || '',
      education: profile.education || '',
      bio: profile.bio || ''
    });
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="spm-container">
        <div className="spm-loading">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="spm-container">
      <div className="spm-header">
        <h2>Thông tin cá nhân</h2>
        <div className="spm-actions">
          {!editMode ? (
            <button 
              className="spm-btn spm-btn-primary"
              onClick={() => setEditMode(true)}
            >
              Chỉnh sửa
            </button>
          ) : (
            <div className="spm-edit-actions">
              <button 
                className="spm-btn spm-btn-success"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button 
                className="spm-btn spm-btn-secondary"
                onClick={handleCancel}
              >
                Hủy bỏ
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="spm-content">
        <div className="spm-avatar-section">
          <div className="spm-avatar">
            {(profile?.name || profile?.firstName) ? 
              (profile.name || profile.firstName)[0].toUpperCase() : 
              (profile?.email ? profile.email[0].toUpperCase() : 'U')}
          </div>
          <div className="spm-avatar-info">
            <h3>
              {profile?.name || (profile?.firstName || '') + ' ' + (profile?.lastName || '')}
            </h3>
            <p className="spm-role">
              {profile?.roles?.map(role => typeof role === 'string' ? role : role.name).join(', ') || 
               profile?.role || 'N/A'}
            </p>
            <p className="spm-email">{profile?.email}</p>
          </div>
        </div>

        <div className="spm-form">
          <div className="spm-form-section">
            <h4>Thông tin cơ bản</h4>
            <div className="spm-form-grid">
              <div className="spm-form-group">
                <label>Họ</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="spm-input"
                />
              </div>
              <div className="spm-form-group">
                <label>Tên</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="spm-input"
                />
              </div>
              <div className="spm-form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="spm-input"
                />
              </div>
              <div className="spm-form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="spm-input"
                />
              </div>
              <div className="spm-form-group">
                <label>Ngày sinh</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="spm-input"
                />
              </div>
              <div className="spm-form-group">
                <label>Giới tính</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="spm-select"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              </div>
            </div>
          </div>

          <div className="spm-form-section">
            <h4>Địa chỉ</h4>
            <div className="spm-form-group">
              <label>Địa chỉ</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!editMode}
                className="spm-textarea"
                rows="3"
              />
            </div>
          </div>

          <div className="spm-form-section">
            <h4>Thông tin chuyên môn</h4>
            <div className="spm-form-grid">
              <div className="spm-form-group">
                <label>Chuyên khoa</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="spm-input"
                  placeholder="Ví dụ: Tim mạch, Nội khoa..."
                />
              </div>
              <div className="spm-form-group">
                <label>Kinh nghiệm (năm)</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="spm-input"
                  min="0"
                />
              </div>
            </div>
            <div className="spm-form-group">
              <label>Học vấn</label>
              <textarea
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                disabled={!editMode}
                className="spm-textarea"
                rows="3"
                placeholder="Trường đại học, bằng cấp..."
              />
            </div>
            <div className="spm-form-group">
              <label>Giới thiệu bản thân</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!editMode}
                className="spm-textarea"
                rows="4"
                placeholder="Giới thiệu về bản thân, kinh nghiệm làm việc..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffProfileManagement;
