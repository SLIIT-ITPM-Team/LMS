import React, { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MATERIAL_TYPES = [
	"Lecture Note",
	"Past Paper",
	"Model Paper",
	"Short Note",
];

const initialFormState = {
	departmentName: "",
	moduleName: "",
	materialType: "",
	description: "",
	file: null,
};

const getFileError = (file) => {
	if (!file) return "Please upload a PDF or Word document";

	const lowerName = (file.name || "").toLowerCase();
	const isAllowed = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
	if (!isAllowed) return "File must be PDF, DOC, or DOCX";

	if (file.size > MAX_FILE_SIZE) return "File size must be 10 MB or less";

	return "";
};

const validateForm = (data) => {
	const nextErrors = {};

	if (!data.departmentName.trim()) {
		nextErrors.departmentName = "Department name is required";
	}

	if (!data.moduleName.trim()) {
		nextErrors.moduleName = "Module name is required";
	}

	if (!data.materialType.trim()) {
		nextErrors.materialType = "Please select a material type";
	}

	if (!data.description.trim()) {
		nextErrors.description = "Description is required";
	}

	const fileError = getFileError(data.file);
	if (fileError) {
		nextErrors.file = fileError;
	}

	return nextErrors;
};

const formatFileSize = (bytes) => {
	if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const MaterialUploadForm = ({ isOpen, onClose }) => {
	const [formData, setFormData] = useState(initialFormState);
	const [errors, setErrors] = useState({});
	const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");
	const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
	const fileInputRef = useRef(null);

	if (!isOpen) {
		return null;
	}

	const resetForm = () => {
		setFormData(initialFormState);
		setErrors({});
		setHasTriedSubmit(false);
		setShowLeaveConfirm(false);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleClose = () => {
		resetForm();
		setSuccessMessage("");
		onClose?.();
	};

	const isFormDirty = () =>
		formData.departmentName.trim() ||
		formData.moduleName.trim() ||
		formData.materialType.trim() ||
		formData.description.trim() ||
		formData.file;

	const requestClose = () => {
		if (isSubmitting) return;
		if (isFormDirty()) {
			setShowLeaveConfirm(true);
			return;
		}
		handleClose();
	};

	const handleConfirmLeave = () => {
		setShowLeaveConfirm(false);
		handleClose();
	};

	const updateFieldError = (field, nextData) => {
		if (!hasTriedSubmit) {
			setErrors((previous) => ({ ...previous, [field]: "" }));
			return;
		}

		const nextErrors = validateForm(nextData);
		setErrors((previous) => ({ ...previous, [field]: nextErrors[field] || "" }));
	};

	const handleFieldChange = (field, value) => {
		setFormData((previous) => {
			const nextData = { ...previous, [field]: value };
			updateFieldError(field, nextData);
			return nextData;
		});
		setSuccessMessage("");
	};

	const handleFileChange = (event) => {
		const selectedFile = event.target.files?.[0] || null;
		setFormData((previous) => ({ ...previous, file: selectedFile }));
		setSuccessMessage("");

		if (hasTriedSubmit || selectedFile) {
			setErrors((previous) => ({
				...previous,
				file: getFileError(selectedFile),
			}));
		}
	};

	const handleRemoveFile = () => {
		setFormData((previous) => ({ ...previous, file: null }));
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
		setErrors((previous) => ({
			...previous,
			file: hasTriedSubmit ? "Please upload a PDF or Word document" : "",
		}));
		setSuccessMessage("");
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setHasTriedSubmit(true);
		const nextErrors = validateForm(formData);
		setErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			setSuccessMessage("");
			return;
		}

		setIsSubmitting(true);
		await new Promise((resolve) => setTimeout(resolve, 600));
		setIsSubmitting(false);
		setSuccessMessage("Material sent successfully");
		resetForm();
	};

	const fieldInputClass =
		"mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition hover:border-slate-300 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30";

	const fieldLabelClass = "text-sm font-semibold text-slate-700";
	const errorClass = "mt-1 min-h-[1.25rem] text-sm text-rose-600";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
			<div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-2xl backdrop-blur-xl">
				<div className="shrink-0 border-b border-slate-100 px-6 py-5 md:px-7">
					<div className="flex items-start justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
							Study Hub
						</p>
						<h2 className="mt-2 text-2xl font-bold text-slate-900">
							Send Material
						</h2>
						<p className="mt-1 text-sm text-slate-600">
							Fill in the details below and upload your file.
						</p>
					</div>
					<button
						type="button"
						onClick={requestClose}
						className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:text-indigo-700"
						aria-label="Close send material form"
					>
						<X size={16} />
					</button>
				</div>
				</div>

				<form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
					<div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 md:px-7">
					<div className="grid gap-5 md:grid-cols-2">
						<div>
							<label
								htmlFor="department-name"
								className={fieldLabelClass}
							>
								Department Name <span className="text-rose-500">*</span>
							</label>
							<input
								id="department-name"
								type="text"
								value={formData.departmentName}
								onChange={(event) =>
									handleFieldChange("departmentName", event.target.value)
								}
								placeholder="Enter department name"
								className={fieldInputClass}
							/>
							<p className={errorClass}>{errors.departmentName || ""}</p>
						</div>
						<div>
							<label
								htmlFor="module-name"
								className={fieldLabelClass}
							>
								Module Name <span className="text-rose-500">*</span>
							</label>
							<input
								id="module-name"
								type="text"
								value={formData.moduleName}
								onChange={(event) =>
									handleFieldChange("moduleName", event.target.value)
								}
								placeholder="Enter module name"
								className={fieldInputClass}
							/>
							<p className={errorClass}>{errors.moduleName || ""}</p>
						</div>
					</div>

					<div className="mt-5">
						<label
							htmlFor="material-type"
							className={fieldLabelClass}
						>
							Material Type <span className="text-rose-500">*</span>
						</label>
						<select
							id="material-type"
							value={formData.materialType}
							onChange={(event) =>
								handleFieldChange("materialType", event.target.value)
							}
							className={fieldInputClass}
						>
							<option value="">Select material type</option>
							{MATERIAL_TYPES.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
						<p className={errorClass}>{errors.materialType || ""}</p>
					</div>

					<div className="mt-5">
						<label
							htmlFor="material-description"
							className={fieldLabelClass}
						>
							Description <span className="text-rose-500">*</span>
						</label>
						<textarea
							id="material-description"
							rows={4}
							value={formData.description}
							onChange={(event) =>
								handleFieldChange("description", event.target.value)
							}
							placeholder="Write a short description"
							className={fieldInputClass}
						/>
						<p className="mt-1 text-xs text-slate-500">
							Keep it brief and clear so others can quickly understand the material.
						</p>
						<p className={errorClass}>{errors.description || ""}</p>
					</div>

					<div className="mt-5">
						<label className={fieldLabelClass}>
							File Upload <span className="text-rose-500">*</span>
						</label>
						<div className="mt-2 rounded-xl border border-dashed border-violet-200 bg-violet-50/40 p-4 transition hover:border-violet-300">
							<div className="flex flex-wrap items-center gap-2 md:gap-3">
								<label
									htmlFor="material-file"
									className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
								>
									<Upload size={16} />
									{formData.file ? "Change File" : "Choose File"}
								</label>
								<p className="text-sm text-slate-700">
									Upload PDF or Word document
								</p>
							</div>
							<p className="mt-2 text-xs text-slate-500">
								Accepted formats: PDF, DOC, DOCX | Max size: 10 MB
							</p>
							{formData.file ? (
								<div className="mt-3 flex flex-wrap items-center gap-2">
									<p className="text-sm font-medium text-slate-700">
										{formData.file.name} ({formatFileSize(formData.file.size)})
									</p>
									<button
										type="button"
										onClick={handleRemoveFile}
										className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
									>
										Remove
									</button>
								</div>
							) : null}
							<input
								ref={fileInputRef}
								id="material-file"
								type="file"
								accept=".pdf,.doc,.docx"
								onChange={handleFileChange}
								className="hidden"
							/>
						</div>
						<p className={errorClass}>{errors.file || ""}</p>
					</div>

					{successMessage ? (
						<div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
							{successMessage}
						</div>
					) : null}
					</div>

					<div className="shrink-0 border-t border-slate-100 px-6 py-4 md:px-7">
					<div className="flex flex-wrap items-center justify-end gap-2">
						<button
							type="button"
							onClick={requestClose}
							disabled={isSubmitting}
							className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
						>
							{isSubmitting ? "Sending..." : "Send Material"}
						</button>
					</div>
					</div>
				</form>

				{showLeaveConfirm ? (
					<div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/35 p-4">
						<div className="w-full max-w-sm rounded-2xl border border-white/60 bg-white p-5 shadow-2xl">
							<h3 className="text-lg font-bold text-slate-900">Leave form?</h3>
							<p className="mt-2 text-sm text-slate-600">
								Your entered details will be lost.
							</p>
							<div className="mt-4 flex items-center justify-end gap-2">
								<button
									type="button"
									onClick={() => setShowLeaveConfirm(false)}
									className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
								>
									Stay
								</button>
								<button
									type="button"
									onClick={handleConfirmLeave}
									className="rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
								>
									Leave
								</button>
							</div>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
};

export default MaterialUploadForm;
