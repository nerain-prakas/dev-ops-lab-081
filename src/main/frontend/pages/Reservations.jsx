import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { getRole, getToken } from '../lib/auth';

export default function Reservations() {
    const navigate = useNavigate();
    const token = getToken();
    const role = getRole();
    const [reservations, setReservations] = useState([]);
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ course_id: '' });
    const [error, setError] = useState('');

    async function loadReservations() {
        try {
            setError('');
            const endpoint = role === 'admin' ? '/admin/reservations' : '/reservations';
            const [reservationData, courseData] = await Promise.all([
                apiRequest(endpoint, { token }),
                apiRequest('/courses', { token }),
            ]);
            setReservations(reservationData.reservations || []);
            setCourses(courseData.courses || []);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadReservations();
    }, [role, token]);

    const filtered = reservations.filter((item) =>
        String(item.course_title || '').toLowerCase().includes(search.toLowerCase()) ||
        String(item.status || '').toLowerCase().includes(search.toLowerCase())
    );

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
            loadReservations();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateStatus = async (reservationId, status) => {
        try {
            await apiRequest(`/admin/reservations/${reservationId}`, {
                method: 'PATCH',
                token,
                data: { status },
            });
            loadReservations();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="slide-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reservations</h1>
                    <p className="page-subtitle">Manage course seat reservations</p>
                </div>
                {role === 'student' && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>New Reservation</button>
                )}
            </div>

            {error && <div className="card" style={{ marginBottom: '20px' }}>{error}</div>}

            <div className="table-wrapper">
                <div className="table-header">
                    <h3 className="table-title">All Reservations ({filtered.length})</h3>
                    <div className="table-search">
                        <span>S</span>
                        <input placeholder="Search reservations..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Course</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((item) => (
                            <tr key={item.reservation_id}>
                                <td>#{item.reservation_id}</td>
                                <td>{item.course_title}</td>
                                <td><span className={`badge ${item.status === 'confirmed' ? 'success' : item.status === 'pending' ? 'warning' : 'danger'}`}>{String(item.status || '').toUpperCase()}</span></td>
                                <td>{item.reservation_date}</td>
                                <td>
                                    <div className="action-buttons">
                                        {role === 'student' && item.status === 'pending' && (
                                            <button className="btn btn-sm btn-primary" onClick={() => navigate(`/payments?reservationId=${item.reservation_id}`)}>
                                                Pay Now
                                            </button>
                                        )}
                                        {role === 'admin' && item.status === 'pending' && (
                                            <button className="btn btn-sm btn-primary" onClick={() => handleUpdateStatus(item.reservation_id, 'confirmed')}>
                                                Confirm
                                            </button>
                                        )}
                                        {role === 'admin' && item.status !== 'cancelled' && (
                                            <button className="btn btn-sm btn-danger" onClick={() => handleUpdateStatus(item.reservation_id, 'cancelled')}>
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="5">No reservations found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">New Reservation</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
                        </div>
                        <form onSubmit={handleReserve}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Course</label>
                                    <select className="form-select" value={form.course_id} onChange={(e) => setForm({ course_id: e.target.value })} required>
                                        <option value="">Select a course</option>
                                        {courses.map((course) => (
                                            <option key={course.course_id} value={course.course_id}>{course.title}</option>
                                        ))}
                                    </select>
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
