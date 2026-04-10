export const MODEL_PAPER_DEPARTMENTS = [
	{ code: "IT", name: "Information Technology" },
	{ code: "SE", name: "Software Engineering" },
	{ code: "DS", name: "Data Science" },
	{ code: "Cyber", name: "Cyber Security" },
	{ code: "ISE", name: "Information Systems Engineering" },
	{ code: "IM", name: "Information Management" },
];

export const MODEL_PAPER_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const MODULE_TEMPLATES = [
	{
		title: "Programming Fundamentals",
		description: "Instructor model papers focused on core coding patterns.",
	},
	{
		title: "Mathematics for Computing",
		description: "Guided model papers for logic and discrete math topics.",
	},
	{
		title: "Database Systems",
		description: "Model question sets for SQL, indexing, and normalization.",
	},
	{
		title: "Data Structures",
		description: "Structured model papers for trees, graphs, and sorting.",
	},
	{
		title: "Operating Systems",
		description: "Practice model papers on processes, memory, and scheduling.",
	},
	{
		title: "Software Engineering",
		description: "Model papers covering requirements and design workflows.",
	},
	{
		title: "Computer Networks",
		description: "Exam-style model papers for routing and transport layers.",
	},
	{
		title: "Information Security",
		description: "Model papers for security principles and cryptography basics.",
	},
	{
		title: "Web Development",
		description: "Model papers for full-stack concepts and web architecture.",
	},
	{
		title: "Human Computer Interaction",
		description: "Model papers on usability, evaluation, and interaction design.",
	},
];

const createModulesForYear = (departmentCode, yearLabel) =>
	MODULE_TEMPLATES.map((module, index) => ({
		id: `${departmentCode}-${yearLabel}-model-${index + 1}`,
		code: `${departmentCode}-MP-${yearLabel.charAt(0)}0${index + 1}`,
		name: module.title,
		description: module.description,
	}));

export const MODEL_PAPER_DATA = MODEL_PAPER_DEPARTMENTS.reduce(
	(accumulator, department) => {
		accumulator[department.code] = MODEL_PAPER_YEARS.reduce((yearMap, yearLabel) => {
			yearMap[yearLabel] = createModulesForYear(department.code, yearLabel);
			return yearMap;
		}, {});
		return accumulator;
	},
	{},
);
