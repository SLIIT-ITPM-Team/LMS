import React from "react";
import { MessageCircle, Search, Sparkles } from "lucide-react";

const SearchBar = ({ value, onChange, onAskAI, onQuickSummary }) => {
	return (
		<div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-lg backdrop-blur-xl md:p-5">
			<div className="flex flex-col gap-4 md:flex-row md:items-center">
				<div className="flex flex-1 items-center gap-3 rounded-2xl border border-indigo-100 bg-white/80 px-4 py-3 shadow-inner">
					<Search className="text-indigo-500" size={20} />
					<input
						type="text"
						value={value}
						onChange={(event) => onChange(event.target.value)}
						placeholder="Find materials..."
						className="w-full bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400"
					/>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={onAskAI}
						className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
					>
						<MessageCircle size={18} />
						Ask AI
					</button>
					<button
						type="button"
						onClick={onQuickSummary}
						className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-white/90 px-4 py-3 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-xl"
					>
						<Sparkles size={18} />
						Quick Summary
					</button>
				</div>
			</div>
			<p className="mt-3 text-sm text-slate-500">
				Try: <span className="font-semibold text-slate-700">"Summarize Module 3 of Signals"</span>{" "}
				or <span className="font-semibold text-slate-700">"Find past papers for Data Structures"</span>
			</p>
		</div>
	);
};

export default SearchBar;
