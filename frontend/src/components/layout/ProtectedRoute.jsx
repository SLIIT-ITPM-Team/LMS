import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const ProtectedRoute = ({ children, roles = [] }) => {
	const { isAuthenticated, loading, user } = useAuth();
	const location = useLocation();

	if (loading) {
		return (
			<div className="flex min-h-[40vh] items-center justify-center text-slate-600">
				Loading...
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
	}

	if (roles.length > 0 && !roles.includes(user?.role)) {
		return <Navigate to="/dashboard" replace />;
	}

	return children;
};

export default ProtectedRoute;
