import { test, expect } from "@playwright/test";

const mockCourses = [
  {
    _id: "course-1",
    title: "Trees and Graphs",
    videoUrl: "https://www.youtube.com/watch?v=example1",
    transcriptText: "Sample transcript content.",
    summaryText: "Sample summary.",
    summaryPdfUrl: "",
    createdAt: "2026-04-20T10:00:00.000Z",
    updatedAt: "2026-04-21T10:00:00.000Z",
    moduleId: {
      _id: "module-1",
      name: "Data Structures",
      code: "CS204",
      department: { _id: "dept-1", name: "Information Technology" },
      academicYear: "Year 2",
      academicSemester: "1st Semester",
    },
  },
  {
    _id: "course-2",
    title: "Hash Tables",
    videoUrl: "https://www.youtube.com/watch?v=example2",
    transcriptText: "Another transcript.",
    summaryText: "Another summary.",
    summaryPdfUrl: "",
    createdAt: "2026-04-19T10:00:00.000Z",
    updatedAt: "2026-04-20T10:00:00.000Z",
    moduleId: {
      _id: "module-1",
      name: "Data Structures",
      code: "CS204",
      department: { _id: "dept-1", name: "Information Technology" },
      academicYear: "Year 2",
      academicSemester: "1st Semester",
    },
  },
];

const mockStudentUser = {
  _id: "student-1",
  name: "Student User",
  email: "student@example.com",
  role: "student",
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
      body: JSON.stringify({
        user: mockStudentUser,
      }),
    });
  });

  await page.route("**/api/notifications/unread-count**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        unreadCount: 0,
      }),
    });
  });

  await page.route("**/api/courses?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: mockCourses,
      }),
    });
  });

  await page.route("**/api/courses/course-1", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: mockCourses[0],
      }),
    });
  });
});

test("course page loads for student", async ({ page }) => {
  await page.goto("/student/courses");

  await expect(page).toHaveURL(/\/student\/courses/);
  await expect(page.getByRole("heading", { name: /my courses/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /choose a department/i })).toBeVisible();
  await expect(page.getByText("Information Technology")).toBeVisible();
});

test("student can navigate all course steps", async ({ page }) => {
  await page.goto("/student/courses");

  await page.getByRole("button", { name: /information technology/i }).click();
  await expect(page.getByRole("heading", { name: /select academic year/i })).toBeVisible();

  await page.getByRole("button", { name: /year 2/i }).click();
  await expect(page.getByRole("heading", { name: /select semester/i })).toBeVisible();

  await page.getByRole("button", { name: /1st semester/i }).click();
  await expect(page.getByRole("heading", { name: /select module/i })).toBeVisible();

  await page.getByRole("button", { name: /data structures/i }).click();
  await expect(page.getByText(/trees and graphs/i)).toBeVisible();
  await expect(page.getByText(/hash tables/i)).toBeVisible();
});

test("student can open a course from course list", async ({ page }) => {
  await page.goto("/student/courses");

  await page.getByRole("button", { name: /information technology/i }).click();
  await page.getByRole("button", { name: /year 2/i }).click();
  await page.getByRole("button", { name: /1st semester/i }).click();
  await page.getByRole("button", { name: /data structures/i }).click();

  await page.getByText(/trees and graphs/i).click();
  await expect(page).toHaveURL(/\/courses\/course-1/);
  await expect(page.locator("h1", { hasText: /trees and graphs/i })).toBeVisible();
});
