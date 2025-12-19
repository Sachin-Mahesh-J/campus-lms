import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (user?.role === 'ADMIN') {
      return [
        { to: '/admin', label: 'Dashboard' },
        { to: '/users', label: 'Users' },
        { to: '/courses', label: 'Courses' },
        { to: '/batches', label: 'Batches' },
        { to: '/enrollments', label: 'Enrollments' },
        { to: '/notifications', label: 'Notifications' },
        { to: '/attendance', label: 'Attendance' },
        { to: '/reports', label: 'Reports' },
      ];
    }
    if (user?.role === 'TEACHER') {
      return [
        { to: '/teacher', label: 'Dashboard' },
        { to: '/courses', label: 'Courses' },
        { to: '/batches', label: 'Batches' },
        { to: '/assignments', label: 'Assignments' },
        { to: '/sessions', label: 'Sessions' },
        { to: '/attendance', label: 'Attendance' },
        { to: '/materials', label: 'Materials' },
        { to: '/grades', label: 'Grades' },
        { to: '/reports', label: 'Reports' },
        { to: '/notifications', label: 'Notifications' },
      ];
    }
    if (user?.role === 'STUDENT') {
      return [
        { to: '/student', label: 'Dashboard' },
        { to: '/assignments', label: 'Assignments' },
        { to: '/submissions', label: 'My Submissions' },
        { to: '/materials', label: 'Materials' },
        { to: '/notifications', label: 'Notifications' },
      ];
    }
    return [];
  };

  return (
    <div className="ui-page">
      <header className="ui-container pt-8">
        <div className="ui-card ui-card-pad">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand text-white flex items-center justify-center shadow-cardLight">
                  <span className="text-sm font-bold">CL</span>
                </div>
                <div className="leading-tight">
                  <div className="text-h2 font-semibold text-textPrimary">Campus LMS</div>
                  <div className="ui-caption">
                    {user?.role ? (
                      <span className="ui-pill">
                        <span className="h-2 w-2 rounded-full bg-accentYellow" />
                        {user.role.toLowerCase()}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>

              <div className="flex items-center gap-2 lg:hidden">
                <span className="ui-caption">{user?.fullName}</span>
                <button onClick={handleLogout} className="ui-btn-secondary ui-btn-sm">
                  Logout
                </button>
              </div>
            </div>

            <nav className="flex items-center gap-2 overflow-x-auto pb-1">
              {getNavLinks().map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    [
                      'ui-btn ui-btn-sm whitespace-nowrap',
                      isActive ? 'bg-brandSoft text-textPrimary' : 'ui-btn-ghost',
                    ].join(' ')
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <span className="ui-muted">{user?.fullName}</span>
              <button onClick={handleLogout} className="ui-btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="ui-container py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

