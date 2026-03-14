import React, { useEffect } from 'react';
import { Shield, Globe, Award, Phone, MessageCircle, Mail, Instagram, Facebook, ArrowRight } from 'lucide-react';

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('active'));
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container center-text reveal">
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.5em', fontSize: '0.9rem' }}>The Vision Spa</span>
          <h1 className="serif" style={{ fontSize: '5rem', marginTop: '1rem' }}>Our Heritage</h1>
        </div>
      </section>

      <section className="section-padding container">
        <div className="about-story-grid">
          <div className="reveal">
            <span className="text-teal" style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.8rem' }}>Since 2025</span>
            <h2 className="serif" style={{ fontSize: '3.5rem', marginTop: '1rem', marginBottom: '2rem' }}>A Legacy of Excellence in Vision.</h2>
            <p style={{ fontSize: '1.2rem', color: '#666', lineHeight: '1.8', marginBottom: '2rem' }}>
              Vision Spa was born from a simple yet profound realization: that high-end eyewear is the ultimate intersection of medical precision and personal style. For over a decade, we have been at the forefront of luxury eyewear in Africa.
            </p>
            <p style={{ color: '#666', lineHeight: '1.8' }}>
              Our journey began with a small boutique focused on artisanal craftsmanship. Today, we are proud to be the premier destination for those who seek eyewear that reflects their ambition, their culture, and their uncompromising taste.
            </p>
          </div>
          <div className="heritage-image-wrapper reveal">
            <img src="/hero.png" alt="Vision Spa Craftsmanship" style={{ width: '100%', height: '600px', objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="container">
          <div className="center-text reveal" style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <span className="text-teal" style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.8rem' }}>Our Philosophy</span>
            <h2 className="serif" style={{ fontSize: '3.5rem', marginTop: '1rem' }}>Values That Define Us</h2>
          </div>

          <div className="values-grid">
            <div className="value-card reveal">
              <div className="value-icon">
                <Shield size={30} strokeWidth={1.5} />
              </div>
              <h4 className="serif" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Unmatched Quality</h4>
              <p style={{ color: '#666', lineHeight: '1.6' }}>We source only the finest materials, from Italian acetate to Japanese titanium, ensuring every frame is built to last.</p>
            </div>

            <div className="value-card reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="value-icon">
                <Globe size={30} strokeWidth={1.5} />
              </div>
              <h4 className="serif" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Cultural Pride</h4>
              <p style={{ color: '#666', lineHeight: '1.6' }}>Our designs are inspired by African excellence, merging traditional resonance with modern global fashion trends.</p>
            </div>

            <div className="value-card reveal" style={{ transitionDelay: '0.4s' }}>
              <div className="value-icon">
                <Award size={30} strokeWidth={1.5} />
              </div>
              <h4 className="serif" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Client Care</h4>
              <p style={{ color: '#666', lineHeight: '1.6' }}>Vision Spa is not just a store; it's a sanctuary for your sight. We provide personalized service for every elite client.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: '#fff' }}>
        <div className="container">
          <div className="center-text reveal" style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <span className="text-teal" style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.8rem' }}>Get in Touch</span>
            <h2 className="serif" style={{ fontSize: '3.5rem', marginTop: '1rem' }}>Contact Vision Spa</h2>
          </div>

          <div className="contact-grid">
            <div className="contact-info-card reveal">
              <h3 className="serif" style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Connect with Us</h3>
              <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '3rem' }}>
                We are dedicated to providing you with an enhanced vision and a premium experience. Reach out to us for orders, styling advice, or exclusive support.
              </p>

              <div className="flex flex-col gap-4">
                <div className="contact-method-item">
                  <div className="contact-icon-box">
                    <Phone size={22} strokeWidth={1.5} />
                  </div>
                  <div className="contact-detail">
                    <p>Phone Support</p>
                    <p>+233 544477261</p>
                  </div>
                </div>

                <div className="contact-method-item">
                  <div className="contact-icon-box">
                    <MessageCircle size={22} strokeWidth={1.5} />
                  </div>
                  <div className="contact-detail">
                    <p>Direct WhatsApp</p>
                    <p>+233 552739280</p>
                  </div>
                </div>

                <div className="contact-method-item">
                  <div className="contact-icon-box">
                    <Mail size={22} strokeWidth={1.5} />
                  </div>
                  <div className="contact-detail">
                    <p>Email Address</p>
                    <p style={{ fontSize: '0.95rem !important' }}>flourenceeshun6352@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal">
              <h3 className="serif" style={{ fontSize: '2.2rem', marginBottom: '1.5rem', paddingLeft: '1rem' }}>Our Social Media</h3>
              <div className="social-luxury-grid">
                <a href="#" className="social-luxury-card">
                  <div className="social-icon-circle"><Instagram size={20} /></div>
                  <div className="social-info">
                    <h4>Instagram</h4>
                    <p>@The-Vision-Spa</p>
                  </div>
                  <span className="social-follow-btn">Follow Us <ArrowRight size={14} /></span>
                </a>

                <a href="#" className="social-luxury-card">
                  <div className="social-icon-circle"><Facebook size={20} /></div>
                  <div className="social-info">
                    <h4>Facebook</h4>
                    <p>@The-Vision-Spa</p>
                  </div>
                  <span className="social-follow-btn">Join Us <ArrowRight size={14} /></span>
                </a>

                <a href="#" className="social-luxury-card">
                  <div className="social-icon-circle"><span style={{ fontWeight: 900 }}>T</span></div>
                  <div className="social-info">
                    <h4>TikTok</h4>
                    <p>@The-Vision-Spa</p>
                  </div>
                  <span className="social-follow-btn">Watch <ArrowRight size={14} /></span>
                </a>

                <a href="#" className="social-luxury-card">
                  <div className="social-icon-circle"><span style={{ fontWeight: 900 }}>S</span></div>
                  <div className="social-info">
                    <h4>Snapchat</h4>
                    <p>@The-Vision-Spa</p>
                  </div>
                  <span className="social-follow-btn">Share <ArrowRight size={14} /></span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding container">
        <div className="center-text reveal" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="serif" style={{ fontSize: '3rem', marginBottom: '2rem' }}>Experience Vision Spa Today.</h2>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '3rem' }}>Join the thousands of individuals who have defined their personality through our curated collections.</p>
          <a href="/shop" className="cta-button-premium">Explore Collection</a>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
