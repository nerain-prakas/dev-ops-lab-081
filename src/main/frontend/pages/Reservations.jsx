import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { getRole, getToken } from '../lib/auth';

export default function Reservations() {
    const navigate = useNavigate();
    const token    = getToken();
    const role     = getRole();
    const [reservations, setReservations] = useState([]);
    const [courses, setCourses]           = useState([]);
    const [search, setSearch]             = useState('');
    const [showModal, setShowModal]       = useState(false);
    const [form, setForm]                 = useState({ course_id: '' });
    const [error, setError]               = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    async function load() {
        try {
            setError('');
            const endpoint = role === 'admin' ? '/admin/reservations' : '/reservations';
            const [resData, courseData] = await Promise.all([
                apiRequest(endpoint, { token }),
                apiRequest('/courses', { token }),
            ]);
            setReservations(resData.reservations || []);
            setCourses(courseData.courses || []);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => { load(); }, [role, token]);

    const filtered = reservations.filter((r) => {
        const matchSearch =
            String(r.course_title  || '').toLowerCase().includes(search.toLowerCase()) ||
            String(r.student_name  || '').toLowerCase().includes(search.toLowerCase()) ||
            String(r.status        || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter ? r.status === statusFilter : true;
        return matchSearch && matchStatus;
    });

    const handleReserve = async (e) => {
        e.preventDefault();
        try {
            await apiRequest('/reserve', {
                method: 'POST',
                token,
                data: { course_id: Number(form.course_id) },
            });
            setShowModal(false);
            setForm({ course_id: '' });
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAdminStatus = async (reservationId, status) => {
        try {
            await apiRequest(`/admin/reservations/${reservationId}`, {
                method: 'PATCH',
                token,
                data: { status },
            });
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    // stats
    const pending   = reservations.filter(r => r.status === 'pending').length;
    const confirmed = reservations.filter(r => r.status === 'confirmed').length;
    const cancelled = reservations.filter(r => r.status === 'cancelled').length;

    return (
        <div className="slide-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reservations</h1>
                    <p className="page-subtitle">
                        {role === 'student'
                            ? 'Your seat reservations — pay to confirm enrollment'
                            : 'All seat reservations across the platform'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="table-search">
                        <span>🔍</span>
                        <input
                            placeholder="Search…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {role === 'student' && (
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            + New Reservation
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="alert-error">{error}</div>}

            {/* Status stats */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {[
                    { label: 'Pending',   value: pending,   color: 'warning', key: 'pending'   },
                    { label: 'Confirmed', value: confirmed, color: 'success', key: 'confirmed' },
                    { label: 'Cancelled', value: cancelled, color: 'danger',  key: 'cancelled' },
                ].map((s) => (
                    <button
                        key={s.key}
                        className={`inline-stat ${s.color}${statusFilter === s.key ? ' active-filter' : ''}`}
                        onClick={() => setStatusFilter(statusFilter === s.key ? '' : s.key)}
                        style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                    >
                        <strong>{s.value}</strong> {s.label}
                    </button>
                ))}
                <div className="inline-stat"><strong>{reservations.length}</strong> Total</div>
            </div>

            <div className="table-wrapper">
                <div className="table-header">
                    <h3 className="table-title">Reservations ({filtered.length})</h3>
                    {statusFilter && (
                        <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setStatusFilter('')}
                        >
                            Clear Filter
                        </button>
                    )}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            {role === 'admin' && <th>Student</th>}
                            <th>Course</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((r) => (
                            <tr key={r.reservation_id}>
                                <td>#{r.reservation_id}</td>
                                {role === 'admin' && <td>{r.student_name}</td>}
                                <td>{r.course_title}</td>
                                <td>
                                    <span className={`badge ${
                                        r.status === 'confirmed' ? 'success' :
                                        r.status === 'pending'   ? 'warning' : 'danger'
                                    }`}>
                                        {String(r.status || '').toUpperCase()}
                                    </span>
                                </td>
                                <td>{r.reservation_date}</td>
                                <td>
                                    <div className="action-buttons">
                                        {/* Student actions */}
                                        {role === 'student' && r.status === 'pending' && (
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => navigate(`/payments?reservationId=${r.reservation_id}`)}
                                            >
                                                💳 Pay Now
                                            </button>
                                        )}
                                        {/* Admin actions */}
                                        {role === 'admin' && r.status === 'pending' && (
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleAdminStatus(r.reservation_id, 'confirmed')}
                                            >
                                                ✓ Confirm
                                            </button>
                                        )}
                                        {role === 'admin' && r.status !== 'cancelled' && (
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleAdminStatus(r.reservation_id, 'cancelled')}
                                            >
                                                ✕ Cancel
                                            </button>
                                        )}
                                        {(r.status === 'confirmed' || r.status === 'cancelled') && role === 'student' && (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                                {r.status === 'confirmed' ? '✅ Confirmed' : '❌ Cancelled'}
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                No reservations found.
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* New Reservation Modal — student only */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Reserve a Course Seat</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleReserve}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Select Course</label>
                                    <select
                                        className="form-select"
                                        value={form.course_id}
                                        onChange={(e) => setForm({ course_id: e.target.value })}
                                        required
                                    >
                                        <option value="">— Choose a course —</option>
                                        {courses
                                            .filter(c => c.available_seats > 0)
                                            .map((c) => (
                                                <option key={c.course_id} value={c.course_id}>
                                                    {c.title} — {c.available_seats} seats left — Rs {Number(c.price).toFixed(2)}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                    After reserving, go to Payments to complete your enrollment.
                                </p>
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
