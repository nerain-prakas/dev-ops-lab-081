import React from 'react';
import { Link } from 'react-router-dom';
import { mockUsers, mockCourses, mockEnrollments, mockReservations, mockPayments } from '../data/mockData';

export default function Dashboard() {
    const stats = [
        { label: 'Total Users', value: mockUsers.length, icon: '👥', color: 'blue' },
        { label: 'Courses', value: mockCourses.length, icon: '📚', color: 'purple' },
        { label: 'Enrollments', value: mockEnrollments.filter(e => e.status === 'ACTIVE').length, icon: '📝', color: 'emerald' },
        { label: 'Revenue', value: `₹${mockPayments.filter(p => p.transactionStatus === 'SUCCESS').reduce((s, p) => s + p.amount, 0).toLocaleString()}`, icon: '💰', color: 'amber' },
        { label: 'Reservations', value: mockReservations.filter(r => r.status === 'CONFIRMED').length, icon: '🎫', color: 'cyan' },
        { label: 'Instructors', value: mockUsers.filter(u => u.role === 'INSTRUCTOR').length, icon: '🎓', color: 'rose' },
    ];

    const recentEnrollments = mockEnrollments.slice(0, 5);

    return (
        <div className="slide-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Welcome back 👋</h1>
                    <p className="page-subtitle">Here's an overview of your course management system</p>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {stats.map((stat) => (
                    <div key={stat.label} className={`stat-card ${stat.color}`}>
                        <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Recent Enrollments & Popular Courses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Recent Enrollments Table */}
                <div className="table-wrapper">
                    <div className="table-header">
                        <h3 className="table-title">Recent Enrollments</h3>
                        <Link to="/enrollments" className="btn btn-sm btn-secondary">View All →</Link>
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
                            {recentEnrollments.map((e) => (
                                <tr key={e.enrollmentId}>
                                    <td>{e.studentName}</td>
                                    <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.courseName}</td>
                                    <td>
                                        <span className={`badge ${e.status === 'ACTIVE' ? 'success' : e.status === 'COMPLETED' ? 'info' : 'danger'}`}>
                                            {e.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Popular Courses */}
                <div className="table-wrapper">
                    <div className="table-header">
                        <h3 className="table-title">Popular Courses</h3>
                        <Link to="/courses" className="btn btn-sm btn-secondary">View All →</Link>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Enrolled</th>
                                <th>Seats</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockCourses.slice(0, 5).map((c) => (
                                <tr key={c.courseId}>
                                    <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                                    <td>{c.enrolledCount}</td>
                                    <td>{c.totalSeats}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
