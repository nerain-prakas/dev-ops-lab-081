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

    const userRole = localStorage.getItem('userRole') || 'ADMIN';

    // Filter nav items conditionally based on role
    const filteredNavItems = navItems.map(section => {
        let items = section.items;
        
        if (userRole === 'STUDENT') {
            const allowed = ['/', '/courses', '/enrollments', '/reservations', '/payments'];
            items = items.filter(item => allowed.includes(item.to));
        } else if (userRole === 'INSTRUCTOR') {
            const allowed = ['/', '/courses', '/enrollments'];
            items = items.filter(item => allowed.includes(item.to));
        }
        
        return { ...section, items };
    }).filter(section => section.items.length > 0);

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">C</div>
                    <div className="sidebar-logo-text">
                        CourseHub
                        <span>{userRole === 'STUDENT' ? 'Student Portal' : userRole === 'INSTRUCTOR' ? 'Instructor Portal' : 'Admin Panel'}</span>
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

            {/* Main content */}
            <div className="main-area">
                <header className="header">
                    <h2 className="header-title">{getPageTitle()}</h2>
                    <div className="header-actions">
                        <span className="badge" style={{marginRight: '15px'}}>{userRole}</span>
                        <NavLink to="/login" className="btn btn-sm btn-secondary" onClick={() => localStorage.removeItem('userRole')}>
                            {userRole !== 'ADMIN' ? '🔄 Switch Role' : '🔐 Logout'}
                        </NavLink>
                        <div className="header-avatar">{userRole.charAt(0)}</div>
                    </div>
                </header>
                <main className="page-content fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
