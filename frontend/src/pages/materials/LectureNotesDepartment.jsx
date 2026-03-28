import React, { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import {
	LECTURE_NOTE_DATA,
	LECTURE_NOTE_DEPARTMENTS,
	LECTURE_NOTE_YEARS,
} from "./lectureNotesData";

const LectureNotesDepartment = () => {
	const navigate = useNavigate();
	const { department } = useParams();
	const departmentCode = (department || "").trim();

	const departmentInfo = useMemo(
		() =>
			LECTURE_NOTE_DEPARTMENTS.find(
				(item) => item.code.toLowerCase() === departmentCode.toLowerCase(),
			),
		[departmentCode],
	);

	const [selectedYear, setSelectedYear] = useState(LECTURE_NOTE_YEARS[0]);

	if (!departmentInfo) {
		return (
			<div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-pink-50 to-blue-50 text-slate-900">
				<Navbar />
				<main className="relative mx-auto max-w-5xl px-4 pb-16 pt-28 md:px-8">
					<div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
						<p className="text-sm text-slate-600">Department not found.</p>
						<button
							type="button"
							onClick={() => navigate("/materials")}
							className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
						>
							Back to Materials
						</button>
					</div>
				</main>
			</div>
		);
	}

	const yearModules = LECTURE_NOTE_DATA[departmentInfo.code][selectedYear];

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

					<p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
						Materials / Lecture Notes / {departmentInfo.code}
					</p>
					<h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
						{departmentInfo.code} Lecture Notes
					</h1>
					<p className="mt-2 text-sm text-slate-600 md:text-base">
						Select an academic year to view modules.
					</p>

					<div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{LECTURE_NOTE_YEARS.map((yearLabel) => {
							const isActive = yearLabel === selectedYear;
							return (
								<button
									key={yearLabel}
									type="button"
									onClick={() => setSelectedYear(yearLabel)}
									className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
										isActive
											? "border-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg shadow-indigo-200"
											: "border-white/70 bg-white/90 text-slate-800 shadow-md hover:-translate-y-0.5 hover:shadow-lg"
									}`}
								>
									{yearLabel}
								</button>
							);
						})}
					</div>

					<div className="mt-8">
						<h2 className="text-xl font-bold text-slate-900">{selectedYear} Modules</h2>
						<div className="mt-4 grid gap-4 md:grid-cols-2">
							{yearModules.map((module) => (
								<article
									key={module.id}
									className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-md"
								>
									<p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
										{module.code}
									</p>
									<h3 className="mt-1 text-base font-semibold text-slate-900">
										{module.name}
									</h3>
									<p className="mt-2 text-sm text-slate-600">{module.description}</p>
									<button
										type="button"
										className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
									>
										View Notes
									</button>
								</article>
							))}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default LectureNotesDepartment;
