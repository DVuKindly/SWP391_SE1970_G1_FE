import { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../providers/AuthContext'
import Header from '../../components/Header'
import { useNavigate } from 'react-router-dom'
import '../../styles/theme.css'
import '../../styles/header.css'
import '../../styles/sections.css'
import FloatingRegister from '../../components/FloatingRegister'
import LoginChoiceModal from '../../components/LoginChoiceModal'
import '../../styles/floating-register.css'

function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const slides = [
    { img: '/orthoc/images/d1.jpg', title: 'Dịch vụ chăm sóc sức khỏe tốt nhất', desc: 'Cung cấp dịch vụ tận tâm, an toàn và hiệu quả cho mọi bệnh nhân.' },
    { img: '/orthoc/images/d2.jpg', title: 'Đội ngũ y bác sĩ uy tín', desc: 'Các chuyên gia hàng đầu luôn sẵn sàng đồng hành cùng bạn.' },
    { img: '/orthoc/images/d3.jpg', title: 'Chăm sóc khi bạn cần', desc: 'Hỗ trợ nhanh chóng với quy trình đặt lịch và tư vấn thuận tiện.' }
  ]
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(id)
  }, [slides.length])

  const [showLoginChoice, setShowLoginChoice] = useState(false)

  const openLoginChoice = () => setShowLoginChoice(true)
  const closeLoginChoice = () => setShowLoginChoice(false)

  const goPatientLogin = () => {
    setShowLoginChoice(false)
    navigate('/login?role=patient')
  }

  const goStaffLogin = () => {
    setShowLoginChoice(false)
    navigate('/login-system')
  }

  return (
    <div className="home">
      <section className="hero_area">
        <div className="hero_bg_box">
          <img src="/orthoc/images/hero-bg.png" alt="bg" />
        </div>

        <Header onLoginClick={openLoginChoice} />

        <section className="slider_section" id="home">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <div className="detail-box">
                  <h1>{slides[currentSlide].title}</h1>
                  <p>{slides[currentSlide].desc}</p>
                  <div className="btn-box">
                    <a className="btn1" href="#departments">Xem thêm</a>
                    {!isAuthenticated && (
                      <button className="btn1" onClick={openLoginChoice} style={{ marginLeft: 12 }}>Đăng nhập</button>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="img-box">
                  <img src={slides[currentSlide].img} alt="doctor" />
                </div>
              </div>
            </div>
            <ol className="carousel-indicators">
              {slides.map((_, i) => (
                <li key={i} className={i === currentSlide ? 'active' : ''} onClick={() => setCurrentSlide(i)} />
              ))}
            </ol>
          </div>
        </section>
      </section>
      <FloatingRegister />
      <LoginChoiceModal open={showLoginChoice} onClose={closeLoginChoice} onPatient={goPatientLogin} onStaff={goStaffLogin} />
      <div className="hero-wave-shape" />

      <section className="department_section layout_padding" id="departments">
        <div className="container">
          <div className="heading_container heading_center">
            <h2>Chuyên khoa</h2>
            <p>Các dịch vụ y tế đa dạng đáp ứng nhu cầu chăm sóc sức khỏe.</p>
          </div>
          <div className="row">
            {['s1', 's2', 's3', 's4'].map((s, i) => (
              <div className="col-md-3 col-sm-6" key={i}>
                <div className="box">
                  <div className="img-box">
                    <img src={`/orthoc/images/${s}.png`} alt="icon" />
                  </div>
                  <div className="detail-box">
                    <h5>Dịch vụ {i + 1}</h5>
                    <p>Nội dung mô tả ngắn gọn về dịch vụ và lợi ích mang lại.</p>
                    <a href="#">Xem thêm</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="btn-box">
            <a href="#">Xem tất cả</a>
          </div>
        </div>
      </section>

      <section className="about_section layout_padding" id="about">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="img-box">
                <img src="/orthoc/images/about-img.jpg" alt="about" />
              </div>
            </div>
            <div className="col-md-6">
              <div className="detail-box">
                <div className="heading_container">
                  <h3>Về chúng tôi</h3>
                </div>
                <p>Chúng tôi hướng đến trải nghiệm khám chữa bệnh hiện đại, thuận tiện và an toàn.</p>
                <a href="#">Xem thêm</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="doctor_section layout_padding" id="doctors">
        <div className="container">
          <div className="heading_container heading_center">
            <h2>Bác sĩ của chúng tôi</h2>
          </div>
          <div className="row">
            {['d1', 'd2', 'd3'].map((d, i) => (
              <div className="col-md-4" key={i}>
                <div className="box">
                  <div className="img-box">
                    <img src={`/orthoc/images/${d}.jpg`} alt="doctor" />
                  </div>
                  <div className="detail-box">
                    <h5>Bác sĩ {i + 1}</h5>
                    <h6>Bác sĩ</h6>
                    <div className="social_box">
                      <a href="#"><i className="fa fa-facebook" /></a>
                      <a href="#"><i className="fa fa-twitter" /></a>
                      <a href="#"><i className="fa fa-linkedin" /></a>
                      <a href="#"><i className="fa fa-instagram" /></a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="btn-box">
            <a href="#">Xem tất cả</a>
          </div>
        </div>
      </section>

      <section className="contact_section layout_padding" id="contact">
        <div className="container">
          <div className="heading_container">
            <h2>Liên hệ</h2>
          </div>
          <div className="row">
            <div className="col-md-6">
              <form className="form_container" onSubmit={(e) => e.preventDefault()}>
                <input placeholder="Họ và tên" />
                <input placeholder="Số điện thoại" />
                <input placeholder="Email" />
                <input className="message-box" placeholder="Lời nhắn" />
                <button type="submit">Gửi</button>
              </form>
            </div>
            <div className="col-md-6">
              <div className="map_container ">
                <div className="map"><div id="googleMap" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="client_section layout_padding-bottom">
        <div className="container">
          <div className="heading_container heading_center">
            <h2>Cảm nhận khách hàng</h2>
          </div>
          <div className="box">
            <div className="img-box"><img src="/orthoc/images/client.jpg" alt="client" /></div>
            <div className="detail-box">
              <div className="name"><h6>Alan Emerson</h6></div>
              <p>Dịch vụ tận tâm, quy trình nhanh gọn và đội ngũ chuyên nghiệp.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="footer_section">
        <div className="container">
          <div className="row">
            <div className="col-md-3 footer_col">
              <div className="footer_contact">
                <h4>Liên hệ</h4>
                <div className="contact_link_box">
                  <a href="#"><i className="fa fa-map-marker" aria-hidden="true" /> Địa chỉ</a>
                  <a href="#"><i className="fa fa-phone" aria-hidden="true" /> Gọi +01 1234567890</a>
                  <a href="#"><i className="fa fa-envelope" aria-hidden="true" /> demo@gmail.com</a>
                </div>
              </div>
              <div className="footer_social">
                <a href="#"><i className="fa fa-facebook" aria-hidden="true" /></a>
                <a href="#"><i className="fa fa-twitter" aria-hidden="true" /></a>
                <a href="#"><i className="fa fa-linkedin" aria-hidden="true" /></a>
                <a href="#"><i className="fa fa-instagram" aria-hidden="true" /></a>
              </div>
            </div>
            <div className="col-md-3 footer_col">
              <h4>Giới thiệu</h4>
              <p>Hệ thống eClinic hỗ trợ đặt lịch, tư vấn và theo dõi sức khỏe hiệu quả.</p>
            </div>
            <div className="col-md-3 footer_col">
              <h4>Liên kết</h4>
              <div className="footer_links">
                <a href="#">Trang chủ</a>
                <a href="#">Giới thiệu</a>
                <a href="#">Chuyên khoa</a>
                <a href="#">Bác sĩ</a>
                <a href="#">Liên hệ</a>
              </div>
            </div>
            <div className="col-md-3 footer_col">
              <h4>Bản tin</h4>
              <form>
                <input type="text" placeholder="Nhập email" />
                <button>Đăng ký</button>
              </form>
            </div>
          </div>
        </div>
        <div className="footer-info"><p>© 2025 All Rights Reserved</p></div>
      </section>
    </div>
  )
}

export default Home


