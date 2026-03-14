import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, UploadCloud } from 'lucide-react';
import Swal from 'sweetalert2';
import { apiRequest, API_URL } from '../../utils/api';

const AdminGallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', image: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    const res = await apiRequest('/gallery');
    if (res.success) setItems(res.data);
    setLoading(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('images', file);

    try {
      const token = localStorage.getItem('vision_auth_token');
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });
      const result = await res.json();
      if (result.success) {
        setFormData({ ...formData, image: result.urls[0] });
      } else {
        Swal.fire('Error', result.message || 'Upload failed', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) return Swal.fire('Error', 'Please upload an image', 'error');

    const res = await apiRequest('/gallery', 'POST', formData);
    if (res.success) {
      setItems([res.data, ...items]);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', image: '' });
      Swal.fire({
        title: 'Added!',
        text: 'Gallery item added successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Item?',
      text: "This cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#008080',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete'
    });

    if (result.isConfirmed) {
      const res = await apiRequest(`/gallery/${id}`, 'DELETE');
      if (res.success) {
        setItems(items.filter(i => i._id !== id));
        Swal.fire('Deleted', 'Gallery item removed', 'success');
      }
    }
  };

  return (
    <div className="admin-gallery-page dashboard-view fade-in">
      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Gallery Management</h1>
          <p>Manage the images that appear in the public gallery</p>
        </div>
        <button className="cta-button-premium" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add New Image
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center p-20"><div className="loader-premium"></div></div>
      ) : (
        <div className="admin-card" style={{ padding: '0' }}>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Title</th>
                  <th>Added On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id}>
                    <td data-label="Preview"><img src={item.image} className="table-product-img" alt={item.title} /></td>
                    <td data-label="Title">
                      <div style={{ fontWeight: 700 }}>{item.title || 'No Title'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{item.description}</div>
                    </td>
                    <td data-label="Added On">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td data-label="Actions">
                      <button onClick={() => handleDelete(item._id)} style={{ color: '#ef4444', padding: '0.5rem', border: 'none', background: 'none', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card modal-narrow">
            <div className="modal-header-premium">
              <h2 className="serif">Add Gallery Item</h2>
              <X size={24} onClick={() => setIsModalOpen(false)} style={{ cursor: 'pointer' }} />
            </div>
            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="modal-content-scroll">
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Upload Image</label>
                  <div className="media-upload-area" onClick={() => document.getElementById('gallery-upload').click()}>
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '12px', objectFit: 'cover' }} />
                    ) : (
                      <div className="upload-empty-content">
                        <UploadCloud className="mx-auto" size={40} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                        <p style={{ color: '#94a3b8' }}>{uploading ? 'Uploading...' : 'Click to Browse'}</p>
                      </div>
                    )}
                    <input id="gallery-upload" type="file" onChange={handleUpload} style={{ display: 'none' }} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Title (Optional)</label>
                  <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Summer Collection Launch" />
                </div>
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Short caption..." rows={3} />
                </div>
              </div>
              <div className="modal-footer-premium">
                <button type="button" className="btn-cancel-premium" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="cta-button-premium" style={{ flex: 2 }} disabled={uploading}>
                  {uploading ? 'Processing...' : 'Save to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
