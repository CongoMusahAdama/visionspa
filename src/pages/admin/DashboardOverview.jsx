import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus, Package, ShoppingCart, Award, Globe, AlertCircle, ShoppingBag, Eye } from 'lucide-react';

const DashboardOverview = ({ products, orders, totalVisits, user }) => {
  const navigate = useNavigate();
  const pendingCount = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
  const lowStockThreshold = 5;
  const lowStock = products.filter(p => p.stock <= lowStockThreshold).length;
  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  // Pagination for Recent Orders
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  return (
    <div className="dashboard-view fade-in">
      <div className="welcome-banner reveal active">
        <div className="welcome-content">
          <h2 className="serif">Welcome Back, {
            user?.name && user.name !== 'Vision Admin' && user.name !== 'Admin'
              ? user.name.split(' ')[0]
              : 'Florence'
          }!</h2>
          <p>The vision of luxury continues. Here is a summary of your performance today.</p>
        </div>
        <div className="welcome-decor">
          <Sparkles size={60} className="sparkle-icon" />
        </div>
      </div>

      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Performance Overview</h1>
          <p>Vision Spa Luxury • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/admin/products')} className="cta-button-premium shadowed" style={{ padding: '0.8rem 1.75rem', fontSize: '0.8rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Plus size={18} /> Add New Product
          </button>
        </div>
      </header>

      {/* Interactive Stats Cards */}
      <div className="stats-grid">
        <div
          className="stat-card blue interactive"
          onClick={() => navigate('/admin/products')}
        >
          <div className="stat-icon"><Package size={24} /></div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <span className="stat-number">{products.length}</span>
            <span className="stat-link">View catalog →</span>
          </div>
        </div>

        <div
          className="stat-card green interactive"
          onClick={() => navigate('/admin/orders')}
        >
          <div className="stat-icon"><ShoppingCart size={24} /></div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <span className="stat-number">{orders.length}</span>
            <span className="stat-link">Manage sales →</span>
          </div>
        </div>

        <div
          className="stat-card yellow interactive"
          onClick={() => navigate('/admin/receipts')}
        >
          <div className="stat-icon"><Award size={24} /></div>
          <div className="stat-info">
            <h3>Total Sales</h3>
            <span className="stat-number">GH₵{totalSales.toLocaleString()}</span>
            <span className="stat-link">Receipts →</span>
          </div>
        </div>

        <div
          className="stat-card blue interactive"
          onClick={() => navigate('/admin/stats')}
        >
          <div className="stat-icon"><Globe size={24} /></div>
          <div className="stat-info">
            <h3>Website Visits</h3>
            <span className="stat-number">{totalVisits.toLocaleString()}</span>
            <span className="stat-link">View Analytics →</span>
          </div>
        </div>

        <div
          className="stat-card orange interactive"
          onClick={() => navigate('/admin/orders')}
        >
          <div className="stat-icon"><AlertCircle size={24} /></div>
          <div className="stat-info">
            <h3>Pending Orders</h3>
            <span className="stat-number">{pendingCount}</span>
            <span className="stat-link">Requires action →</span>
          </div>
        </div>

        <div
          className="stat-card orange interactive"
          onClick={() => navigate('/admin/inventory')}
        >
          <div className="stat-icon"><ShoppingBag size={24} /></div>
          <div className="stat-info">
            <h3>Low Stock</h3>
            <span className="stat-number">{lowStock}</span>
            <span className="stat-link">Restock soon →</span>
          </div>
        </div>
      </div>

      <div className="recent-activity-section">
        <div className="section-card recent-orders">
          <div className="card-header">
            <h3 className="serif">Recent Orders</h3>
            <button onClick={() => navigate('/admin/orders')} className="view-all-btn">View All</button>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.length > 0 ? (
                  currentOrders.map(order => (
                    <tr key={order._id}>
                      <td className="font-mono" style={{ fontSize: '0.75rem' }}>#{order.id || order._id.slice(-6).toUpperCase()}</td>
                      <td>
                        <div className="customer-info-table">
                          <p className="customer-name-table">{order.customer}</p>
                          <p className="customer-phone-table">{order.phone}</p>
                        </div>
                      </td>
                      <td className="font-bold">GH₵{order.total?.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${order.status?.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="table-action-btn" onClick={() => navigate('/admin/orders')} title="View Details">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-gray-400">No orders placed yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <p className="pagination-info">Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, orders.length)} of {orders.length} entries</p>
              <div className="pagination-buttons">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="page-btn"
                >Prev</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                  >{i + 1}</button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="page-btn"
                >Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
