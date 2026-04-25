import React from "react";
import { Upload, Library } from "lucide-react";

const MaterialHeader = ({ onFilter, onUpload }) => {
	return (
		<div className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur-xl md:flex-row md:items-center md:justify-between">
			<div>
				<p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-indigo-500">
					<Library size={14} className="text-pink-500" />
					Study Hub
				</p>
				<h1 className="mt-2 text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 md:text-5xl drop-shadow-sm">
					Materials
				</h1>
				<p className="mt-3 max-w-2xl text-sm font-medium text-slate-600 md:text-base leading-relaxed">
					Access all your study resources in one place. Browse, preview, and
					get AI-powered summaries instantly.
				</p>
			</div>
			<div className="flex flex-wrap items-center gap-3">

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
