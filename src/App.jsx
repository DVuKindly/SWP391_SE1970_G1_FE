import './App.css'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import LoginSystem from './pages/Login/LoginSystem'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CreateAccount from './pages/Register/CreateAccount'
import AdminDashboard from './pages/Admins/AdminDashboard'
import DoctorDashboard from './pages/Doctor/DoctorDashboard'
import StaffDoctorDashboard from './pages/StaffDoctor/StaffDoctorDashboard'
import StaffPatientDashboard from './pages/Staff/StaffPatientDashboard'
import { AuthProvider } from './providers/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'


const GOOGLE_CLIENT_ID =
  '501967368951-5pom4erpto99u149ao7uuk9hbj4s263p.apps.googleusercontent.com'

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login-system" element={<LoginSystem />} />
            <Route path="/create-account" element={<CreateAccount />} />

            {/* Các route khác */}
            <Route
              path="/profile"
              element={<div style={{ padding: 24 }}>Trang hồ sơ (đang cập nhật)</div>}
            />
            <Route
              path="/appointments"
              element={<div style={{ padding: 24 }}>Bệnh án của tôi (đang cập nhật)</div>}
            />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/staff-doctor" element={<StaffDoctorDashboard />} />
            <Route path="/staff-patient" element={<StaffPatientDashboard />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}

export default App
