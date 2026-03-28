import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Loader2, Sparkles, Upload, X } from "lucide-react";
import Navbar from "../../components/layout/Navbar";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const PROCESS_STEPS = [
	"Processing document...",
	"Extracting key concepts...",
	"Generating exam-focused summary...",
];

const MOCK_SUMMARY = {
	overview:
		"This document introduces the fundamentals of signals and systems, including signal classification, transform basics, and core analytical ideas. It highlights the key principles students should understand for revision and exam preparation.",
	keyConcepts: [
		"Signal classification",
		"Continuous and discrete signals",
		"Fourier Transform basics",
		"Time-domain and frequency-domain interpretation",
	],
	examRelevantPoints: [
		"Definitions and classifications are commonly tested",
		"Understand differences between continuous and discrete signals",
		"Be able to explain the purpose of the Fourier Transform",
		"Focus on worked examples and core formulas",
	],
	importantTopics: ["Signals", "Systems", "Fourier", "Sampling", "Definitions"],
};

const formatFileSize = (bytes) => {
	if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const validateFile = (file) => {
	if (!file) return "Please upload a file";

	const lowerName = (file.name || "").toLowerCase();
	const isAllowed = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
	if (!isAllowed) return "File must be PDF, DOC, or DOCX";

	if (file.size > MAX_FILE_SIZE) return "File size must be 10 MB or less";

	return "";
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const QuickSummary = () => {
	const navigate = useNavigate();
	const [selectedFile, setSelectedFile] = useState(null);
	const [error, setError] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [processingText, setProcessingText] = useState(PROCESS_STEPS[0]);
	const [summaryResult, setSummaryResult] = useState(null);

	const handleFileChange = (event) => {
		const file = event.target.files?.[0] || null;
		const fileError = validateFile(file);

		if (fileError && file) {
			setSelectedFile(null);
			setError(fileError);
			return;
		}

		setSelectedFile(file);
		setError("");
		setSummaryResult(null);
	};

	const handleRemoveFile = () => {
		setSelectedFile(null);
		setError("");
		setSummaryResult(null);
	};

	const handleGenerateSummary = async () => {
		const fileError = validateFile(selectedFile);
		if (fileError) {
			setError(fileError);
			return;
		}

		setError("");
		setSummaryResult(null);
		setIsProcessing(true);

		for (const step of PROCESS_STEPS) {
			setProcessingText(step);
			await wait(1000);
		}

		setIsProcessing(false);
		setSummaryResult(MOCK_SUMMARY);
	};

	const handleUploadAnother = () => {
		setSelectedFile(null);
		setSummaryResult(null);
		setError("");
	};

	return (
		<div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-pink-50 to-blue-50 text-slate-900">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -left-24 -top-10 h-80 w-80 rounded-full bg-purple-300/25 blur-3xl" />
				<div className="absolute right-10 top-20 h-72 w-72 rounded-full bg-pink-300/25 blur-3xl" />
				<div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />
			</div>

			<Navbar />

			<main className="relative mx-auto max-w-5xl px-4 pb-16 pt-28 md:px-8">
				<section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur-xl md:p-8">
					<p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
						AI STUDY TOOL
					</p>
					<h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
						Quick Summary
					</h1>
					<p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
						Upload a PDF or Word document to generate a focused study summary with
						key concepts and exam-relevant points.
					</p>
				</section>

				<section className="mt-6 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur-xl md:p-8">
					{!isProcessing && !summaryResult ? (
						<div className="space-y-5">
							<div>
								<label className="text-sm font-semibold text-slate-700">
									Document Upload
								</label>
								<div className="mt-2 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-5">
									<div className="flex flex-wrap items-center gap-3">
										<label
											htmlFor="quick-summary-file"
											className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
										>
											<Upload size={16} />
											{selectedFile ? "Change File" : "Choose File"}
										</label>
										<p className="text-sm text-slate-700">
											Upload PDF or Word document
										</p>
									</div>
									<p className="mt-2 text-xs text-slate-500">
										Accepted formats: PDF, DOC, DOCX | Max size: 10 MB
									</p>

									{selectedFile ? (
										<div className="mt-3 flex flex-wrap items-center gap-2">
											<p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
												<FileText size={15} className="text-indigo-600" />
												{selectedFile.name} ({formatFileSize(selectedFile.size)})
											</p>
											<button
												type="button"
												onClick={handleRemoveFile}
												className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
											>
												<X size={12} />
												Remove
											</button>
										</div>
									) : null}

									<input
										id="quick-summary-file"
										type="file"
										accept=".pdf,.doc,.docx"
										onChange={handleFileChange}
										className="hidden"
									/>
								</div>
								<p className="mt-1 min-h-[1.25rem] text-sm text-rose-600">
									{error || ""}
								</p>
							</div>

							<div className="flex flex-wrap items-center justify-end gap-2">
								<button
									type="button"
									onClick={() => navigate("/materials")}
									className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
								>
									Back to Materials
								</button>
								<button
									type="button"
									onClick={handleGenerateSummary}
									className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
								>
									<Sparkles size={16} />
									Generate Summary
								</button>
							</div>
						</div>
					) : null}

					{isProcessing ? (
						<div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white/90 to-purple-50/80 p-6">
							<div className="flex items-center gap-3">
								<Loader2 size={20} className="animate-spin text-indigo-600" />
								<p className="text-sm font-semibold text-indigo-700">
									{processingText}
								</p>
							</div>
							<div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-indigo-100">
								<div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
							</div>
						</div>
					) : null}

					{summaryResult ? (
						<div className="space-y-5">
							<div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white/90 to-purple-50/80 p-5">
								<h2 className="text-lg font-bold text-slate-900">
									Summary Overview
								</h2>
								<p className="mt-2 text-sm leading-6 text-slate-700">
									{summaryResult.overview}
								</p>
							</div>

							<div className="rounded-2xl border border-slate-200 bg-white p-5">
								<h3 className="text-base font-semibold text-slate-900">
									Key Concepts
								</h3>
								<ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-slate-700">
									{summaryResult.keyConcepts.map((item) => (
										<li key={item}>{item}</li>
									))}
								</ul>
							</div>

							<div className="rounded-2xl border border-slate-200 bg-white p-5">
								<h3 className="text-base font-semibold text-slate-900">
									Exam-Relevant Points
								</h3>
								<ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-slate-700">
									{summaryResult.examRelevantPoints.map((item) => (
										<li key={item}>{item}</li>
									))}
								</ul>
							</div>

							<div className="rounded-2xl border border-slate-200 bg-white p-5">
								<h3 className="text-base font-semibold text-slate-900">
									Important Topics
								</h3>
								<div className="mt-3 flex flex-wrap gap-2">
									{summaryResult.importantTopics.map((topic) => (
										<span
											key={topic}
											className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700"
										>
											{topic}
										</span>
									))}
								</div>
							</div>

							<div className="flex flex-wrap items-center justify-end gap-2">
								<button
									type="button"
									onClick={handleUploadAnother}
									className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
								>
									Upload Another File
								</button>
								<button
									type="button"
									onClick={() => navigate("/materials")}
									className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
								>
									Back to Materials
								</button>
							</div>
						</div>
					) : null}
				</section>
			</main>
		</div>
	);
};

export default QuickSummary;
