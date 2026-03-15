import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, coursesAPI, enrollmentsAPI } from '../services/api';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userRole = localStorage.getItem('userRole') || 'ADMIN';

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      if (userRole === 'ADMIN') {
        const [dashData, enrollData, courseData] = await Promise.all([
          adminAPI.dashboard(),
          adminAPI.getEnrollments(),
          adminAPI.getCourses(),
        ]);
        setSummary(dashData.summary);
        setRecentEnrollments(enrollData.enrollments.slice(0, 5));
        setPopularCourses(
          courseData.courses
            .sort((a, b) => (b.total_seats - b.available_seats) - (a.total_seats - a.available_seats))
            .slice(0, 5)
        );
      } else {
        // Student / Instructor: just load courses & enrollments
        const [enrollData, courseData] = await Promise.all([
          enrollmentsAPI.getAll(),
          coursesAPI.getAll(),
        ]);
        setRecentEnrollments(enrollData.enrollments.slice(0, 5));
        setPopularCourses(courseData.courses.slice(0, 5));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="slide-up" style={{ color: 'var(--text-secondary)', padding: '40px' }}>Loading dashboard...</div>;
  if (error)   return <div className="slide-up" style={{ color: '#f87171', padding: '40px' }}>⚠️ {error}</div>;

  // Build stat cards from real data
  const stats = summary ? [
    { label: 'Total Users',    value: summary.users.total,              icon: '👥', color: 'blue'    },
    { label: 'Courses',        value: summary.courses,                  icon: '📚', color: 'purple'  },
    { label: 'Enrollments',    value: summary.enrollments,              icon: '📝', color: 'emerald' },
    { label: 'Reservations',   value: summary.reservations.confirmed,   icon: '🎫', color: 'cyan'    },
    { label: 'Pending Res.',   value: summary.reservations.pending,     icon: '⏳', color: 'amber'   },
    { label: 'Instructors',    value: summary.users.instructors,        icon: '🎓', color: 'rose'    },
  ] : [];

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {localStorage.getItem('userName') || 'User'} 👋</h1>
          <p className="page-subtitle">Here's an overview of your course management system</p>
        </div>
      </div>

      {/* Stats — admin only */}
      {summary && (
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className={`stat-card ${stat.color}`}>
              <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Recent Enrollments */}
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
              {recentEnrollments.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No enrollments yet</td></tr>
              ) : recentEnrollments.map((e) => (
                <tr key={e.enrollment_id}>
                  <td>{e.student_name}</td>
                  <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.course_title}</td>
                  <td>
                    <span className={`badge ${e.status === 'active' ? 'success' : e.status === 'completed' ? 'info' : 'danger'}`}>
                      {e.status.toUpperCase()}
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
              {popularCourses.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No courses yet</td></tr>
              ) : popularCourses.map((c) => (
                <tr key={c.course_id}>
                  <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                  <td>{c.total_seats - c.available_seats}</td>
                  <td>{c.total_seats}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
