import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { setSession } from '../lib/auth';

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '', role: 'student' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await apiRequest('/login', {
                method: 'POST',
                data: {
                    email: form.email,
                    password: form.password,
                },
            });

            setSession({
                accessToken: result.access_token,
                user: result.user,
            });
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card slide-up">
                <div className="login-logo">
                    <div className="login-logo-icon">C</div>
                </div>
                <h1 className="login-title">Welcome Back</h1>
                <p className="login-subtitle">Sign in to CourseHub Management</p>

                {error && (
                    <div className="badge danger" style={{ display: 'block', marginBottom: '16px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Portal</label>
                        <select
                            className="form-input"
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                        >
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Use an account from the deployed backend.
                </p>
            </div>
        </div>
    );
}
