import React, { useState } from 'react';
import { mockPayments, mockCourses, mockUsers } from '../data/mockData';

export default function Payments() {
    const [payments, setPayments] = useState(mockPayments);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ courseName: '', studentName: '', amount: '' });

    const students = mockUsers.filter((u) => u.role === 'STUDENT');

    const filtered = payments.filter(
        (p) =>
            p.studentName.toLowerCase().includes(search.toLowerCase()) ||
            p.courseName.toLowerCase().includes(search.toLowerCase()) ||
            p.transactionStatus.toLowerCase().includes(search.toLowerCase())
    );

    const totalRevenue = payments.filter((p) => p.transactionStatus === 'SUCCESS').reduce((s, p) => s + p.amount, 0);

    const handleProcess = (e) => {
        e.preventDefault();
        const newPayment = {
            paymentId: Date.now(),
            courseName: form.courseName,
            studentName: form.studentName,
            amount: parseFloat(form.amount),
            paymentDate: new Date().toISOString().split('T')[0],
            transactionStatus: 'SUCCESS',
        };
        setPayments([newPayment, ...payments]);
        setShowModal(false);
        setForm({ courseName: '', studentName: '', amount: '' });
    };

    return (
        <div className="slide-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Payments</h1>
                    <p className="page-subtitle">Track and process course payments</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Process Payment</button>
            </div>

            {/* Revenue Stats */}
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card emerald">
                    <div className="stat-icon emerald">💰</div>
                    <div className="stat-value">₹{totalRevenue.toLocaleString()}</div>
                    <div className="stat-label">Total Revenue</div>
                </div>
                <div className="stat-card blue">
                    <div className="stat-icon blue">✅</div>
                    <div className="stat-value">{payments.filter((p) => p.transactionStatus === 'SUCCESS').length}</div>
                    <div className="stat-label">Successful</div>
                </div>
                <div className="stat-card amber">
                    <div className="stat-icon amber">⏳</div>
                    <div className="stat-value">{payments.filter((p) => p.transactionStatus === 'PENDING').length}</div>
                    <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card rose">
                    <div className="stat-icon rose">❌</div>
                    <div className="stat-value">{payments.filter((p) => p.transactionStatus === 'FAILED').length}</div>
                    <div className="stat-label">Failed</div>
                </div>
            </div>

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
                            <th>Student</th>
                            <th>Course</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((payment) => (
                            <tr key={payment.paymentId}>
                                <td>#{payment.paymentId}</td>
                                <td style={{ fontWeight: 600 }}>{payment.studentName}</td>
                                <td>{payment.courseName}</td>
                                <td style={{ fontWeight: 600 }}>₹{payment.amount.toLocaleString()}</td>
                                <td style={{ color: 'var(--text-secondary)' }}>{payment.paymentDate}</td>
                                <td>
                                    <span className={`badge ${payment.transactionStatus === 'SUCCESS' ? 'success' : payment.transactionStatus === 'PENDING' ? 'warning' : 'danger'}`}>
                                        {payment.transactionStatus}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="6">
                                    <div className="empty-state">
                                        <div className="empty-state-icon">💳</div>
                                        <div className="empty-state-title">No payments found</div>
                                        <div className="empty-state-desc">Try adjusting your search or process a new payment.</div>
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
                            <h3 className="modal-title">Process Payment</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleProcess}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Student</label>
                                    <select className="form-select" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} required>
                                        <option value="">Select a student</option>
                                        {students.map((s) => (
                                            <option key={s.userId} value={s.name}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Course</label>
                                        <select className="form-select" value={form.courseName} onChange={(e) => {
                                            const course = mockCourses.find((c) => c.title === e.target.value);
                                            setForm({ ...form, courseName: e.target.value, amount: course ? course.fee : '' });
                                        }} required>
                                            <option value="">Select a course</option>
                                            {mockCourses.map((c) => (
                                                <option key={c.courseId} value={c.title}>{c.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Amount (₹)</label>
                                        <input className="form-input" type="number" placeholder="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Process Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
