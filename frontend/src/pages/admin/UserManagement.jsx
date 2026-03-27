import React, { useEffect, useMemo, useState } from 'react';
import { Download, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  assignModule,
  createUser,
  deleteUser,
  getAllUsers,
  getDepartments,
  getModules,
  updateUser,
} from '../../api/admin.api';
import UsersTable from '../../components/admin/UsersTable';
import UserModal from '../../components/admin/UserModal';
import AssignModuleModal from '../../components/admin/AssignModuleModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [modules, setModules] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const av = String(a?.[sortBy] ?? '').toLowerCase();
      const bv = String(b?.[sortBy] ?? '').toLowerCase();
      if (av === bv) return 0;
      if (sortOrder === 'asc') return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });
  }, [users, sortBy, sortOrder]);

  const loadDependencies = async () => {
    try {
      const [deptRes, moduleRes] = await Promise.all([getDepartments(), getModules()]);
      setDepartments(deptRes.departments || []);
      setModules(moduleRes.modules || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load filters');
    }
  };

  const loadUsers = async (targetPage = pagination.page) => {
    setLoading(true);
    try {
      const data = await getAllUsers({
        q: query || undefined,
        role: roleFilter || undefined,
        department: departmentFilter || undefined,
        active: statusFilter || undefined,
        page: targetPage,
        limit: pagination.limit,
      });

      setUsers(data.users || []);
      setPagination(data.pagination || pagination);
      setSelected(new Set());
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDependencies();
    loadUsers(1);
  }, []);

  const handleSelect = (id, checked) => {
    const key = String(id);
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const handleSelectAll = (checked) => {
    if (!checked) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(users.map((u) => String(u._id))));
  };

  const handleSaveUser = async (payload) => {
    setSaving(true);
    try {
      if (editingUser?._id) {
        await updateUser(editingUser._id, payload);
        toast.success('User updated successfully');
      } else {
        await createUser(payload);
        toast.success('User created successfully');
      }
      setIsUserModalOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name}?`)) return;
    try {
      await deleteUser(user._id, false);
      toast.success('User deactivated successfully');
      await loadUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleBulkDeactivate = async () => {
    if (selected.size === 0) {
      toast.error('Select at least one user');
      return;
    }

    try {
      await Promise.all(Array.from(selected).map((id) => deleteUser(id, false)));
      toast.success('Selected users deactivated');
      await loadUsers();
    } catch {
      toast.error('Bulk action failed');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await updateUser(user._id, { isActive: !user.isActive });
      toast.success('Status updated');
      await loadUsers();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleAssignModules = async (moduleIds) => {
    if (!assignTarget) return;
    setSaving(true);
    try {
      await assignModule(assignTarget._id, moduleIds);
      toast.success('Modules assigned successfully');
      setIsAssignOpen(false);
      setAssignTarget(null);
      await loadUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to assign modules');
    } finally {
      setSaving(false);
    }
  };

  const handleSort = (field) => {
    setSortBy(field);
    setSortOrder((prev) => (sortBy === field && prev === 'asc' ? 'desc' : 'asc'));
  };

  const exportCsv = () => {
    const lines = [
      ['Name', 'Email', 'Role', 'Department', 'Status'].join(','),
      ...sortedUsers.map((user) => [
        user.name,
        user.email,
        user.role,
        user.department?.name || 'Unassigned',
        user.isActive ? 'Active' : 'Inactive',
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-1 py-2 md:px-2">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingUser(null);
                setIsUserModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> Add User
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or email"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            >
              <option value="">All roles</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            >
              <option value="">All departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            >
              <option value="">All status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadUsers(1)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <RefreshCw className="h-4 w-4" /> Apply Filters
            </button>
            <button
              type="button"
              onClick={handleBulkDeactivate}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-300 px-3 py-2 text-sm text-rose-700"
            >
              <Trash2 className="h-4 w-4" /> Bulk Deactivate ({selected.size})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : (
          <UsersTable
            users={sortedUsers}
            selected={selected}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onEdit={(user) => {
              setEditingUser(user);
              setIsUserModalOpen(true);
            }}
            onDelete={handleDelete}
            onAssign={(user) => {
              setAssignTarget(user);
              setIsAssignOpen(true);
            }}
            onToggleStatus={handleToggleStatus}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        )}

        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
          <p className="text-slate-600">Page {pagination.page} of {Math.max(1, pagination.totalPages)}</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => loadUsers(pagination.page - 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadUsers(pagination.page + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <UserModal
        open={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleSaveUser}
        loading={saving}
        initialData={editingUser}
        departments={departments}
      />

      <AssignModuleModal
        open={isAssignOpen}
        onClose={() => {
          setIsAssignOpen(false);
          setAssignTarget(null);
        }}
        onSubmit={handleAssignModules}
        loading={saving}
        modules={modules}
        assignedModules={assignTarget?.assignedModules || []}
      />
    </div>
  );
};

export default UserManagement;
