import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
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
        { to: '/materials', label: 'Materials' },
        { to: '/grades', label: 'Grades' },
        { to: '/reports', label: 'Reports' },
      ];
    }
    if (user?.role === 'STUDENT') {
      return [
        { to: '/student', label: 'Dashboard' },
        { to: '/assignments', label: 'Assignments' },
        { to: '/submissions', label: 'My Submissions' },
        { to: '/materials', label: 'Materials' },
      ];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">Campus LMS</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {getNavLinks().map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">{user?.fullName}</span>
              <button
                onClick={handleLogout}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

