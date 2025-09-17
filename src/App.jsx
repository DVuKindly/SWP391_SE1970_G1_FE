import './App.css'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CreateAccount from './pages/Register/CreateAccount'
import { AuthProvider } from './providers/AuthContext'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App


