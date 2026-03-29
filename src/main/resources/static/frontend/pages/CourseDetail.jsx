import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { getRole, getToken } from '../lib/auth';

export default function CourseDetail() {
    const { id }    = useParams();
    const navigate  = useNavigate();
    const token     = getToken();
    const role      = getRole();
    const [course, setCourse]           = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [error, setError]             = useState('');
    const [reserving, setReserving]     = useState(false);

    useEffect(() => {
        async function load() {
            try {
                setError('');
                const courseData = await apiRequest(`/courses/${id}`, { token });
                setCourse(courseData.course);

                const endpoint = role === 'admin' ? '/admin/enrollments' : '/enrollments';
                const enrollData = await apiRequest(endpoint, { token });
                setEnrollments(
                    (enrollData.enrollments || []).filter(e => String(e.course_id) === String(id))
                );
            } catch (err) {
                setError(err.message);
            }
        }
        load();
    }, [id, role, token]);

    const handleReserve = async () => {
        setReserving(true);
        try {
            await apiRequest('/reserve', {
                method: 'POST',
                token,
                data: { course_id: id },
            });
            navigate('/reservations');
        } catch (err) {
            setError(err.message);
            setReserving(false);
        }
    };

    if (error && !course) {
        return (
            <div className="card slide-up">
                <div className="empty-state">
                    <div className="empty-state-title">Course not found</div>
                    <div className="empty-state-desc">{error}</div>
                    <Link to="/courses" className="btn btn-primary" style={{ marginTop: '12px' }}>
                        ← Back to Courses
                    </Link>
                </div>
            </div>
        );
    }

    if (!course) {
        return <div className="card slide-up"><div className="empty-state">Loading course…</div></div>;
    }

    return (
        <div className="slide-up">
            <Link
                to="/courses"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px',
                         color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}
            >
                ← Back to Courses
            </Link>

            {error && <div className="alert-error">{error}</div>}

            {/* Course header */}
            <div className="detail-header">
                <div
                    className="detail-icon stat-icon blue"
                    style={{ width: '64px', height: '64px', fontSize: '1.6rem', flexShrink: 0 }}
                >
                    🎓
                </div>
                <div className="detail-info" style={{ flex: 1 }}>
                    <h1>{course.title}</h1>
                    <p>Taught by <strong>{course.instructor_name || 'Unknown'}</strong></p>
                    {course.description && (
                        <p style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {course.description}
                        </p>
                    )}
                </div>
                {/* Role-specific action */}
                {role === 'student' && course.available_seats > 0 && (
                    <button
                        className="btn btn-primary"
                        onClick={handleReserve}
                        disabled={reserving}
                        style={{ flexShrink: 0 }}
                    >
                        {reserving ? 'Reserving…' : '📋 Reserve Seat'}
                    </button>
                )}
                {role === 'student' && course.available_seats === 0 && (
                    <span className="badge danger" style={{ alignSelf: 'center' }}>Course Full</span>
                )}
            </div>

            {/* Stats */}
            <div className="detail-stats">
                <div className="detail-stat">
                    <div className="detail-stat-value" style={{ color: 'var(--accent-blue)' }}>
                        Rs {Number(course.price || 0).toFixed(2)}
                    </div>
                    <div className="detail-stat-label">Course Fee</div>
                </div>
                <div className="detail-stat">
                    <div className="detail-stat-value" style={{ color: 'var(--accent-emerald)' }}>
                        {course.total_seats - course.available_seats}
                    </div>
                    <div className="detail-stat-label">Enrolled</div>
                </div>
                <div className="detail-stat">
                    <div
                        className="detail-stat-value"
                        style={{ color: course.available_seats > 0 ? 'var(--accent-amber)' : 'var(--danger)' }}
                    >
                        {course.available_seats}
                    </div>
                    <div className="detail-stat-label">Available Seats</div>
                </div>
                <div className="detail-stat">
                    <div className="detail-stat-value" style={{ color: 'var(--accent-purple)' }}>
                        {course.total_seats}
                    </div>
                    <div className="detail-stat-label">Total Seats</div>
                </div>
            </div>

            {/* Enrollments table — visible to all who can see them */}
            <div className="table-wrapper">
                <div className="table-header">
                    <h3 className="table-title">
                        {role === 'student' ? 'Course Enrollment' : `Enrollments (${enrollments.length})`}
                    </h3>
                </div>
                {enrollments.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                {role !== 'student' && <th>Student</th>}
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enrollments.map(e => (
                                <tr key={e.enrollment_id}>
                                    <td>#{e.enrollment_id}</td>
                                    {role !== 'student' && <td>{e.student_name}</td>}
                                    <td><span className="badge success">{String(e.status || '').toUpperCase()}</span></td>
                                    <td>{e.enrollment_date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-title">No enrollments yet</div>
                        <div className="empty-state-desc">
                            {role === 'student'
                                ? 'Be the first to enroll in this course.'
                                : 'No students have enrolled in this course yet.'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
