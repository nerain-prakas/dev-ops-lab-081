import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { getRole, getToken } from '../lib/auth';

export default function Users() {
    const token = getToken();
    const role = getRole();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', role: 'student', password: '' });
    const [error, setError] = useState('');

    async function loadUsers() {
        try {
            setError('');
            const data = await apiRequest('/admin/users', { token });
            setUsers(data.users || []);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        if (role === 'admin') {
            loadUsers();
        }
    }, [role, token]);

    const filtered = users.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => {
        setEditingUser(null);
        setForm({ name: '', email: '', role: 'student', password: '' });
        setShowModal(true);
    };

    const openEdit = (user) => {
        setEditingUser(user);
        setForm({ name: user.name, email: user.email, role: user.role, password: '' });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await apiRequest(`/admin/users/${editingUser.user_id}/role`, {
                    method: 'PATCH',
                    token,
                    data: { role: form.role },
                });
            } else {
                await apiRequest('/register', {
                    method: 'POST',
                    data: {
                        name: form.name,
                        email: form.email,
                        password: form.password,
                        role: form.role,
                    },
                });
            }
            setShowModal(false);
            loadUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            await apiRequest(`/admin/users/${userId}`, {
                method: 'DELETE',
                token,
            });
            loadUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    if (role !== 'admin') {
        return <div className="card slide-up">This page is available to admins only.</div>;
    }

    return (
        <div className="slide-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Users</h1>
                    <p className="page-subtitle">Manage students, instructors and administrators</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>Add User</button>
            </div>

            {error && <div className="card" style={{ marginBottom: '20px' }}>{error}</div>}

            <div className="table-wrapper">
                <div className="table-header">
                    <h3 className="table-title">All Users ({filtered.length})</h3>
                    <div className="table-search">
                        <span>S</span>
                        <input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((user) => (
                            <tr key={user.user_id}>
                                <td>#{user.user_id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td><span className="badge info">{String(user.role || '').toUpperCase()}</span></td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(user)}>Edit Role</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user.user_id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="5">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingUser ? 'Edit User Role' : 'Add New User'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                {!editingUser && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Full Name</label>
                                            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Email</label>
                                            <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                                        </div>
                                    </>
                                )}
                                <div className="form-group">
                                    <label className="form-label">Role</label>
                                    <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                                        <option value="student">Student</option>
                                        <option value="instructor">Instructor</option>
                                        {editingUser && <option value="admin">Administrator</option>}
                                    </select>
                                </div>
                                {!editingUser && (
                                    <div className="form-group">
                                        <label className="form-label">Password</label>
                                        <input className="form-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingUser ? 'Save Role' : 'Create User'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
