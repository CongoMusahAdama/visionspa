import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Layers, ShoppingCart, BarChart3, 
  ImageIcon, Activity, Globe, ShoppingBag, LogOut, Menu, 
  LayoutGrid, User
} from 'lucide-react';
import { ReceiptCedi } from '../../components/common/Icons';
import Swal from 'sweetalert2';

import DashboardOverview from './DashboardOverview';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminReceipts from './AdminReceipts';
import AdminCategories from './AdminCategories';
import AdminInventory from './AdminInventory';
import AdminGallery from './AdminGallery';
import AdminStats from './AdminStats';

const AdminDashboard = ({ products, categories, orders, totalVisits, fetchOrders, addProduct, updateProduct, deleteProduct, addOrder, updateOrder, deleteOrder, setCategories, user, onLogout }) => {

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const location = useLocation();

  const handleMobileLogout = () => {
    Swal.fire({
      title: 'Sign Out?',
      text: "Are you sure you want to end your session?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#008080',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Sign Out'
    }).then((result) => {
      if (result.isConfirmed) {
        onLogout();
      }
    });
  };

  return (
    <div className={`dashboard-layout ${isMinimized ? 'minimized' : ''}`}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobileOpen ? 'mobile-open' : ''} ${isMinimized ? 'minimized' : ''}`}>
        <div className="sidebar-header">
          {!isMinimized && (
            <div className="flex items-center gap-4">
              <img src="/logo.jpeg" alt="Vision Spa" className="admin-logo" />
              <div className="admin-profile-hint">
                <h2 className="serif" style={{ fontSize: '1rem', color: 'white', margin: 0 }}>Vision Spa</h2>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.role || 'Admin'}</p>
              </div>
            </div>
          )}
          <button className="sidebar-minimize-toggle" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <LayoutGrid size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin" className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
            <LayoutDashboard size={18} />
            <span className="sidebar-text">Dashboard</span>
          </Link>
          <Link to="/admin/products" className={`sidebar-link ${location.pathname.startsWith('/admin/products') ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
            <Package size={18} />
            <span className="sidebar-text">Products</span>
          </Link>
          <Link to="/admin/categories" className={`sidebar-link ${location.pathname.startsWith('/admin/categories') ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
            <Layers size={18} />
            <span className="sidebar-text">Categories</span>
          </Link>
          <Link to="/admin/orders" className={`sidebar-link ${location.pathname.startsWith('/admin/orders') ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
            <ShoppingCart size={18} />
            <span className="sidebar-text">Orders</span>
          </Link>
          <Link to="/admin/inventory" className={`sidebar-link ${location.pathname.startsWith('/admin/inventory') ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
            <BarChart3 size={18} />
            <span className="sidebar-text">Inventory</span>
          </Link>
          <Link to="/admin/gallery" className={`sidebar-link ${location.pathname.startsWith('/admin/gallery') ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
            <ImageIcon size={18} />
            <span className="sidebar-text">Gallery</span>
          </Link>
          <Link to="/admin/stats" className={`sidebar-link ${location.pathname.startsWith('/admin/stats') ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
            <Activity size={18} />
            <span className="sidebar-text">Analytics</span>
          </Link>

          <Link to="/admin/receipts" className={`sidebar-link ${location.pathname.startsWith('/admin/receipts') ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
            <ReceiptCedi size={18} />
            <span className="sidebar-text">Receipts</span>
          </Link>
          <div className="sidebar-divider" style={{ margin: '1rem 0', height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <Link to="/" className="sidebar-link" onClick={() => setIsMobileOpen(false)}>
            <Globe size={18} />
            <span className="sidebar-text">View Website</span>
          </Link>
          <Link to="/shop" className="sidebar-link" onClick={() => setIsMobileOpen(false)}>
            <ShoppingBag size={18} />
            <span className="sidebar-text">Go to Shop</span>
          </Link>

        </nav>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="logout-btn" style={{ width: '100%', border: 'none', background: 'none' }}>
            <LogOut size={18} />
            <span className="sidebar-text">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Mobile Nav Toggle */}
        <div className="admin-mobile-nav">
          <div className="flex items-center gap-3">
            <Menu size={24} onClick={() => setIsMobileOpen(!isMobileOpen)} />
            <Link to="/" style={{ color: 'inherit', display: 'flex' }} title="View Store">
              <Globe size={20} />
            </Link>
          </div>
          <h2 className="serif" onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>Vision Admin</h2>
          <div className="admin-user-avatar" onClick={handleMobileLogout} style={{ cursor: 'pointer' }}>
            <User size={20} />
          </div>
        </div>

        {isMobileOpen && (
          <div
            className="mobile-menu-backdrop"
            style={{ zIndex: 1500 }}
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        <Routes>
          <Route path="/" element={<DashboardOverview products={products} orders={orders} totalVisits={totalVisits} user={user} />} />
          <Route path="/products" element={<AdminProducts products={products} categories={categories} deleteProduct={deleteProduct} addProduct={addProduct} updateProduct={updateProduct} />} />
          <Route path="/orders" element={<AdminOrders orders={orders} fetchOrders={fetchOrders} addOrder={addOrder} updateOrder={updateOrder} deleteOrder={deleteOrder} products={products} />} />
          <Route path="/receipts" element={<AdminReceipts orders={orders} updateOrder={updateOrder} />} />
          <Route path="/categories" element={<AdminCategories categories={categories} setCategories={setCategories} />} />
          <Route path="/inventory" element={<AdminInventory products={products} />} />
          <Route path="/gallery" element={<AdminGallery />} />
          <Route path="/stats" element={<AdminStats />} />

          {/* Default to Overview */}
          <Route path="*" element={<DashboardOverview products={products} orders={orders} user={user} />} />
        </Routes>
      </main>

      {/* Admin Bottom Navigation (Mobile) — Pulse-Style */}
      <nav className="admin-bottom-nav">
        {/* Left side: 2 links */}
        <Link to="/admin" className={`bottom-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
          <LayoutDashboard size={22} />
          <span>Home</span>
        </Link>
        <Link to="/admin/products" className={`bottom-nav-link ${location.pathname.startsWith('/admin/products') ? 'active' : ''}`}>
          <Package size={22} />
          <span>Stock</span>
        </Link>

        {/* Center raised FAB button */}
        <div className="bottom-nav-center-slot">
          <Link to="/admin/orders" className={`bottom-nav-fab ${location.pathname.startsWith('/admin/orders') ? 'active' : ''}`}>
            <ShoppingCart size={26} />
            <span>Sales</span>
          </Link>
        </div>

        {/* Right side: 2 links */}
        <Link to="/admin/receipts" className={`bottom-nav-link ${location.pathname.startsWith('/admin/receipts') ? 'active' : ''}`}>
          <ReceiptCedi size={22} />
          <span>Receipts</span>
        </Link>
        <Link to="/admin/inventory" className={`bottom-nav-link ${location.pathname.startsWith('/admin/inventory') ? 'active' : ''}`}>
          <BarChart3 size={22} />
          <span>Health</span>
        </Link>
      </nav>
    </div>
  );
};

export default AdminDashboard;
