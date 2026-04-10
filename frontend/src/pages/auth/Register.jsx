import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import * as authApi from '../../api/auth.api';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[A-Za-z\s]{2,50}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const departments = [
	{ label: 'Select Department', value: '' },
	{ label: 'Information Technology (IT)', value: 'IT' },
	{ label: 'Data Science (DS)', value: 'DS' },
	{ label: 'Software Engineering (SE)', value: 'SE' },
];

const getPasswordScore = (password) => {
	if (!password) return 0;
	let score = 0;
	if (password.length >= 8) score += 1;
	if (/[A-Z]/.test(password)) score += 1;
	if (/[a-z]/.test(password)) score += 1;
	if (/\d/.test(password)) score += 1;
	return score;
};

const validateRegisterField = (name, value, form) => {
	if (name === 'name') {
		if (!value.trim()) return 'Name is required';
		if (!nameRegex.test(value.trim())) return 'Name must be 2-50 letters only';
	}

	if (name === 'email') {
		if (!value.trim()) return 'Email is required';
		if (!emailRegex.test(value.trim())) return 'Please enter a valid email';
	}

	if (name === 'password') {
		if (!value) return 'Password is required';
		if (!passwordRegex.test(value)) return 'Min 8 chars with uppercase, lowercase, and number';
	}

	if (name === 'confirmPassword') {
		if (!value) return 'Please confirm your password';
		if (value !== form.password) return 'Passwords do not match';
	}

	if (name === 'department' && !value) {
		return 'Please select a department';
	}

	if (name === 'acceptedTerms' && !value) {
		return 'You must accept terms and conditions';
	}

	return '';
};

const mapBackendValidationErrors = (apiErrors = []) => {
	const next = {};
	apiErrors.forEach((item) => {
		if (item?.path === 'name') next.name = item.msg;
		if (item?.path === 'email') next.email = item.msg;
		if (item?.path === 'password') next.password = item.msg;
	});
	return next;
};

const sanitizeNameInput = (value) =>
	value
		.replace(/[^A-Za-z\s]/g, '')
		.replace(/\s{2,}/g, ' ')
		.trimStart()
		.slice(0, 50);

const preventInvalidNameKeyDown = (event) => {
	const allowedControlKeys = [
		'Backspace',
		'Delete',
		'Tab',
		'Enter',
		'ArrowLeft',
		'ArrowRight',
		'ArrowUp',
		'ArrowDown',
		'Home',
		'End',
	];

	if (event.ctrlKey || event.metaKey || event.altKey) return;
	if (allowedControlKeys.includes(event.key)) return;
	if (/^[A-Za-z\s]$/.test(event.key)) return;

	event.preventDefault();
};

const Register = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [form, setForm] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		department: '',
		role: 'student',
		acceptedTerms: false,
	});
	const [errors, setErrors] = useState({});
	const [touched, setTouched] = useState({});

	const passwordScore = useMemo(() => getPasswordScore(form.password), [form.password]);

	const validate = () => {
		const next = {};
		next.name = validateRegisterField('name', form.name, form);
		next.email = validateRegisterField('email', form.email, form);
		next.password = validateRegisterField('password', form.password, form);
		next.confirmPassword = validateRegisterField('confirmPassword', form.confirmPassword, form);
		next.department = validateRegisterField('department', form.department, form);
		next.acceptedTerms = validateRegisterField('acceptedTerms', form.acceptedTerms, form);

		Object.keys(next).forEach((key) => {
			if (!next[key]) delete next[key];
		});

		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const handleChange = (event) => {
		const { name, value, type, checked } = event.target;
		let normalizedValue = type === 'checkbox' ? checked : type === 'email' ? value.trimStart() : value;

		if (name === 'name' && typeof normalizedValue === 'string') {
			normalizedValue = sanitizeNameInput(normalizedValue);
		}

		setForm((prev) => ({
			...prev,
			[name]: normalizedValue,
		}));

		setErrors((prev) => {
			const next = { ...prev };
			if (touched[name]) {
				const message = validateRegisterField(name, normalizedValue, { ...form, [name]: normalizedValue });
				if (message) next[name] = message;
				else delete next[name];
			} else {
				delete next[name];
			}

			if (name === 'password' && touched.confirmPassword) {
				const confirmMessage = validateRegisterField('confirmPassword', form.confirmPassword, {
					...form,
					password: normalizedValue,
				});
				if (confirmMessage) next.confirmPassword = confirmMessage;
				else delete next.confirmPassword;
			}

			return next;
		});
	};

	const handleNamePaste = (event) => {
		event.preventDefault();
		const pastedText = event.clipboardData.getData('text');
		const sanitized = sanitizeNameInput(pastedText);

		setForm((prev) => ({
			...prev,
			name: sanitized,
		}));

		setErrors((prev) => {
			const next = { ...prev };
			if (touched.name) {
				const message = validateRegisterField('name', sanitized, { ...form, name: sanitized });
				if (message) next.name = message;
				else delete next.name;
			} else {
				delete next.name;
			}
			return next;
		});
	};

	const handleBlur = (event) => {
		const { name, value, type, checked } = event.target;
		const normalizedValue = type === 'checkbox' ? checked : value;

		setTouched((prev) => ({ ...prev, [name]: true }));
		const message = validateRegisterField(name, normalizedValue, { ...form, [name]: normalizedValue });
		setErrors((prev) => {
			const next = { ...prev };
			if (message) next[name] = message;
			else delete next[name];
			return next;
		});
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setTouched({
			name: true,
			email: true,
			password: true,
			confirmPassword: true,
			department: true,
			acceptedTerms: true,
		});
		if (!validate()) return;

		setLoading(true);
		try {
			await authApi.register({
				name: form.name.trim(),
				email: form.email.trim(),
				password: form.password,
				department: form.department,
				role: 'student',
			});

			toast.success('Registration successful. Please login.');
			navigate('/login', { replace: true });
		} catch (error) {
			const backendErrors = mapBackendValidationErrors(error?.response?.data?.errors);
			if (Object.keys(backendErrors).length) {
				setErrors((prev) => ({ ...prev, ...backendErrors }));
			}
			const message = error?.response?.data?.message || 'Registration failed';
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
					'linear-gradient(135deg, rgba(8,22,43,0.7), rgba(10,40,80,0.62)), url("https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1800&q=80")',
				backgroundSize: 'cover',
				backgroundPosition: 'center',
			}}
		>
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#091a35]/35 via-transparent to-[#081022]/55" />
			<motion.div
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="relative z-10 w-full max-w-xl rounded-[28px] border border-white/35 bg-white/15 p-8 text-white shadow-2xl shadow-black/35 backdrop-blur-xl"
			>
				<div className="mx-auto mb-7 inline-flex w-full justify-center">
					<div className="rounded-b-2xl rounded-t-md bg-white px-8 py-2.5 text-center shadow-lg shadow-black/25">
						<p className="text-lg font-semibold text-[#0B1F3B]">Register</p>
					</div>
				</div>

				<div className="mb-6 flex items-center justify-center gap-2 text-white/90">
					<GraduationCap className="h-5 w-5" />
					<p className="text-sm font-medium">Create your learning account</p>
				</div>

				<form className="mt-6 space-y-4" onSubmit={handleSubmit}>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label htmlFor="name" className="mb-1.5 block text-sm font-medium text-white/90">
								Full Name
							</label>
							<div className="flex items-center rounded-full border border-white/45 bg-[#072343]/55 px-4 py-2.5 shadow-inner">
								<User className="mr-2 h-4 w-4 text-white/85" />
								<input
									id="name"
									name="name"
									value={form.name}
									onChange={handleChange}
									onBlur={handleBlur}
									onKeyDown={preventInvalidNameKeyDown}
									onPaste={handleNamePaste}
									maxLength={50}
									placeholder="Your full name"
									className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/65"
								/>
							</div>
							{errors.name && <p className="mt-1.5 text-xs text-rose-200">{errors.name}</p>}
						</div>

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
								placeholder="Choose a strong password"
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
					<div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
						<div
							className={`h-full transition-all ${
								passwordScore <= 1
									? 'w-1/4 bg-red-500'
									: passwordScore === 2
										? 'w-2/4 bg-amber-500'
										: passwordScore === 3
											? 'w-3/4 bg-lime-500'
											: 'w-full bg-emerald-500'
							}`}
						/>
					</div>

					<div>
						<label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-white/90">
							Confirm Password
						</label>
						<div className="flex items-center rounded-full border border-white/45 bg-[#072343]/55 px-4 py-2.5 shadow-inner">
							<Lock className="mr-2 h-4 w-4 text-white/85" />
							<input
								id="confirmPassword"
								name="confirmPassword"
								type={showConfirmPassword ? 'text' : 'password'}
								value={form.confirmPassword}
								onChange={handleChange}
								onBlur={handleBlur}
								placeholder="Re-enter password"
								className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/65"
							/>
							<button
								type="button"
								className="rounded p-1 text-white/85 hover:bg-white/10"
								onClick={() => setShowConfirmPassword((prev) => !prev)}
								aria-label="Toggle confirm password visibility"
							>
								{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						</div>
						{errors.confirmPassword && <p className="mt-1.5 text-xs text-rose-200">{errors.confirmPassword}</p>}
					</div>

					<div>
						<label htmlFor="department" className="mb-1.5 block text-sm font-medium text-white/90">
							Department
						</label>
						<select
							id="department"
							name="department"
							value={form.department}
							onChange={handleChange}
							onBlur={handleBlur}
							className="w-full rounded-full border border-white/45 bg-[#072343]/55 px-4 py-2.5 text-sm text-white outline-none"
						>
							{departments.map((dept) => (
								<option key={dept.value} value={dept.value} className="text-slate-900">
									{dept.label}
								</option>
							))}
						</select>
						{errors.department && <p className="mt-1.5 text-xs text-rose-200">{errors.department}</p>}
					</div>

					<label className="inline-flex items-center gap-2 text-sm text-white/90">
						<input
							type="checkbox"
							name="acceptedTerms"
							checked={form.acceptedTerms}
							onChange={handleChange}
							onBlur={handleBlur}
							className="h-4 w-4 rounded border-white/50 bg-white/20 text-[#0B1F3B] accent-[#0B1F3B]"
						/>
						I agree to the terms and conditions
					</label>
					{errors.acceptedTerms && <p className="-mt-2 text-xs text-rose-200">{errors.acceptedTerms}</p>}

					<button
						type="submit"
						disabled={loading}
						className="mt-1 w-full rounded-full bg-white py-2.5 text-sm font-semibold text-[#0B1F3B] shadow-lg shadow-black/20 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{loading ? 'Creating account...' : 'Create Account'}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-white/85">
					Already have an account?{' '}
					<Link to="/login" className="font-semibold text-white hover:text-slate-100">
						Login
					</Link>
				</p>
			</motion.div>
		</div>
	);
};

export default Register;
