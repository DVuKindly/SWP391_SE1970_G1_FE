import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../providers/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);

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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
