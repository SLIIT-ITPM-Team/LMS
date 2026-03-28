import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Building2, FileText, Layers3, LayoutDashboard, LogOut, MessagesSquare, Users, Brain } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/courses', label: 'Course Management', icon: Layers3 },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/modules', label: 'Modules', icon: Layers3 },
  { to: '/admin/departments', label: 'Departments', icon: Building2 },
  { to: '/admin/quiz', label: 'Quiz', icon: Brain },
  { to: '/admin/community', label: 'Community', icon: MessagesSquare },
  { to: '/admin/reports', label: 'Reports', icon: FileText },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl bg-gradient-to-b from-indigo-700 to-violet-700 p-4 text-white shadow-lg lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <div className="mb-6 border-b border-white/20 pb-4">
            <p className="text-xs uppercase tracking-[0.16em] text-indigo-100">Admin Panel</p>
            <h2 className="mt-1 text-lg font-semibold">EduFlow Admin</h2>
          </div>

          <nav className="space-y-1.5">
            {adminLinks.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-50 hover:bg-white/20'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-6 rounded-xl border border-white/20 bg-white/10 p-3">
            <p className="text-xs text-indigo-100">Signed in as</p>
            <p className="mt-1 truncate text-sm font-semibold">{user?.name || 'Admin User'}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <main className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
