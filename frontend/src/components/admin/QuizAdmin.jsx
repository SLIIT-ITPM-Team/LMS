import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../api/axios';

const QuizAdmin = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', summary: '' });
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/quiz');
      setQuizzes(response.data?.quizzes || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz._id);
    setEditFormData({ title: quiz.title, summary: quiz.summary });
    setExpandedQuiz(quiz._id);
  };

  const handleSaveEdit = async () => {
    if (!editFormData.title.trim()) {
      toast.error('Quiz title is required');
      return;
    }

    try {
      await api.put(`/api/quiz/${editingQuiz}`, editFormData);
      toast.success('Quiz updated successfully');
      setEditingQuiz(null);
      loadQuizzes();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update quiz');
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(quizId);
      await api.delete(`/api/quiz/${quizId}`);
      toast.success('Quiz deleted successfully');
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
      if (expandedQuiz === quizId) {
        setExpandedQuiz(null);
      }
      if (editingQuiz === quizId) {
        setEditingQuiz(null);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete quiz');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quiz Management</h1>
        <p className="mt-2 text-sm text-gray-600">View, edit, and manage all quizzes with attempt statistics.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="rounded-lg bg-white p-4 shadow-sm animate-pulse">
              <div className="h-6 w-40 bg-gray-200 rounded" />
              <div className="mt-3 h-4 w-32 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">No quizzes found yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Quiz Title</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Questions</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Attempts</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Passed</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Pass Rate</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Created</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <React.Fragment key={quiz._id}>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button
                        className="flex items-center gap-2 font-medium text-indigo-600 hover:text-indigo-700"
                        onClick={() => setExpandedQuiz(expandedQuiz === quiz._id ? null : quiz._id)}
                      >
                        {expandedQuiz === quiz._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {quiz.title}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{quiz.questionCount || 0}</td>
                    <td className="px-4 py-3 text-gray-700">{quiz.totalAttempts || 0}</td>
                    <td className="px-4 py-3 text-emerald-700 font-medium">{quiz.totalPasses || 0}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {quiz.totalAttempts > 0
                        ? `${Math.round((quiz.totalPasses / quiz.totalAttempts) * 100)}%`
                        : '0%'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{new Date(quiz.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(quiz)}
                          className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(quiz._id)}
                          disabled={deletingId === quiz._id}
                          className="inline-flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletingId === quiz._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedQuiz === quiz._id && (
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <td colSpan="7" className="px-4 py-4">
                        {editingQuiz === quiz._id ? (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">Edit Quiz</h4>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                              <input
                                type="text"
                                value={editFormData.title}
                                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                              <textarea
                                value={editFormData.summary}
                                onChange={(e) => setEditFormData({ ...editFormData, summary: e.target.value })}
                                rows="4"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveEdit}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingQuiz(null)}
                                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-600">Created</p>
                                <p className="text-gray-900">{new Date(quiz.createdAt).toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                                <p className="text-gray-900">{new Date(quiz.updatedAt).toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                                <p className="text-gray-900">{quiz.questionCount || 0}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                                <p className="text-emerald-700 font-semibold">
                                  {quiz.totalAttempts > 0
                                    ? `${Math.round((quiz.totalPasses / quiz.totalAttempts) * 100)}%`
                                    : 'N/A'}
                                </p>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-2">Summary</p>
                              <p className="text-sm text-gray-700 leading-relaxed">{quiz.summary}</p>
                            </div>

                            {quiz.questions && quiz.questions.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">Questions Preview</p>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {quiz.questions.slice(0, 5).map((q, idx) => (
                                    <div key={idx} className="rounded bg-white p-2 border border-gray-200 text-sm">
                                      <p className="font-medium text-gray-800">Q{idx + 1}: {q.questionText}</p>
                                      <div className="mt-1 pl-4 space-y-1">
                                        {q.options.map((opt, optIdx) => (
                                          <p key={optIdx} className={`text-xs ${opt.isCorrect ? 'text-emerald-700 font-semibold' : 'text-gray-600'}`}>
                                            • {opt.text}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                  {quiz.questions.length > 5 && (
                                    <p className="text-xs text-gray-500 text-center py-2">
                                      +{quiz.questions.length - 5} more questions
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuizAdmin;
