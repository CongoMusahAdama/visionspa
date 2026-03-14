import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { apiRequest } from '../utils/api';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId || !phone) return;

    setLoading(true);
    setError('');
    setOrder(null);

    const res = await apiRequest(`/orders/track/${orderId}?phone=${phone}`);
    if (res.success) {
      setOrder(res.data);
    } else {
      setError(res.message || 'Could not find order. Please check your ID and Phone.');
    }
    setLoading(false);
  };

  // Auto-refresh order status every 10 seconds if an order is being viewed
  React.useEffect(() => {
    if (!order) return;
    
    const interval = setInterval(async () => {
      const res = await apiRequest(`/orders/track/${order.orderId}?phone=${order.phone}`);
      if (res.success) {
        setOrder(res.data);
      }
    }, 10000); // 10 seconds polling

    return () => clearInterval(interval);
  }, [order]);

  const statusSteps = [
    { label: 'Pending', icon: <Clock size={20} />, key: 'Pending' },
    { label: 'Processing', icon: <Package size={20} />, key: 'Processing' },
    { label: 'Shipped', icon: <Truck size={20} />, key: 'Shipped' },
    { label: 'Delivered', icon: <CheckCircle size={20} />, key: 'Delivered' }
  ];

  const currentStatusIndex = statusSteps.findIndex(s => s.key === order?.status);

  return (
    <div className="track-order-page section-padding container">
      <div className="center-text mb-12 reveal">
        <h1 className="serif" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Track My Vision</h1>
        <p className="text-teal" style={{ letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Exclusive Order Tracking</p>
      </div>

      <div className="track-search-card shadowed glass" style={{ maxWidth: '600px', margin: '0 auto 4rem', padding: '2.5rem', borderRadius: '24px' }}>
        <form onSubmit={handleTrack} className="flex flex-col gap-5">
          <div className="form-group-premium">
            <label style={{ fontWeight: 700, color: '#1e293b' }}>Order ID</label>
            <input 
              type="text" 
              placeholder="e.g. VS-12345" 
              value={orderId} 
              onChange={e => setOrderId(e.target.value)}
              className="checkout-input"
              required
            />
          </div>
          <div className="form-group-premium">
            <label style={{ fontWeight: 700, color: '#1e293b' }}>Phone Number</label>
            <input 
              type="text" 
              placeholder="The number used for the order" 
              value={phone} 
              onChange={e => setPhone(e.target.value)}
              className="checkout-input"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="cta-button-premium" 
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? 'Finding Your Order...' : 'Track Now'}
          </button>
        </form>

        {error && (
          <div className="error-box mt-6" style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{error}</p>
          </div>
        )}
      </div>

      {order && (
        <div className="track-results fade-in">
          <div className="status-timeline-wrapper mb-16">
            <div className="status-timeline">
              {statusSteps.map((step, idx) => {
                const isCompleted = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                return (
                  <div key={idx} className={`status-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                    <div className="step-icon-circle">
                      {step.icon}
                    </div>
                    <div className="step-info">
                      <p className="step-label">{step.label}</p>
                      {isCurrent && <span className="current-badge">Active</span>}
                    </div>
                    {idx < statusSteps.length - 1 && <div className="step-line" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="order-details-card glass shadowed" style={{ padding: '2rem', borderRadius: '20px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 className="serif" style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Order Details</h3>
                <p style={{ color: '#64748b' }}>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 800, color: '#008080', fontSize: '1.2rem' }}>#{order.orderId}</p>
                <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
              </div>
            </div>

            <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Customer</h4>
                <p style={{ fontWeight: 700 }}>{order.customer}</p>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{order.location}</p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Delivery Status</h4>
                <p style={{ fontWeight: 700 }}>
                  {order.status === 'Pending' && 'Payment Verification in Progress'}
                  {order.status === 'Processing' && 'Preparing your package'}
                  {order.status === 'Shipped' && 'Order is out for delivery'}
                  {order.status === 'Delivered' && 'Order has been received'}
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Items Summary</h4>
                {order.items.map((item, i) => (
                  <p key={i} style={{ fontSize: '0.9rem' }}>{item.qty}x {item.name}</p>
                ))}
              </div>
              <div style={{ textAlign: 'right' }}>
                <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Total Amount</h4>
                <p style={{ fontWeight: 800, fontSize: '1.5rem', color: '#1e293b' }}>GH₵{order.total.toFixed(2)}</p>
                <p style={{ fontSize: '0.75rem', color: order.payment === 'Paid' ? '#16a34a' : '#ef4444', fontWeight: 700 }}>
                  {order.payment === 'Paid' ? '✓ PAYMENT CONFIRMED' : '⚠ PAYMENT UNVERIFIED'}
                </p>
              </div>
            </div>
            
            <div style={{ marginTop: '2.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', textAlign: 'center' }}>
               <a 
                href={`https://wa.me/233552739280?text=${encodeURIComponent(`Hi Vision Spa, I have a question about my order #${order.orderId}`)}`} 
                target="_blank" 
                rel="noreferrer" 
                className="text-teal" 
                style={{ fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
               >
                 Need assistance? Contact us on WhatsApp
               </a>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .status-timeline {
          display: flex;
          justify-content: space-between;
          position: relative;
          max-width: 900px;
          margin: 0 auto;
        }
        .status-step {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .step-icon-circle {
          width: 50px;
          height: 50px;
          background: #f1f5f9;
          border: 2px solid #e2e8f0;
          color: #94a3b8;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s ease;
          margin-bottom: 12px;
        }
        .status-step.completed .step-icon-circle {
          background: #008080;
          border-color: #008080;
          color: white;
          box-shadow: 0 4px 15px rgba(0, 128, 128, 0.2);
        }
        .status-step.current .step-icon-circle {
          border-color: #008080;
          color: #008080;
          transform: scale(1.1);
        }
        .step-label {
          font-weight: 700;
          font-size: 0.9rem;
          color: #94a3b8;
          transition: color 0.4s ease;
        }
        .status-step.completed .step-label {
          color: #1e293b;
        }
        .status-step.current .step-label {
          color: #008080;
        }
        .step-line {
          position: absolute;
          top: 25px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: #e2e8f0;
          z-index: -1;
        }
        .status-step.completed .step-line {
          background: #008080;
        }
        .current-badge {
          background: rgba(0, 128, 128, 0.1);
          color: #008080;
          font-size: 0.65rem;
          padding: 2px 8px;
          border-radius: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 4px;
        }
        @media (max-width: 640px) {
          .status-timeline { flex-direction: column; gap: 2rem; align-items: flex-start; padding-left: 20px; }
          .status-step { flex-direction: row; align-items: center; gap: 1rem; width: 100%; }
          .step-line { width: 2px; height: 2rem; left: 25px; top: 50px; }
        }
      `}} />
    </div>
  );
};

export default TrackOrder;
