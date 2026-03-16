import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { getRole, getToken } from '../lib/auth';

export default function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const role = getRole();
    const [course, setCourse] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadCourse() {
            try {
                setError('');
                const courseData = await apiRequest(`/courses/${id}`, { token });
                setCourse(courseData.course);

                const endpoint = role === 'admin' ? '/admin/enrollments' : '/enrollments';
                const enrollmentData = await apiRequest(endpoint, { token });
                setEnrollments((enrollmentData.enrollments || []).filter((item) => Number(item.course_id) === Number(id)));
            } catch (err) {
                setError(err.message);
            }
        }

        loadCourse();
    }, [id, role, token]);

    const handleReserve = async () => {
        try {
            await apiRequest('/reserve', {
                method: 'POST',
                token,
                data: { course_id: Number(id) },
            });
            navigate('/reservations');
        } catch (err) {
            setError(err.message);
        }
    };

    if (error && !course) {
        return (
            <div className="card slide-up">
                <div className="empty-state">
                    <div className="empty-state-title">Course not found</div>
                    <div className="empty-state-desc">{error}</div>
                    <Link to="/courses" className="btn btn-primary">Back to Courses</Link>
                </div>
            </div>
        );
    }

    if (!course) {
        return <div className="card slide-up">Loading course...</div>;
    }

    return (
        <div className="slide-up">
            <Link to="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                Back to Courses
            </Link>

            {error && <div className="card" style={{ marginBottom: '20px' }}>{error}</div>}

            <div className="detail-header">
                <div className="detail-icon stat-icon blue" style={{ width: '64px', height: '64px', fontSize: '1.6rem' }}>
                    C
                </div>
                <div className="detail-info">
                    <h1>{course.title}</h1>
                    <p>Taught by {course.instructor_name || 'Unknown'}</p>
                </div>
                {role === 'student' && course.available_seats > 0 && (
                    <div style={{ marginLeft: 'auto' }}>
                        <button className="btn btn-primary" onClick={handleReserve}>
                            Reserve Seat
                        </button>
                    </div>
                )}
            </div>

            <div className="detail-stats">
                <div className="detail-stat">
                    <div className="detail-stat-value" style={{ color: 'var(--accent-blue)' }}>Rs {Number(course.price || 0).toFixed(2)}</div>
                    <div className="detail-stat-label">Course Fee</div>
                </div>
                <div className="detail-stat">
                    <div className="detail-stat-value" style={{ color: 'var(--accent-emerald)' }}>{course.total_seats - course.available_seats}</div>
                    <div className="detail-stat-label">Enrolled</div>
                </div>
                <div className="detail-stat">
                    <div className="detail-stat-value" style={{ color: 'var(--accent-amber)' }}>{course.available_seats}</div>
                    <div className="detail-stat-label">Available Seats</div>
                </div>
                <div className="detail-stat">
                    <div className="detail-stat-value" style={{ color: 'var(--accent-purple)' }}>{course.total_seats}</div>
                    <div className="detail-stat-label">Total Seats</div>
                </div>
            </div>

            <div className="table-wrapper">
                <div className="table-header">
                    <h3 className="table-title">Visible Enrollments ({enrollments.length})</h3>
                </div>
                {enrollments.length > 0 ? (
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
                            {enrollments.map((item) => (
                                <tr key={item.enrollment_id}>
                                    <td>#{item.enrollment_id}</td>
                                    <td>{item.student_name}</td>
                                    <td><span className="badge success">{String(item.status || '').toUpperCase()}</span></td>
                                    <td>{item.enrollment_date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-title">No enrollments yet</div>
                        <div className="empty-state-desc">No visible enrollments are available for this course.</div>
                    </div>
                )}
            </div>
        </div>
    );
}
