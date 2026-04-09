import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { createDepartment, getDepartments } from '../../api/admin.api';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data.departments || []);
    } catch {
      toast.error('Failed to load departments');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await createDepartment({ name, description });
      toast.success('Department created');
      setName('');
      setDescription('');
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-1 py-2 md:px-2">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Department Management</h1>
          <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={handleCreate}>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Department name"
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            />
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
            >
              {loading ? 'Creating...' : 'Add Department'}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Departments</h2>
          <div className="mt-4 space-y-2">
            {departments.map((dept) => (
              <div key={dept._id} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <p className="font-medium text-slate-800">{dept.name}</p>
                <p className="text-slate-500">{dept.description || 'No description'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagement;
