import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LogOut } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const baseLinks = [
	{ to: "/", label: "Home" },
	{ to: "/community", label: "Community" },
	{ to: "/notifications", label: "Notifications" },
];

const Navbar = () => {
	const [open, setOpen] = useState(false);
	const { isAuthenticated, user, logout } = useAuth();
	const navigate = useNavigate();

	const navLinkClass = ({ isActive }) =>
		`rounded-lg px-3 py-2 text-sm font-medium transition ${
			isActive
				? "bg-indigo-100 text-primary"
				: "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
		}`;

	const handleLogout = () => {
		logout();
		navigate("/");
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
					{baseLinks.map((item) => (
						<NavLink key={item.label} to={item.to} className={navLinkClass}>
							{item.label}
						</NavLink>
					))}
					{isAuthenticated && (
						<NavLink to="/dashboard" className={navLinkClass}>
							Dashboard
						</NavLink>
					)}
				</div>

				<div className="hidden items-center gap-3 md:flex">
					{isAuthenticated ? (
						<>
							<div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2">
								<img
									src={user?.avatar}
									alt={user?.name || "User"}
									className="h-8 w-8 rounded-full border border-slate-200"
								/>
								<span className="text-sm font-medium text-slate-700">
									{user?.name || "Learner"}
								</span>
							</div>
							<button
								type="button"
								onClick={handleLogout}
								className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
							>
								<LogOut size={16} />
								Logout
							</button>
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
							{isAuthenticated && (
								<NavLink
									to="/dashboard"
									className={navLinkClass}
									onClick={() => setOpen(false)}
								>
									Dashboard
								</NavLink>
							)}
						</div>

						<div className="mt-3 border-t border-white/60 pt-3">
							{isAuthenticated ? (
								<button
									type="button"
									onClick={() => {
										handleLogout();
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
