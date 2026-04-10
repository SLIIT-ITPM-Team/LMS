import React, { useEffect, useState } from "react";
import { BookOpen, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import { getMaterialHierarchy } from "../../api/material.api";

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
				<div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur-xl md:p-8">
					<button
						type="button"
						onClick={() => navigate("/materials")}
						className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
					>
						<ChevronLeft size={16} />
						Back to Materials
					</button>

					<p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
						LECTURE NOTES
					</p>
					<h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
						Choose Department
					</h1>
					<p className="mt-2 text-sm text-slate-600 md:text-base">
						Browse lecture notes by academic department.
					</p>

					{isLoading ? (
						<p className="mt-6 text-sm text-slate-500">Loading departments...</p>
					) : departments.length === 0 ? (
						<p className="mt-6 text-sm text-slate-500">No departments found.</p>
					) : (
						<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{departments.map((department) => (
								<button
									key={department._id}
									type="button"
									onClick={() => navigate(`/materials/lecture-notes/${department._id}`)}
									className="group flex items-start gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 text-left shadow-md transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
								>
									<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
										<BookOpen size={20} />
									</div>
									<div>
										<p className="text-sm font-semibold text-slate-900">
											{department.name}
										</p>
										<p className="mt-0.5 text-xs text-slate-500">Lecture note materials</p>
									</div>
								</button>
							))}
						</div>
					)}
				</div>
			</main>
		</div>
	);
};

export default LectureNotesDepartments;
