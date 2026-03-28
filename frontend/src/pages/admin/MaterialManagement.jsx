import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  getMaterialHierarchy,
  getPendingMaterials,
  reviewMaterial,
  uploadMaterial,
} from '../../api/material.api';

const YEAR_OPTIONS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];
const SEMESTER_OPTIONS = ['1st Semester', '2nd Semester'];
const MATERIAL_TYPES = ['Lecture Note', 'Past Paper', 'Model Paper', 'Short Note'];

const initialFormState = {
  departmentId: '',
  academicYear: '',
  academicSemester: '',
  moduleId: '',
  moduleCode: '',
  materialType: '',
  description: '',
  file: null,
};

const getModuleDepartmentId = (module) => {
  if (!module) return '';
  return module?.department?._id || module?.department || '';
};

const MaterialManagement = () => {
  const [pendingMaterials, setPendingMaterials] = useState([]);
  const [hierarchy, setHierarchy] = useState({ departments: [], modules: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [reviewNoteById, setReviewNoteById] = useState({});
  const [savingReviewId, setSavingReviewId] = useState('');
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [pendingResponse, hierarchyResponse] = await Promise.all([
        getPendingMaterials(),
        getMaterialHierarchy(),
      ]);

      setPendingMaterials(pendingResponse?.data || []);
      setHierarchy({
        departments: hierarchyResponse?.data?.departments || [],
        modules: hierarchyResponse?.data?.modules || [],
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load materials data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredModules = useMemo(() => {
    return (hierarchy.modules || []).filter((module) => {
      const departmentMatch = !formData.departmentId || String(getModuleDepartmentId(module)) === String(formData.departmentId);
      const yearMatch = !formData.academicYear || !module.academicYear || module.academicYear === formData.academicYear;
      const semesterMatch = !formData.academicSemester || !module.academicSemester || module.academicSemester === formData.academicSemester;
      return departmentMatch && yearMatch && semesterMatch;
    });
  }, [hierarchy.modules, formData.departmentId, formData.academicYear, formData.academicSemester]);

  const handleReview = async (materialId, action) => {
    try {
      setSavingReviewId(materialId);
      await reviewMaterial(materialId, {
        action,
        reviewNote: reviewNoteById[materialId] || '',
      });

      toast.success(action === 'approve' ? 'Material approved' : 'Material rejected');
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to review material');
    } finally {
      setSavingReviewId('');
    }
  };

  const handleChange = (name, value) => {
    setFormData((previous) => {
      const next = { ...previous, [name]: value };
      if (name === 'departmentId' || name === 'academicYear' || name === 'academicSemester') {
        next.moduleId = '';
        next.moduleCode = '';
      }
      if (name === 'moduleId') {
        const selected = filteredModules.find((module) => String(module._id) === String(value));
        next.moduleCode = selected?.code || '';
      }
      return next;
    });
  };

  const handleCreateMaterial = async (event) => {
    event.preventDefault();

    if (
      !formData.departmentId ||
      !formData.academicYear ||
      !formData.academicSemester ||
      !formData.moduleId ||
      !formData.moduleCode ||
      !formData.materialType ||
      !formData.file
    ) {
      toast.error('Please fill all required fields including file upload');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = new FormData();
      payload.append('departmentId', formData.departmentId);
      payload.append('academicYear', formData.academicYear);
      payload.append('academicSemester', formData.academicSemester);
      payload.append('moduleId', formData.moduleId);
      payload.append('moduleCode', formData.moduleCode);
      payload.append('materialType', formData.materialType);
      payload.append('description', formData.description || '');
      payload.append('title', `${formData.moduleCode} ${formData.materialType}`);
      payload.append('file', formData.file);

      await uploadMaterial(payload);
      toast.success('Material uploaded and published');
      setFormData(initialFormState);
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to upload material');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Material Management</h1>
        <p className="mt-1 text-sm text-slate-600">Review student submissions and publish approved materials.</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            activeTab === 'pending' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Pending Review
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('add')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            activeTab === 'add' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Add Material
        </button>
      </div>

      {activeTab === 'pending' ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading pending materials...</p>
          ) : pendingMaterials.length === 0 ? (
            <p className="text-sm text-slate-500">No pending materials.</p>
          ) : (
            <div className="space-y-4">
              {pendingMaterials.map((material) => (
                <div key={material._id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{material.title}</p>
                      <p className="text-xs text-slate-500">{material.moduleCode} | {material.academicYear} | {material.academicSemester}</p>
                      <p className="mt-1 text-sm text-slate-600">{material.description || 'No description'}</p>
                      <p className="mt-1 text-xs text-slate-500">Submitted by {material?.uploadedBy?.name || 'Unknown user'}</p>
                    </div>

                    <div className="w-full max-w-xs space-y-2">
                      <textarea
                        rows={2}
                        placeholder="Review note (optional)"
                        value={reviewNoteById[material._id] || ''}
                        onChange={(event) =>
                          setReviewNoteById((previous) => ({
                            ...previous,
                            [material._id]: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleReview(material._id, 'approve')}
                          disabled={savingReviewId === material._id}
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReview(material._id, 'reject')}
                          disabled={savingReviewId === material._id}
                          className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleCreateMaterial} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Department *</label>
              <select
                value={formData.departmentId}
                onChange={(event) => handleChange('departmentId', event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Select department</option>
                {hierarchy.departments.map((department) => (
                  <option key={department._id} value={department._id}>{department.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Academic Year *</label>
              <select
                value={formData.academicYear}
                onChange={(event) => handleChange('academicYear', event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Select year</option>
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Academic Semester *</label>
              <select
                value={formData.academicSemester}
                onChange={(event) => handleChange('academicSemester', event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Select semester</option>
                {SEMESTER_OPTIONS.map((semester) => (
                  <option key={semester} value={semester}>{semester}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Module *</label>
              <select
                value={formData.moduleId}
                onChange={(event) => handleChange('moduleId', event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Select module</option>
                {filteredModules.map((module) => (
                  <option key={module._id} value={module._id}>{module.code} - {module.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Module Code *</label>
              <input
                value={formData.moduleCode}
                onChange={(event) => handleChange('moduleCode', event.target.value.toUpperCase())}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Material Type *</label>
              <select
                value={formData.materialType}
                onChange={(event) => handleChange('materialType', event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Select material type</option>
                {MATERIAL_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(event) => handleChange('description', event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">File *</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) => handleChange('file', event.target.files?.[0] || null)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {isSubmitting ? 'Uploading...' : 'Upload & Publish'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default MaterialManagement;
