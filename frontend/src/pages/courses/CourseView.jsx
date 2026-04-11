import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { courseApi } from '../../api/course.api';
import EnhancedVideoPlayer from '../../components/courses/EnhancedVideoPlayer';
import SummaryViewer from '../../components/courses/SummaryViewer';
import { useAuthContext } from '../../context/AuthContext';

const CourseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('video');

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getCourseById(id);
      setCourse(response.data);
    } catch (error) {
      console.error('Fetch course error:', error);
      toast.error('Failed to load course');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoEnd = () => {
    toast.success('Video completed! Consider taking the quiz to test your knowledge.');
  };

  const handleDownloadComplete = () => {
    // Optional: Track download analytics or show success message
  };

  const departmentName =
    typeof course?.moduleId?.department === 'string'
      ? course?.moduleId?.department
      : course?.moduleId?.department?.name || 'Unknown';

  const moduleName = course?.moduleId?.name || 'Unknown';
  const moduleCode = course?.moduleId?.code || 'N/A';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h1>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-1">
                Module: {moduleName} • 
                Department: {departmentName}
              </p>
            </div>
            <div className="flex space-x-3">
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate(`/admin/courses/edit/${course._id}`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Edit Course
                </button>
              )}
              <button
                onClick={() => navigate('/courses')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Back to Courses
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('video')}
                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'video'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Video Player
                  </button>
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'summary'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setActiveTab('transcript')}
                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'transcript'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Transcript
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'video' && (
                <EnhancedVideoPlayer
                  videoUrl={course.videoUrl}
                  title={course.title}
                  onVideoEnd={handleVideoEnd}
                />
              )}

              {activeTab === 'summary' && (
                <SummaryViewer
                  course={course}
                  onDownloadComplete={handleDownloadComplete}
                />
              )}

              {activeTab === 'transcript' && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Transcript</h2>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="prose prose-indigo max-w-none">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {course.transcriptText || 'No transcript available. This course may not have been processed yet.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <span>Word count: {course.transcriptText?.split(/\s+/).length || 0}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Course Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Module Code:</span>
                  <p className="text-gray-900">{moduleCode}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Department:</span>
                  <p className="text-gray-900">{departmentName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Created:</span>
                  <p className="text-gray-900">{new Date(course.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Updated:</span>
                  <p className="text-gray-900">{new Date(course.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                {user?.role === 'admin' && (
                  <>
                    <button
                      onClick={() => navigate(`/admin/courses/edit/${course._id}`)}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Edit Course
                    </button>
                    <button
                      onClick={() => navigate(`/admin/courses/regenerate/${course._id}`)}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Regenerate Summary
                    </button>
                  </>
                )}
                {course.summaryPdfUrl && (
                  <button
                    onClick={() => window.open(course.summaryPdfUrl, '_blank')}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    View PDF Summary
                  </button>
                )}
                {course.summaryText ? (
                  <button
                    onClick={() =>
                      navigate('/quizzes', {
                        state: {
                          summary: course.summaryText,
                          courseTitle: course.title,
                        },
                      })
                    }
                    className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold rounded-md hover:opacity-90 transition"
                  >
                    Attempt Quiz
                  </button>
                ) : (
                  <button
                    disabled
                    title="No summary available to generate a quiz"
                    className="w-full px-4 py-2 bg-gray-200 text-gray-400 font-semibold rounded-md cursor-not-allowed"
                  >
                    Attempt Quiz
                  </button>
                )}
              </div>
            </div>

            {/* Related Materials */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Materials</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Check the materials section for additional resources related to this module.
                </p>
                <button
                  onClick={() => navigate('/materials')}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  View Materials
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;