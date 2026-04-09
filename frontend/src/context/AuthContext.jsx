import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth.api";

export const AuthContext = createContext(null);

const USER_KEY = "lms_user";
const TOKEN_KEY = "lms_token";
const DEFAULT_ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || "admin@gmail.com").toLowerCase();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const bootstrap = async () => {
			const token = localStorage.getItem(TOKEN_KEY);
			if (!token) {
				setLoading(false);
				return;
			}

			try {
				const { user: profile } = await authApi.getMe();
				localStorage.setItem(USER_KEY, JSON.stringify(profile));
				setUser(profile);
			} catch {
				localStorage.removeItem(USER_KEY);
				localStorage.removeItem(TOKEN_KEY);
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

		try {
			const raw = localStorage.getItem(USER_KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				const normalized = {
					...parsed,
					role:
						parsed?.role ||
						(parsed?.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL ? "admin" : "student"),
				};
				setUser(normalized);
			}
		} catch (error) {
			console.error("Failed to parse persisted auth user", error);
			localStorage.removeItem(USER_KEY);
		}

		bootstrap();
	}, []);

	const login = async (credentials) => {
		const data = await authApi.login(credentials);
		localStorage.setItem(TOKEN_KEY, data.token);
		localStorage.setItem(USER_KEY, JSON.stringify(data.user));
		setUser(data.user);
		return data;
	};

	const logout = async () => {
		try {
			await authApi.logout();
		} catch {
			// Client-side cleanup is sufficient even if request fails.
		}

		localStorage.removeItem(USER_KEY);
		localStorage.removeItem(TOKEN_KEY);
		setUser(null);
	};

	const updateUser = (nextUser) => {
		localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
		setUser(nextUser);
	};

	const value = useMemo(
		() => ({
			user,
			loading,
			isAuthenticated: Boolean(user),
			isAdmin: user?.role === "admin",
			hasRole: (role) => user?.role === role,
			login,
			logout,
			updateUser,
		}),
		[user, loading]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuthContext must be used within AuthProvider");
	}
	return context;
};
