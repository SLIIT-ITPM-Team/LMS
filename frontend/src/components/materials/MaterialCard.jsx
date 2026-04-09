import React from "react";
import {
	BookOpen,
	Clock3,
	Download,
	ExternalLink,
	FileText,
	Sparkles,
	Star,
} from "lucide-react";

const difficultyStyles = {
	Easy: {
		dot: "bg-emerald-500",
		badge: "bg-emerald-50 text-emerald-700",
	},
	Medium: {
		dot: "bg-amber-500",
		badge: "bg-amber-50 text-amber-700",
	},
	Hard: {
		dot: "bg-rose-500",
		badge: "bg-rose-50 text-rose-700",
	},
};

const MaterialCard = ({ material }) => {
	const { title, tag, description, readTime, pages, difficulty, insight } =
		material;
	const difficultyClass = difficultyStyles[difficulty] || difficultyStyles.Medium;

	return (
		<article className="group relative h-full rounded-3xl border border-white/60 bg-white/80 p-5 shadow-lg shadow-indigo-100 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl backdrop-blur-xl">
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-center gap-3">
					<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg shadow-indigo-200">
						<FileText size={18} />
					</span>
					<div className="flex flex-col">
						<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
							PDF
						</span>
						<p className="text-sm font-semibold text-slate-800">Resource</p>
					</div>
				</div>
				<span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
					{tag}
				</span>
			</div>

			<h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
			<p className="mt-2 text-sm text-slate-600">{description}</p>

			<div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-700">
				<span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
					<Clock3 size={16} className="text-indigo-600" />
					{readTime} read
				</span>
				<span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
					<BookOpen size={16} className="text-indigo-600" />
					{pages} pages
				</span>
				<span
					className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${difficultyClass.badge}`}
				>
					<span
						className={`h-2.5 w-2.5 rounded-full ${difficultyClass.dot}`}
					/>
					{difficulty}
				</span>
			</div>

			<div className="mt-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-purple-50 p-3">
				<div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
					<Sparkles size={16} />
					AI Insight
				</div>
				<p className="mt-1 text-sm text-slate-600">{insight}</p>
			</div>

			<div className="mt-5 flex flex-wrap items-center gap-2">
				<button
					type="button"
					className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
				>
					<ExternalLink size={16} />
					Open
				</button>
				<button
					type="button"
					className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-lg"
				>
					<Download size={16} />
					Download
				</button>
				<button
					type="button"
					className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-amber-200 hover:text-amber-600 hover:shadow-lg"
				>
					<Star size={16} />
					Favorite
				</button>
			</div>
		</article>
	);
};

export default MaterialCard;
