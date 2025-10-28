import { useEffect, useState } from 'react';
import { getMyDoctorProfile, updateMyDoctorProfile } from '../../services/doctorAccounts.api';

function DoctorProfile({ tokens }) {
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    degree: '',
    title: '',
    image: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [previewImage, setPreviewImage] = useState('');

  // 🚀 Load profile khi trang mở
  useEffect(() => {
    if (!profile) {
      (async () => {
        try {
          const prof = await getMyDoctorProfile(tokens);
          if (prof) {
            setProfile(prof);
            setProfileForm({
              fullName: prof.fullName || '',
              phone: prof.phone || '',
              degree: prof.degree || '',
              title: prof.title || '',
              image: prof.image || '',
            });
            setPreviewImage(prof.image || '');
          } else {
            setMessage('Không tìm thấy hồ sơ');
          }
        } catch (err) {
          setMessage('❌ Lỗi tải hồ sơ: ' + err.message);
        }
      })();
    }
  }, [tokens, profile]);

  // 🧩 Validate dữ liệu form
  const validateForm = () => {
    const newErrors = {};

    if (!profileForm.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    } else if (profileForm.fullName.length > 100) {
      newErrors.fullName = 'Họ tên không được vượt quá 100 ký tự';
    } else if (!/^[\p{L}\s'.-]+$/u.test(profileForm.fullName)) {
      newErrors.fullName = 'Họ tên chỉ được chứa chữ cái và khoảng trắng';
    }

    if (!profileForm.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^(0|\+84)\d{9,10}$/.test(profileForm.phone)) {
      newErrors.phone = 'Số điện thoại phải bắt đầu bằng 0 hoặc +84 và có 10–11 số';
    }

    if (profileForm.degree.length > 50) {
      newErrors.degree = 'Bằng cấp không được vượt quá 50 ký tự';
    } else if (profileForm.degree && !/^[\p{L}\s,.-]+$/u.test(profileForm.degree)) {
      newErrors.degree = 'Bằng cấp chỉ được chứa chữ cái, dấu phẩy hoặc dấu chấm';
    }

    if (profileForm.title.length > 50) {
      newErrors.title = 'Chức danh không được vượt quá 50 ký tự';
    } else if (profileForm.title && !/^[\p{L}\s,.-]+$/u.test(profileForm.title)) {
      newErrors.title = 'Chức danh chỉ được chứa chữ cái, dấu phẩy hoặc dấu chấm';
    }

    if (profileForm.image && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(profileForm.image)) {
      // Chỉ cảnh báo nếu không phải file upload nội bộ
      if (!previewImage.startsWith('blob:')) {
        newErrors.image = 'Đường dẫn ảnh không hợp lệ (phải là URL ảnh)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, image: 'Vui lòng chọn tệp hình ảnh' });
        return;
      }

      //  xem trước ảnh
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      setProfileForm({ ...profileForm, image: file.name });
    }
  };

  // 💾 Gửi cập nhật hồ sơ
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!validateForm()) {
      setMessage('⚠️ Vui lòng kiểm tra lại thông tin');
      return;
    }

    try {
      await updateMyDoctorProfile(profileForm, tokens);
      setMessage('✅ Cập nhật thành công');
      const updatedProf = await getMyDoctorProfile(tokens);
      setProfile(updatedProf);
      setProfileForm({
        fullName: updatedProf.fullName || '',
        phone: updatedProf.phone || '',
        degree: updatedProf.degree || '',
        title: updatedProf.title || '',
        image: updatedProf.image || '',
      });
      setPreviewImage(updatedProf.image || '');
      setErrors({});
    } catch (err) {
      if (err.response && err.response.data?.errors) {
        setMessage('❌ ' + err.response.data.errors.join(', '));
      } else {
        setMessage('❌ Lỗi cập nhật: ' + err.message);
      }
    }
  };

  return (
    <div className="doctor-profile">
      <h2>🩺 Hồ sơ Bác sĩ</h2>

      {message && (
        <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      {profile ? (
        <form onSubmit={handleUpdateProfile} className="profile-form">
          <div className="form-group">
            <label>ID:</label>
            <span>{profile.doctorId}</span>
          </div>

          <div className="form-group">
            <label>Họ tên:</label>
            <input
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
            />
            {errors.fullName && <small className="error-text">{errors.fullName}</small>}
          </div>

          <div className="form-group">
            <label>Email:</label>
            <span>{profile.email}</span>
          </div>

          <div className="form-group">
            <label>SĐT:</label>
            <input
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            />
            {errors.phone && <small className="error-text">{errors.phone}</small>}
          </div>

          <div className="form-group">
            <label>Bằng cấp:</label>
            <input
              value={profileForm.degree}
              onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })}
            />
            {errors.degree && <small className="error-text">{errors.degree}</small>}
          </div>

          <div className="form-group">
            <label>Chức danh:</label>
            <input
              value={profileForm.title}
              onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
            />
            {errors.title && <small className="error-text">{errors.title}</small>}
          </div>

          <div className="form-group">
            <label>Ảnh:</label>
            <input
              type="text"
              value={profileForm.image}/>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
            />
            {errors.image && <small className="error-text">{errors.image}</small>}

            {previewImage && (
              <div className="preview">
                <img src={previewImage} alt="Preview" style={{ width: 120, borderRadius: '8px' }} />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Trạng thái:</label>
            <span>{profile.isActive ? 'Hoạt động' : 'Không hoạt động'}</span>
          </div>

          <button type="submit" className="btn-submit">💾 Cập nhật</button>
        </form>
      ) : (
        <p>Đang tải...</p>
      )}
    </div>
  );
}

export default DoctorProfile;
