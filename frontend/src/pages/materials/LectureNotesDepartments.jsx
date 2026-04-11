import { useEffect, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import { getMaterialHierarchy } from "../../api/material.api";

const CARD_GRADIENTS = [
	{ from: "#4B6EF5", to: "#6B8FF8" },
	{ from: "#2563EB", to: "#3B82F6" },
	{ from: "#059669", to: "#10B981" },
	{ from: "#F97316", to: "#EF4444" },
	{ from: "#7C3AED", to: "#8B5CF6" },
	{ from: "#DB2777", to: "#EC4899" },
];

const LectureNotesDepartments = () => {
	const navigate = useNavigate();
	const [departments, setDepartments] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const loadDepartments = async () => {
			setIsLoading(true);
			try {
				const response = await getMaterialHierarchy();
				setDepartments(response?.data?.departments || []);
			} catch (error) {
				toast.error(error?.response?.data?.message || "Failed to load departments");
			} finally {
				setIsLoading(false);
			}
		};

		loadDepartments();
	}, []);

	return (
		<div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-pink-50 to-blue-50 text-slate-900">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -left-24 -top-10 h-80 w-80 rounded-full bg-purple-300/25 blur-3xl" />
				<div className="absolute right-10 top-20 h-72 w-72 rounded-full bg-pink-300/25 blur-3xl" />
				<div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />
			</div>

			<Navbar />

			<main className="relative mx-auto max-w-6xl px-4 pb-16 pt-28 md:px-8">
				<div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur-xl md:p-8">
					<button
						type="button"
						onClick={() => navigate("/materials")}
						className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
					>
						<ChevronLeft size={16} />
						Back to Materials
					</button>

					<h1 className="mt-6 text-2xl font-bold text-slate-900 md:text-3xl">
						Choose a Department
					</h1>
					<p className="mt-1 text-sm text-slate-500">
						Browse lecture notes by academic department.
					</p>

					{isLoading ? (
						<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{[...Array(3)].map((_, i) => (
								<div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-100" />
							))}
						</div>
					) : departments.length === 0 ? (
						<p className="mt-6 text-sm text-slate-500">No departments found.</p>
					) : (
						<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{departments.map((department, index) => {
								const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
								return (
									<button
										key={department._id}
										type="button"
										onClick={() => navigate(`/materials/lecture-notes/${department._id}`)}
										className="group relative overflow-hidden rounded-2xl p-6 text-left shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus:outline-none"
										style={{
											background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
										}}
									>
										{/* Decorative circles */}
										<div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/20" />
										<div className="pointer-events-none absolute -bottom-8 -right-4 h-40 w-40 rounded-full bg-white/10" />

										{/* Icon */}
										<div className="relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
											<BookOpen size={22} />
										</div>

										{/* Name & count */}
										<p className="relative text-lg font-bold text-white">{department.name}</p>
										<p className="relative mt-0.5 text-sm text-white/75">
											{department.modules?.length
												? `${department.modules.length} module${department.modules.length !== 1 ? "s" : ""} available`
												: "Lecture notes available"}
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
							})}
						</div>
					)}
				</div>
			</main>
		</div>
	);
};

export default LectureNotesDepartments;
