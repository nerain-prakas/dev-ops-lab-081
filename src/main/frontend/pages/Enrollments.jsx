import React, { useState, useEffect } from 'react';
import { enrollmentsAPI, adminAPI } from '../services/api';

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userRole = localStorage.getItem('userRole') || 'ADMIN';

  useEffect(() => { fetchEnrollments(); }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    setError('');
    try {
      let data;
      if (userRole === 'ADMIN') {
        data = await adminAPI.getEnrollments();
      } else {
        data = await enrollmentsAPI.getAll();
      }
      setEnrollments(data.enrollments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = enrollments.filter(
    (e) =>
      (e.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.course_title || '').toLowerCase().includes(search.toLowerCase()) ||
      e.status.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="slide-up" style={{ color: 'var(--text-secondary)', padding: '40px' }}>Loading enrollments...</div>;

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Enrollments</h1>
          <p className="page-subtitle">
            {userRole === 'STUDENT' ? 'Your active and past course enrollments' : 'All student course enrollments'}
          </p>
        </div>
      </div>

      {error && <div style={{ color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      <div className="table-wrapper">
        <div className="table-header">
          <h3 className="table-title">All Enrollments ({filtered.length})</h3>
          <div className="table-search">
            <span>🔍</span>
            <input placeholder="Search enrollments..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              {userRole !== 'STUDENT' && <th>Student</th>}
              <th>Course</th>
              <th>Status</th>
              <th>Date</th>
              {userRole === 'STUDENT' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((enrollment) => (
              <tr key={enrollment.enrollment_id}>
                <td>#{enrollment.enrollment_id}</td>
                {userRole !== 'STUDENT' && <td style={{ fontWeight: 600 }}>{enrollment.student_name}</td>}
                <td>{enrollment.course_title}</td>
                <td>
                  <span className={`badge ${enrollment.status === 'active' ? 'success' : enrollment.status === 'completed' ? 'info' : 'danger'}`}>
                    {enrollment.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{enrollment.enrollment_date}</td>
                {userRole === 'STUDENT' && (
                  <td>
                    {enrollment.status === 'active' && (
                      <button className="btn btn-sm btn-primary" onClick={() => alert(`Launching: ${enrollment.course_title}`)}>
                        📘 Learn Course
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={userRole === 'STUDENT' ? 5 : 4}>
                  <div className="empty-state">
                    <div className="empty-state-icon">📝</div>
                    <div className="empty-state-title">No enrollments found</div>
                    <div className="empty-state-desc">Complete a payment to get enrolled in a course.</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
