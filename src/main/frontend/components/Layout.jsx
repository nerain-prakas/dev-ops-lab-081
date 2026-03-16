import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { clearSession, getSession } from '../lib/auth';

const navItems = [
    {
        section: 'Main', items: [
            { to: '/', icon: 'D', label: 'Dashboard' },
        ]
    },
    {
        section: 'Management', items: [
            { to: '/users', icon: 'U', label: 'Users' },
            { to: '/courses', icon: 'C', label: 'Courses' },
            { to: '/enrollments', icon: 'E', label: 'Enrollments' },
        ]
    },
    {
        section: 'Operations', items: [
            { to: '/reservations', icon: 'R', label: 'Reservations' },
            { to: '/payments', icon: 'P', label: 'Payments' },
        ]
    },
];

export default function Layout() {
    const location = useLocation();
    const session = getSession();
    const userRole = session?.role || 'admin';
    const userName = session?.user?.name || 'User';

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Dashboard';
        const segment = path.split('/')[1];
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    };

    const filteredNavItems = navItems.map(section => {
        let items = section.items;

        if (userRole === 'student') {
            const allowed = ['/', '/courses', '/enrollments', '/reservations', '/payments'];
            items = items.filter(item => allowed.includes(item.to));
        } else if (userRole === 'instructor') {
            const allowed = ['/', '/courses', '/enrollments'];
            items = items.filter(item => allowed.includes(item.to));
        }

        return { ...section, items };
    }).filter(section => section.items.length > 0);

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">C</div>
                    <div className="sidebar-logo-text">
                        CourseHub
                        <span>{userRole === 'student' ? 'Student Portal' : userRole === 'instructor' ? 'Instructor Portal' : 'Admin Panel'}</span>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    {filteredNavItems.map((section) => (
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

            <div className="main-area">
                <header className="header">
                    <h2 className="header-title">{getPageTitle()}</h2>
                    <div className="header-actions">
                        <span className="badge" style={{ marginRight: '15px' }}>{userRole.toUpperCase()}</span>
                        <NavLink to="/login" className="btn btn-sm btn-secondary" onClick={clearSession}>
                            Logout
                        </NavLink>
                        <div className="header-avatar">{userName.charAt(0).toUpperCase()}</div>
                    </div>
                </header>
                <main className="page-content fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
