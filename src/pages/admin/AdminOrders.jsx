import React, { useState, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import ReceiptModal from '../../components/admin/ReceiptModal';

const AdminOrders = ({ orders, addOrder, updateOrder, deleteOrder, products }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [showModal]);
  const [newOrder, setNewOrder] = useState({ customer: '', phone: '', location: '', productName: products[0]?.name || '', qty: 1, payment: 'Unpaid' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const prod = products.find(p => p.name === newOrder.productName) || products[0];
    if (!prod) return; // Prevent crash if no products exist
    addOrder({
      customer: newOrder.customer,
      phone: newOrder.phone,
      location: newOrder.location,
      items: [{ name: newOrder.productName, qty: parseInt(newOrder.qty), sku: prod.sku }],
      total: prod.price * newOrder.qty,
      payment: newOrder.payment,
      status: 'Processing'
    });
    setShowModal(false);
    setNewOrder({ customer: '', phone: '', location: '', productName: products[0]?.name || '', qty: 1, payment: 'Unpaid' });
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOrders = orders.filter(order =>
    order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <div className="dashboard-view fade-in">
      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Sales Orders</h1>
          <p>Track payments and fulfillments — {orders.length} Total</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="admin-search-bar" style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search customer, ID or SKU..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="admin-search-input"
              style={{ paddingLeft: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '44px', width: '280px' }}
            />
          </div>
          <button className="cta-button-premium" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Record Manual Sale
          </button>
        </div>
      </header>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal-card modal-narrow" onClick={(e) => e.stopPropagation()}>
            <div className="modal-pull-handle"></div>
            <div className="modal-header-premium">
              <div>
                <h2 className="serif">Record New Sale</h2>
                <p>Create a manual order for offline or WhatsApp sales.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="sidebar-minimize-toggle">
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="modal-content-scroll">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input type="text" required value={newOrder.customer} onChange={e => setNewOrder({ ...newOrder, customer: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>WhatsApp / Phone</label>
                  <input type="text" value={newOrder.phone} onChange={e => setNewOrder({ ...newOrder, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Shipping Location</label>
                  <input type="text" placeholder="e.g. Accra, Osu" value={newOrder.location} onChange={e => setNewOrder({ ...newOrder, location: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Select Product</label>
                  <select value={newOrder.productName} onChange={e => setNewOrder({ ...newOrder, productName: e.target.value })}>
                    {products.length > 0 ? (
                      products.map((p, idx) => <option key={p._id || p.id || idx} value={p.name}>{p.name}</option>)
                    ) : (
                      <option disabled>No products available</option>
                    )}
                  </select>
                </div>
                <div className="form-grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
                  <div className="form-group">
                    <label>Quantity</label>
                    <input type="number" min="1" value={newOrder.qty} onChange={e => setNewOrder({ ...newOrder, qty: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Payment State</label>
                    <select value={newOrder.payment} onChange={e => setNewOrder({ ...newOrder, payment: e.target.value })}>
                      <option>Unpaid</option>
                      <option>Paid</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer-premium">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel-premium">
                  <X size={16} /> Close
                </button>
                <button type="submit" className="cta-button-premium shadowed" style={{ flex: 2, padding: '1rem', borderRadius: '14px' }}>
                  Record Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-card" style={{ padding: '0' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items Ordered</th>
                <th>Price</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((order, index) => (
                <tr key={order._id || order.id}>
                  <td data-label="#">{indexOfFirstItem + index + 1}</td>
                  <td data-label="Order ID" style={{ fontWeight: 700, color: '#008080' }}>#{order.orderId || order.id}</td>
                  <td data-label="Customer">
                    <div style={{ fontWeight: 600 }}>{order.customer}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.phone}</div>
                  </td>
                  <td data-label="Items Ordered">
                    <div style={{ fontSize: '0.85rem' }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{ marginBottom: '2px' }}>
                          <span style={{ fontWeight: 700 }}>{item.qty}x</span> {item.name}
                          {item.sku && <div style={{ fontSize: '0.7rem', color: '#008080', fontWeight: 600 }}>ID: {item.sku}</div>}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td data-label="Price">
                    <div style={{ fontWeight: 800 }}>GH₵{order.total?.toFixed(2)}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{order.items?.length || 0} unit(s)</div>
                  </td>
                  <td data-label="Payment"><span className={`badge ${order.payment === 'Paid' ? 'badge-paid' : 'badge-unpaid'}`}>{order.payment}</span></td>
                  <td data-label="Status"><span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span></td>
                  <td data-label="Actions" style={{ textAlign: 'center' }}>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrder(order._id || order.id, { status: e.target.value })}
                      style={{
                        padding: '0.4rem 0.5rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        color: '#334155',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Blocked">Blocked</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <button 
                      onClick={() => deleteOrder(order._id || order.id)}
                      style={{
                        marginLeft: '8px',
                        padding: '0.4rem',
                        borderRadius: '8px',
                        border: '1px solid #fee2e2',
                        background: '#fef2f2',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Delete Order"
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-wrapper" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} lines</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="pagination-btn">Prev</button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="pagination-btn">Next</button>
            </div>
          </div>
        )}
      </div>

      {selectedReceipt && (
        <ReceiptModal order={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      )}
    </div>
  );
};

export default AdminOrders;
