import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const slides = [
    { img: '/orthoc/images/d1.jpg', title: 'We Provide Best Healthcare', desc: 'Asperiores sunt consectetur impedit nulla molestiae delectus repellat laborum dolores.' },
    { img: '/orthoc/images/d2.jpg', title: 'Trusted Medical Experts', desc: 'Curae vivamus quis magna vitae dui elementum cursus sit amet.' },
    { img: '/orthoc/images/d3.jpg', title: 'Care When You Need It', desc: 'Natus molestias perferendis ratione doloribus quas cumque dignissimos.' }
  ]
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(id)
  }, [slides.length])

  return (
    <div className="home">
      {/* Orthoc header/hero area */}
      <section className="hero_area">
        <div className="hero_bg_box">
          <img src="/orthoc/images/hero-bg.png" alt="bg" />
        </div>

        <header className="header_section">
          <div className="topbar">
            <div className="container">
              <div className="nav container" style={{padding:0}}>
                <div className="brand">eClinic</div>
                <nav>
                  <a href="#home">Home</a>
                  <a href="#about">About</a>
                  <a href="#departments">Departments</a>
                  <a href="#doctors">Doctors</a>
                  <a href="#contact">Contact Us</a>
                </nav>
              </div>
            </div>
          </div>
        </header>

        <section className="slider_section" id="home">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <div className="detail-box">
                  <h1>{slides[currentSlide].title}</h1>
                  <p>{slides[currentSlide].desc}</p>
                  <div className="btn-box">
                    <a className="btn1" href="#departments">Read More</a>
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
      <div className="hero-wave-shape" />

      {/* Departments */}
      <section className="department_section layout_padding" id="departments">
        <div className="container">
          <div className="heading_container heading_center">
            <h2>Our Departments</h2>
            <p>Asperiores sunt consectetur impedit nulla molestiae delectus repellat.</p>
          </div>
          <div className="row">
            {['s1','s2','s3','s4'].map((s, i) => (
              <div className="col-md-3 col-sm-6" key={i}>
                <div className="box">
                  <div className="img-box">
                    <img src={`/orthoc/images/${s}.png`} alt="icon" />
                  </div>
                  <div className="detail-box">
                    <h5>Service {i+1}</h5>
                    <p>Fact that a reader will be distracted by the readable page.</p>
                    <a href="#">Read More</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="btn-box">
            <a href="#">View All</a>
          </div>
        </div>
      </section>

      {/* About */}
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
                  <h3>About Us</h3>
                </div>
                <p>There are many variations of passages of Lorem Ipsum available.</p>
                <a href="#">Read More</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="doctor_section layout_padding" id="doctors">
        <div className="container">
          <div className="heading_container heading_center">
            <h2>Our Doctors</h2>
          </div>
          <div className="row">
            {['d1','d2','d3'].map((d, i) => (
              <div className="col-md-4" key={i}>
                <div className="box">
                  <div className="img-box">
                    <img src={`/orthoc/images/${d}.jpg`} alt="doctor" />
                  </div>
                  <div className="detail-box">
                    <h5>Doctor {i+1}</h5>
                    <h6>Doctor</h6>
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
            <a href="#">View All</a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="contact_section layout_padding" id="contact">
        <div className="container">
          <div className="heading_container">
            <h2>Get In Touch</h2>
          </div>
          <div className="row">
            <div className="col-md-6">
              <form className="form_container" onSubmit={(e)=>e.preventDefault()}>
                <input placeholder="Your Name" />
                <input placeholder="Phone Number" />
                <input placeholder="Email" />
                <input className="message-box" placeholder="Message" />
                <button type="submit">Send</button>
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

      {/* Testimonial */}
      <section className="client_section layout_padding-bottom">
        <div className="container">
          <div className="heading_container heading_center">
            <h2>Testimonial</h2>
          </div>
          <div className="box">
            <div className="img-box"><img src="/orthoc/images/client.jpg" alt="client" /></div>
            <div className="detail-box">
              <div className="name"><h6>Alan Emerson</h6></div>
              <p>Enim consequatur odio assumenda voluptas voluptatibus esse nobis officia.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="footer_section">
        <div className="container">
          <div className="row">
            <div className="col-md-3 footer_col">
              <div className="footer_contact">
                <h4>Reach at..</h4>
                <div className="contact_link_box">
                  <a href="#"><i className="fa fa-map-marker" aria-hidden="true" /> Location</a>
                  <a href="#"><i className="fa fa-phone" aria-hidden="true" /> Call +01 1234567890</a>
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
              <h4>About</h4>
              <p>Beatae provident nobis molestiae magnam voluptatum, unde dicta facitis minima veniam.</p>
            </div>
            <div className="col-md-3 footer_col">
              <h4>Links</h4>
              <div className="footer_links">
                <a href="#">Home</a>
                <a href="#">About</a>
                <a href="#">Departments</a>
                <a href="#">Doctors</a>
                <a href="#">Contact Us</a>
              </div>
            </div>
            <div className="col-md-3 footer_col">
              <h4>Newsletter</h4>
              <form>
                <input type="text" placeholder="Enter email" />
                <button>Subscribe</button>
              </form>
            </div>
          </div>
        </div>
        <div className="footer-info"><p>© 2025 All Rights Reserved</p></div>
      </section>
    </div>
  )
}

export default App
