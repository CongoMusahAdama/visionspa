import React, { useState, useEffect } from 'react';
import { Globe, Users, Zap } from 'lucide-react';
import { apiRequest } from '../../utils/api';

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await apiRequest('/visits/stats');
    if (res.success) setStats(res.data);
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center p-20"><div className="loader-premium"></div></div>;

  return (
    <div className="admin-stats-page dashboard-view fade-in">
      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Visitor Analytics</h1>
          <p>Tracking activity on your website</p>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon"><Globe size={24} /></div>
          <div className="stat-info">
            <h3>Total Hits</h3>
            <p className="stat-number">{stats?.totalVisits || 0}</p>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-info">
            <h3>Unique Visitors</h3>
            <p className="stat-number">{stats?.uniqueVisitors || 0}</p>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon"><Zap size={24} /></div>
          <div className="stat-info">
            <h3>Last 24h</h3>
            <p className="stat-number">{stats?.recentVisits || 0}</p>
          </div>
        </div>
      </div>

      <div className="admin-card mt-8">
        <div className="card-header">
          <h2 className="serif">Traffic (Last 7 Days)</h2>
        </div>
        {stats?.dailyStats?.length > 0 ? (
          <div className="traffic-chart-simulated">
            {stats.dailyStats.map(day => (
              <div key={day._id} className="chart-bar-wrapper">
                <div className="chart-bar" style={{ height: `${Math.min(100, (day.count / (stats.totalVisits || 1)) * 500)}%` }}>
                  <span className="bar-tooltip">{day.count} visits</span>
                </div>
                <span className="chart-label">{day._id.split('-').slice(1).join('/')}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic p-10 center-text">No data available for the last 7 days.</p>
        )}
      </div>
    </div>
  );
};

export default AdminStats;
