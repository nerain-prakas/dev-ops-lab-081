import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { getRole, getToken } from '../lib/auth';

export default function Enrollments() {
    const token = getToken();
    const role  = getRole();
    const [enrollments, setEnrollments] = useState([]);
    const [search, setSearch]           = useState('');
    const [error, setError]             = useState('');

    useEffect(() => {
        async function load() {
            try {
                // admin uses /admin/enrollments, student+instructor use /enrollments
                const endpoint = role === 'admin' ? '/admin/enrollments' : '/enrollments';
                const data = await apiRequest(endpoint, { token });
                setEnrollments(data.enrollments || []);
            } catch (err) {
                setError(err.message);
            }
        }
        load();
    }, [role, token]);

    const filtered = enrollments.filter((e) =>
        String(e.student_name  || '').toLowerCase().includes(search.toLowerCase()) ||
        String(e.course_title  || '').toLowerCase().includes(search.toLowerCase()) ||
        String(e.status        || '').toLowerCase().includes(search.toLowerCase())
    );

    const subtitle = {
        student:    'Your active and past course enrollments',
        instructor: 'Students enrolled in your courses',
        admin:      'All enrollments across the platform',
    }[role] || '';

    // Show student name column only for instructor/admin
    const showStudentCol = role === 'instructor' || role === 'admin';
    // Show price column only for admin
    const showPriceCol   = role === 'admin';

    return (
        <div className="slide-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Enrollments</h1>
                    <p className="page-subtitle">{subtitle}</p>
                </div>
                <div className="table-search">
                    <span>🔍</span>
                    <input
                        placeholder="Search enrollments…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="alert-error">{error}</div>}

            {/* Stats summary */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div className="inline-stat emerald">
                    <strong>{filtered.filter(e => e.status === 'active').length}</strong> Active
                </div>
                <div className="inline-stat blue">
                    <strong>{filtered.filter(e => e.status === 'completed').length}</strong> Completed
                </div>
                <div className="inline-stat danger">
                    <strong>{filtered.filter(e => e.status === 'dropped').length}</strong> Dropped
                </div>
                <div className="inline-stat">
                    <strong>{filtered.length}</strong> Total
                </div>
            </div>

            <div className="table-wrapper">
                <div className="table-header">
                    <h3 className="table-title">All Enrollments ({filtered.length})</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            {showStudentCol && <th>Student</th>}
                            <th>Course</th>
                            {showPriceCol   && <th>Price</th>}
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((e) => (
                            <tr key={e.enrollment_id}>
                                <td>#{e.enrollment_id}</td>
                                {showStudentCol && <td>{e.student_name}</td>}
                                <td>{e.course_title}</td>
                                {showPriceCol   && <td>Rs {Number(e.course_price || 0).toFixed(2)}</td>}
                                <td>
                                    <span className={`badge ${
                                        e.status === 'active'    ? 'success' :
                                        e.status === 'completed' ? 'info'    : 'danger'
                                    }`}>
                                        {String(e.status || '').toUpperCase()}
                                    </span>
                                </td>
                                <td>{e.enrollment_date}</td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No enrollments found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
