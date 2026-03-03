import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';

const navItems = [
    {
        section: 'Main', items: [
            { to: '/', icon: '📊', label: 'Dashboard' },
        ]
    },
    {
        section: 'Management', items: [
            { to: '/users', icon: '👥', label: 'Users' },
            { to: '/courses', icon: '📚', label: 'Courses' },
            { to: '/enrollments', icon: '📝', label: 'Enrollments' },
        ]
    },
    {
        section: 'Operations', items: [
            { to: '/reservations', icon: '🎫', label: 'Reservations' },
            { to: '/payments', icon: '💳', label: 'Payments' },
        ]
    },
];

export default function Layout() {
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Dashboard';
        const segment = path.split('/')[1];
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    };

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">C</div>
                    <div className="sidebar-logo-text">
                        CourseHub
                        <span>Management System</span>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map((section) => (
                        <div key={section.section}>
                            <div className="sidebar-section-label">{section.section}</div>
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.to === '/'}
                                    className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                                >
                                    <span className="sidebar-link-icon">{item.icon}</span>
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <div className="main-area">
                <header className="header">
                    <h2 className="header-title">{getPageTitle()}</h2>
                    <div className="header-actions">
                        <NavLink to="/login" className="btn btn-sm btn-secondary">
                            🔐 Login
                        </NavLink>
                        <div className="header-avatar">A</div>
                    </div>
                </header>
                <main className="page-content fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
