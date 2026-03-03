import React, { useState } from 'react';
import { mockUsers } from '../data/mockData';

export default function Users() {
    const [users, setUsers] = useState(mockUsers);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', role: 'STUDENT', password: '' });

    const filtered = users.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.role.toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => {
        setEditingUser(null);
        setForm({ name: '', email: '', role: 'STUDENT', password: '' });
        setShowModal(true);
    };

    const openEdit = (user) => {
        setEditingUser(user);
        setForm({ name: user.name, email: user.email, role: user.role, password: '' });
        setShowModal(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editingUser) {
            setUsers(users.map((u) => (u.userId === editingUser.userId ? { ...u, ...form } : u)));
        } else {
            const newUser = { ...form, userId: Date.now() };
            setUsers([...users, newUser]);
        }
        setShowModal(false);
    };

    const handleDelete = (userId) => {
        if (confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter((u) => u.userId !== userId));
        }
    };

    const roleBadge = (role) => {
        const map = { STUDENT: 'info', INSTRUCTOR: 'purple', ADMIN: 'warning' };
        return <span className={`badge ${map[role] || 'info'}`}>{role}</span>;
    };

    return (
        <div className="slide-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Users</h1>
                    <p className="page-subtitle">Manage students, instructors & administrators</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>+ Add User</button>
            </div>

            <div className="table-wrapper">
                <div className="table-header">
                    <h3 className="table-title">All Users ({filtered.length})</h3>
                    <div className="table-search">
                        <span>🔍</span>
                        <input
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
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
                            <tr key={user.userId}>
                                <td>#{user.userId}</td>
                                <td style={{ fontWeight: 600 }}>{user.name}</td>
                                <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                                <td>{roleBadge(user.role)}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(user)}>✏️ Edit</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user.userId)}>🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="5">
                                    <div className="empty-state">
                                        <div className="empty-state-icon">👥</div>
                                        <div className="empty-state-title">No users found</div>
                                        <div className="empty-state-desc">Try adjusting your search or add a new user.</div>
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
                            <h3 className="modal-title">{editingUser ? 'Edit User' : 'Add New User'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input className="form-input" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input className="form-input" type="email" placeholder="john@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Role</label>
                                        <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                                            <option value="STUDENT">Student</option>
                                            <option value="INSTRUCTOR">Instructor</option>
                                            <option value="ADMIN">Administrator</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password {editingUser && '(leave blank to keep current)'}</label>
                                    <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingUser} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingUser ? 'Save Changes' : 'Add User'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
