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
  const [message, setMessage] = useState('');

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
          } else {
            setMessage('Không tìm thấy hồ sơ');
          }
        } catch (err) {
          setMessage('Lỗi tải hồ sơ: ' + err.message);
        }
      })();
    }
  }, [tokens, profile]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateMyDoctorProfile(profileForm, tokens);
      setMessage('Cập nhật thành công');
      const updatedProf = await getMyDoctorProfile(tokens);
      setProfile(updatedProf);
      setProfileForm({
        fullName: updatedProf.fullName || '',
        phone: updatedProf.phone || '',
        degree: updatedProf.degree || '',
        title: updatedProf.title || '',
        image: updatedProf.image || '',
      });
    } catch (err) {
      setMessage('Lỗi cập nhật');
    }
  };

  return (
    <div className="dd-content">
      <h2>Hồ sơ Bác sĩ</h2>
      {message && <p className={message.includes('Lỗi') ? 'error' : 'success'}>{message}</p>}
      {profile ? (
        <form onSubmit={handleUpdateProfile}>
          <div>
            <label>ID: </label>
            <span>{profile.doctorId}</span>
          </div>
          <div>
            <label>Họ tên: </label>
            <input 
              value={profileForm.fullName} 
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} 
            />
          </div>
          <div>
            <label>Email: </label>
            <span>{profile.email}</span>
          </div>
          <div>
            <label>SĐT: </label>
            <input 
              value={profileForm.phone} 
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} 
            />
          </div>
          <div>
            <label>Bằng cấp: </label>
            <input 
              value={profileForm.degree} 
              onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })} 
            />
          </div>
          <div>
            <label>Chức danh: </label>
            <input 
              value={profileForm.title} 
              onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })} 
            />
          </div>
          <div>
            <label>Ảnh: </label>
            <input 
              value={profileForm.image} 
              onChange={(e) => setProfileForm({ ...profileForm, image: e.target.value })} 
              placeholder="URL ảnh"
            />
            {profileForm.image && <img src={profileForm.image} alt="Profile" style={{ width: 100 }} />}
          </div>
          <div>
            <label>Trạng thái: </label>
            <span>{profile.isActive ? 'Hoạt động' : 'Không hoạt động'}</span>
          </div>
          <button type="submit">Cập nhật</button>
        </form>
      ) : (
        <p>Đang tải...</p>
      )}
    </div>
  );
}

export default DoctorProfile;