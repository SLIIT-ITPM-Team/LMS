import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import * as authApi from '../../api/auth.api';
import InputField from '../../components/form/InputField';
import SelectField from '../../components/form/SelectField';
import Checkbox from '../../components/form/Checkbox';
import LoadingButton from '../../components/form/LoadingButton';

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

	const passwordScore = useMemo(() => getPasswordScore(form.password), [form.password]);

	const validate = () => {
		const next = {};
		if (!nameRegex.test(form.name)) next.name = 'Name must be 2-50 letters only';
		if (!emailRegex.test(form.email)) next.email = 'Please enter a valid email';
		if (!passwordRegex.test(form.password)) {
			next.password = 'Min 8 chars with uppercase, lowercase, and number';
		}
		if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match';
		if (!form.department) next.department = 'Please select a department';
		if (!form.acceptedTerms) next.acceptedTerms = 'You must accept terms and conditions';
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
			await authApi.register({
				name: form.name,
				email: form.email,
				password: form.password,
				department: form.department,
				role: 'student',
			});

			toast.success('Registration successful. Please login.');
			navigate('/login', { replace: true });
		} catch (error) {
			const message = error?.response?.data?.message || 'Registration failed';
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
				className="w-full max-w-lg rounded-2xl border border-white/70 bg-white/90 p-8 shadow-xl backdrop-blur"
			>
				<h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
				<p className="mt-1 text-sm text-slate-600">Join EduFlow LMS and start learning smarter.</p>

				<form className="mt-6 space-y-4" onSubmit={handleSubmit}>
					<InputField
						label="Full Name"
						name="name"
						value={form.name}
						onChange={handleChange}
						placeholder="Your full name"
						icon={User}
						error={errors.name}
					/>

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
						placeholder="Choose a strong password"
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

					<InputField
						label="Confirm Password"
						name="confirmPassword"
						type={showConfirmPassword ? 'text' : 'password'}
						value={form.confirmPassword}
						onChange={handleChange}
						placeholder="Re-enter password"
						icon={Lock}
						error={errors.confirmPassword}
						rightAdornment={
							<button
								type="button"
								className="rounded p-1 text-slate-500 hover:bg-slate-100"
								onClick={() => setShowConfirmPassword((prev) => !prev)}
								aria-label="Toggle confirm password visibility"
							>
								{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						}
					/>

					<SelectField
						label="Department"
						name="department"
						value={form.department}
						onChange={handleChange}
						options={departments}
						error={errors.department}
					/>

					<Checkbox
						label="I agree to the terms and conditions"
						name="acceptedTerms"
						checked={form.acceptedTerms}
						onChange={handleChange}
						error={errors.acceptedTerms}
					/>

					<LoadingButton type="submit" loading={loading}>
						Create Account
					</LoadingButton>
				</form>

				<p className="mt-5 text-center text-sm text-slate-600">
					Already have an account?{' '}
					<Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
						Login
					</Link>
				</p>
			</motion.div>
		</div>
	);
};

export default Register;
