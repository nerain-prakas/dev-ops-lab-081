import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { getRole, getToken } from '../lib/auth';

export default function Dashboard() {
    const token = getToken();
    const role = getRole();
    const [stats, setStats] = useState([]);
    const [recentEnrollments, setRecentEnrollments] = useState([]);
    const [popularCourses, setPopularCourses] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadDashboard() {
            try {
                setError('');
                const [coursesData, enrollmentsData] = await Promise.all([
                    apiRequest('/courses', { token }),
                    apiRequest(role === 'admin' ? '/admin/enrollments' : '/enrollments', { token }),
                ]);

                const courses = coursesData.courses || [];
                const enrollments = enrollmentsData.enrollments || [];

                if (role === 'admin') {
                    const [summaryData, usersData, paymentsData] = await Promise.all([
                        apiRequest('/admin/dashboard', { token }),
                        apiRequest('/admin/users', { token }),
                        apiRequest('/admin/payments', { token }),
                    ]);

                    setStats([
                        { label: 'Total Users', value: summaryData.summary.users.total, icon: 'U', color: 'blue' },
                        { label: 'Courses', value: summaryData.summary.courses, icon: 'C', color: 'purple' },
                        { label: 'Enrollments', value: summaryData.summary.enrollments, icon: 'E', color: 'emerald' },
                        { label: 'Revenue', value: `Rs ${paymentsData.payments.reduce((sum, item) => sum + Number(item.amount || 0), 0).toFixed(2)}`, icon: 'R', color: 'amber' },
                        { label: 'Reservations', value: summaryData.summary.reservations.total, icon: 'T', color: 'cyan' },
                        { label: 'Instructors', value: usersData.users.filter((user) => user.role === 'instructor').length, icon: 'I', color: 'rose' },
                    ]);
                } else {
                    const reservationsData = role === 'student'
                        ? await apiRequest('/reservations', { token })
                        : { reservations: [] };
                    const paymentsData = role === 'student'
                        ? await apiRequest('/payments', { token })
                        : { payments: [] };

                    setStats([
                        { label: 'Courses', value: courses.length, icon: 'C', color: 'purple' },
                        { label: 'Active Enrollments', value: enrollments.filter((item) => item.status === 'active').length, icon: 'E', color: 'emerald' },
                        { label: 'Reservations', value: (reservationsData.reservations || []).length, icon: 'T', color: 'cyan' },
                        { label: 'Payments', value: (paymentsData.payments || []).length, icon: 'P', color: 'amber' },
                    ]);
                }

                setRecentEnrollments(enrollments.slice(0, 5));
                setPopularCourses(courses.slice(0, 5));
            } catch (err) {
                setError(err.message);
            }
        }

        loadDashboard();
    }, [role, token]);

    return (
        <div className="slide-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Welcome back</h1>
                    <p className="page-subtitle">Here is a live overview from your deployed backend.</p>
                </div>
            </div>

            {error && <div className="card" style={{ marginBottom: '20px' }}>{error}</div>}

            <div className="stats-grid">
                {stats.map((stat) => (
                    <div key={stat.label} className={`stat-card ${stat.color}`}>
                        <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                            </tr>
                        </thead>
                        <tbody>
                            {recentEnrollments.map((item) => (
                                <tr key={item.enrollment_id}>
                                    <td>{item.student_name}</td>
                                    <td>{item.course_title}</td>
                                    <td><span className="badge success">{String(item.status || '').toUpperCase()}</span></td>
                                </tr>
                            ))}
                            {recentEnrollments.length === 0 && (
                                <tr>
                                    <td colSpan="3">No enrollments found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="table-wrapper">
                    <div className="table-header">
                        <h3 className="table-title">Courses</h3>
                        <Link to="/courses" className="btn btn-sm btn-secondary">View All</Link>
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
                            {popularCourses.map((course) => (
                                <tr key={course.course_id}>
                                    <td>{course.title}</td>
                                    <td>{course.available_seats}/{course.total_seats}</td>
                                    <td>Rs {Number(course.price || 0).toFixed(2)}</td>
                                </tr>
                            ))}
                            {popularCourses.length === 0 && (
                                <tr>
                                    <td colSpan="3">No courses found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
