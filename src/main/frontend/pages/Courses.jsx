import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { getRole, getToken } from '../lib/auth';

export default function Courses() {
    const token  = getToken();
    const role   = getRole();
    const [courses, setCourses]     = useState([]);
    const [search, setSearch]       = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [form, setForm]           = useState({ title: '', description: '', price: '', total_seats: '' });
    const [error, setError]         = useState('');
    const [loading, setLoading]     = useState(false);

    async function loadCourses() {
        setLoading(true);
        try {
            setError('');
            // Instructors see only their own courses by default dashboard,
            // but the Courses page shows ALL courses for browsing purposes.
            const data = await apiRequest('/courses', { token });
            setCourses(data.courses || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadCourses(); }, []);

    const filtered = courses.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        String(c.instructor_name || '').toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => {
        setEditingCourse(null);
        setForm({ title: '', description: '', price: '', total_seats: '' });
        setShowModal(true);
    };

    const openEdit = (course) => {
        setEditingCourse(course);
        setForm({
            title:       course.title,
            description: course.description || '',
            price:       String(course.price),
            total_seats: String(course.total_seats),
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title:       form.title,
                description: form.description,
                price:       Number(form.price),
                total_seats: Number(form.total_seats),
            };
            if (editingCourse) {
                await apiRequest(`/courses/${editingCourse.course_id}`, { method: 'PUT', token, data: payload });
            } else {
                await apiRequest('/courses', { method: 'POST', token, data: payload });
            }
            setShowModal(false);
            setForm({ title: '', description: '', price: '', total_seats: '' });
            setEditingCourse(null);
            loadCourses();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (courseId) => {
        if (!window.confirm('Delete this course? This cannot be undone.')) return;
        try {
            await apiRequest(`/courses/${courseId}`, { method: 'DELETE', token });
            loadCourses();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAdminDelete = async (courseId) => {
        if (!window.confirm('Force-delete this course as admin?')) return;
        try {
            await apiRequest(`/admin/courses/${courseId}`, { method: 'DELETE', token });
            loadCourses();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="slide-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        {role === 'instructor' ? 'My Courses' : 'All Courses'}
                    </h1>
                    <p className="page-subtitle">
                        {role === 'student'    && 'Browse and reserve seats in available courses'}
                        {role === 'instructor' && 'Create, manage and update your courses'}
                        {role === 'admin'      && 'View and administrate all platform courses'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="table-search">
                        <span>🔍</span>
                        <input
                            placeholder="Search courses…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {role === 'instructor' && (
                        <button className="btn btn-primary" onClick={openAdd}>+ Add Course</button>
                    )}
                </div>
            </div>

            {error && <div className="alert-error">{error}</div>}

            {loading ? (
                <div className="card"><div className="empty-state">Loading courses…</div></div>
            ) : (
                <div className="courses-grid">
                    {filtered.map((course) => (
                        <div key={course.course_id} className="course-card">
                            <Link to={`/courses/${course.course_id}`} className="course-card-link">
                                <div className="course-card-header">
                                    <div className="course-card-icon stat-icon blue">🎓</div>
                                    <span className={`badge ${course.available_seats > 0 ? 'success' : 'danger'}`}>
                                        {course.available_seats > 0 ? `${course.available_seats} seats` : 'Full'}
                                    </span>
                                </div>
                                <h3 className="course-card-title">{course.title}</h3>
                                <p className="course-card-instructor">by {course.instructor_name || 'Unknown'}</p>
                                <div className="course-card-meta">
                                    <span className="course-card-meta-item">Rs {Number(course.price || 0).toFixed(2)}</span>
                                    <span className="course-card-meta-item">
                                        {course.total_seats - course.available_seats}/{course.total_seats} enrolled
                                    </span>
                                </div>
                            </Link>

                            {/* Role-specific actions below card */}
                            <div className="course-card-actions">
                                {role === 'student' && course.available_seats > 0 && (
                                    <Link
                                        to={`/courses/${course.course_id}`}
                                        className="btn btn-sm btn-primary"
                                    >
                                        Reserve Seat
                                    </Link>
                                )}
                                {role === 'instructor' && (
                                    <>
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => openEdit(course)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(course.course_id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                                {role === 'admin' && (
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleAdminDelete(course.course_id)}
                                    >
                                        Force Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-title">No courses found</div>
                        <div className="empty-state-desc">
                            {role === 'instructor'
                                ? 'Create your first course to get started.'
                                : 'No courses match your search.'}
                        </div>
                        {role === 'instructor' && (
                            <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={openAdd}>
                                Create Course
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Add / Edit Modal — instructor only */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Course Title</label>
                                    <input
                                        className="form-input"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-input"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        rows="3"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Price (Rs)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.price}
                                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Total Seats</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            min="1"
                                            value={form.total_seats}
                                            onChange={(e) => setForm({ ...form, total_seats: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCourse ? 'Save Changes' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
