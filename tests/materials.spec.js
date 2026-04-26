import { test, expect } from "@playwright/test";

const mockStudentUser = {
  _id: "student-1",
  name: "Student User",
  email: "student@example.com",
  role: "student",
};

const mockDepartments = [
  {
    _id: "dept-it",
    name: "Information Technology",
    modules: [{ _id: "mod-1", code: "IT201" }, { _id: "mod-2", code: "IT202" }],
  },
  {
    _id: "dept-cs",
    name: "Computer Science",
    modules: [{ _id: "mod-3", code: "CS101" }],
  },
];

const materialsByType = {
  "Lecture Note": [
    {
      _id: "ln-1",
      title: "Intro to Data Structures",
      description: "Basics of arrays, lists, and stacks.",
      moduleCode: "IT201",
      academicYear: "Year 1",
      academicSemester: "1st Semester",
    },
    {
      _id: "ln-2",
      title: "Graphs Foundations",
      description: "Graph traversal and shortest paths.",
      moduleCode: "IT202",
      academicYear: "Year 2",
      academicSemester: "1st Semester",
    },
    {
      _id: "ln-3",
      title: "Networks Deep Dive",
      description: "Protocols and network models.",
      moduleCode: "IT203",
      academicYear: "Year 2",
      academicSemester: "2nd Semester",
    },
  ],
  "Past Paper": [
    {
      _id: "pp-1",
      title: "IT Past Paper 2025",
      description: "Past paper set.",
      moduleCode: "IT201",
      academicYear: "Year 1",
      academicSemester: "1st Semester",
    },
  ],
  "Model Paper": [],
  "Short Note": [],
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((user) => {
    localStorage.setItem("lms_user", JSON.stringify(user));
    localStorage.setItem("lms_token", "mock-student-token");
  }, mockStudentUser);

  await page.route("**/api/auth/me**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: mockStudentUser }),
    });
  });

  await page.route("**/api/notifications/unread-count**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, unreadCount: 0 }),
    });
  });

  await page.route("**/api/materials/hierarchy**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: { departments: mockDepartments },
      }),
    });
  });

  await page.route("**/api/materials?**", async (route) => {
    const url = new URL(route.request().url());
    const departmentId = url.searchParams.get("departmentId");
    const materialType = url.searchParams.get("materialType");

    const data =
      departmentId === "dept-it" && materialType
        ? materialsByType[materialType] || []
        : [];

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data,
      }),
    });
  });
});

test("materials page loads with categories and departments", async ({ page }) => {
  await page.goto("/materials");

  await expect(page).toHaveURL(/\/materials/);
  await expect(page.getByRole("heading", { name: /^materials$/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /lecture notes/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /past papers/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /model papers/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /short notes/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /information technology/i }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /computer science/i }).first()).toBeVisible();
});

test("student can open a past papers department", async ({ page }) => {
  await page.goto("/materials");

  await page.getByRole("button", { name: /past papers/i }).click();
  await expect(page.getByText(/select a department to browse past papers/i)).toBeVisible();

  await page.getByRole("button", { name: /information technology/i }).first().click();

  await expect(page).toHaveURL(/\/materials\/past-papers\/dept-it$/);
  await expect(
    page.getByRole("heading", { name: /information technology past papers/i })
  ).toBeVisible();
  await expect(page.getByText("IT Past Paper 2025")).toBeVisible();
});

test("department materials page filters by academic year and semester", async ({ page }) => {
  await page.goto("/materials/lecture-notes/dept-it");

  await expect(page).toHaveURL(/\/materials\/lecture-notes\/dept-it$/);
  await expect(page.getByText("Intro to Data Structures")).toBeVisible();
  await expect(page.getByText("Graphs Foundations")).toHaveCount(0);
  await expect(page.getByText("Networks Deep Dive")).toHaveCount(0);

  await page.getByRole("button", { name: "Year 2" }).click();
  await expect(page.getByText("Intro to Data Structures")).toHaveCount(0);
  await expect(page.getByText("Graphs Foundations")).toBeVisible();
  await expect(page.getByText("Networks Deep Dive")).toHaveCount(0);

  await page.getByRole("button", { name: "2nd Semester" }).click();
  await expect(page.getByText("Graphs Foundations")).toHaveCount(0);
  await expect(page.getByText("Networks Deep Dive")).toBeVisible();
});
