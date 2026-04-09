import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { createModule, getDepartments, getModules } from '../../api/admin.api';

const YEAR_OPTIONS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];
const SEMESTER_OPTIONS = ['1st Semester', '2nd Semester'];

const ModuleManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterAcademicYear, setFilterAcademicYear] = useState('');
  const [filterAcademicSemester, setFilterAcademicSemester] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    department: '',
    academicYear: '',
    academicSemester: '',
  });

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      const deptList = data?.departments || [];
      setDepartments(deptList);

      if (deptList.length > 0) {
        setFormData((prev) => ({
          ...prev,
          department: prev.department || deptList[0]._id,
          academicYear: prev.academicYear || YEAR_OPTIONS[0],
          academicSemester: prev.academicSemester || SEMESTER_OPTIONS[0],
        }));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load departments');
    }
  };

  const loadModules = async (department = filterDepartment, academicYear = filterAcademicYear, academicSemester = filterAcademicSemester) => {
    try {
      setLoading(true);
      const params = {};
      if (department) params.department = department;
      if (academicYear) params.academicYear = academicYear;
      if (academicSemester) params.academicSemester = academicSemester;

      const data = await getModules(params);
      setModules(data?.modules || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load modules');
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadModules(filterDepartment, filterAcademicYear, filterAcademicSemester);
  }, [filterDepartment, filterAcademicYear, filterAcademicSemester]);

  const departmentNameMap = useMemo(() => {
    const map = new Map();
    departments.forEach((dept) => map.set(String(dept._id), dept.name));
    return map;
  }, [departments]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateModule = async (event) => {
    event.preventDefault();

    if (!formData.department) {
      toast.error('Please select a department first');
      return;
    }

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
      setFormData((prev) => ({
        ...prev,
        name: '',
        code: '',
        description: '',
      }));

      await loadModules(filterDepartment);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create module');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-1 py-2 md:px-2">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Module Management</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create modules under departments. Each module must belong to a department.
          </p>

          <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={handleCreateModule}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                required
              >
                {departments.length === 0 ? (
                  <option value="">No departments found</option>
                ) : (
                  departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Module Name *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                placeholder="e.g. Web Fundamentals"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Module Code *</label>
              <input
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                placeholder="e.g. IT101"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Academic Year *</label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                required
              >
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Academic Semester *</label>
              <select
                name="academicSemester"
                value={formData.academicSemester}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                required
              >
                {SEMESTER_OPTIONS.map((semester) => (
                  <option key={semester} value={semester}>{semester}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <input
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                placeholder="Short module description"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving || departments.length === 0}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? 'Creating...' : 'Create Module'}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Modules</h2>
            <div className="flex flex-wrap gap-2">
              <select
                value={filterDepartment}
                onChange={(event) => setFilterDepartment(event.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">All departments</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>

              <select
                value={filterAcademicYear}
                onChange={(event) => setFilterAcademicYear(event.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">All years</option>
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={filterAcademicSemester}
                onChange={(event) => setFilterAcademicSemester(event.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">All semesters</option>
                {SEMESTER_OPTIONS.map((semester) => (
                  <option key={semester} value={semester}>{semester}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : modules.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              No modules found for the selected department.
            </div>
          ) : (
            <div className="space-y-2">
              {modules.map((module) => {
                const deptName = module?.department?.name || departmentNameMap.get(String(module?.department)) || 'Unknown';

                return (
                  <div key={module._id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{module.name}</p>
                        <p className="text-xs text-slate-500">{module.description || 'No description'}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{module.code}</p>
                        <p className="text-xs text-indigo-600">{deptName}</p>
                        <p className="text-xs text-slate-500">{module.academicYear} | {module.academicSemester}</p>
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
