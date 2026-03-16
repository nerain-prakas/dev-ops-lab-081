import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { clearSession, getSession, getRole } from '../lib/auth';

/* ─── Role-specific nav configuration ─────────────────────────────────────── */
const NAV_CONFIG = {
    student: [
        { section: 'Main',       items: [{ to: '/',            icon: '⊞', label: 'Dashboard'    }] },
        { section: 'Learning',   items: [{ to: '/courses',     icon: '🎓', label: 'Courses'      },
                                          { to: '/enrollments', icon: '✓',  label: 'Enrollments'  }] },
        { section: 'Bookings',   items: [{ to: '/reservations',icon: '📋', label: 'Reservations' },
                                          { to: '/payments',    icon: '💳', label: 'Payments'     }] },
    ],
    instructor: [
        { section: 'Main',       items: [{ to: '/',            icon: '⊞', label: 'Dashboard'    }] },
        { section: 'Teaching',   items: [{ to: '/courses',     icon: '🎓', label: 'My Courses'   },
                                          { to: '/enrollments', icon: '✓',  label: 'Enrollments'  }] },
    ],
    admin: [
        { section: 'Main',       items: [{ to: '/',             icon: '⊞', label: 'Dashboard'    }] },
        { section: 'Management', items: [{ to: '/users',        icon: '👥', label: 'Users'        },
                                          { to: '/courses',      icon: '🎓', label: 'All Courses'  },
                                          { to: '/enrollments',  icon: '✓',  label: 'Enrollments'  }] },
        { section: 'Operations', items: [{ to: '/reservations', icon: '📋', label: 'Reservations' },
                                          { to: '/payments',     icon: '💳', label: 'Payments'     }] },
    ],
};

/* ─── Role badge colours ───────────────────────────────────────────────────── */
const ROLE_META = {
    student:    { label: 'Student Portal',    accent: 'var(--accent-emerald)', badge: 'success' },
    instructor: { label: 'Instructor Portal', accent: 'var(--accent-purple)',  badge: 'purple'  },
    admin:      { label: 'Admin Panel',       accent: 'var(--accent-amber)',   badge: 'warning' },
};

export default function Layout() {
    const location = useLocation();
    const navigate  = useNavigate();
    const session   = getSession();
    const role      = (session?.role || 'student').toLowerCase();
    const userName  = session?.user?.name || 'User';
    const meta      = ROLE_META[role] || ROLE_META.student;
    const navItems  = NAV_CONFIG[role]  || NAV_CONFIG.student;

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Dashboard';
        const segment = path.split('/')[1];
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    };

    const handleLogout = () => {
        clearSession();
        navigate('/login');
    };

    return (
        <div className="app-layout">
            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon" style={{ background: meta.accent }}>C</div>
                    <div className="sidebar-logo-text">
                        CourseHub
                        <span>{meta.label}</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((section) => (
                        <div key={section.section} className="sidebar-section">
                            <div className="sidebar-section-label">{section.section}</div>
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.to === '/'}
                                    className={({ isActive }) =>
                                        `sidebar-link${isActive ? ' active' : ''}`
                                    }
                                >
                                    <span className="sidebar-link-icon">{item.icon}</span>
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* User info at bottom of sidebar */}
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar" style={{ background: meta.accent }}>
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{userName}</div>
                        <div className="sidebar-user-role">
                            <span className={`badge ${meta.badge}`}>
                                {role.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <button
                        className="sidebar-logout-btn"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        ⏻
                    </button>
                </div>
            </aside>

            {/* ── Main area ───────────────────────────────────────────────── */}
            <div className="main-area">
                <header className="header">
                    <div className="header-left">
                        <h2 className="header-title">{getPageTitle()}</h2>
                        <div
                            className="header-role-indicator"
                            style={{ borderColor: meta.accent, color: meta.accent }}
                        >
                            {meta.label}
                        </div>
                    </div>
                    <div className="header-actions">
                        <div
                            className="header-avatar"
                            style={{ background: meta.accent }}
                            title={userName}
                        >
                            {userName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>
                <main className="page-content fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
