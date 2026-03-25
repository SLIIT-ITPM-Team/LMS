import React from 'react';
import CountUp from 'react-countup';

const StatCard = ({ title, value, icon: Icon, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'from-indigo-500 to-indigo-600',
    violet: 'from-violet-500 to-violet-600',
    emerald: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            <CountUp end={Number(value || 0)} duration={1.1} separator="," />
          </h3>
        </div>
        <div className={`rounded-xl bg-gradient-to-br p-2 text-white ${colorMap[color] || colorMap.indigo}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
