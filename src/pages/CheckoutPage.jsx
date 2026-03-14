import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Shield, Upload, Copy } from 'lucide-react';
import Swal from 'sweetalert2';
import { useCart } from '../context/CartContext';
import { API_URL } from '../utils/api';

const CheckoutPage = ({ addOrder }) => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [formData, setFormData] = useState({
    customer: '',
    phone: '',
    location: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (cartItems.length === 0 && !isSubmitting) {
    return (
      <div className="section-padding container center-text">
        <h2 className="serif">Your Bag is Empty</h2>
        <p style={{ margin: '1rem 0 2rem' }}>You don't have any items in your bag to checkout.</p>
        <Link to="/shop" className="cta-button-premium">Continue Shopping</Link>
      </div>
    );
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const form = new FormData();
    form.append('screenshot', file);

    try {
      const res = await fetch(`${API_URL}/upload/screenshot`, {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (data.success) {
        setScreenshotUrl(data.url);
        Swal.fire({
          title: 'Screenshot Uploaded',
          text: 'Payment proof received.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          iconColor: '#008080'
        });
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      Swal.fire('Upload Failed', err.message || 'Image upload failed.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshotUrl) {
      Swal.fire({
        title: 'Payment Proof Required',
        text: 'Please upload a screenshot of your payment to proceed.',
        icon: 'warning',
        confirmButtonColor: '#008080'
      });
      return;
    }

    setIsSubmitting(true);
    const orderData = {
      customer: formData.customer,
      phone: formData.phone,
      location: formData.location,
      items: cartItems.map(i => ({ name: i.name, qty: i.qty, size: i.size || 'M', sku: i.sku })),
      total: cartTotal,
      paymentScreenshot: screenshotUrl,
      paymentMethod: 'Direct Payment',
      status: 'Pending'
    };

    const res = await addOrder(orderData);
    if (res.success) {
      clearCart();
      const order = res.data;
      const adminPhone = "233552739280";
      
      const trackUrl = `${window.location.origin}/track`;
      const itemsSummary = order.items.map(item => `- ${item.name} (x${item.qty})`).join('\n');
      const message = `*NEW VISION SPA ORDER!* 🕶️
--------------------------
*Order ID:* ${order.orderId}
*Customer:* ${order.customer}
*Phone:* ${order.phone}
*Total:* GH₵${order.total.toFixed(2)}
*Location:* ${order.location}

*Items:*
${itemsSummary}

_Track your order here: ${trackUrl}_

_Please check the Admin Dashboard for the payment screenshot._`;

      const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;

      Swal.fire({
        title: 'Order Successful!',
        html: `
          <div style="text-align: center;">
            <p style="margin-bottom: 0.5rem;">Your order <b>#${order.orderId}</b> has been placed.</p>
            <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem;">You can track its progress on our <b>Track My Vision</b> page.</p>
            
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <a href="${whatsappUrl}" target="_blank" class="cta-button-premium" style="display: inline-block; text-decoration: none; background: #25D366; border-color: #25D366; color: white; width: 100%;">
                Notify Florence via WhatsApp
              </a>
              <a href="${trackUrl}" target="_blank" style="font-weight: 700; color: #008080; text-decoration: none; font-size: 0.9rem; padding: 10px;">
                View Order Progress
              </a>
            </div>
          </div>
        `,
        icon: 'success',
        showConfirmButton: true,
        confirmButtonText: 'Back to Home',
        confirmButtonColor: '#008080'
      }).then(() => {
        navigate('/');
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="checkout-page section-padding container">
      <div className="reveal checkout-header">
        <h1 className="serif">Secure Checkout</h1>
        <p className="text-teal">Vision Spa Elite Delivery</p>
      </div>

      <div className="checkout-grid">
        <div className="checkout-form-column">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h3 className="serif form-section-title">Customer Details</h3>
              <div className="form-group-premium">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ama Serwaa"
                  value={formData.customer}
                  onChange={e => setFormData({ ...formData, customer: e.target.value })}
                  className="checkout-input"
                />
              </div>
              <div className="form-group-premium">
                <label>WhatsApp Number</label>
                <input
                  type="text"
                  required
                  placeholder="+233 55 555 5555"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="checkout-input"
                />
              </div>
              <div className="form-group-premium">
                <label>Delivery Location</label>
                <input
                  type="text"
                  required
                  placeholder="Accra, Osu / Digital Address"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="checkout-input"
                />
              </div>
            </div>

            <div className="form-section payment-section checkout-card">
              <h3 className="serif form-section-title">Payment Instructions</h3>
              <div className="payment-instruction-box">
                <p className="instruction-text">Please make a direct payment to the number below:</p>
                <div className="payment-number-card">
                  <div className="payment-number-info">
                    <p className="payment-method-label">MoMo / Direct Pay</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p className="payment-number" id="momo-number">0552739280</p>
                      <button 
                        type="button"
                        onClick={() => {
                          const num = document.getElementById('momo-number').innerText;
                          navigator.clipboard.writeText(num);
                          Swal.fire({
                            title: 'Copied!',
                            text: 'MoMo number copied to clipboard',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                            toast: true,
                            position: 'top-end'
                          });
                        }}
                        style={{ 
                          background: 'rgba(0, 128, 128, 0.1)', 
                          border: 'none', 
                          borderRadius: '6px', 
                          padding: '4px 8px', 
                          color: '#008080',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Copy size={14} /> Copy
                      </button>
                    </div>
                    <p className="payment-acc-name">Account Name: <b>FLORENCE ESHUN</b></p>
                    <p className="payment-warning">
                      <AlertTriangle size={12} /> Confirm name before authorising payment
                    </p>
                  </div>
                  <div className="payment-card-icon">
                    <Shield size={20} color="#16a34a" />
                  </div>
                </div>
              </div>

              <div className="screenshot-upload">
                <label className="upload-label">Upload Payment Screenshot</label>
                <div
                  className="upload-placeholder"
                  onClick={() => !isUploading && document.getElementById('screenshot').click()}
                  style={{ background: screenshotUrl ? '#f0fdf4' : 'white' }}
                >
                  {isUploading ? (
                    <p>Uploading...</p>
                  ) : screenshotUrl ? (
                    <div className="upload-success-content">
                      <CheckCircle size={32} color="#16a34a" />
                      <p className="success-text">Proof Received</p>
                      <p className="change-text">Click to change</p>
                    </div>
                  ) : (
                    <div className="upload-empty-content">
                      <Upload size={32} color="#94a3b8" />
                      <p>Tap to upload receipt screenshot</p>
                    </div>
                  )}
                  <input type="file" id="screenshot" hidden accept="image/*" onChange={handleFileUpload} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="cta-button-premium checkout-submit-btn"
            >
              {isSubmitting ? 'Processing Your Vision...' : 'Confirm & Place Order'}
            </button>
          </form>
        </div>

        <div className="order-summary-sidebar">
          <div className="glass shadowed order-summary-card">
            <h3 className="serif summary-title">Order Summary</h3>
            <div className="cart-items-preview">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <div className="summary-item-left">
                    <img src={item.image} className="summary-item-img" />
                    <div className="summary-item-info">
                      <p className="summary-item-name">{item.name}</p>
                      {item.sku && <p className="summary-item-sku" style={{ fontSize: '0.65rem', color: '#008080', fontWeight: 700 }}>ID: {item.sku}</p>}
                      <p className="summary-item-qty">Qty: {item.qty}</p>
                    </div>
                  </div>
                  <p className="summary-item-price">GH₵{(item.price * item.qty).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="summary-pricing">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>GH₵{cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span className="free-tag">FREE</span>
              </div>
              <div className="summary-total-row">
                <span className="total-label">Total To Pay</span>
                <span className="total-amount">GH₵{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="guarantee-box">
              <CheckCircle size={20} color="#16a34a" />
              <div className="guarantee-text">
                <p className="guarantee-title">Authentic Vision Guaranteed</p>
                <p className="guarantee-desc">Secure payment direct to Vision Spa.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mobile-checkout-sticky-bar">
          <div className="sticky-bar-info">
            <p>Total to Pay</p>
            <h3>GH₵{cartTotal.toFixed(2)}</h3>
          </div>
          <button
            type="button"
            className="sticky-pay-btn"
            onClick={() => {
              const el = document.querySelector('.checkout-submit-btn');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
          >
            Pay Now
          </button>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
