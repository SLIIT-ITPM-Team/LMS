import { useEffect, useState } from "react";
import { BookOpen, FileText, Inbox, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import MaterialHeader from "../../components/materials/MaterialHeader";
import MaterialUploadForm from "../../components/materials/MaterialUploadForm";
import SearchBar from "../../components/materials/SearchBar";
import CategoryCards from "../../components/materials/CategoryCards";
import { getMaterialHierarchy } from "../../api/material.api";

const categories = [
	{ name: "Lecture Notes", meta: "By Department" },
	{ name: "Past Papers", meta: "By Department" },
	{ name: "Model Papers", meta: "By Department" },
	{ name: "Short Notes", meta: "By Department" },
];

const categoryConfig = {
	"Lecture Notes": {
		label: "LECTURE NOTES",
		description: "Select a department to browse lecture note materials",
		icon: BookOpen,
		route: "lecture-notes",
	},
	"Past Papers": {
		label: "PAST PAPERS",
		description: "Select a department to browse past papers",
		icon: FileText,
		route: "past-papers",
	},
	"Model Papers": {
		label: "MODEL PAPERS",
		description: "Select a department to browse model paper materials",
		icon: FileText,
		route: "model-papers",
	},
	"Short Notes": {
		label: "SHORT NOTES",
		description: "Select a department to browse short note materials",
		icon: FileText,
		route: "short-notes",
	},
};

const EmptyState = () => (
	<div className="mt-10 rounded-3xl border-2 border-dashed border-slate-300 bg-white/70 p-10 text-center shadow-lg backdrop-blur">
		<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 via-pink-100 to-blue-100 text-indigo-600">
			<Inbox size={24} />
		</div>
		<h3 className="mt-4 text-lg font-semibold text-slate-900">
			No materials found
		</h3>
		<p className="mt-2 text-sm text-slate-600">
			Upload new materials to get started or try a different category.
		</p>
	</div>
);

const CARD_GRADIENTS = [
	{ from: "#4B6EF5", to: "#6B8FF8" },
	{ from: "#2563EB", to: "#3B82F6" },
	{ from: "#059669", to: "#10B981" },
	{ from: "#F97316", to: "#EF4444" },
	{ from: "#7C3AED", to: "#8B5CF6" },
	{ from: "#DB2777", to: "#EC4899" },
];

const DepartmentCard = ({ department, index, icon: Icon, label, onClick }) => {
	const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

	return (
		<button
			type="button"
			onClick={onClick}
			className="group relative overflow-hidden rounded-2xl p-6 text-left shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus:outline-none"
			style={{
				background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
			}}
		>
			{/* Decorative circles */}
			<div
				className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-20"
				style={{ background: "white" }}
			/>
			<div
				className="pointer-events-none absolute -bottom-8 -right-4 h-40 w-40 rounded-full opacity-10"
				style={{ background: "white" }}
			/>

			{/* Icon */}
			<div className="relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
				<Icon size={22} />
			</div>

			{/* Name & count */}
			<p className="relative text-lg font-bold text-white">{department.name}</p>
			<p className="relative mt-0.5 text-sm text-white/75">
				{department.modules?.length
					? `${department.modules.length} module${department.modules.length !== 1 ? "s" : ""} available`
					: `${label} available`}
			</p>

			{/* Footer */}
			<div className="relative mt-5 flex items-center justify-between">
				<span className="text-sm font-semibold text-white">Explore</span>
				<span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-all duration-200 group-hover:bg-white/30">
					<ChevronRight size={16} />
				</span>
			</div>
		</button>
	);
};

const DepartmentSelector = ({ activeCategory, departments, isLoading, onSelectDepartment }) => {
	const config = categoryConfig[activeCategory];
	if (!config) return null;

	const Icon = config.icon;

	return (
		<div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur-xl md:p-8">
			<h3 className="text-2xl font-bold text-slate-900 md:text-3xl">
				Choose a Department
			</h3>
			<p className="mt-1 text-sm text-slate-500">
				{config.description}
			</p>

			{isLoading ? (
				<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{[...Array(3)].map((_, i) => (
						<div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-100" />
					))}
				</div>
			) : departments.length === 0 ? (
				<div className="mt-6 text-sm text-slate-500">No departments found.</div>
			) : (
				<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{departments.map((department, index) => (
						<DepartmentCard
							key={department._id}
							department={department}
							index={index}
							icon={Icon}
							label={config.label.toLowerCase()}
							onClick={() => onSelectDepartment(department._id, config.route)}
						/>
					))}
				</div>
			)}
		</div>
	);
};

const Materials = () => {
	const navigate = useNavigate();
	const [activeCategory, setActiveCategory] = useState(categories[0].name);
	const [query, setQuery] = useState("");
	const [isSendMaterialOpen, setIsSendMaterialOpen] = useState(false);
	const [departments, setDepartments] = useState([]);
	const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

	useEffect(() => {
		const loadDepartments = async () => {
			setIsLoadingDepartments(true);
			try {
				const response = await getMaterialHierarchy();
				setDepartments(response?.data?.departments || []);
			} catch (error) {
				toast.error(error?.response?.data?.message || "Failed to load departments");
			} finally {
				setIsLoadingDepartments(false);
			}
		};

		loadDepartments();
	}, []);

	const handleSelectDepartment = (departmentId, route) => {
		navigate(`/materials/${route}/${departmentId}`);
	};

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
					{categoryConfig[activeCategory] ? (
						<DepartmentSelector
							activeCategory={activeCategory}
							departments={departments}
							isLoading={isLoadingDepartments}
							onSelectDepartment={handleSelectDepartment}
						/>
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
