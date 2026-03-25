import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LogOut, UserCircle2, ChevronDown } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const guestLinks = [
	{ to: "/", label: "Home" },
	{ to: "/courses/1", label: "Cources" },
	{ to: "/quiz/1", label: "Quizes" },
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
		`rounded-lg px-3 py-2 text-sm font-medium transition ${
			isActive
				? "bg-indigo-100 text-primary"
				: "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
		}`;

	const handleLogout = async () => {
		await logout();
		navigate("/", { replace: true });
	};

	return (
		<header className="fixed top-0 z-50 w-full px-4 py-3 md:px-8">
			<nav className="glass mx-auto flex w-full max-w-7xl items-center justify-between rounded-2xl px-4 py-3 shadow-lg">
				<Link to="/" className="flex items-center gap-2">
					<span className="rounded-lg bg-primary px-2 py-1 text-xs font-bold text-white">
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

				<div className="hidden items-center gap-3 md:flex">
					{isAuthenticated ? (
						<>
							<div className="relative">
								<button
									type="button"
									onClick={() => setProfileOpen((prev) => !prev)}
									className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700"
								>
									<UserCircle2 className="h-5 w-5 text-indigo-600" />
									<span>{user?.name || "User"}</span>
									<ChevronDown className="h-4 w-4" />
								</button>

								<AnimatePresence>
									{profileOpen && (
										<motion.div
											initial={{ opacity: 0, y: -6 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -6 }}
											className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
										>
											<Link
												to="/dashboard"
												onClick={() => setProfileOpen(false)}
												className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
											>
												Profile
											</Link>
											<button
												type="button"
												onClick={handleLogout}
												className="mt-1 inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
											>
												<LogOut size={16} /> Logout
											</button>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</>
					) : (
						<>
							<Link
								to="/login"
								className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
							>
								Login
							</Link>
							<Link
								to="/register"
								className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
							>
								Register
							</Link>
						</>
					)}
				</div>

				<button
					type="button"
					onClick={() => setOpen((prev) => !prev)}
					className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
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
						className="glass mx-auto mt-2 w-full max-w-7xl rounded-2xl p-3 md:hidden"
					>
						<div className="flex flex-col gap-1">
							{currentLinks.map((item) => (
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

						<div className="mt-3 border-t border-white/60 pt-3">
							{isAuthenticated ? (
								<button
									type="button"
									onClick={async () => {
										await handleLogout();
										setOpen(false);
									}}
									className="w-full rounded-lg border border-slate-200 px-4 py-2 text-left text-sm font-medium text-slate-700"
								>
									Logout
								</button>
							) : (
								<div className="flex gap-2">
									<Link
										to="/login"
										onClick={() => setOpen(false)}
										className="w-full rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700"
									>
										Login
									</Link>
									<Link
										to="/register"
										onClick={() => setOpen(false)}
										className="w-full rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-white"
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
