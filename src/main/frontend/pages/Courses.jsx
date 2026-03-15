import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../services/api';

const ICONS = ['📐', '💻', '🤖', '🗄️', '☁️', '📱', '🔬', '🎨'];
const COLORS = ['blue', 'purple', 'emerald', 'amber', 'cyan', 'rose'];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '', total_seats: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const userRole = localStorage.getItem('userRole') || 'ADMIN';

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await coursesAPI.getAll();
      setCourses(data.courses);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.instructor_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await coursesAPI.create({
        title:       form.title,
        description: form.description,
        price:       parseFloat(form.price),
        total_seats: parseInt(form.total_seats),
      });
      setCourses([...courses, data.course]);
      setShowModal(false);
      setForm({ title: '', description: '', price: '', total_seats: '' });
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="slide-up" style={{ color: 'var(--text-secondary)', padding: '40px' }}>Loading courses...</div>;

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Courses</h1>
          <p className="page-subtitle">Browse and manage available courses</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="table-search">
            <span>🔍</span>
            <input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {userRole === 'INSTRUCTOR' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Course</button>
          )}
        </div>
      </div>

      {error && <div style={{ color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      <div className="courses-grid">
        {filtered.map((course, idx) => {
          const enrolled = course.total_seats - course.available_seats;
          return (
            <Link to={`/courses/${course.course_id}`} key={course.course_id} className="course-card">
              <div className="course-card-header">
                <div className={`course-card-icon stat-icon ${COLORS[idx % COLORS.length]}`}>
                  {ICONS[idx % ICONS.length]}
                </div>
                <span className="badge success">{course.available_seats} seats left</span>
              </div>
              <h3 className="course-card-title">{course.title}</h3>
              <p className="course-card-instructor">👨‍🏫 {course.instructor_name || 'Instructor'}</p>
              <div className="course-card-meta">
                <span className="course-card-meta-item">💰 ₹{course.price.toLocaleString()}</span>
                <span className="course-card-meta-item">👥 {enrolled}/{course.total_seats}</span>
              </div>
              <div style={{ marginTop: '14px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', height: '5px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(enrolled / course.total_seats) * 100}%`,
                  height: '100%',
                  background: 'var(--gradient-primary)',
                  borderRadius: '6px',
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <div className="empty-state-title">No courses found</div>
            <div className="empty-state-desc">Try adjusting your search or add a new course.</div>
          </div>
        </div>
      )}

      {/* Add Course Modal — Instructors only */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Course</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Course Title</label>
                  <input className="form-input" placeholder="e.g. Data Structures" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" placeholder="Brief course description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price (₹)</label>
                    <input className="form-input" type="number" placeholder="4999" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Seats</label>
                    <input className="form-input" type="number" placeholder="50" value={form.total_seats} onChange={(e) => setForm({ ...form, total_seats: e.target.value })} required />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Adding...' : 'Add Course'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
