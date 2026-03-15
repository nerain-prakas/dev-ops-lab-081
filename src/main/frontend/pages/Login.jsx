import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '', role: 'STUDENT' });

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Replace with actual API call to POST /api/users/login
        // Save mock role to localStorage for demo
        localStorage.setItem('userRole', form.role);
        navigate('/');
    };

    return (
        <div className="login-page">
            <div className="login-card slide-up">
                <div className="login-logo">
                    <div className="login-logo-icon">C</div>
                </div>
                <h1 className="login-title">Welcome Back</h1>
                <p className="login-subtitle">Sign in to CourseHub Management</p>

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
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Login As</label>
                        <select 
                            className="form-input" 
                            value={form.role} 
                            onChange={(e) => setForm({...form, role: e.target.value})}
                        >
                            <option value="STUDENT">Student</option>
                            <option value="INSTRUCTOR">Instructor</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary login-btn">
                        Sign In →
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Demo — any credentials will sign in
                </p>
            </div>
        </div>
    );
}
