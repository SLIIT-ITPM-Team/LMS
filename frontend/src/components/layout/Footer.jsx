import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, BriefcaseBusiness, Globe, Mail, MessageCircle } from "lucide-react";

const socialLinks = [
  { label: "Website", icon: Globe, href: "#" },
  { label: "Forum", icon: MessageCircle, href: "#" },
  { label: "LinkedIn", icon: BriefcaseBusiness, href: "#" },
  { label: "Repository", icon: BookOpen, href: "#" },
];

const Footer = () => {
	return (
		<footer className="border-t border-slate-200 bg-slate-900 text-slate-200">
			<div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-4">
				<div>
					<div className="flex items-center gap-2">
						<span className="rounded-lg bg-primary px-2 py-1 text-xs font-bold text-white">
							EF
						</span>
						<h3 className="text-xl font-bold">EduFlow LMS</h3>
					</div>
					<p className="mt-4 text-sm text-slate-400">
						Empowering every learner with structured pathways, interactive
						experiences, and measurable outcomes.
					</p>
				</div>

				<div>
					<h4 className="text-sm font-semibold uppercase tracking-wider text-slate-100">
						Quick Links
					</h4>
					<ul className="mt-4 space-y-2 text-sm text-slate-300">
						<li>
							<Link className="hover:text-white" to="/">
								Home
							</Link>
						</li>
						<li>
							<Link className="hover:text-white" to="/dashboard">
								Courses
							</Link>
						</li>
						<li>
							<Link className="hover:text-white" to="/dashboard">
								Dashboard
							</Link>
						</li>
						<li>
							<Link className="hover:text-white" to="/community">
								Community
							</Link>
						</li>
					</ul>
				</div>

				<div>
					<h4 className="text-sm font-semibold uppercase tracking-wider text-slate-100">
						Departments
					</h4>
					<ul className="mt-4 space-y-2 text-sm text-slate-300">
						<li>Information Technology</li>
						<li>Data Science</li>
						<li>Software Engineering</li>
					</ul>
				</div>

				<div>
					<h4 className="text-sm font-semibold uppercase tracking-wider text-slate-100">
						Contact
					</h4>
					<a
						href="mailto:support@eduflow.com"
						className="mt-4 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
					>
						<Mail size={16} />
						support@eduflow.com
					</a>
					<div className="mt-4 flex gap-2">
						{socialLinks.map(({ label, icon: Icon, href }) => (
							<a
								key={label}
								href={href}
								aria-label={label}
								className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-slate-500 hover:text-white"
							>
								<Icon size={16} />
							</a>
						))}
					</div>
				</div>
			</div>

			<div className="border-t border-slate-800 py-5 text-center text-sm text-slate-400">
				© 2024 EduFlow LMS. All rights reserved.
			</div>
		</footer>
	);
};

export default Footer;
