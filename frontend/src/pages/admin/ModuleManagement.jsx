import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { createModule, deleteModule, getDepartments, getModules, updateModule } from '../../api/admin.api';

const YEAR_OPTIONS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];
const SEMESTER_OPTIONS = ['1st Semester', '2nd Semester'];

const EMPTY_FORM = {
  name: '',
  code: '',
  description: '',
  department: '',
  academicYear: YEAR_OPTIONS[0],
  academicSemester: SEMESTER_OPTIONS[0],
};

// ---------------------------------------------------------------------------
// Edit modal
// ---------------------------------------------------------------------------
const EditModal = ({ module, departments, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: module.name || '',
    code: module.code || '',
    description: module.description || '',
    department: module.department?._id || module.department || '',
    academicYear: module.academicYear || YEAR_OPTIONS[0],
    academicSemester: module.academicSemester || SEMESTER_OPTIONS[0],
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateModule(module._id, {
        ...form,
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
      });
      toast.success('Module updated successfully');
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update module');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Edit Module</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Department *</label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              required
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Module Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Module Code *</label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Academic Year *</label>
            <select
              name="academicYear"
              value={form.academicYear}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              required
            >
              {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Academic Semester *</label>
            <select
              name="academicSemester"
              value={form.academicSemester}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              required
            >
              {SEMESTER_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              placeholder="Short module description"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
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
const DeleteModal = ({ module, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteModule(module._id);
      toast.success('Module deleted successfully');
      onDeleted();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete module');
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
        <h2 className="text-lg font-bold text-slate-900">Delete Module</h2>
        <p className="mt-2 text-sm text-slate-600">
          Are you sure you want to delete <span className="font-semibold">{module.name}</span> ({module.code})?
          This action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
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
const ModuleManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterAcademicYear, setFilterAcademicYear] = useState('');
  const [filterAcademicSemester, setFilterAcademicSemester] = useState('');
  const [editingModule, setEditingModule] = useState(null);
  const [deletingModule, setDeletingModule] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      const deptList = data?.departments || [];
      setDepartments(deptList);
      if (deptList.length > 0) {
        setFormData((prev) => ({
          ...prev,
          department: prev.department || deptList[0]._id,
        }));
      }
    } catch {
      toast.error('Failed to load departments');
    }
  };

  const loadModules = async (dept = filterDepartment, year = filterAcademicYear, sem = filterAcademicSemester) => {
    try {
      setLoading(true);
      const params = {};
      if (dept) params.department = dept;
      if (year) params.academicYear = year;
      if (sem) params.academicSemester = sem;
      const data = await getModules(params);
      setModules(data?.modules || []);
    } catch {
      toast.error('Failed to load modules');
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDepartments(); }, []);
  useEffect(() => { loadModules(filterDepartment, filterAcademicYear, filterAcademicSemester); },
    [filterDepartment, filterAcademicYear, filterAcademicSemester]);

  const departmentNameMap = useMemo(() => {
    const map = new Map();
    departments.forEach((d) => map.set(String(d._id), d.name));
    return map;
  }, [departments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!formData.department) { toast.error('Please select a department first'); return; }
    setSaving(true);
    try {
      await createModule({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        department: formData.department,
        academicYear: formData.academicYear,
        academicSemester: formData.academicSemester,
      });
      toast.success('Module created successfully');
      setFormData((prev) => ({ ...prev, name: '', code: '', description: '' }));
      await loadModules(filterDepartment);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create module');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-1 py-2 md:px-2">
      {editingModule && (
        <EditModal
          module={editingModule}
          departments={departments}
          onClose={() => setEditingModule(null)}
          onSaved={() => { setEditingModule(null); loadModules(); }}
        />
      )}
      {deletingModule && (
        <DeleteModal
          module={deletingModule}
          onClose={() => setDeletingModule(null)}
          onDeleted={() => { setDeletingModule(null); loadModules(); }}
        />
      )}

      <div className="mx-auto max-w-6xl space-y-6">
        {/* Create form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Module Management</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create modules under departments. Each module must belong to a department.
          </p>

          <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={handleCreateModule}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Department *</label>
              <select name="department" value={formData.department} onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" required>
                {departments.length === 0
                  ? <option value="">No departments found</option>
                  : departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Module Name *</label>
              <input name="name" value={formData.name} onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                placeholder="e.g. Web Fundamentals" required />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Module Code *</label>
              <input name="code" value={formData.code} onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                placeholder="e.g. IT101" required />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Academic Year *</label>
              <select name="academicYear" value={formData.academicYear} onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" required>
                {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Academic Semester *</label>
              <select name="academicSemester" value={formData.academicSemester} onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" required>
                {SEMESTER_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <input name="description" value={formData.description} onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                placeholder="Short module description" />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button type="submit" disabled={saving || departments.length === 0}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                {saving ? 'Creating…' : 'Create Module'}
              </button>
            </div>
          </form>
        </div>

        {/* Module list */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Modules <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">{modules.length}</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
                <option value="">All departments</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
              <select value={filterAcademicYear} onChange={(e) => setFilterAcademicYear(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
                <option value="">All years</option>
                {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={filterAcademicSemester} onChange={(e) => setFilterAcademicSemester(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
                <option value="">All semesters</option>
                {SEMESTER_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : modules.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              No modules found for the selected filters.
            </div>
          ) : (
            <div className="space-y-2">
              {modules.map((mod) => {
                const deptName = mod?.department?.name || departmentNameMap.get(String(mod?.department)) || 'Unknown';
                return (
                  <div key={mod._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{mod.name}</p>
                      <p className="text-xs text-slate-500">{mod.description || 'No description'}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{mod.code}</p>
                        <p className="text-xs text-indigo-600">{deptName}</p>
                        <p className="text-xs text-slate-500">{mod.academicYear} | {mod.academicSemester}</p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => setEditingModule(mod)}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingModule(mod)}
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleManagement;
