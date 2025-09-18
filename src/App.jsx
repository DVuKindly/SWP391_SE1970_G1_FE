import './App.css'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import LoginSystem from './pages/Login/LoginSystem'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CreateAccount from './pages/Register/CreateAccount'
import AdminDashboard from './pages/Admins/AdminDashboard'
import { AuthProvider } from './providers/AuthContext'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login-system" element={<LoginSystem />} />
          <Route path="/create-account" element={<CreateAccount />} />
          {/* để tạm như này ạ ai làm Profile thì sửa lại nha */}
          <Route path="/profile" element={<div style={{padding:24}}>Trang hồ sơ (đang cập nhật)</div>} />
          <Route path="/appointments" element={<div style={{padding:24}}>Bệnh án của tôi (đang cập nhật)</div>} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App


