import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { setSession } from '../lib/auth';

const PORTAL_META = {
    student:    { label: 'Student Portal',    color: 'var(--accent-emerald)', icon: '🎓', desc: 'Browse & enroll in courses' },
    instructor: { label: 'Instructor Portal', color: 'var(--accent-purple)',  icon: '📚', desc: 'Manage your courses & students' },
    admin:      { label: 'Admin Panel',       color: 'var(--accent-amber)',   icon: '⚙️', desc: 'Full system administration' },
};

export default function Login() {
    const navigate = useNavigate();
    const [selectedPortal, setSelectedPortal] = useState('student');
    const [form, setForm]   = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const meta = PORTAL_META[selectedPortal];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await apiRequest('/login', {
                method: 'POST',
                data: { email: form.email, password: form.password },
            });

            // Validate that the returned role matches the selected portal
            const returnedRole = result.user?.role?.toLowerCase();
            if (returnedRole !== selectedPortal) {
                setError(
                    `This account is registered as "${returnedRole}". ` +
                    `Please select the correct portal: ${returnedRole.charAt(0).toUpperCase() + returnedRole.slice(1)}.`
                );
                setLoading(false);
                return;
            }

            setSession({ accessToken: result.access_token, user: result.user });
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
                {/* Logo */}
                <div className="login-logo">
                    <div
                        className="login-logo-icon"
                        style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}aa)` }}
                    >
                        C
                    </div>
                </div>
                <h1 className="login-title">Welcome to CourseHub</h1>
                <p className="login-subtitle">Select your portal and sign in</p>

                {/* Portal Selector */}
                <div className="portal-selector">
                    {Object.entries(PORTAL_META).map(([key, pm]) => (
                        <button
                            key={key}
                            type="button"
                            className={`portal-option${selectedPortal === key ? ' active' : ''}`}
                            style={selectedPortal === key ? {
                                borderColor: pm.color,
                                background: `${pm.color}18`,
                                color: pm.color,
                            } : {}}
                            onClick={() => setSelectedPortal(key)}
                        >
                            <span className="portal-option-icon">{pm.icon}</span>
                            <span className="portal-option-label">
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Selected portal description */}
                <div
                    className="portal-desc"
                    style={{ borderColor: meta.color, color: meta.color }}
                >
                    {meta.icon} {meta.desc}
                </div>

                {error && (
                    <div className="login-error">
                        ⚠ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            id="login-email"
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
                            id="login-password"
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                    <button
                        id="login-submit"
                        type="submit"
                        className="btn btn-primary login-btn"
                        style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)` }}
                        disabled={loading}
                    >
                        {loading
                            ? 'Signing in…'
                            : `Sign in as ${selectedPortal.charAt(0).toUpperCase() + selectedPortal.slice(1)}`
                        }
                    </button>
                </form>

                <p className="login-hint">
                    Your role is determined by your registered account.
                </p>
            </div>
        </div>
    );
}
