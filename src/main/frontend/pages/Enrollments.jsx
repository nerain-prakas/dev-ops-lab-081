import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { getRole, getToken } from '../lib/auth';

export default function Enrollments() {
    const token = getToken();
    const role = getRole();
    const [enrollments, setEnrollments] = useState([]);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadEnrollments() {
            try {
                const endpoint = role === 'admin' ? '/admin/enrollments' : '/enrollments';
                const data = await apiRequest(endpoint, { token });
                setEnrollments(data.enrollments || []);
            } catch (err) {
                setError(err.message);
            }
        }

        loadEnrollments();
    }, [role, token]);

    const filtered = enrollments.filter((item) =>
        String(item.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
        String(item.course_title || '').toLowerCase().includes(search.toLowerCase()) ||
        String(item.status || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="slide-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Enrollments</h1>
                    <p className="page-subtitle">{role === 'student' ? 'Your active and past course enrollments' : 'View course enrollments'}</p>
                </div>
            </div>

            {error && <div className="card" style={{ marginBottom: '20px' }}>{error}</div>}

            <div className="table-wrapper">
                <div className="table-header">
                    <h3 className="table-title">All Enrollments ({filtered.length})</h3>
                    <div className="table-search">
                        <span>S</span>
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
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((item) => (
                            <tr key={item.enrollment_id}>
                                <td>#{item.enrollment_id}</td>
                                <td>{item.student_name}</td>
                                <td>{item.course_title}</td>
                                <td><span className={`badge ${item.status === 'active' ? 'success' : item.status === 'completed' ? 'info' : 'danger'}`}>{String(item.status || '').toUpperCase()}</span></td>
                                <td>{item.enrollment_date}</td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="5">No enrollments found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
