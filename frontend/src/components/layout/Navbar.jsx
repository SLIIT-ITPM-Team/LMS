import React, { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
	Bell,
	LogOut,
	Menu,
	Search,
	UserRound,
	X,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";

const guestLinks = [
	{ to: "/", label: "Home" },
	{ to: "/courses", label: "Courses" },
	{ to: "/quizzes", label: "Quizzes" },
	{ to: "/materials", label: "Materials" },
	{ to: "/community", label: "Community" },
];

const studentLinks = [
	{ to: "/dashboard", label: "Dashboard" },
	{ to: "/courses/1", label: "My Courses" },
	{ to: "/quiz/1", label: "Quizzes" },
	{ to: "/community", label: "Community" },
	{ to: "/certificates", label: "Certificates" },
];

const adminLinks = [
	{ to: "/admin", label: "Dashboard" },
	{ to: "/admin/users", label: "Users" },
	{ to: "/admin/modules", label: "Modules" },
	{ to: "/admin/departments", label: "Departments" },
	{ to: "/admin/reports", label: "Reports" },
];

const Navbar = () => {
	const [open, setOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
	const { isAuthenticated, user, logout, isAdmin } = useAuth();
	const navigate = useNavigate();

	const currentLinks = isAuthenticated ? (isAdmin ? adminLinks : studentLinks) : guestLinks;

	const navLinkClass = ({ isActive }) =>
		`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
			isActive
				? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg shadow-indigo-200"
				: "text-slate-700 hover:bg-white/60 hover:text-slate-900"
		}`;

	const handleLogout = async () => {
		await logout();
		navigate("/", { replace: true });
	};

	return (
		<header className="fixed top-0 z-50 w-full px-4 py-3 md:px-6">
			<nav className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-xl backdrop-blur-xl">
				<Link to="/" className="flex items-center gap-2">
					<span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-xs font-extrabold text-white shadow-lg shadow-indigo-200">
						EF
					</span>
					<span className="text-lg font-bold text-slate-900">EduFlow</span>
				</Link>

				<div className="hidden items-center gap-1 md:flex">
					{currentLinks.map((item) => (
						<NavLink key={item.label} to={item.to} className={navLinkClass}>
							{item.label}
						</NavLink>
					))}
				</div>

				<div className="hidden items-center gap-2 md:flex">
					<div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-2 text-sm text-slate-600 shadow-inner backdrop-blur">
						<Search size={16} className="text-slate-500" />
						<input
							type="text"
							placeholder="Search"
							className="w-32 bg-transparent text-sm outline-none placeholder:text-slate-400"
						/>
					</div>
					<button
						type="button"
						className="rounded-full border border-white/80 bg-white/70 p-2 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
						aria-label="Notifications"
					>
						<Bell size={18} />
					</button>
					<div className="flex items-center gap-3 rounded-full border border-white/60 bg-white/70 px-3 py-2 shadow-sm backdrop-blur">
						<span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white">
							{initials}
						</span>
						<div className="leading-tight">
							<p className="text-sm font-semibold text-slate-900">
								{displayName}
							</p>
							<p className="text-xs text-slate-500">Learner</p>
						</div>
					</div>
					{isAuthenticated && (
						<button
							type="button"
							onClick={handleLogout}
							className="rounded-full border border-white/80 bg-white/70 p-2 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
							aria-label="Logout"
						>
							<LogOut size={18} />
						</button>
					)}
				</div>

				<button
					type="button"
					onClick={() => setOpen((prev) => !prev)}
					className="rounded-xl border border-white/70 bg-white/70 p-2 text-slate-700 shadow-sm backdrop-blur md:hidden"
					aria-label="Toggle menu"
				>
					{open ? <X size={20} /> : <Menu size={20} />}
				</button>
			</nav>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						className="mx-auto mt-2 w-full max-w-7xl rounded-2xl border border-white/60 bg-white/80 p-4 shadow-lg backdrop-blur md:hidden"
					>
						<div className="flex flex-col gap-2">
							{baseLinks.map((item) => (
								<NavLink
									key={item.label}
									to={item.to}
									className={navLinkClass}
									onClick={() => setOpen(false)}
								>
									{item.label}
								</NavLink>
							))}
						</div>

						<div className="mt-3 space-y-3 border-t border-white/70 pt-3">
							<div className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-sm text-slate-600 shadow-inner">
								<Search size={16} className="text-slate-500" />
								<input
									type="text"
									placeholder="Search"
									className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
								/>
							</div>
							<div className="flex items-center gap-3 rounded-xl border border-white/60 bg-white/70 px-3 py-2 shadow-sm">
								<span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white">
									{initials}
								</span>
								<div className="leading-tight">
									<p className="text-sm font-semibold text-slate-900">
										{displayName}
									</p>
									<p className="text-xs text-slate-500">Learner</p>
								</div>
							</div>
							{isAuthenticated ? (
								<button
									type="button"
									onClick={async () => {
										await handleLogout();
										setOpen(false);
									}}
									className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200"
								>
									<LogOut size={16} />
									Logout
								</button>
							) : (
								<div className="flex gap-2">
									<Link
										to="/login"
										onClick={() => setOpen(false)}
										className="w-full rounded-xl border border-white/70 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700"
									>
										Login
									</Link>
									<Link
										to="/register"
										onClick={() => setOpen(false)}
										className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-2 text-center text-sm font-semibold text-white shadow-md shadow-indigo-200"
									>
										Register
									</Link>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	);
};

export default Navbar;
