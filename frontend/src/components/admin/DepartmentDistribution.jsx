import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#4F46E5', '#6366F1', '#7C3AED', '#0EA5E9', '#10B981', '#F97316', '#EF4444'];

const DepartmentDistribution = ({ data = [] }) => {
  const total = data.reduce((sum, item) => sum + Number(item.count || 0), 0);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_14px_36px_-24px_rgba(15,23,42,0.45)] backdrop-blur">
      <h3 className="text-[1.05rem] font-semibold text-slate-900">User Distribution by Department</h3>

      {data.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
          No department data available.
        </div>
      ) : (
        <div className="mt-3 grid gap-4 xl:grid-cols-[1fr_210px]">
          <div className="h-64 rounded-2xl bg-slate-50/80 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="count" nameKey="department" outerRadius={95} innerRadius={52} stroke="rgba(255,255,255,0.8)" strokeWidth={2}>
                  {data.map((entry, index) => (
                    <Cell key={entry.department || index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 rounded-2xl bg-slate-50/80 p-3">
            {data.map((item, index) => {
              const count = Number(item.count || 0);
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={item.department || index} className="rounded-lg bg-white px-3 py-2 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <p className="truncate text-sm font-medium text-slate-700">{item.department || 'Unassigned'}</p>
                    </div>
                    <p className="text-xs font-semibold text-slate-500">{percentage}%</p>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{count} users</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-slate-500">
        Total users in chart: <span className="font-semibold text-slate-700">{total}</span>
      </div>
    </div>
  );
};

export default DepartmentDistribution;
