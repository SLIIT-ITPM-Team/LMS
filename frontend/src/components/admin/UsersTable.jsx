import React from 'react';
import { Pencil, Trash2, BookOpenCheck } from 'lucide-react';

const UsersTable = ({
  users = [],
  selected = new Set(),
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onAssign,
  onToggleStatus,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const allSelected = users.length > 0 && users.every((u) => selected.has(String(u._id)));

  const SortHeader = ({ field, label }) => (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1 font-semibold text-slate-700"
    >
      {label}
      {sortBy === field ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
    </button>
  );

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(event) => onSelectAll(event.target.checked)}
              />
            </th>
            <th className="px-4 py-3"><SortHeader field="name" label="Name" /></th>
            <th className="px-4 py-3"><SortHeader field="email" label="Email" /></th>
            <th className="px-4 py-3"><SortHeader field="role" label="Role" /></th>
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isChecked = selected.has(String(user._id));
            return (
              <tr key={user._id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(event) => onSelect(user._id, event.target.checked)}
                  />
                </td>
                <td className="px-4 py-3 text-slate-900">{user.name}</td>
                <td className="px-4 py-3 text-slate-700">{user.email}</td>
                <td className="px-4 py-3 capitalize">{user.role}</td>
                <td className="px-4 py-3">{user.department?.name || 'Unassigned'}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(user)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50"
                      onClick={() => onEdit(user)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-rose-300 p-2 text-rose-600 hover:bg-rose-50"
                      onClick={() => onDelete(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-indigo-300 p-2 text-indigo-600 hover:bg-indigo-50"
                      onClick={() => onAssign(user)}
                    >
                      <BookOpenCheck className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                No users found for the selected filters.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
