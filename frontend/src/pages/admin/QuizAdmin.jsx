import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Edit2, ChevronDown, ChevronUp, RefreshCw, BarChart2, Library, CheckCircle, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 min-h-screen pb-12"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-sm backdrop-blur-md md:p-8 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg">
            <Library className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              Quiz Management
            </h1>
            <p className="mt-1.5 text-sm font-medium text-slate-600 max-w-xl">
              Take complete control over your quiz repertoire. View advanced attempt statistics, meticulously edit content, or remove outdated material.
            </p>
          </div>
        </div>
        
        <div className="relative z-10">
          <button
            onClick={loadQuizzes}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 transition-all hover:bg-slate-50 hover:shadow disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="rounded-2xl border border-white/60 bg-white/40 p-6 shadow-sm backdrop-blur-sm animate-pulse">
              <div className="h-6 w-1/3 bg-slate-200 rounded-lg" />
              <div className="mt-4 flex gap-4">
                 <div className="h-4 w-24 bg-slate-200 rounded-md" />
                 <div className="h-4 w-24 bg-slate-200 rounded-md" />
                 <div className="h-4 w-24 bg-slate-200 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white/50 p-16 text-center shadow-sm backdrop-blur-sm"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 mb-6 border border-slate-200 shadow-inner">
            <Library className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No Quizzes Found</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            Your evaluation pool is currently empty. Start by creating a new quiz from the learning module generator to populate this dashboard.
          </p>
        </motion.div>
      ) : (
        <div className="rounded-[2rem] border border-white/60 bg-white/60 shadow-xl backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/50">
                  <th className="px-6 py-5 font-bold text-slate-700 w-1/3 uppercase tracking-wider text-xs">Quiz Title</th>
                  <th className="px-5 py-5 font-bold text-slate-700 uppercase tracking-wider text-xs whitespace-nowrap">Questions</th>
                  <th className="px-5 py-5 font-bold text-slate-700 uppercase tracking-wider text-xs whitespace-nowrap">Attempts</th>
                  <th className="px-5 py-5 font-bold text-slate-700 uppercase tracking-wider text-xs whitespace-nowrap">Passed</th>
                  <th className="px-5 py-5 font-bold text-slate-700 uppercase tracking-wider text-xs whitespace-nowrap">Pass Rate</th>
                  <th className="px-5 py-5 font-bold text-slate-700 uppercase tracking-wider text-xs whitespace-nowrap">Created</th>
                  <th className="px-6 py-5 font-bold text-slate-700 text-center uppercase tracking-wider text-xs whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {quizzes.map((quiz, idx) => {
                  const passRate = quiz.totalAttempts > 0 ? Math.round((quiz.totalPasses / quiz.totalAttempts) * 100) : 0;
                  return (
                    <React.Fragment key={quiz._id}>
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`group transition-colors ${expandedQuiz === quiz._id ? 'bg-indigo-50/30' : 'hover:bg-white/80'}`}
                      >
                        <td className="px-6 py-4 relative">
                          {expandedQuiz === quiz._id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />
                          )}
                          <button
                            className="flex items-center gap-3 font-semibold text-slate-800 hover:text-indigo-600 transition-colors text-left w-full"
                            onClick={() => setExpandedQuiz(expandedQuiz === quiz._id ? null : quiz._id)}
                          >
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors flex-shrink-0 ${expandedQuiz === quiz._id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                              {expandedQuiz === quiz._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </div>
                            <span className="line-clamp-2 leading-relaxed flex-1">{quiz.title}</span>
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="inline-flex items-center justify-center rounded-lg bg-slate-100 border border-slate-200/60 px-2.5 py-1 text-xs font-bold text-slate-600">
                            {quiz.questionCount || 0}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-slate-700">{quiz.totalAttempts || 0}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-emerald-600">{quiz.totalPasses || 0}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full border border-slate-200 bg-slate-100 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${passRate >= 60 ? 'bg-emerald-500' : passRate > 0 ? 'bg-amber-400' : 'bg-slate-300'}`}
                                style={{ width: `${passRate}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-600">{passRate}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
                            {new Date(quiz.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(quiz)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-indigo-600 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 transition-all tooltip-trigger"
                              title="Edit Quiz"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(quiz._id)}
                              disabled={deletingId === quiz._id}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-rose-600 shadow-sm hover:border-rose-300 hover:bg-rose-50 transition-all disabled:opacity-50"
                              title="Delete Quiz"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>

                      <AnimatePresence>
                        {expandedQuiz === quiz._id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-indigo-50/20 border-b border-indigo-100/50 shadow-[inset_0_4px_10px_-10px_rgba(0,0,0,0.1)]"
                          >
                            <td colSpan="7" className="p-0">
                              <div className="p-6 md:p-8">
                                {editingQuiz === quiz._id ? (
                                  <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-xl">
                                    <h4 className="flex items-center gap-2 font-bold text-xl text-slate-800 mb-6">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                        <Edit2 className="h-4 w-4" />
                                      </div>
                                      Edit Quiz Attributes
                                    </h4>
                                    <div className="space-y-5">
                                      <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Quiz Title</label>
                                        <input
                                          type="text"
                                          value={editFormData.title}
                                          onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Context / Summary</label>
                                        <textarea
                                          value={editFormData.summary}
                                          onChange={(e) => setEditFormData({ ...editFormData, summary: e.target.value })}
                                          rows="5"
                                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none"
                                        />
                                      </div>
                                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                        <button
                                          onClick={() => setEditingQuiz(null)}
                                          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={handleSaveEdit}
                                          className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                                        >
                                          Save Changes
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-8">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Created</p>
                                          <div className="bg-slate-50 border border-slate-100 rounded-lg p-1 text-slate-400"><BarChart2 size={14}/></div>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800">{new Date(quiz.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                      </div>
                                      <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Updated</p>
                                          <div className="bg-slate-50 border border-slate-100 rounded-lg p-1 text-slate-400"><RefreshCw size={14}/></div>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800">{new Date(quiz.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                      </div>
                                      <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Questions</p>
                                          <div className="bg-cyan-50 border border-cyan-100 rounded-lg p-1 text-cyan-600"><Library size={14}/></div>
                                        </div>
                                        <p className="text-xl font-black text-slate-800">{quiz.questionCount || 0}</p>
                                      </div>
                                      <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pass Rate</p>
                                          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-1 text-emerald-600"><Percent size={14}/></div>
                                        </div>
                                        <p className="text-xl font-black tracking-tight text-emerald-600">
                                          {passRate}%
                                        </p>
                                      </div>
                                    </div>

                                    {quiz.summary && (
                                      <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-400"></div>
                                        <h5 className="text-xs font-bold text-cyan-700 uppercase tracking-wider mb-2">Context Summary</h5>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                          {quiz.summary}
                                        </p>
                                      </div>
                                    )}

                                    {quiz.questions && quiz.questions.length > 0 && (
                                      <div>
                                        <h5 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4 border-b border-slate-200/50 pb-2">
                                          <CheckCircle className="w-4 h-4 text-indigo-500" />
                                          Questions Preview <span className="text-slate-400 font-medium">({quiz.questions.length})</span>
                                        </h5>
                                        <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                                          {quiz.questions.map((q, idx) => (
                                            <div key={idx} className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-slate-300/80">
                                              <div className="flex items-start gap-4">
                                                <div className="flex h-8 w-8 items-center justify-center font-black rounded-lg bg-slate-100 text-slate-500 text-sm flex-shrink-0">
                                                  Q{idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                  <p className="font-bold text-slate-800 text-[15px] mb-3 leading-snug">{q.questionText}</p>
                                                  <div className="flex flex-col gap-1.5 pl-1.5 border-l-2 border-slate-100">
                                                    {q.options.map((opt, optIdx) => (
                                                      <div 
                                                        key={optIdx} 
                                                        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm ${opt.isCorrect ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-100/50' : 'text-slate-600 font-medium'}`}
                                                      >
                                                        {opt.isCorrect ? (
                                                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                        ) : (
                                                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                                                        )}
                                                        <span>{opt.text}</span>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default QuizAdmin;
