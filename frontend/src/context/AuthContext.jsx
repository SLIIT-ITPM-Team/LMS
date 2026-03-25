import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export const AuthContext = createContext(null);

const USER_KEY = "lms_user";
const TOKEN_KEY = "lms_token";

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		try {
			const raw = localStorage.getItem(USER_KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				setUser(parsed);
			}
		} catch (error) {
			console.error("Failed to parse persisted auth user", error);
			localStorage.removeItem(USER_KEY);
		} finally {
			setLoading(false);
		}
	}, []);

	const login = (payload) => {
		const safeUser = {
			name: payload?.name || payload?.email?.split("@")[0] || "Learner",
			email: payload?.email || "learner@eduflow.app",
			avatar:
				payload?.avatar ||
				`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
					payload?.name || "Learner"
				)}`,
		};

		const token = payload?.token || `demo-token-${Date.now()}`;

		localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
		localStorage.setItem(TOKEN_KEY, token);
		setUser(safeUser);
	};

	const logout = () => {
		localStorage.removeItem(USER_KEY);
		localStorage.removeItem(TOKEN_KEY);
		setUser(null);
	};

	const value = useMemo(
		() => ({
			user,
			loading,
			isAuthenticated: Boolean(user),
			login,
			logout,
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
