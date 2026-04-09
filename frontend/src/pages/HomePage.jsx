import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  CirclePlay,
  GraduationCap,
  Layers,
  MonitorPlay,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Users,
  Zap,
  Trophy,
  Target,
  BarChart3,
  ChevronRight,
  Rocket,
  Clock,
  Award,
  CheckCircle,
} from "lucide-react";
import Footer from "../components/layout/Footer";

const features = [
  {
    title: "Adaptive Learning Paths",
    description: "Personalized courses tailored to your learning style and pace.",
    icon: Target,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Interactive Lectures",
    description: "Engaging video content with quizzes and instant feedback.",
    icon: MonitorPlay,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Real-time Progress",
    description: "Track your achievements with detailed analytics and insights.",
    icon: BarChart3,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Verified Certificates",
    description: "Earn industry-recognized certificates upon completion.",
    icon: Award,
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "AI-Powered Summaries",
    description: "Get intelligent summaries and quick notes from lectures.",
    icon: Sparkles,
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "Secure Assessments",
    description: "Fair and secure quiz system with plagiarism detection.",
    icon: ShieldCheck,
    gradient: "from-rose-500 to-orange-500",
  },
];

const stats = [
  { value: "2,500+", label: "Active Students", delay: 0 },
  { value: "60+", label: "Courses Available", delay: 0.1 },
  { value: "95%", label: "Completion Rate", delay: 0.2 },
  { value: "4.9★", label: "Average Rating", delay: 0.3 },
];

const testimonials = [
  {
    name: "Kamal Perera",
    role: "CS Student",
    content: "This LMS transformed how I learn. The interactive content and quizzes really helped!",
    avatar: "👨‍💻",
  },
  {
    name: "Priya Silva",
    role: "IT Major",
    content: "The certificate programs are industry-recognized. Highly recommend!",
    avatar: "👩‍💼",
  },
  {
    name: "Roshan Kumar",
    role: "Data Science Student",
    content: "Best learning platform I've used. Great instructors and support!",
    avatar: "👨‍🎓",
  },
];

const departments = [
  { name: "Computer Science", icon: "🖥️", courses: 12 },
  { name: "Information Technology", icon: "💾", courses: 10 },
  { name: "Business", icon: "📊", courses: 8 },
  { name: "Engineering", icon: "⚙️", courses: 9 },
];

// Animated Background Component
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <motion.div
      className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 opacity-20 blur-3xl"
      animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
      transition={{ duration: 8, repeat: Infinity }}
    />
    <motion.div
      className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-purple-400 to-pink-300 opacity-20 blur-3xl"
      animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
      transition={{ duration: 10, repeat: Infinity }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 h-60 w-60 rounded-full bg-gradient-to-b from-indigo-300 to-blue-200 opacity-15 blur-3xl"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 12, repeat: Infinity }}
    />
  </div>
);

// Floating Card Component
const FloatingCard = ({ delay }) => (
  <motion.div
    className="absolute rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4"
    animate={{ y: [0, -20, 0] }}
    transition={{ duration: 4, delay, repeat: Infinity }}
  >
    <BookOpen className="h-6 w-6 text-white" />
  </motion.div>
);

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <>
      <motion.div
        className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* HERO SECTION */}
        <section className="relative py-20 px-4 md:px-8 pt-28 overflow-hidden">
          <AnimatedBackground />
          
          <div className="mx-auto max-w-6xl relative z-10">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="inline-block"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/50 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 backdrop-blur-md">
                  <Rocket size={16} /> Welcome to SLIIT LMS
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-7xl font-black leading-tight bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                Learn, Grow, Achieve Excellence
              </h1>

              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
                Master your skills through interactive courses, expert instructors, and real-world projects. 
                Join thousands of students transforming their careers at SLIIT.
              </p>

              <motion.div
                className="flex flex-wrap gap-4 justify-center pt-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <Link
                    to="/register"
                    className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-4 text-base font-semibold text-white transition hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105"
                  >
                    Start Learning Now
                    <ArrowRight className="group-hover:translate-x-1 transition" size={18} />
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-cyan-400/50 px-8 py-4 text-base font-semibold text-cyan-300 backdrop-blur-md transition hover:bg-cyan-500/10 hover:border-cyan-300"
                  >
                    Explore Courses
                    <ChevronRight size={18} />
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Floating Cards in Hero */}
            <motion.div
              className="relative mt-16 h-64 hidden lg:block"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <FloatingCard delay={0} />
              <FloatingCard delay={0.3} />
              <FloatingCard delay={0.6} />
            </motion.div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="relative py-16 px-4 md:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  className="group rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 p-6 backdrop-blur-md hover:border-blue-400/50 transition"
                >
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-4xl md:text-5xl font-black text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text">
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="relative py-20 px-4 md:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black">
                Feature-Rich Learning Platform
              </h2>
              <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
                Everything you need to succeed in your academic journey
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    variants={itemVariants}
                    className="group rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 hover:border-slate-600 transition overflow-hidden relative"
                  >
                    {/* Gradient background on hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition duration-300`}
                    />

                    <div className="relative z-10">
                      <motion.div
                        className={`inline-flex rounded-lg bg-gradient-to-br ${feature.gradient} p-3`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </motion.div>

                      <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                      <p className="mt-2 text-slate-400">{feature.description}</p>

                      <motion.div
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-300"
                        whileHover={{ x: 5 }}
                      >
                        Learn more <ChevronRight size={16} />
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* DEPARTMENTS SECTION */}
        <section className="relative py-20 px-4 md:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black">
                Study Programs by Department
              </h2>
              <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
                Choose from various departments and specializations
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {departments.map((dept) => (
                <motion.div
                  key={dept.name}
                  variants={itemVariants}
                  whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.2)" }}
                  className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 cursor-pointer"
                >
                  <div className="text-4xl mb-3">{dept.icon}</div>
                  <h3 className="text-xl font-bold">{dept.name}</h3>
                  <p className="mt-2 text-sm text-slate-400">{dept.courses} courses</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="relative py-20 px-4 md:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black">
                What Students Say
              </h2>
              <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
                Hear from learners who have transformed their careers
              </p>
            </motion.div>

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 md:p-12"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-xl md:text-2xl text-slate-200 mb-6">
                    "{testimonials[activeTestimonial].content}"
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{testimonials[activeTestimonial].avatar}</div>
                    <div>
                      <p className="font-bold text-lg">{testimonials[activeTestimonial].name}</p>
                      <p className="text-sm text-slate-400">{testimonials[activeTestimonial].role}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`h-3 rounded-full transition ${
                      idx === activeTestimonial ? "bg-blue-500 w-8" : "bg-slate-600 w-3"
                    }`}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="relative py-20 px-4 md:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              className="rounded-3xl bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 p-1 overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 p-12 md:p-16 text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="mx-auto h-12 w-12 mb-4 text-cyan-400" />
                </motion.div>

                <h2 className="text-4xl md:text-5xl font-black">
                  Ready to Transform Your Learning?
                </h2>

                <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
                  Join thousands of SLIIT students learning together, growing together, and achieving excellence together.
                </p>

                <motion.div
                  className="mt-8"
                  whileHover={{ scale: 1.05 }}
                >
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-10 py-4 text-lg font-bold text-white hover:shadow-lg hover:shadow-blue-500/50 transition"
                  >
                    Create Your Account Now
                    <Rocket size={20} />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </motion.div>

      <Footer />
    </>
  );
};

export default HomePage;
