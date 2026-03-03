import React, { useState } from 'react';
import { mockEnrollments, mockCourses, mockUsers } from '../data/mockData';

export default function Enrollments() {
    const [enrollments, setEnrollments] = useState(mockEnrollments);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ studentName: '', courseName: '' });

    const students = mockUsers.filter((u) => u.role === 'STUDENT');

    const filtered = enrollments.filter(
        (e) =>
            e.studentName.toLowerCase().includes(search.toLowerCase()) ||
            e.courseName.toLowerCase().includes(search.toLowerCase()) ||
            e.status.toLowerCase().includes(search.toLowerCase())
    );

    const handleEnroll = (e) => {
        e.preventDefault();
        const newEnrollment = {
            enrollmentId: Date.now(),
            studentName: form.studentName,
            courseName: form.courseName,
            status: 'ACTIVE',
            enrollmentDate: new Date().toISOString().split('T')[0],
        };
        setEnrollments([newEnrollment, ...enrollments]);
        setShowModal(false);
        setForm({ studentName: '', courseName: '' });
    };

    const handleDrop = (id) => {
        setEnrollments(enrollments.map((e) => (e.enrollmentId === id ? { ...e, status: 'DROPPED' } : e)));
    };

    return (
        <div className="slide-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Enrollments</h1>
                    <p className="page-subtitle">Manage student course enrollments</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Enrollment</button>
            </div>

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
                            <th>Student</th>
                            <th>Course</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((enrollment) => (
                            <tr key={enrollment.enrollmentId}>
                                <td>#{enrollment.enrollmentId}</td>
                                <td style={{ fontWeight: 600 }}>{enrollment.studentName}</td>
                                <td>{enrollment.courseName}</td>
                                <td>
                                    <span className={`badge ${enrollment.status === 'ACTIVE' ? 'success' : enrollment.status === 'COMPLETED' ? 'info' : 'danger'}`}>
                                        {enrollment.status}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--text-secondary)' }}>{enrollment.enrollmentDate}</td>
                                <td>
                                    <div className="action-buttons">
                                        {enrollment.status === 'ACTIVE' && (
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDrop(enrollment.enrollmentId)}>
                                                Drop
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="6">
                                    <div className="empty-state">
                                        <div className="empty-state-icon">📝</div>
                                        <div className="empty-state-title">No enrollments found</div>
                                        <div className="empty-state-desc">Try adjusting your search or enroll a student.</div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">New Enrollment</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleEnroll}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Student</label>
                                    <select className="form-select" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} required>
                                        <option value="">Select a student</option>
                                        {students.map((s) => (
                                            <option key={s.userId} value={s.name}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Course</label>
                                    <select className="form-select" value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} required>
                                        <option value="">Select a course</option>
                                        {mockCourses.map((c) => (
                                            <option key={c.courseId} value={c.title}>{c.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Enroll Student</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
