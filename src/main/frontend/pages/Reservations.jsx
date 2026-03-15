import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationsAPI, adminAPI } from '../services/api';

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userRole = localStorage.getItem('userRole') || 'ADMIN';
  const navigate = useNavigate();

  useEffect(() => { fetchReservations(); }, []);

  const fetchReservations = async () => {
    setLoading(true);
    setError('');
    try {
      let data;
      if (userRole === 'ADMIN') {
        data = await adminAPI.getReservations();
        setReservations(data.reservations);
      } else if (userRole === 'STUDENT') {
        data = await reservationsAPI.getAll();
        setReservations(data.reservations);
      } else {
        setReservations([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this reservation?')) return;
    try {
      await adminAPI.updateReservation(id, 'cancelled');
      setReservations(reservations.map((r) =>
        r.reservation_id === id ? { ...r, status: 'cancelled' } : r
      ));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await adminAPI.updateReservation(id, 'confirmed');
      setReservations(reservations.map((r) =>
        r.reservation_id === id ? { ...r, status: 'confirmed' } : r
      ));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const filtered = reservations.filter(
    (r) =>
      (r.course_title || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
      r.status.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="slide-up" style={{ color: 'var(--text-secondary)', padding: '40px' }}>Loading reservations...</div>;

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reservations</h1>
          <p className="page-subtitle">Manage course seat reservations</p>
        </div>
      </div>

      {error && <div style={{ color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      <div className="table-wrapper">
        <div className="table-header">
          <h3 className="table-title">All Reservations ({filtered.length})</h3>
          <div className="table-search">
            <span>🔍</span>
            <input placeholder="Search reservations..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              {userRole === 'ADMIN' && <th>Student</th>}
              <th>Course</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((res) => (
              <tr key={res.reservation_id}>
                <td>#{res.reservation_id}</td>
                {userRole === 'ADMIN' && <td style={{ fontWeight: 600 }}>{res.student_name}</td>}
                <td style={{ fontWeight: 600 }}>{res.course_title}</td>
                <td>
                  <span className={`badge ${res.status === 'confirmed' ? 'success' : res.status === 'pending' ? 'warning' : 'danger'}`}>
                    {res.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{res.reservation_date}</td>
                <td>
                  <div className="action-buttons">
                    {res.status === 'pending' && userRole === 'STUDENT' && (
                      <button className="btn btn-sm btn-primary" onClick={() => navigate('/payments')}>
                        💳 Pay Now
                      </button>
                    )}
                    {res.status === 'pending' && userRole === 'ADMIN' && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleConfirm(res.reservation_id)}>
                        ✓ Confirm
                      </button>
                    )}
                    {res.status !== 'cancelled' && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleCancel(res.reservation_id)}>
                        ✕ Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={userRole === 'ADMIN' ? 6 : 5}>
                  <div className="empty-state">
                    <div className="empty-state-icon">🎫</div>
                    <div className="empty-state-title">No reservations found</div>
                    <div className="empty-state-desc">Reserve a seat from the Courses page.</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
