import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { getRole, getToken } from '../lib/auth';

export default function Courses() {
    const token = getToken();
    const role = getRole();
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', price: '', total_seats: '' });
    const [error, setError] = useState('');

    async function loadCourses() {
        try {
            setError('');
            const data = await apiRequest('/courses', { token });
            setCourses(data.courses || []);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadCourses();
    }, []);

    const filtered = courses.filter((course) =>
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        String(course.instructor_name || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await apiRequest('/courses', {
                method: 'POST',
                token,
                data: {
                    title: form.title,
                    description: form.description,
                    price: Number(form.price),
                    total_seats: Number(form.total_seats),
                },
            });
            setShowModal(false);
            setForm({ title: '', description: '', price: '', total_seats: '' });
            loadCourses();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="slide-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Courses</h1>
                    <p className="page-subtitle">Browse and manage available courses</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="table-search">
                        <span>S</span>
                        <input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    {role === 'instructor' && (
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Course</button>
                    )}
                </div>
            </div>

            {error && <div className="card" style={{ marginBottom: '20px' }}>{error}</div>}

            <div className="courses-grid">
                {filtered.map((course) => (
                    <Link to={`/courses/${course.course_id}`} key={course.course_id} className="course-card">
                        <div className="course-card-header">
                            <div className="course-card-icon stat-icon blue">C</div>
                            <span className="badge success">{course.available_seats} seats left</span>
                        </div>
                        <h3 className="course-card-title">{course.title}</h3>
                        <p className="course-card-instructor">Instructor: {course.instructor_name || 'Unknown'}</p>
                        <div className="course-card-meta">
                            <span className="course-card-meta-item">Rs {Number(course.price || 0).toFixed(2)}</span>
                            <span className="course-card-meta-item">{course.total_seats - course.available_seats}/{course.total_seats}</span>
                        </div>
                    </Link>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-title">No courses found</div>
                        <div className="empty-state-desc">Try adjusting your search or add a new course.</div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Add New Course</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
                        </div>
                        <form onSubmit={handleAdd}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Course Title</label>
                                    <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="4" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Price</label>
                                        <input className="form-input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Total Seats</label>
                                        <input className="form-input" type="number" value={form.total_seats} onChange={(e) => setForm({ ...form, total_seats: e.target.value })} required />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Course</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
