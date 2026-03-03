import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockCourses } from '../data/mockData';

export default function Courses() {
    const [courses, setCourses] = useState(mockCourses);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', fee: '', totalSeats: '', instructor: '' });

    const colors = ['blue', 'purple', 'emerald', 'amber', 'cyan', 'rose'];
    const icons = ['📐', '💻', '🤖', '🗄️', '☁️', '📱', '🔬', '🎨'];

    const filtered = courses.filter(
        (c) =>
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.instructor.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = (e) => {
        e.preventDefault();
        const newCourse = {
            ...form,
            courseId: Date.now(),
            fee: parseFloat(form.fee),
            totalSeats: parseInt(form.totalSeats),
            enrolledCount: 0,
            color: colors[Math.floor(Math.random() * colors.length)],
        };
        setCourses([...courses, newCourse]);
        setShowModal(false);
        setForm({ title: '', fee: '', totalSeats: '', instructor: '' });
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
                        <span>🔍</span>
                        <input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Course</button>
                </div>
            </div>

            <div className="courses-grid">
                {filtered.map((course, idx) => (
                    <Link to={`/courses/${course.courseId}`} key={course.courseId} className="course-card">
                        <div className="course-card-header">
                            <div className={`course-card-icon stat-icon ${course.color}`}>
                                {icons[idx % icons.length]}
                            </div>
                            <span className="badge success">
                                {course.totalSeats - course.enrolledCount} seats left
                            </span>
                        </div>
                        <h3 className="course-card-title">{course.title}</h3>
                        <p className="course-card-instructor">👨‍🏫 {course.instructor}</p>
                        <div className="course-card-meta">
                            <span className="course-card-meta-item">💰 ₹{course.fee.toLocaleString()}</span>
                            <span className="course-card-meta-item">👥 {course.enrolledCount}/{course.totalSeats}</span>
                        </div>
                        {/* Progress bar */}
                        <div style={{ marginTop: '14px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', height: '5px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${(course.enrolledCount / course.totalSeats) * 100}%`,
                                height: '100%',
                                background: 'var(--gradient-primary)',
                                borderRadius: '6px',
                                transition: 'width 0.6s ease',
                            }} />
                        </div>
                    </Link>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📚</div>
                        <div className="empty-state-title">No courses found</div>
                        <div className="empty-state-desc">Try adjusting your search or add a new course.</div>
                    </div>
                </div>
            )}

            {/* Modal */}
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
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Fee (₹)</label>
                                        <input className="form-input" type="number" placeholder="4999" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Total Seats</label>
                                        <input className="form-input" type="number" placeholder="50" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Instructor Name</label>
                                    <input className="form-input" placeholder="e.g. Bob Smith" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} required />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Course</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
