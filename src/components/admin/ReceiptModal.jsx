import React, { useState, useRef } from 'react';
import { Download } from 'lucide-react';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';

const ReceiptModal = ({ order, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const receiptRef = useRef(null);

  if (!order) return null;

  const handleDownloadAndShare = async () => {
    setIsGenerating(true);
    const element = receiptRef.current;

    const opt = {
      margin: 10,
      filename: `Receipt_RC-${order.orderId?.split('-')[1]?.toUpperCase() || order._id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
      const waText = `Hello ${order.customer}, thank you for your authentic luxury purchase from Vision Spa! We've attached your digital receipt RC-${order.orderId?.split('-')[1]?.toUpperCase() || order._id} for your records. Let us know if you need anything else!`;
      const waUrl = `https://wa.me/${order.phone ? order.phone.replace(/[^0-9]/g, '') : ''}?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, '_blank');
    } catch (err) {
      console.error('Error generating PDF or opening WhatsApp:', err);
      Swal.fire('Error', 'Could not generate receipt PDF or open WhatsApp. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose} style={{ zIndex: 1000001 }}>
      <div className="admin-modal-card modal-narrow" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', padding: '0', border: '1px solid #eee' }}>
        <div ref={receiptRef} style={{ background: '#fff', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
          {/* Watermark Logo */}
          <img src="/logo.jpeg" alt="Watermark" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.08,
            width: '70%',
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #f8fafc', paddingBottom: '1.5rem' }}>
              <h2 className="serif" style={{ color: '#008080', fontSize: '1.8rem', margin: '0' }}>Vision Spa</h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0' }}>The Essence of Luxury</p>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                Receipt #: RC-{order.orderId?.split('-')[1]?.toUpperCase() || order._id} | Date: {order.date}
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Customer</span>
                <span style={{ fontWeight: 700 }}>{order.customer}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Location</span>
                <span style={{ fontWeight: 700 }}>{order.location || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Payment Method</span>
                <span style={{ fontWeight: 700, color: order.payment === 'Paid' ? '#16a34a' : '#d97706' }}>{order.payment}</span>
              </div>
            </div>

            <div style={{ background: 'rgba(248, 250, 252, 0.8)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
                <span>Item</span>
                <div style={{ display: 'flex', gap: '3rem' }}>
                  <span>Qty</span>
                  <span>Price</span>
                </div>
              </div>
              {order.items.map((item, idx) => {
                 // Try to calculate unit price based on total if item price isn't directly available or if it's simpler
                 const unitPrice = (order.total / order.items.reduce((acc, curr) => acc + curr.qty, 0)).toFixed(2);
                 return (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600 }}>
                    <span style={{ fontSize: '0.9rem' }}>{item.name}</span>
                    <div style={{ display: 'flex', gap: '3.5rem' }}>
                      <span>x{item.qty}</span>
                      <span>GH₵{unitPrice}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #008080', paddingTop: '1.5rem', marginTop: '1rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Total Amount</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#008080' }}>GH₵{order.total.toFixed(2)}</span>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem', color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>
              Thank you for choosing luxury. Visit again!
            </div>
          </div>
        </div>

        <div className="modal-footer-premium" style={{ marginTop: '0', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px', padding: '1.5rem', display: 'flex', gap: '1rem' }}>
          <button className="btn-cancel-premium" onClick={onClose} style={{ flex: 1 }}>Close</button>
          <button className="cta-button-premium" style={{ flex: 1 }} onClick={handleDownloadAndShare} disabled={isGenerating}>
            {isGenerating ? 'Processing...' : <><Download size={16} /> Save PDF & WA</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
