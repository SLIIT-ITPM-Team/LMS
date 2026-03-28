import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMaterialHierarchy, uploadMaterial } from '../../api/material.api';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const MATERIAL_TYPES = ['Lecture Note', 'Past Paper', 'Model Paper', 'Short Note'];
const YEAR_OPTIONS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];
const SEMESTER_OPTIONS = ['1st Semester', '2nd Semester'];

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

const getFileError = (file) => {
  if (!file) return 'Please upload a PDF or Word document';

  const lowerName = (file.name || '').toLowerCase();
  const isAllowed = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  if (!isAllowed) return 'File must be PDF, DOC, or DOCX';

  if (file.size > MAX_FILE_SIZE) return 'File size must be 10 MB or less';

  return '';
};

const validateForm = (data) => {
  const nextErrors = {};

  if (!data.departmentId) nextErrors.departmentId = 'Department is required';
  if (!data.academicYear) nextErrors.academicYear = 'Academic year is required';
  if (!data.academicSemester) nextErrors.academicSemester = 'Academic semester is required';
  if (!data.moduleId) nextErrors.moduleId = 'Module is required';
  if (!data.moduleCode.trim()) nextErrors.moduleCode = 'Module code is required';
  if (!data.materialType.trim()) nextErrors.materialType = 'Please select a material type';
  if (!data.description.trim()) nextErrors.description = 'Description is required';

  const fileError = getFileError(data.file);
  if (fileError) nextErrors.file = fileError;

  return nextErrors;
};

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const MaterialUploadForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [hierarchy, setHierarchy] = useState({ departments: [], modules: [] });
  const [isLoadingHierarchy, setIsLoadingHierarchy] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadHierarchy = async () => {
      setIsLoadingHierarchy(true);
      try {
        const response = await getMaterialHierarchy();
        setHierarchy({
          departments: response?.data?.departments || [],
          modules: response?.data?.modules || [],
        });
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load material hierarchy');
      } finally {
        setIsLoadingHierarchy(false);
      }
    };

    loadHierarchy();
  }, [isOpen]);

  const filteredModules = useMemo(() => {
    return (hierarchy.modules || []).filter((module) => {
      const departmentMatch = !formData.departmentId || String(getModuleDepartmentId(module)) === String(formData.departmentId);
      const yearMatch = !formData.academicYear || !module.academicYear || module.academicYear === formData.academicYear;
      const semesterMatch = !formData.academicSemester || !module.academicSemester || module.academicSemester === formData.academicSemester;
      return departmentMatch && yearMatch && semesterMatch;
    });
  }, [hierarchy.modules, formData.departmentId, formData.academicYear, formData.academicSemester]);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
    setHasTriedSubmit(false);
    setShowLeaveConfirm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const isFormDirty = () => Object.values(formData).some((value) => Boolean(value));

  const requestClose = () => {
    if (isSubmitting) return;
    if (isFormDirty()) {
      setShowLeaveConfirm(true);
      return;
    }
    handleClose();
  };

  const handleFieldChange = (field, value) => {
    setFormData((previous) => {
      let nextData = { ...previous, [field]: value };

      if (field === 'departmentId' || field === 'academicYear' || field === 'academicSemester') {
        nextData = { ...nextData, moduleId: '', moduleCode: '' };
      }

      if (field === 'moduleId') {
        const selected = filteredModules.find((module) => String(module._id) === String(value));
        nextData.moduleCode = selected?.code || '';
      }

      if (hasTriedSubmit) {
        const nextErrors = validateForm(nextData);
        setErrors((previousErrors) => ({ ...previousErrors, [field]: nextErrors[field] || '' }));
      }

      return nextData;
    });
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    setFormData((previous) => ({ ...previous, file: selectedFile }));

    if (hasTriedSubmit || selectedFile) {
      setErrors((previous) => ({ ...previous, file: getFileError(selectedFile) }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setHasTriedSubmit(true);

    const nextErrors = validateForm(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      const payload = new FormData();
      payload.append('departmentId', formData.departmentId);
      payload.append('academicYear', formData.academicYear);
      payload.append('academicSemester', formData.academicSemester);
      payload.append('moduleId', formData.moduleId);
      payload.append('moduleCode', formData.moduleCode);
      payload.append('materialType', formData.materialType);
      payload.append('description', formData.description);
      payload.append('title', `${formData.moduleCode} ${formData.materialType}`);
      payload.append('file', formData.file);

      await uploadMaterial(payload);
      toast.success('Material submitted to admin for review');
      handleClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to submit material');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldInputClass =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition hover:border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/25';

  const fieldLabelClass = 'text-sm font-semibold text-slate-700';
  const errorClass = 'mt-1 min-h-[1.25rem] text-sm text-rose-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl">
        <div className="shrink-0 border-b border-slate-100 px-6 py-5 md:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-700">Study Hub</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Submit Material</h2>
              <p className="mt-1 text-sm text-slate-600">Submissions are sent to admins for review before publishing.</p>
            </div>
            <button
              type="button"
              onClick={requestClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
              aria-label="Close material form"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 md:px-7">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={fieldLabelClass}>Department <span className="text-rose-500">*</span></label>
                <select
                  value={formData.departmentId}
                  onChange={(event) => handleFieldChange('departmentId', event.target.value)}
                  className={fieldInputClass}
                  disabled={isLoadingHierarchy}
                >
                  <option value="">Select department</option>
                  {hierarchy.departments.map((department) => (
                    <option key={department._id} value={department._id}>{department.name}</option>
                  ))}
                </select>
                <p className={errorClass}>{errors.departmentId || ''}</p>
              </div>

              <div>
                <label className={fieldLabelClass}>Academic Year <span className="text-rose-500">*</span></label>
                <select
                  value={formData.academicYear}
                  onChange={(event) => handleFieldChange('academicYear', event.target.value)}
                  className={fieldInputClass}
                >
                  <option value="">Select academic year</option>
                  {YEAR_OPTIONS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <p className={errorClass}>{errors.academicYear || ''}</p>
              </div>

              <div>
                <label className={fieldLabelClass}>Academic Semester <span className="text-rose-500">*</span></label>
                <select
                  value={formData.academicSemester}
                  onChange={(event) => handleFieldChange('academicSemester', event.target.value)}
                  className={fieldInputClass}
                >
                  <option value="">Select semester</option>
                  {SEMESTER_OPTIONS.map((semester) => (
                    <option key={semester} value={semester}>{semester}</option>
                  ))}
                </select>
                <p className={errorClass}>{errors.academicSemester || ''}</p>
              </div>

              <div>
                <label className={fieldLabelClass}>Module <span className="text-rose-500">*</span></label>
                <select
                  value={formData.moduleId}
                  onChange={(event) => handleFieldChange('moduleId', event.target.value)}
                  className={fieldInputClass}
                  disabled={!formData.departmentId}
                >
                  <option value="">Select module</option>
                  {filteredModules.map((module) => (
                    <option key={module._id} value={module._id}>{module.code} - {module.name}</option>
                  ))}
                </select>
                <p className={errorClass}>{errors.moduleId || ''}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className={fieldLabelClass}>Module Code <span className="text-rose-500">*</span></label>
                <input
                  value={formData.moduleCode}
                  onChange={(event) => handleFieldChange('moduleCode', event.target.value.toUpperCase())}
                  placeholder="e.g. IT3050"
                  className={fieldInputClass}
                />
                <p className={errorClass}>{errors.moduleCode || ''}</p>
              </div>

              <div>
                <label className={fieldLabelClass}>Material Type <span className="text-rose-500">*</span></label>
                <select
                  value={formData.materialType}
                  onChange={(event) => handleFieldChange('materialType', event.target.value)}
                  className={fieldInputClass}
                >
                  <option value="">Select material type</option>
                  {MATERIAL_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <p className={errorClass}>{errors.materialType || ''}</p>
              </div>
            </div>

            <div className="mt-5">
              <label className={fieldLabelClass}>Description <span className="text-rose-500">*</span></label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(event) => handleFieldChange('description', event.target.value)}
                placeholder="Write a short description"
                className={fieldInputClass}
              />
              <p className={errorClass}>{errors.description || ''}</p>
            </div>

            <div className="mt-5">
              <label className={fieldLabelClass}>File Upload <span className="text-rose-500">*</span></label>
              <div className="mt-2 rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-4">
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <label
                    htmlFor="material-file"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                  >
                    <Upload size={16} />
                    {formData.file ? 'Change File' : 'Choose File'}
                  </label>
                  <p className="text-sm text-slate-700">Upload PDF or Word document</p>
                </div>
                <p className="mt-2 text-xs text-slate-500">Accepted formats: PDF, DOC, DOCX | Max size: 10 MB</p>
                {formData.file ? (
                  <p className="mt-2 text-sm font-medium text-slate-700">{formData.file.name} ({formatFileSize(formData.file.size)})</p>
                ) : null}
                <input
                  ref={fileInputRef}
                  id="material-file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p className={errorClass}>{errors.file || ''}</p>
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-100 px-6 py-4 md:px-7">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={requestClose}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoadingHierarchy}
                className="rounded-xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Material'}
              </button>
            </div>
          </div>
        </form>

        {showLeaveConfirm ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-slate-900">Discard your changes?</h3>
              <p className="mt-1 text-sm text-slate-600">Your current material submission will be lost.</p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveConfirm(false)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MaterialUploadForm;
