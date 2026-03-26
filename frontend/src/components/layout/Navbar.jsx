import React, { useEffect, useMemo, useState } from "react";
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
import { getNotifications, getUnreadCount, markAllAsRead, markAsRead } from "../../api/notification.api";

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
    { to: "/materials", label: "Materials" },
	{ to: "/certificates", label: "Certificates" },
];

const adminLinks = [
	{ to: "/admin", label: "Dashboard" },
	{ to: "/admin/users", label: "Users" },
	{ to: "/admin/modules", label: "Modules" },
	{ to: "/admin/departments", label: "Departments" },
	{ to: "/admin/community", label: "Community" },
	{ to: "/admin/reports", label: "Reports" },
];

const Navbar = () => {
	const [open, setOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);
	const [notifOpen, setNotifOpen] = useState(false);
	const [notifications, setNotifications] = useState([]);
	const { isAuthenticated, user, logout, isAdmin } = useAuth();
	const navigate = useNavigate();

	// Generate user initials and display name
	const initials = useMemo(() => {
		if (!user?.name) return "U";
		const names = user.name.split(" ");
		if (names.length >= 2) {
			return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
		}
		return names[0][0].toUpperCase();
	}, [user?.name]);

	const displayName = useMemo(() => {
		if (!user?.name) return "User";
		return user.name;
	}, [user?.name]);

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

	useEffect(() => {
		let timer;

		const loadUnread = async () => {
			if (!isAuthenticated) {
				setUnreadCount(0);
				return;
			}
			try {
				const response = await getUnreadCount();
				setUnreadCount(response.data.unreadCount || 0);
			} catch {
				setUnreadCount(0);
			}
		};

		loadUnread();
		timer = setInterval(loadUnread, 30000);

		return () => clearInterval(timer);
	}, [isAuthenticated]);

	useEffect(() => {
		const loadNotifications = async () => {
			if (!isAuthenticated || !notifOpen) return;
			try {
				const response = await getNotifications({ limit: 10 });
				setNotifications(response.data.data || []);
			} catch {
				setNotifications([]);
			}
		};

		loadNotifications();
	}, [isAuthenticated, notifOpen]);

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
						className="relative rounded-full border border-white/80 bg-white/70 p-2 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
						aria-label="Notifications"
						onClick={() => setNotifOpen((prev) => !prev)}
					>
						<span className="relative">
							<Bell size={18} />
							{unreadCount > 0 && (
								<span className="absolute -top-2 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white">
									{unreadCount > 99 ? "99+" : unreadCount}
								</span>
							)}
						</span>

						{notifOpen && (
							<div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
								<div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
									<p className="text-sm font-semibold text-slate-900">Notifications</p>
									<button
										type="button"
										className="text-xs font-semibold text-indigo-600"
										onClick={async () => {
											await markAllAsRead();
											setUnreadCount(0);
											setNotifications((prev) =>
												prev.map((n) => ({ ...n, isRead: true }))
											);
										}}
									>
										Mark all read
									</button>
								</div>
								<div className="max-h-80 overflow-auto">
									{notifications.length === 0 ? (
										<p className="px-4 py-6 text-center text-xs text-slate-500">
											No notifications yet.
										</p>
									) : (
										notifications.map((note) => (
											<button
												key={note._id}
												type="button"
												className={`w-full px-4 py-3 text-left text-sm transition ${
													note.isRead ? "bg-white" : "bg-indigo-50"
												}`}
												onClick={async () => {
													await markAsRead(note._id);
													setNotifications((prev) =>
														prev.map((n) => (n._id === note._id ? { ...n, isRead: true } : n))
													);
													setUnreadCount((prev) => Math.max(0, prev - 1));
													setNotifOpen(false);
												}}
											>
												<p className="font-semibold text-slate-800">{note.title}</p>
												<p className="mt-1 text-xs text-slate-500">{note.message}</p>
											</button>
										))
									)}
								</div>
							</div>
						)}
					</button>
					{isAuthenticated ? (
						<>
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
							<button
								type="button"
								onClick={handleLogout}
								className="rounded-full border border-white/80 bg-white/70 p-2 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
								aria-label="Logout"
							>
								<LogOut size={18} />
							</button>
						</>
					) : (
						<div className="flex gap-2">
							<Link
								to="/login"
								className="rounded-xl border border-white/70 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white/90"
							>
								Login
							</Link>
							<Link
								to="/register"
								className="rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:shadow-lg"
							>
								Register
							</Link>
						</div>
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
