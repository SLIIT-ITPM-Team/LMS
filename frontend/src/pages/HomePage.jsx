import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BarChart3,
  Award,
  MonitorPlay,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  ChevronRight,
  Rocket,
  GraduationCap,
  Users,
  CheckCircle,
} from "lucide-react";
import Footer from "../components/layout/Footer";

/* ─── Data ────────────────────────────────────────────────────────────── */
const features = [
  {
    title: "Adaptive Learning Paths",
    description: "Personalized courses tailored to your learning style and pace.",
    icon: Target,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Interactive Lectures",
    description: "Engaging video content with quizzes and instant feedback.",
    icon: MonitorPlay,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "Real-time Progress",
    description: "Track your achievements with detailed analytics and insights.",
    icon: BarChart3,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Verified Certificates",
    description: "Earn industry-recognized certificates upon completion.",
    icon: Award,
    color: "bg-amber-100 text-amber-600",
  },
  {
    title: "AI-Powered Summaries",
    description: "Get intelligent summaries and quick notes from lectures.",
    icon: Sparkles,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Secure Assessments",
    description: "Fair and secure quiz system with plagiarism detection.",
    icon: ShieldCheck,
    color: "bg-rose-100 text-rose-600",
  },
];

const stats = [
  { value: "2,500+", label: "Active Students", icon: Users },
  { value: "60+", label: "Courses Available", icon: BookOpen },
  { value: "95%", label: "Completion Rate", icon: CheckCircle },
  { value: "4.9★", label: "Average Rating", icon: Star },
];

const testimonials = [
  {
    name: "Kamal Perera",
    role: "CS Student",
    content: "This LMS transformed how I learn. The interactive content and quizzes really helped!",
    initials: "KP",
    color: "bg-blue-500",
  },
  {
    name: "Priya Silva",
    role: "IT Major",
    content: "The certificate programs are industry-recognized. Highly recommend!",
    initials: "PS",
    color: "bg-indigo-500",
  },
  {
    name: "Roshan Kumar",
    role: "Data Science Student",
    content: "Best learning platform I've used. Great instructors and support!",
    initials: "RK",
    color: "bg-emerald-500",
  },
];

const departments = [
  { name: "Computer Science", icon: "🖥️", courses: 12 },
  { name: "Information Technology", icon: "💾", courses: 10 },
  { name: "Business", icon: "📊", courses: 8 },
  { name: "Engineering", icon: "⚙️", courses: 9 },
];

/* ─── Decorative SVG curves (matching screenshot) ─────────────────────── */
const DecorativeCurves = () => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full"
    viewBox="0 0 900 620"
    fill="none"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="520" cy="300" r="230" stroke="#BFDBFE" strokeWidth="1.5" />
    <circle cx="520" cy="300" r="290" stroke="#BFDBFE" strokeWidth="1" opacity="0.5" />
    <path
      d="M60 400 Q260 100 560 260"
      stroke="#93C5FD"
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M0 480 Q200 200 500 340"
      stroke="#BFDBFE"
      strokeWidth="1"
      fill="none"
    />
  </svg>
);

/* ─── Hero visual (right side) ──────────────────────────────────────────── */
const HeroVisual = () => (
  <div className="relative flex items-center justify-center">
    {/* Big blue circle */}
    <div className="relative h-72 w-72 md:h-96 md:w-96">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl shadow-blue-300/50" />

      {/* Inner ring */}
      <div className="absolute inset-4 rounded-full border-2 border-white/20" />

      {/* Floating course cards */}
      <motion.div
        className="absolute -left-10 top-8 rounded-2xl bg-white px-4 py-3 shadow-xl"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <BookOpen size={16} className="text-blue-600" />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-800">New Course</p>
            <p className="text-[10px] text-slate-400">Data Structures</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -right-8 bottom-16 rounded-2xl bg-white px-4 py-3 shadow-xl"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
            <Award size={16} className="text-emerald-600" />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-800">Certificate</p>
            <p className="text-[10px] text-slate-400">Earned today</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -right-6 top-6 rounded-2xl bg-white px-4 py-3 shadow-xl"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, delay: 1 }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
            <Star size={16} className="text-purple-600" />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-800">Top Rated</p>
            <p className="text-[10px] text-slate-400">4.9 / 5.0</p>
          </div>
        </div>
      </motion.div>

      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
          <GraduationCap size={40} className="text-white" />
        </div>
      </div>
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────────── */
const HomePage = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setActiveTestimonial((i) => (i + 1) % testimonials.length),
      4000
    );
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden bg-[#EEF4FF] pt-24">
        <DecorativeCurves />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:px-12 lg:py-24">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
              <Rocket size={14} /> Welcome to EduFlow LMS
            </span>

            <h1 className="mt-6 text-5xl font-black uppercase leading-tight tracking-tight text-slate-800 md:text-6xl lg:text-7xl">
              Get the Best{" "}
              <span className="text-blue-600">Courses</span>
              <br />
              and Upgrade
              <br />
              Your Skills
            </h1>

            <p className="mt-5 max-w-md text-base text-slate-500 md:text-lg">
              Master your skills through interactive courses, expert instructors, and
              real-world projects. Join thousands of students transforming their
              careers at SLIIT.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-300/50 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
              >
                Join With Us
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-full border-2 border-blue-200 bg-white px-8 py-3.5 text-base font-bold text-blue-700 transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg"
              >
                Explore Courses
                <ChevronRight size={18} />
              </Link>
            </div>

            {/* Follow us row */}
            <div className="mt-10 flex items-center gap-4">
              <p className="text-sm font-semibold text-slate-500">Follow Us</p>
              <div className="flex items-center gap-1">
                {["f", "in", "tw", "yt"].map((s, i) => (
                  <div key={s} className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow">
                      {s}
                    </div>
                    {i < 3 && (
                      <div className="h-px w-3 bg-blue-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────── */}
      <section className="bg-white py-16 px-6 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group rounded-2xl border border-blue-100 bg-[#EEF4FF] p-6 text-center transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Icon size={22} />
                  </div>
                  <p className="text-3xl font-black text-blue-700">{stat.value}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section className="bg-[#EEF4FF] py-20 px-6 md:px-12">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Why Choose Us
            </p>
            <h2 className="mt-2 text-4xl font-black text-slate-800 md:text-5xl">
              Feature-Rich Learning Platform
            </h2>
            <p className="mt-3 text-slate-500">
              Everything you need to succeed in your academic journey
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group rounded-2xl border border-white bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`inline-flex rounded-xl p-3 ${f.color}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-800">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{f.description}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                    Learn more <ChevronRight size={15} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DEPARTMENTS ──────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6 md:px-12">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Departments
            </p>
            <h2 className="mt-2 text-4xl font-black text-slate-800 md:text-5xl">
              Study Programs by Department
            </h2>
            <p className="mt-3 text-slate-500">
              Choose from various departments and specializations
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {departments.map((dept, i) => (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer rounded-2xl border border-blue-100 bg-[#EEF4FF] p-6 text-center transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl shadow-lg shadow-blue-300/40">
                  {dept.icon}
                </div>
                <h3 className="font-bold text-slate-800">{dept.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{dept.courses} courses</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="bg-[#EEF4FF] py-20 px-6 md:px-12">
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Testimonials
            </p>
            <h2 className="mt-2 text-4xl font-black text-slate-800 md:text-5xl">
              What Students Say
            </h2>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-white bg-white p-10 shadow-lg md:p-14"
            >
              <div className="flex items-center gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xl font-medium text-slate-700 md:text-2xl">
                "{testimonials[activeTestimonial].content}"
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white ${testimonials[activeTestimonial].color}`}
                >
                  {testimonials[activeTestimonial].initials}
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {testimonials[activeTestimonial].name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {testimonials[activeTestimonial].role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTestimonial(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === activeTestimonial
                    ? "w-8 bg-blue-600"
                    : "w-2.5 bg-blue-200"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6 md:px-12">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 px-10 py-16 text-center shadow-2xl shadow-blue-300/40 md:px-16 md:py-20"
          >
            {/* Decorative orbs */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10" />

            <Sparkles className="relative mx-auto mb-4 h-12 w-12 text-blue-200" />
            <h2 className="relative text-3xl font-black text-white md:text-5xl">
              Ready to Transform Your Learning?
            </h2>
            <p className="relative mt-4 text-base text-blue-100 md:text-lg">
              Join thousands of SLIIT students learning together, growing together,
              and achieving excellence together.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Create Your Account <Rocket size={18} />
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-8 py-3.5 text-base font-bold text-white transition hover:bg-white/10"
              >
                Browse Courses <ChevronRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default HomePage;
