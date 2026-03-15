import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentsAPI, reservationsAPI, adminAPI } from '../services/api';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [pendingReservations, setPendingReservations] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ reservation_id: '', payment_type: 'credit_card' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const userRole = localStorage.getItem('userRole') || 'ADMIN';
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (userRole === 'ADMIN') {
        const data = await adminAPI.getPayments();
        setPayments(data.payments);
      } else if (userRole === 'STUDENT') {
        const [payData, resData] = await Promise.all([
          paymentsAPI.getAll(),
          reservationsAPI.getAll(),
        ]);
        setPayments(payData.payments);
        setPendingReservations(resData.reservations.filter((r) => r.status === 'pending'));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!form.reservation_id) return alert('Select a reservation');
    setSaving(true);
    try {
      // Find the amount from the selected reservation's course price
      const res = pendingReservations.find((r) => r.reservation_id === parseInt(form.reservation_id));
      const amount = res?.course_price || 0;

      const data = await paymentsAPI.make(
        parseInt(form.reservation_id),
        amount,
        form.payment_type
      );
      alert('Payment successful! You are now enrolled.');
      setShowModal(false);
      setForm({ reservation_id: '', payment_type: 'credit_card' });
      navigate('/enrollments');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = payments.filter(
    (p) =>
      String(p.reservation_id).includes(search) ||
      p.payment_type.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);

  if (loading) return <div className="slide-up" style={{ color: 'var(--text-secondary)', padding: '40px' }}>Loading payments...</div>;

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">{userRole === 'STUDENT' ? 'Make and track your course payments' : 'Track all course payments'}</p>
        </div>
        {userRole === 'STUDENT' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>💳 Make Payment</button>
        )}
      </div>

      {error && <div style={{ color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {/* Revenue Stats — Admin only */}
      {userRole === 'ADMIN' && (
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card emerald">
            <div className="stat-icon emerald">💰</div>
            <div className="stat-value">₹{totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-icon blue">✅</div>
            <div className="stat-value">{payments.length}</div>
            <div className="stat-label">Total Payments</div>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <div className="table-header">
          <h3 className="table-title">Transaction History ({filtered.length})</h3>
          <div className="table-search">
            <span>🔍</span>
            <input placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Reservation</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((payment) => (
              <tr key={payment.payment_id}>
                <td>#{payment.payment_id}</td>
                <td>Res #{payment.reservation_id}</td>
                <td style={{ fontWeight: 600 }}>₹{payment.amount.toLocaleString()}</td>
                <td style={{ textTransform: 'capitalize' }}>{payment.payment_type.replace('_', ' ')}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{payment.payment_date}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5">
                  <div className="empty-state">
                    <div className="empty-state-icon">💳</div>
                    <div className="empty-state-title">No payments found</div>
                    <div className="empty-state-desc">
                      {userRole === 'STUDENT' ? 'Reserve a course and make a payment to get enrolled.' : 'No payments recorded yet.'}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Modal — Students only */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">💳 Make Payment</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handlePay}>
              <div className="modal-body">
                {pendingReservations.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                    No pending reservations. Reserve a course first.
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Select Reservation</label>
                      <select
                        className="form-select"
                        value={form.reservation_id}
                        onChange={(e) => setForm({ ...form, reservation_id: e.target.value })}
                        required
                      >
                        <option value="">Choose a pending reservation</option>
                        {pendingReservations.map((r) => (
                          <option key={r.reservation_id} value={r.reservation_id}>
                            {r.course_title} — ₹{r.course_price?.toLocaleString() || 'N/A'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Payment Method</label>
                      <select
                        className="form-select"
                        value={form.payment_type}
                        onChange={(e) => setForm({ ...form, payment_type: e.target.value })}
                      >
                        <option value="credit_card">Credit Card</option>
                        <option value="upi">UPI</option>
                        <option value="cash">Cash</option>
                        <option value="net_banking">Net Banking</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                {pendingReservations.length > 0 && (
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Processing...' : '✅ Confirm Payment'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
