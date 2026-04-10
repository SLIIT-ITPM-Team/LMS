import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { courseApi } from '../../api/course.api';

/* ── colour palettes ─────────────────────────────────── */
const DEPT_PALETTES = [
  { grad: 'from-violet-500 to-purple-700',   light: 'bg-violet-50',  text: 'text-violet-700'  },
  { grad: 'from-blue-500 to-indigo-700',     light: 'bg-blue-50',    text: 'text-blue-700'    },
  { grad: 'from-emerald-500 to-teal-700',    light: 'bg-emerald-50', text: 'text-emerald-700' },
  { grad: 'from-orange-500 to-red-600',      light: 'bg-orange-50',  text: 'text-orange-700'  },
  { grad: 'from-pink-500 to-rose-600',       light: 'bg-pink-50',    text: 'text-pink-700'    },
  { grad: 'from-cyan-500 to-sky-700',        light: 'bg-cyan-50',    text: 'text-cyan-700'    },
  { grad: 'from-amber-500 to-yellow-600',    light: 'bg-amber-50',   text: 'text-amber-700'   },
];

const DEPT_ICONS = ['🏛️', '💻', '⚗️', '🔧', '📐', '🎨', '🧬'];

const YEAR_CONFIG = [
  { value: 'Year 1', icon: '🎯', desc: 'Foundation Year',  grad: 'from-sky-400 to-blue-600',      hoverShadow: 'hover:shadow-blue-200'    },
  { value: 'Year 2', icon: '📚', desc: 'Core Studies',     grad: 'from-violet-400 to-purple-600',  hoverShadow: 'hover:shadow-purple-200'  },
  { value: 'Year 3', icon: '🔬', desc: 'Advanced Topics',  grad: 'from-emerald-400 to-teal-600',   hoverShadow: 'hover:shadow-emerald-200' },
  { value: 'Year 4', icon: '🎓', desc: 'Specialisation',   grad: 'from-orange-400 to-red-600',     hoverShadow: 'hover:shadow-orange-200'  },
];

const SEM_CONFIG = [
  { value: '1st Semester', icon: '🌱', sub: 'August – December', grad: 'from-sky-400 to-blue-600',     shadow: 'shadow-blue-200'   },
  { value: '2nd Semester', icon: '🌟', sub: 'January – May',     grad: 'from-amber-400 to-orange-600', shadow: 'shadow-orange-200' },
];

/* ── animation variants ──────────────────────────────── */
const pageIn = {
  initial: { opacity: 0, y: 36, scale: 0.97 },
  animate: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -24, scale: 0.97, transition: { duration: 0.28 } },
};

const stagger = (i) => ({
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0,   transition: { delay: i * 0.06, duration: 0.38, ease: 'easeOut' } },
});

/* ── helpers ─────────────────────────────────────────── */
const getDeptName = (c) => { const d = c?.moduleId?.department; return !d ? 'Unknown' : typeof d === 'string' ? d : d.name || 'Unknown'; };
const getModName  = (c) => c?.moduleId?.name || 'Unknown';
const getModCode  = (c) => c?.moduleId?.code  || '';
const getYear     = (c) => c?.moduleId?.academicYear     || '';
const getSemester = (c) => c?.moduleId?.academicSemester || '';

/* ══════════════════════════════════════════════════════ */
const StudentCourses = () => {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading]       = useState(true);

  const [selDept,   setSelDept]   = useState(null);
  const [selYear,   setSelYear]   = useState(null);
  const [selSem,    setSelSem]    = useState(null);
  const [selModule, setSelModule] = useState(null);
  const [step,      setStep]      = useState(0); // 0=dept 1=year 2=sem 3=module 4=courses

  useEffect(() => {
    (async () => {
      try {
        const res = await courseApi.getAllCourses({ page: 1, limit: 500 });
        setAllCourses(res.data || []);
      } catch { toast.error('Failed to load courses'); }
      finally   { setLoading(false); }
    })();
  }, []);

  /* ── derived data ── */
  const departments = useMemo(() => {
    const map = {};
    allCourses.forEach((c) => {
      const name = getDeptName(c);
      if (!map[name]) {
        const idx = Object.keys(map).length;
        map[name] = { name, count: 0, palette: DEPT_PALETTES[idx % DEPT_PALETTES.length], icon: DEPT_ICONS[idx % DEPT_ICONS.length] };
      }
      map[name].count++;
    });
    return Object.values(map);
  }, [allCourses]);

  const yearsInDept = useMemo(() => {
    if (!selDept) return new Set();
    return new Set(allCourses.filter(c => getDeptName(c) === selDept).map(getYear).filter(Boolean));
  }, [allCourses, selDept]);

  const semsInSelection = useMemo(() => {
    if (!selDept || !selYear) return new Set();
    return new Set(allCourses.filter(c => getDeptName(c) === selDept && getYear(c) === selYear).map(getSemester).filter(Boolean));
  }, [allCourses, selDept, selYear]);

  const availableModules = useMemo(() => {
    if (!selDept || !selYear || !selSem) return [];
    const map = {};
    allCourses
      .filter(c => getDeptName(c) === selDept && getYear(c) === selYear && getSemester(c) === selSem)
      .forEach(c => {
        const key = getModCode(c) || getModName(c);
        if (!map[key]) map[key] = { name: getModName(c), code: getModCode(c), moduleId: c.moduleId?._id || c.moduleId, count: 0 };
        map[key].count++;
      });
    return Object.values(map);
  }, [allCourses, selDept, selYear, selSem]);

  const filteredCourses = useMemo(() => {
    if (!selModule) return [];
    return allCourses.filter(c => String(c.moduleId?._id || c.moduleId) === String(selModule.moduleId));
  }, [allCourses, selModule]);

  /* ── navigation ── */
  const goBack = () => {
    if (step === 1) setSelDept(null);
    if (step === 2) setSelYear(null);
    if (step === 3) setSelSem(null);
    if (step === 4) setSelModule(null);
    setStep(s => s - 1);
  };

  const pickDept = (name) => { setSelDept(name);  setStep(1); };
  const pickYear = (v)    => { setSelYear(v);     setStep(2); };
  const pickSem  = (v)    => { setSelSem(v);      setStep(3); };
  const pickMod  = (mod)  => { setSelModule(mod); setStep(4); };

  const deptPalette = departments.find(d => d.name === selDept)?.palette || DEPT_PALETTES[0];

  const STEP_LABELS = ['Department', 'Year', 'Semester', 'Module', 'Courses'];

  /* ── breadcrumbs ── */
  const crumbs = [
    { label: selDept,          onClick: () => { setSelYear(null); setSelSem(null); setSelModule(null); setStep(0); } },
    { label: selYear,          onClick: () => { setSelSem(null);  setSelModule(null); setStep(1); } },
    { label: selSem,           onClick: () => { setSelModule(null); setStep(2); } },
    { label: selModule?.name,  onClick: () => setStep(3) },
  ].filter(c => c.label);

  /* ════════════════════════════════════════════════════ */
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto" />
        <p className="text-slate-500 font-medium">Loading courses…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-50">

      {/* ══ HERO HEADER ══════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 pb-24">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-0 w-[30rem] h-[30rem] bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-56 h-56 bg-indigo-300/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-indigo-200 text-[11px] font-bold uppercase tracking-[0.2em] mb-1">Student Portal</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">My Courses</h1>
              <p className="text-indigo-200 mt-2 text-sm">Navigate your learning path step by step</p>
            </div>
            <button onClick={() => navigate('/dashboard')}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold rounded-xl hover:bg-white/25 transition-colors">
              ← Dashboard
            </button>
          </div>

          {/* Step progress pills */}
          <div className="mt-8 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {STEP_LABELS.map((label, i) => (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all duration-300 ${
                  i === step ? 'bg-white text-indigo-700 shadow-lg'
                  : i < step  ? 'bg-white/25 text-white'
                              : 'bg-white/10 text-white/40'
                }`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                    i === step ? 'bg-indigo-600 text-white'
                    : i < step  ? 'bg-white/70 text-indigo-700'
                                : 'bg-white/20 text-white/50'
                  }`}>{i < step ? '✓' : i + 1}</span>
                  {label}
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`h-px w-5 flex-shrink-0 rounded-full transition-all duration-500 ${i < step ? 'bg-white/50' : 'bg-white/15'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CONTENT (floats over hero) ═══════════════════ */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 -mt-12 pb-20">

        {/* Breadcrumb */}
        <AnimatePresence>
          {crumbs.length > 0 && (
            <motion.div key="crumbs" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 flex items-center flex-wrap gap-2">
              {crumbs.map((c, i) => (
                <React.Fragment key={i}>
                  <button onClick={c.onClick}
                    className="px-3 py-1 rounded-full bg-white shadow-sm text-xs font-semibold text-indigo-600 border border-indigo-100 hover:bg-indigo-50 transition-colors">
                    {c.label}
                  </button>
                  {i < crumbs.length - 1 && <span className="text-slate-300 text-sm">›</span>}
                </React.Fragment>
              ))}
              <button onClick={goBack}
                className="ml-auto px-3 py-1 rounded-full bg-white shadow-sm text-xs font-medium text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">
                ← Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">

          {/* ════ STEP 0 — DEPARTMENT ════ */}
          {step === 0 && (
            <motion.div key="dept" variants={pageIn} initial="initial" animate="animate" exit="exit">
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-8">
                <div className="mb-7">
                  <h2 className="text-2xl font-extrabold text-slate-800">Choose a Department</h2>
                  <p className="text-slate-400 text-sm mt-1">Select the department you'd like to explore</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map((dept, i) => (
                    <motion.button key={dept.name}
                      variants={stagger(i)} initial="hidden" animate="show"
                      onClick={() => pickDept(dept.name)}
                      className="group relative overflow-hidden rounded-2xl text-left focus:outline-none focus:ring-2 focus:ring-indigo-400 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                      <div className={`h-full bg-gradient-to-br ${dept.palette.grad} p-6`}>
                        {/* deco circles */}
                        <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
                        <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 text-2xl shadow-inner">
                            {dept.icon}
                          </div>
                          <h3 className="text-lg font-extrabold text-white leading-tight">{dept.name}</h3>
                          <p className="text-white/65 text-xs mt-1 font-medium">{dept.count} course{dept.count !== 1 ? 's' : ''} available</p>
                          <div className="mt-5 flex items-center justify-between">
                            <span className="text-white/75 text-xs font-semibold">Explore</span>
                            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/35 group-hover:translate-x-1 transition-all">
                              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ════ STEP 1 — YEAR ════ */}
          {step === 1 && (
            <motion.div key="year" variants={pageIn} initial="initial" animate="animate" exit="exit">
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-8">
                <div className="mb-7 flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${deptPalette.grad} flex items-center justify-center text-xl shadow-md`}>
                    {departments.find(d => d.name === selDept)?.icon || '🏛️'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">Select Academic Year</h2>
                    <p className="text-slate-400 text-sm">{selDept}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {YEAR_CONFIG.map((yr, i) => {
                    const available = yearsInDept.has(yr.value);
                    return (
                      <motion.button key={yr.value}
                        variants={stagger(i)} initial="hidden" animate="show"
                        onClick={() => available && pickYear(yr.value)}
                        className={`group relative overflow-hidden rounded-2xl text-center focus:outline-none transition-all duration-300 ${
                          available
                            ? `hover:-translate-y-2 hover:shadow-2xl ${yr.hoverShadow} cursor-pointer focus:ring-2 focus:ring-indigo-400`
                            : 'cursor-not-allowed'
                        }`}>
                        <div className={`bg-gradient-to-br ${yr.grad} p-8 relative`}>
                          {/* deco */}
                          <div className="absolute -bottom-5 -right-5 w-20 h-20 bg-white/10 rounded-full" />
                          <div className="absolute -top-6 -left-6 w-16 h-16 bg-white/10 rounded-full" />
                          {/* unavailable overlay */}
                          {!available && <div className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-end justify-center pb-3">
                            <span className="text-white/80 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">No courses</span>
                          </div>}
                          <div className="relative text-4xl mb-3">{yr.icon}</div>
                          <div className="relative text-xl font-extrabold text-white">{yr.value}</div>
                          <div className="relative text-white/70 text-xs mt-1 font-medium">{yr.desc}</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ════ STEP 2 — SEMESTER ════ */}
          {step === 2 && (
            <motion.div key="sem" variants={pageIn} initial="initial" animate="animate" exit="exit">
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-8">
                <div className="mb-7">
                  <h2 className="text-2xl font-extrabold text-slate-800">Select Semester</h2>
                  <p className="text-slate-400 text-sm mt-1">{selDept} · {selYear}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  {SEM_CONFIG.map((sem, i) => {
                    const available = semsInSelection.has(sem.value);
                    return (
                      <motion.button key={sem.value}
                        variants={stagger(i)} initial="hidden" animate="show"
                        onClick={() => available && pickSem(sem.value)}
                        className={`group relative overflow-hidden rounded-2xl focus:outline-none transition-all duration-300 ${
                          available
                            ? `hover:-translate-y-2 hover:shadow-2xl cursor-pointer focus:ring-2 focus:ring-indigo-400`
                            : 'cursor-not-allowed'
                        }`}>
                        <div className={`bg-gradient-to-br ${sem.grad} p-12 text-center relative`}>
                          <div className="absolute -top-10 -left-10 w-36 h-36 bg-white/10 rounded-full" />
                          <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-white/10 rounded-full" />
                          {!available && <div className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-end justify-center pb-4">
                            <span className="text-white/80 text-xs font-bold bg-white/20 px-3 py-1 rounded-full">No courses</span>
                          </div>}
                          <div className="relative text-6xl mb-4">{sem.icon}</div>
                          <div className="relative text-2xl font-extrabold text-white">{sem.value}</div>
                          <div className="relative text-white/70 text-sm mt-1 font-medium">{sem.sub}</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ════ STEP 3 — MODULE ════ */}
          {step === 3 && (
            <motion.div key="mod" variants={pageIn} initial="initial" animate="animate" exit="exit">
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-8">
                <div className="mb-7">
                  <h2 className="text-2xl font-extrabold text-slate-800">Select Module</h2>
                  <p className="text-slate-400 text-sm mt-1">{selDept} · {selYear} · {selSem}</p>
                </div>
                {availableModules.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">
                    <div className="text-5xl mb-4">📭</div>
                    <p className="font-semibold">No modules found for this selection</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableModules.map((mod, i) => {
                      const pal = DEPT_PALETTES[i % DEPT_PALETTES.length];
                      return (
                        <motion.button key={mod.code || mod.name}
                          variants={stagger(i)} initial="hidden" animate="show"
                          onClick={() => pickMod(mod)}
                          className="group relative overflow-hidden rounded-2xl text-left focus:outline-none focus:ring-2 focus:ring-indigo-400 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                          <div className={`h-full bg-gradient-to-br ${pal.grad} p-5`}>
                            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                            <div className="relative">
                              <div className="w-12 h-12 rounded-xl bg-white/25 flex items-center justify-center font-black text-white text-sm mb-3 shadow-inner">
                                {(mod.code || mod.name).slice(0, 3).toUpperCase()}
                              </div>
                              <p className="font-extrabold text-white text-sm leading-snug">{mod.name}</p>
                              {mod.code && <p className="text-white/60 text-xs mt-0.5 font-mono">{mod.code}</p>}
                              <div className="mt-4 flex items-center justify-between">
                                <span className="text-white/70 text-xs font-medium">{mod.count} course{mod.count !== 1 ? 's' : ''}</span>
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ════ STEP 4 — COURSES ════ */}
          {step === 4 && (
            <motion.div key="courses" variants={pageIn} initial="initial" animate="animate" exit="exit">
              <div className="space-y-6">
                {/* Module header banner */}
                <div className={`rounded-2xl bg-gradient-to-r ${deptPalette.grad} p-6 shadow-xl text-white relative overflow-hidden`}>
                  <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full" />
                  <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/10 rounded-full" />
                  <div className="relative flex items-center gap-4 flex-wrap">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-lg shadow-inner flex-shrink-0">
                      {(selModule?.code || selModule?.name || '').slice(0, 3).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/65 text-[11px] font-bold uppercase tracking-widest">{selDept} · {selYear} · {selSem}</p>
                      <h2 className="text-2xl font-extrabold mt-0.5 truncate">{selModule?.name}</h2>
                      {selModule?.code && <p className="text-white/65 text-sm font-mono">{selModule.code}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-4xl font-black">{filteredCourses.length}</p>
                      <p className="text-white/65 text-xs font-semibold">Courses</p>
                    </div>
                  </div>
                </div>

                {filteredCourses.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow p-20 text-center text-slate-400">
                    <div className="text-5xl mb-4">📭</div>
                    <p className="font-semibold">No courses in this module yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCourses.map((course, i) => (
                      <motion.div key={course._id}
                        variants={stagger(i)} initial="hidden" animate="show"
                        onClick={() => navigate(`/courses/${course._id}`)}
                        className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-100 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1">
                        {/* Thumbnail */}
                        <div className={`h-44 bg-gradient-to-br ${deptPalette.grad} relative overflow-hidden flex items-center justify-center`}>
                          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                          <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
                          <div className="relative text-center">
                            <div className="text-5xl mb-1">🎬</div>
                            <p className="text-white/80 text-xs font-semibold">Video Lecture</p>
                          </div>
                          {course.summaryText && (
                            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-indigo-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow">
                              ✦ AI Summary
                            </span>
                          )}
                        </div>
                        {/* Body */}
                        <div className="p-5">
                          <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-2 font-medium">
                            {new Date(course.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                              ● Available
                            </span>
                            <span className="text-indigo-600 text-xs font-bold group-hover:translate-x-1 transition-transform inline-block">
                              Watch →
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentCourses;
