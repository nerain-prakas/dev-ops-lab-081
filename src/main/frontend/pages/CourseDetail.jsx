import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockCourses, mockEnrollments } from '../data/mockData';

export default function CourseDetail() {
    const { id } = useParams();
    const course = mockCourses.find((c) => c.courseId === parseInt(id));

    if (!course) {
        return (
            <div className="card slide-up">
                <div className="empty-state">
                    <div className="empty-state-icon">❌</div>
                    <div className="empty-state-title">Course not found</div>
                    <div className="empty-state-desc">The course you're looking for doesn't exist.</div>
                    <Link to="/courses" className="btn btn-primary">← Back to Courses</Link>
                </div>
            </div>
        );
    }

    const courseEnrollments = mockEnrollments.filter((e) => e.courseName === course.title);
    const availableSeats = course.totalSeats - course.enrolledCount;

    return (
        <div className="slide-up">
            <Link to="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                ← Back to Courses
            </Link>

            <div className="detail-header">
                <div className={`detail-icon stat-icon ${course.color}`} style={{ width: '64px', height: '64px', fontSize: '1.6rem' }}>
                    📚
                </div>
                <div className="detail-info">
                    <h1>{course.title}</h1>
                    <p>Taught by {course.instructor}</p>
                </div>
            </div>

            <div className="detail-stats">
                <div className="detail-stat">
                    <div className="detail-stat-value" style={{ color: 'var(--accent-blue)' }}>₹{course.fee.toLocaleString()}</div>
                    <div className="detail-stat-label">Course Fee</div>
                </div>
                <div className="detail-stat">
                    <div className="detail-stat-value" style={{ color: 'var(--accent-emerald)' }}>{course.enrolledCount}</div>
                    <div className="detail-stat-label">Enrolled</div>
                </div>
                <div className="detail-stat">
                    <div className="detail-stat-value" style={{ color: 'var(--accent-amber)' }}>{availableSeats}</div>
                    <div className="detail-stat-label">Available Seats</div>
                </div>
                <div className="detail-stat">
                    <div className="detail-stat-value" style={{ color: 'var(--accent-purple)' }}>{course.totalSeats}</div>
                    <div className="detail-stat-label">Total Seats</div>
                </div>
            </div>

            <div className="table-wrapper">
                <div className="table-header">
                    <h3 className="table-title">Enrolled Students ({courseEnrollments.length})</h3>
                </div>
                {courseEnrollments.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Student</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courseEnrollments.map((e) => (
                                <tr key={e.enrollmentId}>
                                    <td>#{e.enrollmentId}</td>
                                    <td style={{ fontWeight: 600 }}>{e.studentName}</td>
                                    <td>
                                        <span className={`badge ${e.status === 'ACTIVE' ? 'success' : e.status === 'COMPLETED' ? 'info' : 'danger'}`}>
                                            {e.status}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{e.enrollmentDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <div className="empty-state-title">No enrollments yet</div>
                        <div className="empty-state-desc">Students haven't enrolled in this course yet.</div>
                    </div>
                )}
            </div>
        </div>
    );
}
