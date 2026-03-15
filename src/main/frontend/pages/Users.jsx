import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminAPI.getUsers();
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, email) => {
    if (!confirm(`Delete user "${email}"?`)) return;
    try {
      await adminAPI.deleteUser(userId);
      setUsers(users.filter((u) => u.user_id !== userId));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const data = await adminAPI.changeRole(userId, newRole);
      setUsers(users.map((u) => u.user_id === userId ? data.user : u));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (role) => {
    const map = { student: 'info', instructor: 'purple', admin: 'warning' };
    return <span className={`badge ${map[role] || 'info'}`}>{role.toUpperCase()}</span>;
  };

  if (loading) return <div className="slide-up" style={{ color: 'var(--text-secondary)', padding: '40px' }}>Loading users...</div>;

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage students, instructors & administrators</p>
        </div>
      </div>

      {error && <div style={{ color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      <div className="table-wrapper">
        <div className="table-header">
          <h3 className="table-title">All Users ({filtered.length})</h3>
          <div className="table-search">
            <span>🔍</span>
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
                <td style={{ fontWeight: 600 }}>{user.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                <td>{roleBadge(user.role)}</td>
                <td>
                  <div className="action-buttons">
                    <select
                      className="form-select"
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user.user_id, user.email)}>
                      🗑️
                    </button>
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
                    <div className="empty-state-desc">No registered users yet.</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
