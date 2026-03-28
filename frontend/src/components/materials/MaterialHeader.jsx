import React from "react";
import { Filter, Upload } from "lucide-react";

const MaterialHeader = ({ onFilter, onUpload }) => {
	return (
		<div className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur-xl md:flex-row md:items-center md:justify-between">
			<div>
				<p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
					Study Hub
				</p>
				<h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
					Materials
				</h1>
				<p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
					Access all your study resources in one place. Browse, preview, and
					get AI-powered summaries instantly.
				</p>
			</div>
			<div className="flex flex-wrap items-center gap-3">
				<button
					type="button"
					onClick={onFilter}
					className="inline-flex items-center gap-2 rounded-xl border border-indigo-200/70 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
				>
					<Filter size={16} />
					Filter
				</button>
				<button
					type="button"
					onClick={onUpload}
					className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
				>
					<Upload size={16} />
					Send Material
				</button>
			</div>
		</div>
	);
};

export default MaterialHeader;
