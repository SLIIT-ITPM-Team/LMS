import React from "react";
import { BookOpen, FileText, FolderGit2, Sparkles } from "lucide-react";

const icons = {
	"Lecture Notes": BookOpen,
	"Past Papers": FolderGit2,
	"Model Papers": FileText,
	"Short Notes": Sparkles,
};

const CategoryCards = ({ categories, active, onSelect }) => {
	return (
		<div className="flex gap-3 overflow-x-auto pb-2">
			{categories.map((category) => {
				const Icon = icons[category.name] || BookOpen;
				const isActive = active === category.name;

				return (
					<button
						key={category.name}
						type="button"
						onClick={() => onSelect(category.name)}
						className={`group relative flex min-w-[180px] flex-1 items-start gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-1 hover:shadow-xl ${
							isActive
								? "border-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg shadow-indigo-200"
								: "border-white/70 bg-white/80 text-slate-800 shadow-md backdrop-blur"
						}`}
					>
						<div
							className={`flex h-11 w-11 items-center justify-center rounded-xl ${
								isActive
									? "bg-white/15 text-white"
									: "bg-indigo-50 text-indigo-600"
							}`}
						>
							<Icon size={20} />
						</div>
						<div>
							<p className="text-sm font-semibold">{category.name}</p>
							<p
								className={`text-xs ${
									isActive ? "text-indigo-50/90" : "text-slate-500"
								}`}
							>
								{category.meta}
							</p>
						</div>
						{isActive && (
							<span className="absolute right-3 top-3 rounded-full bg-white/25 px-2 py-1 text-[11px] font-semibold text-white">
								Active
							</span>
						)}
					</button>
				);
			})}
		</div>
	);
};

export default CategoryCards;
