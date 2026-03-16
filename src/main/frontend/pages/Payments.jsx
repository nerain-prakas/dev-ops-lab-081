import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { getRole, getToken } from '../lib/auth';

export default function Payments() {
    const location = useLocation();
    const navigate = useNavigate();
    const token = getToken();
    const role = getRole();
    const [payments, setPayments] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ reservation_id: '', amount: '', payment_type: 'credit_card' });
    const [error, setError] = useState('');

    async function loadPayments() {
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
                const reservationsData = await apiRequest('/reservations', { token });
                const pendingReservations = (reservationsData.reservations || []).filter((item) => item.status === 'pending');
                setReservations(pendingReservations);

                const queryReservationId = new URLSearchParams(location.search).get('reservationId');
                const selectedReservation = pendingReservations.find((item) => String(item.reservation_id) === queryReservationId) || pendingReservations[0];
                if (selectedReservation) {
                    const course = coursesData.courses.find((item) => item.course_id === selectedReservation.course_id);
                    setForm({
                        reservation_id: String(selectedReservation.reservation_id),
                        amount: course ? String(course.price) : '',
                        payment_type: 'credit_card',
                    });
                }
            }
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadPayments();
    }, [location.search, role, token]);

    const filtered = payments.filter((item) =>
        String(item.payment_type || '').toLowerCase().includes(search.toLowerCase()) ||
        String(item.payment_date || '').toLowerCase().includes(search.toLowerCase()) ||
        String(item.amount || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalRevenue = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const handleReservationChange = (reservationId) => {
        const selectedReservation = reservations.find((item) => String(item.reservation_id) === reservationId);
        const course = courses.find((item) => item.course_id === selectedReservation?.course_id);
        setForm({
            reservation_id: reservationId,
            amount: course ? String(course.price) : '',
            payment_type: form.payment_type,
        });
    };

    const handleProcess = async (e) => {
        e.preventDefault();
        try {
            await apiRequest('/payment', {
                method: 'POST',
                token,
                data: {
                    reservation_id: Number(form.reservation_id),
                    amount: Number(form.amount),
                    payment_type: form.payment_type,
                },
            });
            setShowModal(false);
            loadPayments();
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
                    <p className="page-subtitle">{role === 'student' ? 'Make and track your course payments' : 'Track course payments'}</p>
                </div>
                {role === 'student' && reservations.length > 0 && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>Make Payment</button>
                )}
            </div>

            {error && <div className="card" style={{ marginBottom: '20px' }}>{error}</div>}

            {role === 'admin' && (
                <div className="stats-grid" style={{ marginBottom: '24px' }}>
                    <div className="stat-card emerald">
                        <div className="stat-icon emerald">R</div>
                        <div className="stat-value">Rs {totalRevenue.toFixed(2)}</div>
                        <div className="stat-label">Total Revenue</div>
                    </div>
                    <div className="stat-card blue">
                        <div className="stat-icon blue">P</div>
                        <div className="stat-value">{payments.length}</div>
                        <div className="stat-label">Payments</div>
                    </div>
                </div>
            )}

            <div className="table-wrapper">
                <div className="table-header">
                    <h3 className="table-title">Transaction History ({filtered.length})</h3>
                    <div className="table-search">
                        <span>S</span>
                        <input placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Reservation</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((payment) => (
                            <tr key={payment.payment_id}>
                                <td>#{payment.payment_id}</td>
                                <td>#{payment.reservation_id}</td>
                                <td>Rs {Number(payment.amount || 0).toFixed(2)}</td>
                                <td>{payment.payment_date}</td>
                                <td>{payment.payment_type}</td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="5">No payments found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Process Payment</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
                        </div>
                        <form onSubmit={handleProcess}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Reservation</label>
                                    <select className="form-select" value={form.reservation_id} onChange={(e) => handleReservationChange(e.target.value)} required>
                                        <option value="">Select a reservation</option>
                                        {reservations.map((item) => (
                                            <option key={item.reservation_id} value={item.reservation_id}>{item.course_title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Amount</label>
                                        <input className="form-input" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Payment Type</label>
                                        <select className="form-select" value={form.payment_type} onChange={(e) => setForm({ ...form, payment_type: e.target.value })}>
                                            <option value="credit_card">Credit Card</option>
                                            <option value="upi">UPI</option>
                                            <option value="cash">Cash</option>
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
