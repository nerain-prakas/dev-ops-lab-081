import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { getRole, getToken } from '../lib/auth';

export default function Payments() {
    const location = useLocation();
    const navigate = useNavigate();
    const token    = getToken();
    const role     = getRole();
    const [payments, setPayments]         = useState([]);
    const [reservations, setReservations] = useState([]);
    const [courses, setCourses]           = useState([]);
    const [search, setSearch]             = useState('');
    const [showModal, setShowModal]       = useState(false);
    const [form, setForm]                 = useState({ reservation_id: '', amount: '', payment_type: 'credit_card' });
    const [error, setError]               = useState('');

    const getCoursePriceForReservation = (reservationId, reservationList, courseList) => {
        const reservation = reservationList.find(r => String(r.reservation_id) === String(reservationId));
        if (!reservation) return '';
        const course = courseList.find(c => String(c.course_id) === String(reservation.course_id));
        return course ? String(course.price) : '';
    };

    async function load() {
        try {
            setError('');
            const paymentsEndpoint = role === 'admin' ? '/admin/payments' : '/payments';
            const [paymentsData, coursesData] = await Promise.all([
                apiRequest(paymentsEndpoint, { token }),
                apiRequest('/courses', { token }),
            ]);
            setPayments(paymentsData.payments || []);
            setCourses(coursesData.courses || []);

            if (role === 'student') {
                const resData       = await apiRequest('/reservations', { token });
                const pending       = (resData.reservations || []).filter(r => r.status === 'pending');
                setReservations(pending);

                const qId       = new URLSearchParams(location.search).get('reservationId');
                const selected  = pending.find(r => String(r.reservation_id) === qId) || pending[0];
                if (selected) {
                    const amount = getCoursePriceForReservation(selected.reservation_id, pending, coursesData.courses || []);
                    setForm({
                        reservation_id: String(selected.reservation_id),
                        amount,
                        payment_type:   'credit_card',
                    });
                    if (qId) setShowModal(true);
                }
            }
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => { load(); }, [location.search, role, token]);

    const filtered = payments.filter(p =>
        String(p.payment_type || '').toLowerCase().includes(search.toLowerCase()) ||
        String(p.payment_date || '').toLowerCase().includes(search.toLowerCase()) ||
        String(p.amount       || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalRevenue = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

    const handleReservationChange = (rid) => {
        const amount = getCoursePriceForReservation(rid, reservations, courses);
        setForm({ reservation_id: rid, amount, payment_type: form.payment_type });
    };

    const handleProcess = async (e) => {
        e.preventDefault();
        try {
            await apiRequest('/payment', {
                method: 'POST',
                token,
                data: {
                    reservation_id: form.reservation_id,
                    amount:         Number(form.amount || 0),
                    payment_type:   form.payment_type,
                },
            });
            setShowModal(false);
            load();
            navigate('/enrollments');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="slide-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Payments</h1>
                    <p className="page-subtitle">
                        {role === 'student' ? 'Make and track your course payments' : 'All payment transactions across the platform'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div className="table-search">
                        <span>🔍</span>
                        <input placeholder="Search payments…" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    {role === 'student' && reservations.length > 0 && (
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>💳 Make Payment</button>
                    )}
                </div>
            </div>

            {error && <div className="alert-error">{error}</div>}

            {/* Admin revenue summary */}
            {role === 'admin' && (
                <div className="stats-grid" style={{ marginBottom: '20px' }}>
                    <div className="stat-card emerald">
                        <div className="stat-icon emerald">💰</div>
                        <div className="stat-value">Rs {totalRevenue.toFixed(2)}</div>
                        <div className="stat-label">Total Revenue</div>
                    </div>
                    <div className="stat-card blue">
                        <div className="stat-icon blue">🧾</div>
                        <div className="stat-value">{payments.length}</div>
                        <div className="stat-label">Total Transactions</div>
                    </div>
                    <div className="stat-card amber">
                        <div className="stat-icon amber">📊</div>
                        <div className="stat-value">Rs {payments.length > 0 ? (totalRevenue / payments.length).toFixed(2) : '0.00'}</div>
                        <div className="stat-label">Average Payment</div>
                    </div>
                </div>
            )}

            {/* Student pending payable */}
            {role === 'student' && reservations.length > 0 && (
                <div className="card" style={{ marginBottom: '16px', borderColor: 'var(--warning)' }}>
                    <strong style={{ color: 'var(--warning)' }}>⏳ You have {reservations.length} pending reservation(s).</strong>
                    {' '}Click "Make Payment" to complete your enrollment.
                </div>
            )}

            <div className="table-wrapper">
                <div className="table-header">
                    <h3 className="table-title">Transaction History ({filtered.length})</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Reservation</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.payment_id}>
                                <td>#{p.payment_id}</td>
                                <td>#{p.reservation_id}</td>
                                <td><strong>Rs {Number(p.amount || 0).toFixed(2)}</strong></td>
                                <td>{p.payment_date}</td>
                                <td>
                                    <span className="badge info">
                                        {String(p.payment_type || '').replace('_', ' ').toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                No payments found.
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Payment Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">💳 Process Payment</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleProcess}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Reservation</label>
                                    <select
                                        className="form-select"
                                        value={form.reservation_id}
                                        onChange={e => handleReservationChange(e.target.value)}
                                        required
                                    >
                                        <option value="">— Select a reservation —</option>
                                        {reservations.map(r => (
                                            <option key={r.reservation_id} value={r.reservation_id}>
                                                {r.course_title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Amount (Rs)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            value={form.amount}
                                            readOnly
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Payment Method</label>
                                        <select
                                            className="form-select"
                                            value={form.payment_type}
                                            onChange={e => setForm({ ...form, payment_type: e.target.value })}
                                        >
                                            <option value="credit_card">💳 Credit Card</option>
                                            <option value="upi">📱 UPI</option>
                                            <option value="cash">💵 Cash</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Submit Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
