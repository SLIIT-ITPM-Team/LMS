import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateLoginField = (name, value) => {
	if (name === 'email') {
		if (!value.trim()) return 'Email is required';
		if (!emailRegex.test(value.trim())) return 'Please enter a valid email address';
	}

	if (name === 'password') {
		if (!value) return 'Password is required';
	}

	return '';
};

const mapBackendValidationErrors = (apiErrors = []) => {
	const next = {};
	apiErrors.forEach((item) => {
		if (item?.path === 'email') next.email = item.msg;
		if (item?.path === 'password') next.password = item.msg;
	});
	return next;
};

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
	const [touched, setTouched] = useState({});

	const redirectTo = useMemo(() => {
		if (typeof location.state?.from === 'string') {
			return location.state.from;
		}
		return '/dashboard';
	}, [location.state]);

	const validate = () => {
		const next = {};
		next.email = validateLoginField('email', form.email);
		next.password = validateLoginField('password', form.password);

		Object.keys(next).forEach((key) => {
			if (!next[key]) delete next[key];
		});

		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const handleChange = (event) => {
		const { name, value, type, checked } = event.target;
		setForm((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : type === 'email' ? value.trimStart() : value,
		}));

		if (name !== 'rememberMe') {
			setErrors((prev) => {
				const next = { ...prev };
				if (touched[name]) {
					const message = validateLoginField(name, type === 'checkbox' ? checked : value);
					if (message) next[name] = message;
					else delete next[name];
				} else {
					delete next[name];
				}
				return next;
			});
		}
	};

	const handleBlur = (event) => {
		const { name, value, type, checked } = event.target;
		if (name === 'rememberMe') return;

		setTouched((prev) => ({ ...prev, [name]: true }));
		const message = validateLoginField(name, type === 'checkbox' ? checked : value);
		setErrors((prev) => {
			const next = { ...prev };
			if (message) next[name] = message;
			else delete next[name];
			return next;
		});
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setTouched({ email: true, password: true });
		if (!validate()) return;

		setLoading(true);
		try {
			const data = await login({ email: form.email.trim(), password: form.password });
			toast.success('Login successful');

			if (data.user.role === 'admin') {
				navigate('/admin', { replace: true });
			} else {
				navigate(redirectTo, { replace: true });
			}
		} catch (error) {
			const backendErrors = mapBackendValidationErrors(error?.response?.data?.errors);
			if (Object.keys(backendErrors).length) {
				setErrors((prev) => ({ ...prev, ...backendErrors }));
			}
			const message = error?.response?.data?.message || 'Invalid credentials';
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12"
			style={{
				backgroundImage:
					'linear-gradient(135deg, rgba(8,22,43,0.65), rgba(14,46,89,0.58)), url("https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1800&q=80")',
				backgroundSize: 'cover',
				backgroundPosition: 'center',
			}}
		>
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a1730]/35 via-transparent to-[#081022]/55" />
			<motion.div
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="relative z-10 w-full max-w-md rounded-[28px] border border-white/35 bg-white/15 p-8 text-white shadow-2xl shadow-black/35 backdrop-blur-xl"
			>
				<div className="mx-auto mb-7 inline-flex w-full justify-center">
					<div className="rounded-b-2xl rounded-t-md bg-white px-8 py-2.5 text-center shadow-lg shadow-black/25">
						<p className="text-lg font-semibold text-[#0B1F3B]">Login</p>
					</div>
				</div>

				<div className="mb-6 flex items-center justify-center gap-2 text-white/90">
					<GraduationCap className="h-5 w-5" />
					<p className="text-sm font-medium">Continue your learning journey</p>
				</div>

				<form className="mt-6 space-y-4" onSubmit={handleSubmit}>
					<div>
						<label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/90">
							Email
						</label>
						<div className="flex items-center rounded-full border border-white/45 bg-[#072343]/55 px-4 py-2.5 shadow-inner">
							<Mail className="mr-2 h-4 w-4 text-white/85" />
							<input
								id="email"
								name="email"
								type="email"
								value={form.email}
								onChange={handleChange}
								onBlur={handleBlur}
								placeholder="you@example.com"
								className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/65"
							/>
						</div>
						{errors.email && <p className="mt-1.5 text-xs text-rose-200">{errors.email}</p>}
					</div>

					<div>
						<label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/90">
							Password
						</label>
						<div className="flex items-center rounded-full border border-white/45 bg-[#072343]/55 px-4 py-2.5 shadow-inner">
							<Lock className="mr-2 h-4 w-4 text-white/85" />
							<input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								value={form.password}
								onChange={handleChange}
								onBlur={handleBlur}
								placeholder="Enter your password"
								className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/65"
							/>
							<button
								type="button"
								className="rounded p-1 text-white/85 hover:bg-white/10"
								onClick={() => setShowPassword((prev) => !prev)}
								aria-label="Toggle password visibility"
							>
								{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						</div>
						{errors.password && <p className="mt-1.5 text-xs text-rose-200">{errors.password}</p>}
					</div>

					<div className="flex items-center justify-between">
						<label className="inline-flex items-center gap-2 text-sm text-white/90">
							<input
								type="checkbox"
								name="rememberMe"
								checked={form.rememberMe}
								onChange={handleChange}
								className="h-4 w-4 rounded border-white/50 bg-white/20 text-[#0B1F3B] accent-[#0B1F3B]"
							/>
							Remember me
						</label>
						<Link to="/login" className="text-sm font-medium text-white/90 hover:text-white">
							Forgot Password?
						</Link>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="mt-1 w-full rounded-full bg-white py-2.5 text-sm font-semibold text-[#0B1F3B] shadow-lg shadow-black/20 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{loading ? 'Signing in...' : 'Login'}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-white/85">
					Don&apos;t have an account?{' '}
					<Link to="/register" className="font-semibold text-white hover:text-slate-100">
						Register
					</Link>
				</p>
			</motion.div>
		</div>
	);
};

export default Login;
