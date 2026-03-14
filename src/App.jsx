import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './mobile.css';
import './Dashboard.css';
import Swal from 'sweetalert2';

import { apiRequest } from './utils/api';
import { CartProvider } from './context/CartContext';
import { ModalProvider } from './context/ModalContext';

import Toast from './components/common/Toast';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CartDrawer from './components/common/CartDrawer';
import ProductDetailModal from './components/ProductDetailModal';
import VisitTracker from './components/common/VisitTracker';
import SupportBot from './components/common/SupportBot';
import ForcePasswordChangeModal from './components/auth/ForcePasswordChangeModal';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import AboutPage from './pages/AboutPage';
import CollectionsPage from './pages/CollectionsPage';
import GalleryPage from './pages/GalleryPage';
import AuthPage from './pages/AuthPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import TrackOrder from './pages/TrackOrder';

const App = () => {
  // --- ADMIN & AUTH STATE ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Luxury', 'Elite', 'Men']);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [totalVisits, setTotalVisits] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
    const ordRes = await apiRequest('/orders');
    if (ordRes.success) setOrders(ordRes.data);
  };

  // Initial Data Fetching
  useEffect(() => {
    const initApp = async () => {
      setLoading(true);

      // Load categories first
      const catRes = await apiRequest('/categories');
      if (catRes.success && catRes.data?.length > 0) {
        const uniqueCats = [...new Set(catRes.data.map(c => c.name.trim()))];
        setCategories(uniqueCats);
      } else {
        setCategories(['Luxury', 'Elite', 'Men']);
      }

      // Load public products
      const prodRes = await apiRequest('/products');
      if (prodRes.success && prodRes.data?.length > 0) {
        setProducts(prodRes.data);

        // Deduplicate and merge categories from products
        const productCategories = prodRes.data.map(p => p.category?.trim()).filter(Boolean);
        setCategories(prev => {
          const combined = [...prev, ...productCategories];
          const normalized = combined.map(c => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase());
          return [...new Set(normalized)];
        });
      } else {
        setProducts([]);
      }

      // Verify Auth (Cookie-based or Token-based)
      const verifyRes = await apiRequest('/auth/me');
      if (verifyRes.success) {
        setUser(verifyRes.data);
        const ordRes = await apiRequest('/orders');
        if (ordRes.success) setOrders(ordRes.data);

        // Fetch visit stats for admin
        const visitRes = await apiRequest('/visits/stats');
        if (visitRes.success) setTotalVisits(visitRes.data.totalVisits || 0);
      }

      setLoading(false);
    };
    initApp();
  }, []);

  // Auto-refresh orders for admin every 30 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000); // 30 seconds polling
    return () => clearInterval(interval);
  }, [user]);

  const handleLogin = async (userData) => {
    if (userData.token) {
      localStorage.setItem('vision_auth_token', userData.token);
    }
    setUser(userData);

    // Fetch initial admin data
    const ordRes = await apiRequest('/orders');
    if (ordRes.success) setOrders(ordRes.data);

    const visitRes = await apiRequest('/visits/stats');
    if (visitRes.success) setTotalVisits(visitRes.data.totalVisits || 0);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Sign Out?',
      text: "Are you sure you want to end your session?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#008080',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Sign Out',
      background: '#fff',
      color: '#1e293b'
    });

    if (result.isConfirmed) {
      await apiRequest('/auth/logout'); // Clear cookie on backend
      localStorage.removeItem('vision_auth_token');
      setUser(null);
      Swal.fire({
        title: 'Signed Out',
        text: 'Come back soon!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const addProduct = async (newProduct) => {
    const res = await apiRequest('/products', 'POST', newProduct);
    if (res.success) {
      setProducts(prev => [res.data, ...prev]);
      Swal.fire({
        title: 'Product Added!',
        text: `${res.data.name} has been published to the catalog.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        iconColor: '#008080'
      });
    }
    return res.success;
  };

  const updateProduct = async (id, updated) => {
    const res = await apiRequest(`/products/${id}`, 'PUT', updated);
    if (res.success) {
      setProducts(prev => prev.map(p => p._id === id ? res.data : p));
      Swal.fire({
        title: 'Updated!',
        text: 'Product details have been synchronized.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        iconColor: '#008080'
      });
    }
    return res.success;
  };

  const deleteProduct = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This product will be permanently removed.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#008080',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      const res = await apiRequest(`/products/${id}`, 'DELETE', null);
      if (res.success) {
        setProducts(prev => prev.filter(p => p._id !== id));
        Swal.fire({
          title: 'Deleted!',
          text: 'The product has been removed.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
      return res.success;
    }
    return false;
  };

  const addOrder = async (newOrder) => {
    const res = await apiRequest('/orders', 'POST', newOrder);
    if (res.success) {
      Swal.fire({
        title: 'Sale Recorded!',
        text: `Order ${res.data.orderId} has been successfully saved.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        iconColor: '#008080'
      });

      if (user) {
        setOrders(prev => [res.data, ...prev]);
        fetchOrders();
      }

      if (res.data.items) {
        res.data.items.forEach(item => {
          setProducts(prev => prev.map(p => p.name === item.name ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p));
        });
      }
    }
    return res;
  };

  const updateOrder = async (id, updated) => {
    const res = await apiRequest(`/orders/${id}`, 'PUT', updated);
    if (res.success) {
      setOrders(prev => prev.map(o => (o._id === id || o.id === id) ? res.data : o));
      Swal.fire({
        title: 'Status Updated!',
        text: `Order status has been updated successfully.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        iconColor: '#008080'
      });
    } else {
      Swal.fire('Error', res.message || 'Could not update order', 'error');
    }
    return res.success;
  };

  const deleteOrder = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Order?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      const res = await apiRequest(`/orders/${id}`, 'DELETE');
      if (res.success) {
        setOrders(prev => prev.filter(o => o._id !== id));
        Swal.fire({
          title: 'Deleted!',
          text: 'Order has been removed.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire('Error', res.message || 'Could not delete order', 'error');
      }
      return res.success;
    }
    return false;
  };

  if (loading) {

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader-premium"></div>
      </div>
    );
  }

  return (
    <Router>
      <VisitTracker />
      <CartProvider>
        <ModalProvider>
          <div className="app">
            <Navbar user={user} />
            <Toast />
            <CartDrawer />
            <ProductDetailModal />
            {user?.needsPasswordChange && <ForcePasswordChangeModal setUser={setUser} />}
            <Routes>
              <Route path="/" element={<HomePage products={products} categories={categories} />} />
              <Route path="/shop" element={<ShopPage products={products} categories={categories} />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
              <Route path="/checkout" element={<CheckoutPage addOrder={addOrder} />} />
              <Route path="/track" element={<TrackOrder />} />
              <Route
                path="/admin/*"
                element={
                  user ? (
                    <AdminDashboard
                      products={products}
                      categories={categories}
                      orders={orders}
                      totalVisits={totalVisits}
                      fetchOrders={fetchOrders}
                      addProduct={addProduct}
                      updateProduct={updateProduct}
                      deleteProduct={deleteProduct}
                      addOrder={addOrder}
                      updateOrder={updateOrder}
                      deleteOrder={deleteOrder}
                      setCategories={setCategories}

                      user={user}
                      onLogout={handleLogout}
                    />
                  ) : (
                    <AuthPage onLogin={handleLogin} />
                  )
                }
              />
            </Routes>
            <Footer />
            <SupportBot />
          </div>
        </ModalProvider>
      </CartProvider>
    </Router>
  );
};

export default App;
