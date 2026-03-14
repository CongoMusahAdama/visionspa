import React, { useState } from 'react';
import { Search } from 'lucide-react';

const AdminInventory = ({ products }) => {
  const [searchQuery, setSearchQuery] = useState('');
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="dashboard-view fade-in">
      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Inventory Health</h1>
          <p>Real-time stock tracking — {products.length} Items</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="admin-search-bar" style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search product name or ID..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="admin-search-input"
              style={{ paddingLeft: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '44px', width: '250px' }}
            />
          </div>
        </div>
      </header>

      <div className="admin-card" style={{ padding: '0' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Available Stock</th>
                <th>Safety Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(p => (
                <tr key={p._id || p.id}>
                  <td data-label="Product">
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    {p.sku && <div style={{ fontSize: '0.7rem', color: '#008080', fontWeight: 600 }}>ID: {p.sku}</div>}
                  </td>
                  <td data-label="Available Stock">{p.stock} units</td>
                  <td data-label="Safety Level">
                    <div style={{ width: '100%', maxWidth: '150px', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden', marginLeft: 'auto' }}>
                      <div style={{ width: `${Math.min(100, (p.stock / 20) * 100)}%`, height: '100%', background: p.stock <= 3 ? '#ef4444' : '#008080' }}></div>
                    </div>
                  </td>
                  <td data-label="Status">
                    {p.stock <= 3 ? <span className="badge badge-unpaid">Low Stock</span> : <span className="badge badge-paid">Healthy</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination-wrapper" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="pagination-btn">Prev</button>
              <span style={{ alignSelf: 'center', fontWeight: 600 }}>{currentPage} of {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="pagination-btn">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventory;
