import React, { useState } from 'react';
import { mockReservations, mockCourses } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

export default function Reservations() {
    const [reservations, setReservations] = useState(mockReservations);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ courseName: '', expiryDate: '' });
    const userRole = localStorage.getItem('userRole') || 'ADMIN';
    const navigate = useNavigate();

    const filtered = reservations.filter(
        (r) =>
            r.courseName.toLowerCase().includes(search.toLowerCase()) ||
            r.status.toLowerCase().includes(search.toLowerCase())
    );

    const handleReserve = (e) => {
        e.preventDefault();
        const newRes = {
            reservationId: Date.now(),
            courseName: form.courseName,
            status: 'PENDING',
            expiryDate: form.expiryDate,
        };
        setReservations([newRes, ...reservations]);
        setShowModal(false);
        setForm({ courseName: '', expiryDate: '' });
    };

    const handleConfirm = (id) => {
        setReservations(reservations.map((r) => (r.reservationId === id ? { ...r, status: 'CONFIRMED' } : r)));
    };

    const handleCancel = (id) => {
        setReservations(reservations.map((r) => (r.reservationId === id ? { ...r, status: 'CANCELLED' } : r)));
    };

    return (
        <div className="slide-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reservations</h1>
                    <p className="page-subtitle">Manage course seat reservations</p>
                </div>
                {userRole !== 'STUDENT' && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Reservation</button>
                )}
            </div>

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
                            <th>Course</th>
                            <th>Status</th>
                            <th>Expiry Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((res) => (
                            <tr key={res.reservationId}>
                                <td>#{res.reservationId}</td>
                                <td style={{ fontWeight: 600 }}>{res.courseName}</td>
                                <td>
                                    <span className={`badge ${res.status === 'CONFIRMED' ? 'success' : res.status === 'PENDING' ? 'warning' : 'danger'}`}>
                                        {res.status}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--text-secondary)' }}>{res.expiryDate}</td>
                                <td>
                                    <div className="action-buttons">
                                        {res.status === 'PENDING' && (
                                            userRole === 'STUDENT' ? (
                                                <button className="btn btn-sm btn-primary" onClick={() => {
                                                    alert('Redirecting to payment gateway...');
                                                    navigate('/payments');
                                                }}>
                                                    💳 Pay Now
                                                </button>
                                            ) : (
                                                <button className="btn btn-sm btn-primary" onClick={() => handleConfirm(res.reservationId)}>
                                                    ✓ Confirm
                                                </button>
                                            )
                                        )}
                                        {res.status !== 'CANCELLED' && (
                                            <button className="btn btn-sm btn-danger" onClick={() => handleCancel(res.reservationId)}>
                                                ✕ Cancel
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="5">
                                    <div className="empty-state">
                                        <div className="empty-state-icon">🎫</div>
                                        <div className="empty-state-title">No reservations found</div>
                                        <div className="empty-state-desc">Try adjusting your search or create a new reservation.</div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">New Reservation</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleReserve}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Course</label>
                                    <select className="form-select" value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} required>
                                        <option value="">Select a course</option>
                                        {mockCourses.map((c) => (
                                            <option key={c.courseId} value={c.title}>{c.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Expiry Date</label>
                                    <input className="form-input" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} required />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Reserve Seat</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
