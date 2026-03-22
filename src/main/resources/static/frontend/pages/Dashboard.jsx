import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { getRole, getToken, getUser } from '../lib/auth';

/* ─── Sub-dashboards ────────────────────────────────────────────────────────── */

function StudentDashboard({ token }) {
    const [stats, setStats]       = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [error, setError]       = useState('');

    useEffect(() => {
        async function load() {
            try {
                const [coursesData, enrollmentsData, reservationsData, paymentsData] = await Promise.all([
                    apiRequest('/courses', { token }),
                    apiRequest('/enrollments', { token }),
                    apiRequest('/reservations', { token }),
                    apiRequest('/payments', { token }),
                ]);
                setStats({
                    courses:      (coursesData.courses || []).length,
                    enrollments:  (enrollmentsData.enrollments || []).filter(e => e.status === 'active').length,
                    reservations: (reservationsData.reservations || []).length,
                    payments:     (paymentsData.payments || []).length,
                });
                setEnrollments((enrollmentsData.enrollments || []).slice(0, 5));
            } catch (err) {
                setError(err.message);
            }
        }
        load();
    }, [token]);

    if (error) return <div className="card">{error}</div>;
    if (!stats) return <div className="card">Loading your dashboard…</div>;

    return (
        <div className="slide-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Learning Hub</h1>
                    <p className="page-subtitle">Track your courses, enrollments and payments</p>
                </div>
                <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
            </div>

            <div className="stats-grid">
                <div className="stat-card emerald">
                    <div className="stat-icon emerald">🎓</div>
                    <div className="stat-value">{stats.courses}</div>
                    <div className="stat-label">Available Courses</div>
                </div>
                <div className="stat-card blue">
                    <div className="stat-icon blue">✓</div>
                    <div className="stat-value">{stats.enrollments}</div>
                    <div className="stat-label">Active Enrollments</div>
                </div>
                <div className="stat-card cyan">
                    <div className="stat-icon cyan">📋</div>
                    <div className="stat-value">{stats.reservations}</div>
                    <div className="stat-label">Reservations</div>
                </div>
                <div className="stat-card amber">
                    <div className="stat-icon amber">💳</div>
                    <div className="stat-value">{stats.payments}</div>
                    <div className="stat-label">Payments Made</div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="table-wrapper">
                    <div className="table-header">
                        <h3 className="table-title">My Enrollments</h3>
                        <Link to="/enrollments" className="btn btn-sm btn-secondary">View All</Link>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enrollments.map((e) => (
                                <tr key={e.enrollment_id}>
                                    <td>{e.course_title}</td>
                                    <td><span className="badge success">{String(e.status || '').toUpperCase()}</span></td>
                                    <td>{e.enrollment_date}</td>
                                </tr>
                            ))}
                            {enrollments.length === 0 && (
                                <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No enrollments yet. <Link to="/courses">Browse courses →</Link>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="dashboard-quick-actions">
                    <h3 className="table-title" style={{ marginBottom: '16px' }}>Quick Actions</h3>
                    <Link to="/courses" className="quick-action-card emerald">
                        <span className="quick-action-icon">🎓</span>
                        <div>
                            <div className="quick-action-title">Browse Courses</div>
                            <div className="quick-action-desc">Find and reserve new courses</div>
                        </div>
                    </Link>
                    <Link to="/reservations" className="quick-action-card cyan">
                        <span className="quick-action-icon">📋</span>
                        <div>
                            <div className="quick-action-title">My Reservations</div>
                            <div className="quick-action-desc">Manage pending seat reservations</div>
                        </div>
                    </Link>
                    <Link to="/payments" className="quick-action-card amber">
                        <span className="quick-action-icon">💳</span>
                        <div>
                            <div className="quick-action-title">Payments</div>
                            <div className="quick-action-desc">Complete pending payments</div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function InstructorDashboard({ token }) {
    const [stats, setStats]   = useState(null);
    const [courses, setCourses] = useState([]);
    const [error, setError]   = useState('');

    useEffect(() => {
        async function load() {
            try {
                const [coursesData, enrollmentsData] = await Promise.all([
                    apiRequest('/courses/my', { token }),
                    apiRequest('/enrollments', { token }),
                ]);
                const myCourses = coursesData.courses || [];
                const myEnrollments = enrollmentsData.enrollments || [];
                setStats({
                    courses:     myCourses.length,
                    students:    myEnrollments.length,
                    totalSeats:  myCourses.reduce((s, c) => s + c.total_seats, 0),
                    filledSeats: myCourses.reduce((s, c) => s + (c.total_seats - c.available_seats), 0),
                });
                setCourses(myCourses.slice(0, 5));
            } catch (err) {
                setError(err.message);
            }
        }
        load();
    }, [token]);

    if (error) return <div className="card">{error}</div>;
    if (!stats) return <div className="card">Loading your dashboard…</div>;

    const fillRate = stats.totalSeats > 0
        ? Math.round((stats.filledSeats / stats.totalSeats) * 100)
        : 0;

    return (
        <div className="slide-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Teaching Dashboard</h1>
                    <p className="page-subtitle">Overview of your courses and student enrollments</p>
                </div>
                <Link to="/courses" className="btn btn-primary">+ Add Course</Link>
            </div>

            <div className="stats-grid">
                <div className="stat-card purple">
                    <div className="stat-icon purple">📚</div>
                    <div className="stat-value">{stats.courses}</div>
                    <div className="stat-label">My Courses</div>
                </div>
                <div className="stat-card emerald">
                    <div className="stat-icon emerald">👨‍🎓</div>
                    <div className="stat-value">{stats.students}</div>
                    <div className="stat-label">Enrolled Students</div>
                </div>
                <div className="stat-card blue">
                    <div className="stat-icon blue">💺</div>
                    <div className="stat-value">{stats.filledSeats}/{stats.totalSeats}</div>
                    <div className="stat-label">Seats Filled</div>
                </div>
                <div className="stat-card amber">
                    <div className="stat-icon amber">📊</div>
                    <div className="stat-value">{fillRate}%</div>
                    <div className="stat-label">Fill Rate</div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="table-wrapper">
                    <div className="table-header">
                        <h3 className="table-title">My Courses</h3>
                        <Link to="/courses" className="btn btn-sm btn-secondary">Manage All</Link>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Seats</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((c) => (
                                <tr key={c.course_id}>
                                    <td>
                                        <Link to={`/courses/${c.course_id}`} style={{ color: 'var(--accent-purple)', textDecoration: 'none' }}>
                                            {c.title}
                                        </Link>
                                    </td>
                                    <td>
                                        <span className={`badge ${c.available_seats > 0 ? 'success' : 'danger'}`}>
                                            {c.available_seats}/{c.total_seats}
                                        </span>
                                    </td>
                                    <td>Rs {Number(c.price).toFixed(2)}</td>
                                </tr>
                            ))}
                            {courses.length === 0 && (
                                <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No courses yet. <Link to="/courses">Create your first course →</Link>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="dashboard-quick-actions">
                    <h3 className="table-title" style={{ marginBottom: '16px' }}>Quick Actions</h3>
                    <Link to="/courses" className="quick-action-card purple">
                        <span className="quick-action-icon">📚</span>
                        <div>
                            <div className="quick-action-title">Manage Courses</div>
                            <div className="quick-action-desc">Add, edit or remove your courses</div>
                        </div>
                    </Link>
                    <Link to="/enrollments" className="quick-action-card emerald">
                        <span className="quick-action-icon">👨‍🎓</span>
                        <div>
                            <div className="quick-action-title">View Enrollments</div>
                            <div className="quick-action-desc">See who enrolled in your courses</div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function AdminDashboard({ token }) {
    const [summary, setSummary] = useState(null);
    const [recentEnrollments, setRecentEnrollments] = useState([]);
    const [revenue, setRevenue] = useState(0);
    const [error, setError]     = useState('');

    useEffect(() => {
        async function load() {
            try {
                const [summaryData, enrollmentsData, paymentsData] = await Promise.all([
                    apiRequest('/admin/dashboard', { token }),
                    apiRequest('/admin/enrollments', { token }),
                    apiRequest('/admin/payments', { token }),
                ]);
                setSummary(summaryData.summary);
                setRecentEnrollments((enrollmentsData.enrollments || []).slice(0, 6));
                setRevenue((paymentsData.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0));
            } catch (err) {
                setError(err.message);
            }
        }
        load();
    }, [token]);

    if (error) return <div className="card">{error}</div>;
    if (!summary) return <div className="card">Loading admin dashboard…</div>;

    return (
        <div className="slide-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">System Overview</h1>
                    <p className="page-subtitle">Real-time statistics across the entire platform</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-icon blue">👥</div>
                    <div className="stat-value">{summary.users.total}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-icon purple">🎓</div>
                    <div className="stat-value">{summary.courses}</div>
                    <div className="stat-label">Courses</div>
                </div>
                <div className="stat-card emerald">
                    <div className="stat-icon emerald">✓</div>
                    <div className="stat-value">{summary.enrollments}</div>
                    <div className="stat-label">Enrollments</div>
                </div>
                <div className="stat-card amber">
                    <div className="stat-icon amber">💰</div>
                    <div className="stat-value">Rs {revenue.toFixed(0)}</div>
                    <div className="stat-label">Total Revenue</div>
                </div>
                <div className="stat-card cyan">
                    <div className="stat-icon cyan">📋</div>
                    <div className="stat-value">{summary.reservations.total}</div>
                    <div className="stat-label">Reservations</div>
                </div>
                <div className="stat-card rose">
                    <div className="stat-icon rose">👨‍🏫</div>
                    <div className="stat-value">{summary.users.instructors}</div>
                    <div className="stat-label">Instructors</div>
                </div>
            </div>

            {/* Reservation status breakdown */}
            <div className="admin-status-row">
                <div className="status-pill pending">
                    ⏳ Pending: {summary.reservations.pending}
                </div>
                <div className="status-pill confirmed">
                    ✅ Confirmed: {summary.reservations.confirmed}
                </div>
                <div className="status-pill cancelled">
                    ❌ Cancelled: {summary.reservations.cancelled}
                </div>
                <div className="status-pill">
                    👨‍🎓 Students: {summary.users.students}
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="table-wrapper">
                    <div className="table-header">
                        <h3 className="table-title">Recent Enrollments</h3>
                        <Link to="/enrollments" className="btn btn-sm btn-secondary">View All</Link>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Course</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentEnrollments.map((e) => (
                                <tr key={e.enrollment_id}>
                                    <td>{e.student_name}</td>
                                    <td>{e.course_title}</td>
                                    <td><span className="badge success">{String(e.status || '').toUpperCase()}</span></td>
                                    <td>{e.enrollment_date}</td>
                                </tr>
                            ))}
                            {recentEnrollments.length === 0 && (
                                <tr><td colSpan="4">No enrollments yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="dashboard-quick-actions">
                    <h3 className="table-title" style={{ marginBottom: '16px' }}>Quick Actions</h3>
                    <Link to="/users" className="quick-action-card blue">
                        <span className="quick-action-icon">👥</span>
                        <div>
                            <div className="quick-action-title">Manage Users</div>
                            <div className="quick-action-desc">Add, edit or remove user accounts</div>
                        </div>
                    </Link>
                    <Link to="/reservations" className="quick-action-card amber">
                        <span className="quick-action-icon">📋</span>
                        <div>
                            <div className="quick-action-title">Reservations</div>
                            <div className="quick-action-desc">Confirm or cancel pending reservations</div>
                        </div>
                    </Link>
                    <Link to="/payments" className="quick-action-card emerald">
                        <span className="quick-action-icon">💰</span>
                        <div>
                            <div className="quick-action-title">Payments</div>
                            <div className="quick-action-desc">View all transaction records</div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Dashboard (role router) ─────────────────────────────────────────── */

export default function Dashboard() {
    const token = getToken();
    const role  = getRole();
    const user  = getUser();

    return (
        <div>
            <div className="dashboard-welcome-banner">
                <span className="dashboard-welcome-greeting">
                    👋 Hello, <strong>{user?.name || 'there'}</strong>
                </span>
            </div>
            {role === 'student'    && <StudentDashboard    token={token} />}
            {role === 'instructor' && <InstructorDashboard token={token} />}
            {role === 'admin'      && <AdminDashboard      token={token} />}
        </div>
    );
}
