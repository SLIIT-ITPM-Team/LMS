import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { createDepartment, deleteDepartment, getDepartments, updateDepartment } from '../../api/admin.api';

// ---------------------------------------------------------------------------
// Edit modal
// ---------------------------------------------------------------------------
const EditModal = ({ dept, onClose, onSaved }) => {
  const [form, setForm] = useState({ name: dept.name, description: dept.description || '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await updateDepartment(dept._id, form);
      toast.success('Department updated');
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Edit Department</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Department Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              placeholder="Short description"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Delete confirmation modal
// ---------------------------------------------------------------------------
const DeleteModal = ({ dept, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDepartment(dept._id);
      toast.success('Department deleted');
      onDeleted();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900">Delete Department</h2>
        <p className="mt-2 text-sm text-slate-600">
          Are you sure you want to delete <span className="font-semibold">{dept.name}</span>? This action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deletingDept, setDeletingDept] = useState(null);

  const load = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data.departments || []);
    } catch {
      toast.error('Failed to load departments');
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createDepartment({ name, description });
      toast.success('Department created');
      setName('');
      setDescription('');
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-1 py-2 md:px-2">
      {editingDept && (
        <EditModal
          dept={editingDept}
          onClose={() => setEditingDept(null)}
          onSaved={() => { setEditingDept(null); load(); }}
        />
      )}
      {deletingDept && (
        <DeleteModal
          dept={deletingDept}
          onClose={() => setDeletingDept(null)}
          onDeleted={() => { setDeletingDept(null); load(); }}
        />
      )}

      <div className="mx-auto max-w-5xl space-y-6">
        {/* Create form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Department Management</h1>
          <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={handleCreate}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Department name"
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              required
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            />
            <button type="submit" disabled={loading}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-70">
              {loading ? 'Creating…' : 'Add Department'}
            </button>
          </form>
        </div>

        {/* Department list */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Departments
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">
              {departments.length}
            </span>
          </h2>

          <div className="mt-4 space-y-2">
            {departments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                No departments yet. Add one above.
              </div>
            ) : (
              departments.map((dept) => (
                <div key={dept._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{dept.name}</p>
                    <p className="text-xs text-slate-500">{dept.description || 'No description'}</p>
                  </div>

                  <div className="flex shrink-0 gap-1.5">
                    <button
                      onClick={() => setEditingDept(dept)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingDept(dept)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagement;
