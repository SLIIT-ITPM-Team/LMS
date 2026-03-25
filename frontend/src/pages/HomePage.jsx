import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import {
  ArrowRight,
  BellRing,
  BookOpen,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  Cpu,
  FileText,
  GraduationCap,
  Layers3,
  Sparkles,
  Star,
  Users,
  Video,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const stats = [
  { value: 1000, suffix: "+", label: "Students", icon: Users },
  { value: 50, suffix: "+", label: "Courses", icon: BookOpen },
  { value: 10, suffix: "+", label: "Modules", icon: Layers3 },
  { value: 98, suffix: "%", label: "Satisfaction Rate", icon: Star },
];

const featureCards = [
  {
    title: "Department-Based Learning",
    description:
      "Focused learning paths for Information Technology, Data Science, and Software Engineering.",
    icon: Building2,
  },
  {
    title: "Video Courses with Summary PDF",
    description:
      "Learn through structured videos and quickly revise with concise generated summary PDFs.",
    icon: Video,
  },
  {
    title: "AI-Generated Quizzes & Certificates",
    description:
      "Assess progress with adaptive quizzes and instantly unlock certificates after completion.",
    icon: Bot,
  },
  {
    title: "Community & Notifications",
    description:
      "Collaborate with peers, ask questions, and get updates in real time across your modules.",
    icon: BellRing,
  },
];

const steps = [
  {
    title: "Choose Your Department",
    description:
      "Start with the domain that matches your goals: IT, Data Science, or Software Engineering.",
    icon: Building2,
  },
  {
    title: "Enroll in Modules & Courses",
    description:
      "Select structured modules, track your learning progress, and access course materials instantly.",
    icon: FileText,
  },
  {
    title: "Learn, Take Quizzes, Get Certified",
    description:
      "Complete lessons, attempt quizzes, and earn verifiable certificates to showcase your growth.",
    icon: GraduationCap,
  },
];

const departments = [
  {
    name: "Information Technology",
    description:
      "Build practical IT foundations with networking, systems, and cloud-ready workflows.",
    modules: ["Networking Basics", "Web Fundamentals", "Cloud Essentials"],
    color: "from-indigo-500 to-blue-500",
    icon: Cpu,
  },
  {
    name: "Data Science",
    description:
      "Master data-driven decision making with analytics, visualization, and machine learning.",
    modules: ["Python for DS", "Statistics", "Machine Learning Lab"],
    color: "from-pink-500 to-rose-500",
    icon: Sparkles,
  },
  {
    name: "Software Engineering",
    description:
      "Design, build, and scale robust software with modern architectures and team practices.",
    modules: ["OOP & Patterns", "MERN Development", "DevOps Pipeline"],
    color: "from-emerald-500 to-teal-500",
    icon: CheckCircle2,
  },
];

const testimonials = [
  {
    name: "Nishara Perera",
    department: "Data Science",
    quote:
      "The module structure and quiz feedback helped me move from theory to real project confidence in weeks.",
  },
  {
    name: "Sahan Weerasekara",
    department: "Software Engineering",
    quote:
      "EduFlow feels like a complete learning operating system, from courses to certificates to community.",
  },
  {
    name: "Kavindi Fernando",
    department: "Information Technology",
    quote:
      "The summaries and notification flow kept me consistent. I could revise quickly before every quiz.",
  },
];

const sectionVariant = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const cardContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Reveal = ({ children, className = "" }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.12 });

  return (
    <motion.section
      ref={ref}
      className={className}
      variants={sectionVariant}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
    >
      {children}
    </motion.section>
  );
};

const HomeSkeleton = () => (
  <div className="min-h-screen animate-pulse bg-slate-100">
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="h-14 w-full rounded-2xl bg-slate-200" />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="h-60 rounded-3xl bg-slate-200" />
        <div className="h-60 rounded-3xl bg-slate-200" />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200" />
        ))}
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const { ref: statRef, inView: statInView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <motion.div
      className="overflow-x-hidden text-slate-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <Navbar />

      <main>
        <section className="relative isolate overflow-hidden border-b border-indigo-100 pt-28 pb-16 md:pt-36 md:pb-24">
          <div className="absolute inset-0 -z-20 bg-hero-mesh" />
          <motion.div
            className="hero-blob absolute top-16 -left-10 -z-10 h-56 w-56 rounded-full bg-indigo-400"
            animate={{ y: [0, -14, 0], x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="hero-blob absolute right-0 bottom-8 -z-10 h-72 w-72 rounded-full bg-pink-400"
            animate={{ y: [0, 14, 0], x: [0, -8, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              className="max-w-3xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-4 py-2 text-sm font-medium text-indigo-700 backdrop-blur">
                <Sparkles size={16} />
                Future-ready LMS for modern learners
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Learn Smarter with EduFlow
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-slate-600">
                Department-based courses, interactive quizzes, certificates, and
                a vibrant community - all in one platform.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-indigo-700"
                >
                  Get Started
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white/85 px-6 py-3 font-semibold text-indigo-700 transition hover:-translate-y-0.5 hover:border-indigo-300"
                >
                  Browse Courses
                  <ChevronRight size={18} />
                </Link>
              </div>
            </motion.div>

            <motion.div
              ref={statRef}
              className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              variants={cardContainer}
              initial="hidden"
              animate={statInView ? "show" : "hidden"}
            >
              {stats.map(({ icon: Icon, value, suffix, label }) => (
                <motion.article
                  key={label}
                  variants={cardVariant}
                  className="glass rounded-2xl border border-indigo-100 px-5 py-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
                      <Icon size={18} />
                    </div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-slate-900">
                    {statInView ? <CountUp end={value} duration={2} /> : 0}
                    {suffix}
                  </p>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        <Reveal className="section-grid py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Platform Features
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
                Everything You Need To Learn, Practice, and Grow
              </h2>
            </div>

            <motion.div
              className="grid gap-5 md:grid-cols-2 lg:grid-cols-4"
              variants={cardContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {featureCards.map(({ icon: Icon, title, description }) => (
                <motion.article
                  key={title}
                  variants={cardVariant}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl"
                >
                  <div className="w-fit rounded-xl bg-indigo-100 p-3 text-indigo-700">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </Reveal>

        <Reveal className="relative py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
                How It Works
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
                Learn in 3 Simple Steps
              </h2>
            </div>

            <div className="relative grid gap-6 md:grid-cols-3">
              <motion.div
                className="pointer-events-none absolute top-12 left-12 right-12 hidden h-1 rounded-full bg-gradient-to-r from-indigo-300 via-pink-300 to-emerald-300 md:block"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              />

              {steps.map(({ icon: Icon, title, description }, index) => (
                <motion.article
                  key={title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-slate-900 p-2 text-white">
                      <Icon size={18} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
                Departments
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
                Explore Department Pathways
              </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {departments.map(({ name, description, modules, color, icon: Icon }, index) => (
                <motion.article
                  key={name}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  whileHover={{ y: -8 }}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className={`bg-gradient-to-r ${color} px-6 py-5 text-white`}>
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      <h3 className="text-lg font-semibold">{name}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-slate-600">{description}</p>
                    <ul className="mt-4 space-y-2 text-sm text-slate-700">
                      {modules.map((moduleName) => (
                        <li key={moduleName} className="flex items-center gap-2">
                          <CheckCircle2 size={15} className="text-emerald-500" />
                          {moduleName}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/dashboard"
                      className="mt-5 inline-flex items-center gap-2 font-semibold text-primary hover:text-indigo-700"
                    >
                      Explore
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-pink-600">
                Testimonials
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
                What Students Say
              </h2>
            </div>
            <motion.div
              className="grid gap-5 lg:grid-cols-3"
              variants={cardContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {testimonials.map(({ name, department, quote }) => (
                <motion.article
                  key={name}
                  variants={cardVariant}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-3 flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-sm leading-7 text-slate-600">"{quote}"</p>
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="font-semibold text-slate-900">{name}</p>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      {department}
                    </p>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </Reveal>

        <Reveal className="pb-20">
          <div className="mx-auto max-w-5xl px-6">
            <motion.section
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-indigo-600 to-secondary px-8 py-12 text-white shadow-xl"
            >
              <h2 className="text-3xl font-bold sm:text-4xl">
                Ready to Start Your Learning Journey?
              </h2>
              <p className="mt-3 max-w-2xl text-indigo-100">
                Join thousands of students already learning with EduFlow.
              </p>
              <Link
                to="/register"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-primary transition hover:-translate-y-0.5"
              >
                Sign Up Now
                <ArrowRight size={18} />
              </Link>
            </motion.section>
          </div>
        </Reveal>
      </main>

      <Footer />
    </motion.div>
  );
};

export default HomePage;
