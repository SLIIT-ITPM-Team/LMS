import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import InputField from '../../components/form/InputField';
import Checkbox from '../../components/form/Checkbox';
import LoadingButton from '../../components/form/LoadingButton';
import useAuth from '../../hooks/useAuth';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
	const { login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [form, setForm] = useState({
		email: '',
		password: '',
		rememberMe: false,
	});
	const [errors, setErrors] = useState({});

	const redirectTo = useMemo(() => {
		if (typeof location.state?.from === 'string') {
			return location.state.from;
		}
		return '/dashboard';
	}, [location.state]);

	const validate = () => {
		const next = {};
		if (!emailRegex.test(form.email)) next.email = 'Please enter a valid email address';
		if (!form.password.trim()) next.password = 'Password is required';
		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const handleChange = (event) => {
		const { name, value, type, checked } = event.target;
		setForm((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (!validate()) return;

		setLoading(true);
		try {
			const data = await login({ email: form.email, password: form.password });
			toast.success('Login successful');

			if (data.user.role === 'admin') {
				navigate('/admin', { replace: true });
			} else {
				navigate(redirectTo, { replace: true });
			}
		} catch (error) {
			const message = error?.response?.data?.message || 'Invalid credentials';
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-200 via-white to-violet-200 px-4 py-12">
			<motion.div
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="w-full max-w-md rounded-2xl border border-white/70 bg-white/90 p-8 shadow-xl backdrop-blur"
			>
				<h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
				<p className="mt-1 text-sm text-slate-600">Sign in to continue your LMS journey.</p>

				<form className="mt-6 space-y-4" onSubmit={handleSubmit}>
					<InputField
						label="Email"
						name="email"
						type="email"
						value={form.email}
						onChange={handleChange}
						placeholder="you@example.com"
						icon={Mail}
						error={errors.email}
					/>

					<InputField
						label="Password"
						name="password"
						type={showPassword ? 'text' : 'password'}
						value={form.password}
						onChange={handleChange}
						placeholder="Enter your password"
						icon={Lock}
						error={errors.password}
						rightAdornment={
							<button
								type="button"
								className="rounded p-1 text-slate-500 hover:bg-slate-100"
								onClick={() => setShowPassword((prev) => !prev)}
								aria-label="Toggle password visibility"
							>
								{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						}
					/>

					<div className="flex items-center justify-between">
						<Checkbox
							label="Remember me"
							name="rememberMe"
							checked={form.rememberMe}
							onChange={handleChange}
						/>
						<Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
							Forgot Password?
						</Link>
					</div>

					<LoadingButton type="submit" loading={loading}>
						Sign In
					</LoadingButton>
				</form>

				<p className="mt-5 text-center text-sm text-slate-600">
					Don&apos;t have an account?{' '}
					<Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
						Register now
					</Link>
				</p>
			</motion.div>
		</div>
	);
};

export default Login;
