import React, { useState } from "react";
import { BookOpen, FileText, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import MaterialHeader from "../../components/materials/MaterialHeader";
import MaterialUploadForm from "../../components/materials/MaterialUploadForm";
import SearchBar from "../../components/materials/SearchBar";
import CategoryCards from "../../components/materials/CategoryCards";
import MaterialsGrid from "../../components/materials/MaterialsGrid";

const categories = [
	{ name: "Lecture Notes", meta: "12 Modules | 48 Files" },
	{ name: "Past Papers", meta: "2020-2024 | 24 Files" },
	{ name: "Model Papers", meta: "Instructor | 12 Files" },
	{ name: "Short Notes", meta: "Quick Revision | 31 Files" },
];

const lectureNoteDepartments = ["IT", "SE", "DS", "Cyber", "ISE", "IM"];
const pastPaperDepartments = ["IT", "SE", "DS", "Cyber", "ISE", "IM"];
const modelPaperDepartments = ["IT", "SE", "DS", "Cyber", "ISE", "IM"];
const shortNoteDepartments = ["IT", "SE", "DS", "Cyber", "ISE", "IM"];

const materialsData = [
	{
		id: "mat-1",
		title: "Signals - Module 1",
		tag: "Mod 1",
		description: "Fundamentals of signals, domains, and linear systems.",
		readTime: "8 min",
		pages: 42,
		difficulty: "Easy",
		category: "Lecture Notes",
		insight: "Focuses on Fourier Transform, signal types, and basic properties.",
	},
	{
		id: "mat-2",
		title: "Signals - Module 3",
		tag: "Mod 3",
		description: "Sampling theory, aliasing effects, and reconstruction notes.",
		readTime: "12 min",
		pages: 36,
		difficulty: "Medium",
		category: "Lecture Notes",
		insight: "Highlights Nyquist criteria with worked exam-style examples.",
	},
	{
		id: "mat-3",
		title: "Data Structures - Past Paper 2023",
		tag: "Past Paper",
		description: "Full paper with solutions covering trees, heaps, and graphs.",
		readTime: "18 min",
		pages: 28,
		difficulty: "Hard",
		category: "Past Papers",
		insight: "Emphasizes traversal strategies and optimal heap operations.",
	},
	{
		id: "mat-4",
		title: "Database Model Paper",
		tag: "Model",
		description: "Instructor-curated SQL joins, indexing, and ACID scenarios.",
		readTime: "10 min",
		pages: 22,
		difficulty: "Medium",
		category: "Model Papers",
		insight: "Focus on query plans and normal forms for exam shortcuts.",
	},
	{
		id: "mat-5",
		title: "Operating Systems - Short Notes",
		tag: "Quick",
		description: "Process scheduling cheatsheet and synchronization patterns.",
		readTime: "6 min",
		pages: 12,
		difficulty: "Easy",
		category: "Short Notes",
		insight: "Prioritize critical section solutions and deadlock avoidance tips.",
	},
	{
		id: "mat-6",
		title: "Networks - Past Paper 2022",
		tag: "Past Paper",
		description: "Routing algorithms, TCP/UDP comparisons, subnetting tasks.",
		readTime: "14 min",
		pages: 31,
		difficulty: "Hard",
		category: "Past Papers",
		insight: "Review Dijkstra examples and congestion control flow.",
	},
	{
		id: "mat-7",
		title: "AI - Model Paper",
		tag: "Model",
		description: "Search algorithms, heuristic design, and Bayes nets review.",
		readTime: "11 min",
		pages: 25,
		difficulty: "Medium",
		category: "Model Papers",
		insight: "Focus on A* optimality proof steps and naive Bayes pitfalls.",
	},
	{
		id: "mat-8",
		title: "Signals - Short Notes",
		tag: "Quick",
		description: "Condensed reference for transforms and convolution pairs.",
		readTime: "7 min",
		pages: 15,
		difficulty: "Easy",
		category: "Short Notes",
		insight: "Keep Fourier pairs handy; spotlight time-frequency duality.",
	},
];

const EmptyState = () => (
	<div className="mt-10 rounded-3xl border-2 border-dashed border-slate-300 bg-white/70 p-10 text-center shadow-lg backdrop-blur">
		<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 via-pink-100 to-blue-100 text-indigo-600">
			<Inbox size={24} />
		</div>
		<h3 className="mt-4 text-lg font-semibold text-slate-900">
			No more lecture notes found
		</h3>
		<p className="mt-2 text-sm text-slate-600">
			Upload new materials to get started or try a different category.
		</p>
		<button
			type="button"
			className="mt-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
		>
			Upload Your First Material
		</button>
	</div>
);

const LectureNotesDepartments = ({ onSelectDepartment }) => (
	<div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur-xl md:p-8">
		<p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
			LECTURE NOTES
		</p>
		<h3 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
			Choose Department
		</h3>
		<p className="mt-2 text-sm text-slate-600 md:text-base">
			Select a department to browse lecture note materials
		</p>

		<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{lectureNoteDepartments.map((department) => (
				<button
					key={department}
					type="button"
					onClick={() => onSelectDepartment(department)}
					className="group flex items-start gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 text-left shadow-md transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
				>
					<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
						<BookOpen size={20} />
					</div>
					<div>
						<p className="text-sm font-semibold text-slate-900">{department}</p>
						<p className="mt-0.5 text-xs text-slate-500">Lecture materials</p>
					</div>
				</button>
			))}
		</div>
	</div>
);

const PastPapersDepartments = ({ onSelectDepartment }) => (
	<div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur-xl md:p-8">
		<p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
			PAST PAPERS
		</p>
		<h3 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
			Choose Department
		</h3>
		<p className="mt-2 text-sm text-slate-600 md:text-base">
			Select a department to browse past papers
		</p>

		<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{pastPaperDepartments.map((department) => (
				<button
					key={department}
					type="button"
					onClick={() => onSelectDepartment(department)}
					className="group flex items-start gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 text-left shadow-md transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
				>
					<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
						<FileText size={20} />
					</div>
					<div>
						<p className="text-sm font-semibold text-slate-900">{department}</p>
						<p className="mt-0.5 text-xs text-slate-500">Past exam papers</p>
					</div>
				</button>
			))}
		</div>
	</div>
);

const ModelPapersDepartments = ({ onSelectDepartment }) => (
	<div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur-xl md:p-8">
		<p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
			MODEL PAPERS
		</p>
		<h3 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
			Choose Department
		</h3>
		<p className="mt-2 text-sm text-slate-600 md:text-base">
			Select a department to browse model paper materials
		</p>

		<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{modelPaperDepartments.map((department) => (
				<button
					key={department}
					type="button"
					onClick={() => onSelectDepartment(department)}
					className="group flex items-start gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 text-left shadow-md transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
				>
					<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
						<FileText size={20} />
					</div>
					<div>
						<p className="text-sm font-semibold text-slate-900">{department}</p>
						<p className="mt-0.5 text-xs text-slate-500">Model papers</p>
					</div>
				</button>
			))}
		</div>
	</div>
);

const ShortNotesDepartments = ({ onSelectDepartment }) => (
	<div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur-xl md:p-8">
		<p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
			SHORT NOTES
		</p>
		<h3 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
			Choose Department
		</h3>
		<p className="mt-2 text-sm text-slate-600 md:text-base">
			Select a department to browse short note materials
		</p>

		<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{shortNoteDepartments.map((department) => (
				<button
					key={department}
					type="button"
					onClick={() => onSelectDepartment(department)}
					className="group flex items-start gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 text-left shadow-md transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
				>
					<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
						<FileText size={20} />
					</div>
					<div>
						<p className="text-sm font-semibold text-slate-900">{department}</p>
						<p className="mt-0.5 text-xs text-slate-500">Short notes</p>
					</div>
				</button>
			))}
		</div>
	</div>
);

const Materials = () => {
	const navigate = useNavigate();
	const [activeCategory, setActiveCategory] = useState(categories[0].name);
	const [query, setQuery] = useState("");
	const [isSendMaterialOpen, setIsSendMaterialOpen] = useState(false);

	return (
		<div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-pink-50 to-blue-50 text-slate-900">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -left-24 -top-10 h-80 w-80 rounded-full bg-purple-300/25 blur-3xl" />
				<div className="absolute right-10 top-20 h-72 w-72 rounded-full bg-pink-300/25 blur-3xl" />
				<div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />
			</div>

			<Navbar />

			<main className="relative mx-auto max-w-7xl px-4 pb-16 pt-28 md:px-8">
				<MaterialHeader
					onFilter={() => {}}
					onUpload={() => setIsSendMaterialOpen(true)}
				/>

				<div className="mt-6">
					<SearchBar
						value={query}
						onChange={setQuery}
						onAskAI={() => setQuery("Summarize Module 3 of Signals")}
						onQuickSummary={() => navigate("/materials/quick-summary")}
					/>
				</div>

				<div className="mt-6">
					<CategoryCards
						categories={categories}
						active={activeCategory}
						onSelect={setActiveCategory}
					/>
				</div>

				<div className="mt-8">
					{activeCategory === "Lecture Notes" ? (
						<LectureNotesDepartments
							onSelectDepartment={(department) =>
								navigate(`/materials/lecture-notes/${department}`)
							}
						/>
					) : activeCategory === "Past Papers" ? (
						<PastPapersDepartments
							onSelectDepartment={(department) =>
								navigate(`/materials/past-papers/${department}`)
							}
						/>
					) : activeCategory === "Model Papers" ? (
						<ModelPapersDepartments
							onSelectDepartment={(department) =>
								navigate(`/materials/model-papers/${department}`)
							}
						/>
					) : activeCategory === "Short Notes" ? (
						<ShortNotesDepartments
							onSelectDepartment={(department) =>
								navigate(`/materials/short-notes/${department}`)
							}
						/>
					) : query.trim() && materialsData.length ? (
						<MaterialsGrid materials={materialsData} />
					) : (
						<EmptyState />
					)}
				</div>
			</main>

			<MaterialUploadForm
				isOpen={isSendMaterialOpen}
				onClose={() => setIsSendMaterialOpen(false)}
			/>

			<Footer />
		</div>
	);
};

export default Materials;
