import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { courseApi } from '../../api/course.api';
import { getDepartments, getModules } from '../../api/admin.api';

const CourseForm = ({ course = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    departmentId: course?.moduleId?.department?._id || course?.moduleId?.department || '',
    moduleId: course?.moduleId?._id || '',
    title: course?.title || '',
    videoUrl: course?.videoUrl || '',
    manualTranscriptText: course?.transcriptText || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regenerateOptions, setRegenerateOptions] = useState({
    regenerateTranscript: false,
    regenerateSummary: false
  });
  const [modules, setModules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await getDepartments();
      const deptList = response.departments || [];
      setDepartments(deptList);

      if (!formData.departmentId && deptList.length > 0) {
        setFormData((prev) => ({ ...prev, departmentId: deptList[0]._id, moduleId: '' }));
      }
    } catch (error) {
      console.error('Fetch departments error:', error);
      toast.error('Failed to load departments');
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  useEffect(() => {
    fetchModules(formData.departmentId);
  }, [formData.departmentId]);

  const fetchModules = async (departmentId = '') => {
    try {
      setLoadingModules(true);
      const response = await getModules(departmentId ? { department: departmentId } : {});
      setModules(response.modules || []);
    } catch (error) {
      console.error('Fetch modules error:', error);
      toast.error('Failed to load modules');
      setModules([]);
    } finally {
      setLoadingModules(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'departmentId') {
      setFormData((prev) => ({
        ...prev,
        departmentId: value,
        moduleId: '',
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.moduleId) {
      toast.error('Please select a module');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a course title');
      return;
    }

    if (!validateYouTubeUrl(formData.videoUrl)) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    setIsSubmitting(true);

    try {
      if (course) {
        // Update existing course
        const response = await courseApi.updateCourse(course._id, {
          ...formData,
          ...regenerateOptions
        });
        toast.success('Course updated successfully');

        if (Array.isArray(response.warnings)) {
          response.warnings.forEach((warning) => toast.error(warning));
        }

        onSuccess(response.data);
      } else {
        // Create new course
        const response = await courseApi.createCourse(formData);
        toast.success('Course created successfully');

        if (Array.isArray(response.warnings)) {
          response.warnings.forEach((warning) => toast.error(warning));
        }

        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Course form error:', error);
      toast.error(error.message || 'Failed to save course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {course ? 'Edit Course' : 'Add New Course'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Department Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department *
          </label>
          <select
            name="departmentId"
            value={formData.departmentId}
            onChange={handleChange}
            disabled={loadingDepartments}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            required
          >
            <option value="">Select a department...</option>
            {departments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.name}
              </option>
            ))}
          </select>
          {loadingDepartments && (
            <p className="mt-1 text-sm text-gray-500">Loading departments...</p>
          )}
        </div>

        {/* Module Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Module *
          </label>
          <select
            name="moduleId"
            value={formData.moduleId}
            onChange={handleChange}
            disabled={loadingModules || !formData.departmentId}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            required
          >
            <option value="">Select a module...</option>
            {modules.map((module) => (
              <option key={module._id} value={module._id}>
                {module.code} - {module.name} ({module?.department?.name || 'Unknown'})
              </option>
            ))}
          </select>
          {loadingModules && (
            <p className="mt-1 text-sm text-gray-500">Loading modules...</p>
          )}
        </div>

        {/* Course Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter course title"
            required
          />
        </div>

        {/* YouTube URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            YouTube Video URL *
          </label>
          <input
            type="url"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="https://www.youtube.com/watch?v=..."
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter a YouTube URL to automatically extract transcript and generate summary
          </p>
        </div>

        {/* Manual Transcript Fallback */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manual Transcript {course && '(Optional)'}
          </label>
          <textarea
            name="manualTranscriptText"
            value={formData.manualTranscriptText}
            onChange={handleChange}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Paste transcript text here if the YouTube video has no captions..."
          />
          <p className="mt-1 text-sm text-gray-500">
            {course
              ? 'Update the transcript text and enable regeneration below to regenerate the summary automatically.'
              : 'If captions are unavailable, this text will be used to generate summary automatically.'}
          </p>
        </div>

        {/* Regeneration Options (for edit mode) */}
        {course && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Regeneration Options</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={regenerateOptions.regenerateTranscript}
                  onChange={(e) => setRegenerateOptions(prev => ({
                    ...prev,
                    regenerateTranscript: e.target.checked
                  }))}
                  className="mr-2 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Regenerate transcript from video</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={regenerateOptions.regenerateSummary}
                  onChange={(e) => setRegenerateOptions(prev => ({
                    ...prev,
                    regenerateSummary: e.target.checked
                  }))}
                  className="mr-2 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Regenerate summary from transcript</span>
              </label>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {course ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              course ? 'Update Course' : 'Create Course'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;