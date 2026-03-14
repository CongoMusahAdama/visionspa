import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Upload, CheckCircle, Edit3, PackageX, Trash } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_URL } from '../../utils/api';

const AdminProducts = ({ products, categories, deleteProduct, addProduct, updateProduct }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination & Sorting (Newest First)
  const sortedProducts = [...products].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
  const filteredProducts = sortedProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [showModal]);

  const [newProd, setNewProd] = useState({
    name: '',
    price: '',
    discountPrice: '',
    stock: '',
    category: 'Luxury',
    description: '',
    comesWithPouch: false,
    images: [],
    discountPercentage: 0,
    sku: ''
  });

  const handleEdit = (prod) => {
    setEditingId(prod._id);
    setNewProd({
      name: prod.name || '',
      price: prod.price || '',
      discountPrice: prod.discountPrice || '',
      stock: prod.stock || '',
      category: prod.category || 'Luxury',
      description: prod.description || '',
      comesWithPouch: !!prod.comesWithPouch,
      images: prod.images || (prod.image ? [prod.image] : []),
      discountPercentage: prod.discountPercentage || 0,
      sku: prod.sku || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setNewProd({ name: '', price: '', discountPrice: '', stock: '', category: 'Luxury', description: '', comesWithPouch: false, images: [], discountPercentage: 0, sku: '' });
  };

  const openAddModal = () => {
    setEditingId(null);
    setNewProd({ name: '', price: '', discountPrice: '', stock: '', category: 'Luxury', description: '', comesWithPouch: false, images: [], discountPercentage: 0, sku: '' });
    setShowModal(true);
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));

    const token = localStorage.getItem('vision_auth_token');

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setNewProd(prev => ({ ...prev, images: [...prev.images, ...data.urls] }));
      } else {
        Swal.fire('Media Error', data.message || 'Image upload failed.', 'error');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      Swal.fire('Network Error', 'Image upload failed due to network issue.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    const updatedImages = newProd.images.filter((_, i) => i !== index);
    setNewProd({ ...newProd, images: updatedImages });
  };

  const handleSoldOut = async (prod) => {
    const isSoldOut = prod.status === 'Sold Out' || prod.stock === 0 || !!prod.soldOutAt;

    const result = await Swal.fire({
      title: isSoldOut ? 'Restock Product?' : 'Mark as Sold Out?',
      text: isSoldOut ? "This will make the product active again." : "This will mark it as Sold Out and hide it from the shop after 3 days.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#008080',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, proceed'
    });

    if (result.isConfirmed) {
      if (isSoldOut) {
        await updateProduct(prod._id || prod.id, { soldOutAt: null, status: 'Active', stock: Math.max(1, prod.stock) });
      } else {
        await updateProduct(prod._id || prod.id, { soldOutAt: new Date().toISOString(), status: 'Sold Out', stock: 0 });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const priceVal = parseFloat(newProd.price);
    const discPercent = parseFloat(newProd.discountPercentage || 0);
    const calculatedDiscountPrice = discPercent > 0
      ? parseFloat((priceVal * (1 - discPercent / 100)).toFixed(2))
      : null;

    const finalProdData = {
      ...newProd,
      price: priceVal,
      discountPercentage: discPercent,
      discountPrice: calculatedDiscountPrice,
      stock: parseInt(newProd.stock),
      sizes: ['M', 'L'],
      image: newProd.images[0] || '/midnight.png'
    };

    let success = false;
    if (editingId) {
      success = await updateProduct(editingId, finalProdData);
    } else {
      success = await addProduct(finalProdData);
    }

    if (success) {
      closeModal();
    }
  };

  return (
    <div className="dashboard-view fade-in">
      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Product Catalog</h1>
          <p>Edit, restock or remove items — {products.length} Items</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="admin-search-bar" style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search name or ID..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="admin-search-input"
              style={{ paddingLeft: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '44px', width: '250px' }}
            />
          </div>
          <button className="cta-button-premium" onClick={openAddModal}>
            <Plus size={18} /> New Product
          </button>
        </div>
      </header>

      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-pull-handle"></div>
            <div className="modal-header-premium">
              <div>
                <h2 className="serif">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                <p>{editingId ? 'Refine the essence of this luxury item.' : 'Define the features and essence of your next luxury item.'}</p>
              </div>
              <button onClick={closeModal} className="sidebar-minimize-toggle">
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="modal-content-scroll">
                <div className="form-grid-2">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                      <div className="form-group-premium">
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Product Identity (Name)</label>
                        <input type="text" required placeholder="name" value={newProd.name} onChange={e => setNewProd({ ...newProd, name: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem' }} />
                      </div>
                      <div className="form-group-premium">
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Unique SKU / ID</label>
                        <input type="text" placeholder="PID-001" value={newProd.sku} onChange={e => setNewProd({ ...newProd, sku: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Price (GH₵)</label>
                        <input type="number" required placeholder="0.00" value={newProd.price} onChange={e => setNewProd({ ...newProd, price: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Discount (%)</label>
                        <input type="number" placeholder="2" value={newProd.discountPercentage} onChange={e => setNewProd({ ...newProd, discountPercentage: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem' }} />
                        {newProd.discountPercentage > 0 && newProd.price && (
                          <span style={{ fontSize: '0.7rem', color: '#008080', fontWeight: 600 }}>
                            Final: GH₵{(newProd.price * (1 - newProd.discountPercentage / 100)).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Initial Stock</label>
                        <input type="number" required placeholder="Units" value={newProd.stock} onChange={e => setNewProd({ ...newProd, stock: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem' }} />
                      </div>
                    </div>
                    <div className="form-group-premium">
                      <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Collection Category</label>
                      <select value={newProd.category} onChange={e => setNewProd({ ...newProd, category: e.target.value })} style={{ width: '100%', padding: '1.1rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem' }}>
                        {categories.map((cat, idx) => (
                          <option key={idx} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group-premium">
                      <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Product Soul (Description)</label>
                      <textarea rows="5" placeholder="Narrate the story..." value={newProd.description} onChange={e => setNewProd({ ...newProd, description: e.target.value })} style={{ width: '100%', padding: '1.1rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', resize: 'none' }}></textarea>
                    </div>
                    <div className="form-group-premium" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <input type="checkbox" id="pouch-check" checked={newProd.comesWithPouch} onChange={e => setNewProd({ ...newProd, comesWithPouch: e.target.checked })} style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer', accentColor: '#008080' }} />
                      <label htmlFor="pouch-check" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', cursor: 'pointer', margin: 0 }}>Include Vision Spa Protective Pouch?</label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="form-group-premium" style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.9rem', fontWeight: 700, color: '#313e50' }}>Catalogue Imagery</label>
                      <div className="media-upload-area" onClick={() => !isUploading && document.getElementById('image-upload').click()} style={{ opacity: isUploading ? 0.6 : 1, cursor: isUploading ? 'wait' : 'pointer' }}>
                        <Upload size={32} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                          {isUploading ? 'Uploading to cloud...' : 'Click to import high-res media'}
                        </p>
                        <input id="image-upload" type="file" multiple accept="image/*" hidden onChange={handleImageChange} disabled={isUploading} />
                      </div>
                    </div>

                    <div className="admin-images-grid">
                      {newProd.images.map((img, i) => (
                        <div key={i} style={{ position: 'relative', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                          <img src={img && !img.startsWith('blob:') ? img : '/midnight.png'} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer-premium">
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '1.1rem', borderRadius: '16px', fontSize: '1rem', fontWeight: 600, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <X size={18} /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="cta-button-premium shadowed"
                  style={{
                    flex: 2,
                    padding: '1.1rem',
                    borderRadius: '16px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    background: isUploading ? '#94a3b8' : 'var(--admin-sidebar-bg)',
                    color: 'white',
                    cursor: isUploading ? 'wait' : 'pointer',
                    opacity: isUploading ? 0.7 : 1
                  }}>
                  {isUploading ? 'Uploading Media...' : editingId ? 'Save Changes' : 'Finalize & Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((prod, index) => {
                const imgFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(prod.name || 'P')}&background=0d2f2f&color=fff&size=100`;
                return (
                  <tr key={prod._id || prod.id || index}>
                    <td data-label="#">{indexOfFirstItem + index + 1}</td>
                    <td data-label="Product">
                      <div className="flex items-center">
                        <img
                          src={prod.image && !prod.image.startsWith('blob:') ? prod.image : imgFallback}
                          className="table-product-img"
                          alt=""
                          style={{ width: '40px', height: '40px', borderRadius: '8px', marginRight: '1rem' }}
                        />
                        <div style={{ fontWeight: 700 }}>
                          {prod.name}
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>{prod.sku || 'No ID'}</div>
                          {prod.comesWithPouch && <span style={{ marginLeft: '6px', color: '#008080', fontSize: '0.7rem' }} title="Includes Pouch"><CheckCircle size={12} style={{ display: 'inline', marginBottom: '2px' }} /></span>}
                        </div>
                      </div>
                    </td>
                    <td data-label="Category">{prod.category}</td>
                    <td data-label="Price" style={{ fontWeight: 600 }}>GH₵{prod.price}</td>
                    <td data-label="Stock" style={{ fontWeight: 700, color: prod.stock <= 3 ? '#ef4444' : 'inherit' }}>{prod.stock}</td>
                    <td data-label="Status">
                      {prod.status === 'Sold Out' || prod.stock === 0 || !!prod.soldOutAt ? (
                        <span className="badge" style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px' }}>Sold Out</span>
                      ) : (
                        <span className="badge badge-paid">Active</span>
                      )}
                    </td>
                    <td data-label="Actions">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(prod)} style={{ padding: '0.4rem', borderRadius: '6px', background: '#f1f5f9' }}><Edit3 size={14} /></button>
                        <button onClick={() => handleSoldOut(prod)} title={prod.status === 'Sold Out' || prod.stock === 0 || !!prod.soldOutAt ? "Restock" : "Mark Sold Out"} style={{ padding: '0.4rem', borderRadius: '6px', background: '#fef3c7', color: '#d97706' }}><PackageX size={14} /></button>
                        <button onClick={() => deleteProduct(prod._id || prod.id)} style={{ padding: '0.4rem', borderRadius: '6px', background: '#fee2e2', color: '#ef4444' }}><Trash size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-wrapper" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} entries</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="pagination-btn"
                style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
              >Previous</button>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    style={{
                      background: currentPage === i + 1 ? '#008080' : 'white',
                      color: currentPage === i + 1 ? 'white' : '#1e293b',
                      border: '1px solid #e2e8f0',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      minWidth: '36px'
                    }}
                  >{i + 1}</button>
                ))}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="pagination-btn"
                style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
              >Next</button>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default AdminProducts;
