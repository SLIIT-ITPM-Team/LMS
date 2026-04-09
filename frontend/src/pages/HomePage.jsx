import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";
import Footer from "../components/layout/Footer";

const valueCards = [
  {
    title: "Smart Course Paths",
    description: "Structured module journeys for measurable learning outcomes.",
    icon: Layers,
  },
  {
    title: "Video Learning Hub",
    description: "Interactive lessons with replay and chapter-based navigation.",
    icon: MonitorPlay,
  },
  {
    title: "Certificate Ready",
    description: "Completion certificates with verifiable learner progress.",
    icon: GraduationCap,
  },
  {
    title: "Secure Platform",
    description: "Role-based access and protected learner data across the system.",
    icon: ShieldCheck,
  },
];

const badges = ["95% completion focus", "Live instructor support", "AI-powered summaries"];

const metrics = [
  { value: "1,000+", label: "Active learners" },
  { value: "50+", label: "Expert courses" },
  { value: "98%", label: "Satisfaction" },
];

const learningPaths = [
  { title: "Frontend Engineering", users: "1,204 learners" },
  { title: "Data Analytics Fundamentals", users: "982 learners" },
  { title: "Cloud and DevOps Essentials", users: "1,536 learners" },
];

const HERO_VIDEO_SOURCES = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
];

const HomeSkeleton = () => (
  <div className="min-h-screen animate-pulse bg-[#ebf5ff] px-4 pt-28 pb-16 md:px-8">
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="h-14 w-full rounded-2xl bg-slate-200" />
      <div className="h-[420px] rounded-3xl bg-slate-200" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-200" />
        ))}
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoIndex, setVideoIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (videoFailed || videoReady) return;

    const stallTimer = setTimeout(() => {
      setVideoIndex((prev) => {
        if (prev < HERO_VIDEO_SOURCES.length - 1) {
          return prev + 1;
        }

        setVideoFailed(true);
        return prev;
      });
    }, 7000);

    return () => clearTimeout(stallTimer);
  }, [videoFailed, videoReady, videoIndex]);

  useEffect(() => {
    setVideoReady(false);
  }, [videoIndex]);

  const handleVideoError = () => {
    setVideoIndex((prev) => {
      if (prev < HERO_VIDEO_SOURCES.length - 1) {
        return prev + 1;
      }

      setVideoFailed(true);
      return prev;
    });
  };

  if (loading) return <HomeSkeleton />;

  return (
    <>
      <motion.div
        className="overflow-x-hidden bg-[#ebf5ff] text-slate-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <main className="px-4 pt-24 pb-16 md:px-8">
          <div className="mx-auto max-w-7xl">
            <section className="rounded-[30px] bg-white p-4 shadow-[0_26px_72px_-46px_rgba(15,23,42,0.48)] md:p-6">
              <div className="overflow-hidden rounded-3xl bg-[#1f1b52] p-4 md:p-5">
                <div className="rounded-2xl bg-gradient-to-r from-[#202356] via-[#282c6f] to-[#2f4590] p-5 text-white md:p-8">
                  <div className="grid items-center gap-6 lg:grid-cols-[1fr_360px]">
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
                        <BookOpenCheck size={14} /> Trusted by learning teams
                      </span>

                      <h1 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight md:text-5xl">
                        Become a Certified LMS Learner with Practical Skills.
                      </h1>

                      <p className="mt-4 max-w-xl text-sm text-blue-100 md:text-base">
                        EduFlow is your complete learning management platform with structured modules,
                        progress tracking, intelligent assessments, and certificate-ready outcomes.
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <Link
                          to="/register"
                          className="inline-flex items-center gap-2 rounded-full bg-[#33a4ff] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2692e8]"
                        >
                          Apply now <ArrowRight size={15} />
                        </Link>
                        <Link
                          to="/courses"
                          className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                          Support & Tuition
                        </Link>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-2.5">
                        {badges.map((badge) => (
                          <span
                            key={badge}
                            className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/20">
                      {!videoFailed ? (
                        <>
                          <video
                            key={HERO_VIDEO_SOURCES[videoIndex]}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                            onError={handleVideoError}
                            onLoadedData={() => setVideoReady(true)}
                            className="h-[240px] w-full object-cover md:h-[300px]"
                            poster="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80"
                          >
                            <source src={HERO_VIDEO_SOURCES[videoIndex]} type="video/mp4" />
                          </video>

                          {!videoReady && (
                            <div className="absolute inset-0 grid place-items-center bg-[#141339]/55">
                              <div className="text-center text-white">
                                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                <p className="mt-2 text-xs text-blue-100">Loading video...</p>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex h-[240px] w-full items-center justify-center bg-gradient-to-br from-indigo-700 to-violet-700 md:h-[300px]">
                          <div className="text-center text-white">
                            <CirclePlay className="mx-auto h-12 w-12 text-white/90" />
                            <p className="mt-2 text-sm font-semibold">LMS Learning Experience</p>
                            <p className="text-xs text-violet-100">Video preview unavailable right now.</p>
                          </div>
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141339]/55 via-transparent to-transparent" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {metrics.map((item) => (
                  <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">{item.label}</p>
                    <p className="mt-1 text-3xl font-bold text-slate-900">{item.value}</p>
                    <p className="mt-1 text-xs font-semibold text-emerald-600">Growing steadily</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-8 rounded-3xl bg-white p-6 shadow-[0_26px_70px_-46px_rgba(15,23,42,0.46)]">
              <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
                <div className="overflow-hidden rounded-2xl bg-[#f6f8ff]">
                  <div className="grid h-full place-content-center p-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Users size={14} /> 95% Outcome Focus
                      </div>
                      <div className="mt-3 grid h-44 place-content-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
                        <UserRound className="h-14 w-14 text-slate-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">The Problem</p>
                  <h2 className="mt-2 text-3xl font-extrabold leading-tight text-slate-900">
                    You are Smart. Capable. Ambitious. But You are Undervalued.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Traditional education is not designed for modern learners who need flexibility,
                    progress visibility, and real career outcomes. EduFlow brings all essential LMS
                    capabilities into one elegant platform.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {valueCards.map(({ title, description, icon: Icon }) => (
                      <article key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                        <div className="inline-flex rounded-lg bg-violet-100 p-2 text-violet-700">
                          <Icon size={16} />
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-slate-900">{title}</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{description}</p>
                      </article>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 rounded-full bg-[#2f65ea] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2557d8]"
                    >
                      Join EduFlow <ArrowRight size={15} />
                    </Link>
                    <div className="inline-flex items-center gap-1 text-sm font-semibold text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                      <span className="ml-1 text-slate-700">4.9 learner satisfaction</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-8 rounded-3xl bg-gradient-to-r from-[#4d39cd] via-[#4f4fdd] to-[#2f7de9] p-6 text-white shadow-[0_26px_70px_-46px_rgba(32,46,154,0.7)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Ready to start?</p>
                  <h3 className="mt-1 text-2xl font-bold">Build your career with our learning management system.</h3>
                  <p className="mt-1 text-sm text-blue-100">Enroll in curated paths, practice with quizzes, and earn your certificate.</p>
                </div>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-indigo-800"
                >
                  Create account <ArrowRight size={15} />
                </Link>
              </div>
            </section>

            <section className="mt-8 rounded-3xl bg-white p-6 shadow-[0_20px_54px_-40px_rgba(15,23,42,0.48)]">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-slate-900">Popular learning paths</h3>
                <Link to="/courses" className="text-sm font-semibold text-violet-700">View all</Link>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {learningPaths.map((item) => (
                  <article key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="inline-flex rounded-lg bg-violet-100 p-2 text-violet-700">
                      <BookOpen size={16} />
                    </div>
                    <h4 className="mt-2 text-base font-semibold text-slate-900">{item.title}</h4>
                    <p className="mt-1 text-sm text-slate-600">{item.users}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </main>
      </motion.div>
      <Footer />
    </>
  );
};

export default HomePage;
