export const SHORT_NOTE_DEPARTMENTS = [
	{ code: "IT", name: "Information Technology" },
	{ code: "SE", name: "Software Engineering" },
	{ code: "DS", name: "Data Science" },
	{ code: "Cyber", name: "Cyber Security" },
	{ code: "ISE", name: "Information Systems Engineering" },
	{ code: "IM", name: "Information Management" },
];

export const SHORT_NOTE_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const MODULE_TEMPLATES = [
	{
		title: "Programming Fundamentals",
		description: "Condensed notes for core programming logic and syntax.",
	},
	{
		title: "Mathematics for Computing",
		description: "Quick-reference notes for discrete math and logic topics.",
	},
	{
		title: "Database Systems",
		description: "Short notes on schemas, SQL queries, and normalization.",
	},
	{
		title: "Data Structures",
		description: "Revision notes for arrays, trees, graphs, and complexity.",
	},
	{
		title: "Operating Systems",
		description: "Focused notes on processes, threads, and memory concepts.",
	},
	{
		title: "Software Engineering",
		description: "Compact notes for SDLC models and design principles.",
	},
	{
		title: "Computer Networks",
		description: "Summarized notes for protocols, routing, and layers.",
	},
	{
		title: "Information Security",
		description: "Key security notes on threats, controls, and crypto basics.",
	},
	{
		title: "Web Development",
		description: "Fast revision notes for frontend and backend essentials.",
	},
	{
		title: "Human Computer Interaction",
		description: "Brief notes covering usability and interaction patterns.",
	},
];

const createModulesForYear = (departmentCode, yearLabel) =>
	MODULE_TEMPLATES.map((module, index) => ({
		id: `${departmentCode}-${yearLabel}-short-${index + 1}`,
		code: `${departmentCode}-SN-${yearLabel.charAt(0)}0${index + 1}`,
		name: module.title,
		description: module.description,
	}));

export const SHORT_NOTE_DATA = SHORT_NOTE_DEPARTMENTS.reduce(
	(accumulator, department) => {
		accumulator[department.code] = SHORT_NOTE_YEARS.reduce((yearMap, yearLabel) => {
			yearMap[yearLabel] = createModulesForYear(department.code, yearLabel);
			return yearMap;
		}, {});
		return accumulator;
	},
	{},
);
