import React from 'react'
import '../styles/footer.css'

function Footer() {
  return (
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
            <form onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Nhập email" />
              <button>Đăng ký</button>
            </form>
          </div>
        </div>
      </div>
      <div className="footer-info"><p>© 2025 All Rights Reserved</p></div>
    </section>
  )
}

export default Footer


