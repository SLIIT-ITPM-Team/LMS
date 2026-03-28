import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getStatistics } from '../../api/admin.api';
import useAuth from '../../hooks/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();
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
        setStats({
          totals: {
            totalUsers: Number(data?.totals?.totalUsers ?? 0),
            totalStudents: Number(data?.totals?.totalStudents ?? 0),
            totalAdmins: Number(data?.totals?.totalAdmins ?? 0),
            activeUsers: Number(data?.totals?.activeUsers ?? 0),
          },
          departmentDistribution: data?.departmentDistribution ?? [],
          recentUsers: data?.recentUsers ?? [],
        });
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Welcome back {user?.name || 'Admin'}! 🎉
        </h1>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-xl bg-white p-6 shadow-sm">
                <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-8 w-24 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-4 w-40 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="rounded-xl bg-white p-6 shadow-sm">
                <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
                <div className="mt-4 h-9 w-28 animate-pulse rounded bg-gray-200" />
                <div className="mt-4 h-4 w-56 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Page views</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {Number(stats?.totals?.totalUsers || 0).toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-green-600">
                {Number(stats?.totals?.totalUsers || 0) > 0 ? 52 : 0}% lifetime vs last month
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Visitors</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {Number(stats?.totals?.activeUsers || 0).toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-green-600">
                {Number(stats?.totals?.activeUsers || 0) > 0 ? 75 : 0}% lifetime vs last month
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">New users</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {Number(stats?.totals?.totalStudents || 0).toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-green-600">
                {Number(stats?.totals?.totalStudents || 0) > 0 ? 25 : 0}% lifetime vs last month
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800">Visitors report</h2>
              <p className="mt-2 text-sm text-green-600">
                {Number(stats?.totals?.activeUsers || 0) > 0 ? 7.5 : 0}% visitors increased compared to last month
              </p>
              <p className="mt-4 text-4xl font-bold text-gray-900">
                {`${Math.round(Number(stats?.totals?.totalUsers || 0) / 1000)}K`}
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Organic visits</span>
                  <span className="font-medium text-gray-900">
                    {`${Math.round(Number(stats?.totals?.totalUsers || 0) * 0.45)}K`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Visitors by referral</span>
                  <span className="font-medium text-gray-900">
                    {`${Math.round(Number(stats?.totals?.totalUsers || 0) * 0.55)}K`}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800">Weekly visits</h2>
              <p className="mt-4 text-3xl font-bold text-gray-900">
                ${Number(stats?.totals?.activeUsers || 0).toLocaleString()}K
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Source rate:</span>
                  <span className="font-medium text-gray-900">12.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bounce rate:</span>
                  <span className="font-medium text-gray-900">47%</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
