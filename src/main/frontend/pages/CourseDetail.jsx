import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { coursesAPI, reservationsAPI } from '../services/api';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reserving, setReserving] = useState(false);
  const userRole = localStorage.getItem('userRole') || 'ADMIN';

  useEffect(() => { fetchCourse(); }, [id]);

  const fetchCourse = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await coursesAPI.getOne(id);
      setCourse(data.course);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    setReserving(true);
    try {
      await reservationsAPI.create(parseInt(id));
      alert(`Seat reserved for "${course.title}"! Go to Reservations to complete payment.`);
      navigate('/reservations');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setReserving(false);
    }
  };

  if (loading) return <div className="slide-up" style={{ color: 'var(--text-secondary)', padding: '40px' }}>Loading course...</div>;

  if (error || !course) {
    return (
      <div className="card slide-up">
        <div className="empty-state">
          <div className="empty-state-icon">❌</div>
          <div className="empty-state-title">Course not found</div>
          <div className="empty-state-desc">{error || "The course you're looking for doesn't exist."}</div>
          <Link to="/courses" className="btn btn-primary">← Back to Courses</Link>
        </div>
      </div>
    );
  }

  const enrolled = course.total_seats - course.available_seats;

  return (
    <div className="slide-up">
      <Link to="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
        ← Back to Courses
      </Link>

      <div className="detail-header">
        <div className="detail-icon stat-icon blue" style={{ width: '64px', height: '64px', fontSize: '1.6rem' }}>
          📚
        </div>
        <div className="detail-info">
          <h1>{course.title}</h1>
          <p>Taught by {course.instructor_name || 'Instructor'}</p>
          {course.description && <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.9rem' }}>{course.description}</p>}
        </div>
        {userRole === 'STUDENT' && course.available_seats > 0 && (
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-primary" onClick={handleReserve} disabled={reserving}>
              {reserving ? 'Reserving...' : '🎫 Reserve Seat'}
            </button>
          </div>
        )}
        {userRole === 'STUDENT' && course.available_seats === 0 && (
          <div style={{ marginLeft: 'auto' }}>
            <span className="badge danger">Seats Full</span>
          </div>
        )}
      </div>

      <div className="detail-stats">
        <div className="detail-stat">
          <div className="detail-stat-value" style={{ color: 'var(--accent-blue)' }}>₹{course.price.toLocaleString()}</div>
          <div className="detail-stat-label">Course Fee</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-value" style={{ color: 'var(--accent-emerald)' }}>{enrolled}</div>
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
    </div>
  );
}
