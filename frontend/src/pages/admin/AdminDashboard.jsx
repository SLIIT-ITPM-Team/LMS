import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, UserCheck, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { getStatistics } from '../../api/admin.api';
import StatCard from '../../components/admin/StatCard';
import DepartmentDistribution from '../../components/admin/DepartmentDistribution';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totals: {
      totalUsers: 0,
      totalStudents: 0,
      totalAdmins: 0,
      activeUsers: 0,
    },
    departmentDistribution: [],
    recentUsers: [],
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getStatistics();
        setStats(data);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-24 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-lg">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-indigo-100">Overview of platform activity and user distribution.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/admin/users" className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium hover:bg-white/30">
              Manage Users
            </Link>
            <Link to="/admin/departments" className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium hover:bg-white/30">
              Departments
            </Link>
            <Link to="/admin/reports" className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium hover:bg-white/30">
              Reports
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Users" value={stats.totals.totalUsers} icon={Users} color="indigo" />
          <StatCard title="Students" value={stats.totals.totalStudents} icon={UserCheck} color="violet" />
          <StatCard title="Admins" value={stats.totals.totalAdmins} icon={Shield} color="orange" />
          <StatCard title="Active Sessions" value={stats.totals.activeUsers} icon={Activity} color="emerald" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <DepartmentDistribution data={stats.departmentDistribution} />

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Recent Users</h3>
            {loading ? (
              <div className="mt-4 space-y-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-9 animate-pulse rounded-md bg-slate-100" />
                ))}
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {stats.recentUsers.map((user) => (
                  <div key={user._id} className="rounded-lg border border-slate-100 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-800">{user.name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${user.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {user.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
