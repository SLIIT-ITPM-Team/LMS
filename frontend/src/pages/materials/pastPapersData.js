export const PAST_PAPER_DEPARTMENTS = [
	{ code: "IT", name: "Information Technology" },
	{ code: "SE", name: "Software Engineering" },
	{ code: "DS", name: "Data Science" },
	{ code: "Cyber", name: "Cyber Security" },
	{ code: "ISE", name: "Information Systems Engineering" },
	{ code: "IM", name: "Information Management" },
];

export const PAST_PAPER_YEARS = [
	"1st Year",
	"2nd Year",
	"3rd Year",
	"4th Year",
];

const MODULE_TEMPLATES = [
	{ title: "Programming Fundamentals", description: "Past exam sets with foundational coding questions." },
	{ title: "Mathematics for Computing", description: "Paper collection focused on logic and discrete math." },
	{ title: "Database Systems", description: "SQL, normalization, and design question papers." },
	{ title: "Data Structures", description: "Algorithm and data structure problem papers." },
	{ title: "Operating Systems", description: "Scheduling, memory, and process-management paper sets." },
	{ title: "Software Engineering", description: "Past papers on lifecycle models and design techniques." },
	{ title: "Computer Networks", description: "Routing, protocol, and network architecture papers." },
	{ title: "Information Security", description: "Security models, cryptography, and risk question papers." },
	{ title: "Web Development", description: "Frontend/backend architecture and web protocol papers." },
	{ title: "Human Computer Interaction", description: "Usability and user-centered design exam papers." },
];

const createModulesForYear = (departmentCode, yearLabel) =>
	MODULE_TEMPLATES.map((module, index) => ({
		id: `${departmentCode}-${yearLabel}-${index + 1}`,
		code: `${departmentCode}-PP-${yearLabel.charAt(0)}0${index + 1}`,
		name: module.title,
		description: module.description,
	}));

export const PAST_PAPER_DATA = PAST_PAPER_DEPARTMENTS.reduce(
	(accumulator, department) => {
		accumulator[department.code] = PAST_PAPER_YEARS.reduce((yearMap, yearLabel) => {
			yearMap[yearLabel] = createModulesForYear(department.code, yearLabel);
			return yearMap;
		}, {});
		return accumulator;
	},
	{},
);
