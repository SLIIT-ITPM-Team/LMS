import React, { useMemo, useState } from 'react';
import LoadingButton from '../form/LoadingButton';

const AssignModuleModal = ({ open, onClose, onSubmit, loading, modules = [], assignedModules = [] }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(new Set(assignedModules.map((m) => String(m._id || m))));

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return modules.filter((mod) => {
      return mod.name.toLowerCase().includes(q) || mod.code.toLowerCase().includes(q);
    });
  }, [modules, query]);

  if (!open) return null;

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-900/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-900">Assign Modules</h3>

        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          placeholder="Search modules by name or code"
        />

        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3">
          {filtered.map((module) => {
            const id = String(module._id);
            const checked = selected.has(id);
            return (
              <label key={module._id} className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                <span>
                  <span className="font-medium text-slate-800">{module.name}</span>
                  <span className="ml-2 text-xs text-slate-500">({module.code})</span>
                </span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(id)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
              </label>
            );
          })}
          {filtered.length === 0 ? <p className="text-sm text-slate-500">No modules found</p> : null}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            onClick={onClose}
          >
            Cancel
          </button>
          <LoadingButton
            type="button"
            loading={loading}
            className="w-auto px-5"
            onClick={() => onSubmit(Array.from(selected))}
          >
            Save Assignment
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export default AssignModuleModal;
