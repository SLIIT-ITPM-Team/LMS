export const LECTURE_NOTE_DEPARTMENTS = [
	{ code: "IT", name: "Information Technology" },
	{ code: "SE", name: "Software Engineering" },
	{ code: "DS", name: "Data Science" },
	{ code: "Cyber", name: "Cyber Security" },
	{ code: "ISE", name: "Information Systems Engineering" },
	{ code: "IM", name: "Information Management" },
];

export const LECTURE_NOTE_YEARS = [
	"1st Year",
	"2nd Year",
	"3rd Year",
	"4th Year",
];

const MODULE_TEMPLATES = [
	{ title: "Programming Fundamentals", description: "Core programming concepts and problem solving." },
	{ title: "Mathematics for Computing", description: "Discrete math and logic for computing applications." },
	{ title: "Database Systems", description: "Relational models, SQL, and data management basics." },
	{ title: "Data Structures", description: "Efficient data organization and algorithmic operations." },
	{ title: "Operating Systems", description: "Process management, memory, and system-level fundamentals." },
	{ title: "Software Engineering", description: "Software life cycle, requirements, and design practices." },
	{ title: "Computer Networks", description: "Network models, routing, and communication protocols." },
	{ title: "Information Security", description: "Security principles, threats, and defensive techniques." },
	{ title: "Web Development", description: "Modern web architecture, frontend, and backend basics." },
	{ title: "Human Computer Interaction", description: "User-centered design and usability principles." },
];

const createModulesForYear = (departmentCode, yearLabel) =>
	MODULE_TEMPLATES.map((module, index) => ({
		id: `${departmentCode}-${yearLabel}-${index + 1}`,
		code: `${departmentCode}${yearLabel.charAt(0)}0${index + 1}`,
		name: module.title,
		description: module.description,
	}));

export const LECTURE_NOTE_DATA = LECTURE_NOTE_DEPARTMENTS.reduce(
	(accumulator, department) => {
		accumulator[department.code] = LECTURE_NOTE_YEARS.reduce((yearMap, yearLabel) => {
			yearMap[yearLabel] = createModulesForYear(department.code, yearLabel);
			return yearMap;
		}, {});
		return accumulator;
	},
	{},
);
