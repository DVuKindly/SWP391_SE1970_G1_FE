import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../providers/AuthContext';

const Header = ({ onLoginClick }) => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const isPatient = !!(user?.roles || []).includes('Patient')
  const displayName = user?.fullName || user?.email || 'User'
  const initial = (displayName || 'U').trim().charAt(0).toUpperCase()

  useEffect(() => {
    const onClick = (e) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [menuOpen])

  return (
    <header className="header_section">
      <div className="topbar" style={{background: 'white', padding: '16px 0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
        <div className="container">
          <div className="nav container" style={{padding:0, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div className="brand" style={{display: 'flex', alignItems: 'center'}}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, var(--primary), #0b5d50)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                position: 'relative'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: 'white',
                  borderRadius: '4px',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: '2px',
                    width: '16px',
                    height: '16px',
                    background: 'var(--primary)',
                    borderRadius: '2px'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    width: '8px',
                    height: '8px',
                    background: 'white',
                    borderRadius: '50%'
                  }}></div>
                </div>
              </div>
              <Link to="/" style={{textDecoration: 'none'}}>
                <span style={{fontSize: '24px', fontWeight: 'bold', color: '#0b5d50'}}>eClinic</span>
              </Link>
            </div>
            <nav style={{display: 'flex', alignItems: 'center', gap: '32px'}}>
              <Link to="/" style={{textDecoration: 'none', color: '#0b5d50', fontWeight: '600', position: 'relative'}}>
                TRANG CHỦ
                <div style={{
                  position: 'absolute',
                  bottom: '-4px',
                  left: '0',
                  width: '100%',
                  height: '2px',
                  background: 'var(--primary)',
                  borderRadius: '1px'
                }}></div>
              </Link>
              <a href="#departments" style={{textDecoration: 'none', color: '#374151', fontWeight: '500'}}>CHUYÊN KHOA</a>
              <a href="#about" style={{textDecoration: 'none', color: '#374151', fontWeight: '500'}}>GIỚI THIỆU</a>
              <a href="#doctors" style={{textDecoration: 'none', color: '#374151', fontWeight: '500'}}>BÁC SĨ</a>
              <a href="#contact" style={{textDecoration: 'none', color: '#374151', fontWeight: '500'}}>LIÊN HỆ</a>
            </nav>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              {isAuthenticated ? (
                <>
                  {isPatient ? (
                    <div ref={menuRef} style={{ position: 'relative' }}>
                      <button
                        onClick={() => setMenuOpen((v) => !v)}
                        style={{
                          background: 'transparent',
                          border: '1px solid #e5e7eb',
                          borderRadius: 999,
                          padding: '4px 8px 4px 4px',
                          display: 'flex', alignItems: 'center', gap: 8,
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: '#e2e8f0', color: '#0b5d50',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700
                        }}>{initial}</div>
                        <span style={{ color: '#374151', fontWeight: 500, fontSize: 14 }}>{displayName}</span>
                        <span style={{ color: '#6b7280' }}>▾</span>
                      </button>
                      {menuOpen && (
                        <div style={{
                          position: 'absolute', right: 0, marginTop: 8, minWidth: 180,
                          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
                          boxShadow: '0 10px 20px rgba(0,0,0,.08)', overflow: 'hidden', zIndex: 30
                        }}>
                          <button onClick={() => { setMenuOpen(false); navigate('/profile'); }} style={menuItemStyle}>Hồ sơ</button>
                          <button onClick={() => { setMenuOpen(false); navigate('/appointments'); }} style={menuItemStyle}>Bệnh án</button>
                          <button onClick={() => { setMenuOpen(false); logout(); }} style={menuItemStyle}>Đăng xuất</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={logout} 
                      style={{ 
                        padding: '8px 16px',
                        background: 'var(--primary)',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      ĐĂNG XUẤT ({user?.email})
                    </button>
                  )}
                </>
              ) : (
                <>
                  <Link 
                    to="/create-account"
                    style={{ 
                      padding: '8px 16px',
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      color: '#374151',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textDecoration: 'none'
                    }}
                  >
                    TẠO TÀI KHOẢN
                  </Link>
                  {onLoginClick ? (
                    <button
                      onClick={onLoginClick}
                      style={{ 
                        padding: '8px 16px',
                        background: 'var(--primary)',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'inline-block'
                      }}
                    >
                      ĐĂNG NHẬP
                    </button>
                  ) : (
                    <Link 
                      to="/login" 
                      style={{ 
                        padding: '8px 16px',
                        background: 'var(--primary)',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        fontWeight: '500',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        display: 'inline-block'
                      }}
                    >
                      ĐĂNG NHẬP
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const menuItemStyle = { width: '100%', textAlign: 'left', padding: '10px 12px', background: '#fff', border: 'none', cursor: 'pointer', fontSize: 14 };

export default Header;
