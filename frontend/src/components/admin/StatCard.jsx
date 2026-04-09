import React from 'react';
import CountUp from 'react-countup';

const StatCard = ({ title, value, icon: Icon, color = 'indigo' }) => {
  const colorMap = {
    indigo: {
      chip: 'bg-indigo-500 text-white',
      soft: 'bg-indigo-50 text-indigo-700',
    },
    violet: {
      chip: 'bg-violet-500 text-white',
      soft: 'bg-violet-50 text-violet-700',
    },
    emerald: {
      chip: 'bg-emerald-500 text-white',
      soft: 'bg-emerald-50 text-emerald-700',
    },
    orange: {
      chip: 'bg-orange-500 text-white',
      soft: 'bg-orange-50 text-orange-700',
    },
  };

  const selected = colorMap[color] || colorMap.indigo;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_14px_36px_-24px_rgba(15,23,42,0.45)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-24px_rgba(79,70,229,0.4)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-200/0 via-slate-200 to-slate-200/0" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-[2rem] font-bold leading-none text-slate-900">
            <CountUp end={Number(value || 0)} duration={1.1} separator="," />
          </h3>
        </div>
        <div className={`rounded-xl p-2.5 shadow-sm ${selected.chip}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${selected.soft}`}>Live metric</span>
      </div>
    </div>
  );
};

export default StatCard;
