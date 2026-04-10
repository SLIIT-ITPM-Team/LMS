import React, { useEffect, useState } from "react";
import { BookOpen, FileText, Inbox } from "lucide-react";
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

const DepartmentSelector = ({ activeCategory, departments, isLoading, onSelectDepartment }) => {
	const config = categoryConfig[activeCategory];
	if (!config) return null;

	const Icon = config.icon;

	return (
		<div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur-xl md:p-8">
			<p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
				{config.label}
			</p>
			<h3 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
				Choose Department
			</h3>
			<p className="mt-2 text-sm text-slate-600 md:text-base">
				{config.description}
			</p>

			{isLoading ? (
				<div className="mt-6 text-sm text-slate-500">Loading departments...</div>
			) : departments.length === 0 ? (
				<div className="mt-6 text-sm text-slate-500">No departments found.</div>
			) : (
				<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{departments.map((department) => (
						<button
							key={department._id}
							type="button"
							onClick={() => onSelectDepartment(department._id, config.route)}
							className="group flex items-start gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 text-left shadow-md transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
						>
							<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
								<Icon size={20} />
							</div>
							<div>
								<p className="text-sm font-semibold text-slate-900">{department.name}</p>
								<p className="mt-0.5 text-xs text-slate-500">{config.label.charAt(0) + config.label.slice(1).toLowerCase()} materials</p>
							</div>
						</button>
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
