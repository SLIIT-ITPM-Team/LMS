import { test, expect } from "@playwright/test";

const mockStudentUser = {
  _id: "student-1",
  name: "Student User",
  email: "student@example.com",
  role: "student",
};

const buildQuestions = () =>
  Array.from({ length: 10 }, (_, index) => {
    const number = index + 1;
    return {
      questionNumber: number,
      questionText: `Question ${number} text`,
      difficulty: "medium",
      options: [
        `Q${number} Option A`,
        `Q${number} Option B`,
        `Q${number} Option C`,
        `Q${number} Option D`,
      ],
    };
  });

const quizResponse = {
  _id: "quiz-1",
  quizId: "quiz-1",
  title: "Data Structures Quiz",
  summary: "Mock summary for quiz loading.",
  questions: buildQuestions(),
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
      body: JSON.stringify({
        success: true,
        unreadCount: 0,
      }),
    });
  });

  await page.route("**/api/quiz/*/questions", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(quizResponse),
    });
  });
});

test("quiz page can generate quiz from summary", async ({ page }) => {
  let postedBody = null;

  await page.route("**/api/quiz/from-summary", async (route) => {
    postedBody = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ _id: "quiz-1" }),
    });
  });

  await page.goto("/quizzes", { waitUntil: "domcontentloaded" });

  const summary =
    "This is a detailed course summary about arrays, linked lists, stacks, queues, trees, and graph traversal techniques.";
  await page.getByRole("textbox", { name: /summary/i }).fill(summary);
  await page.getByRole("button", { name: /generate 10 questions from summary/i }).click();

  await expect(page).toHaveURL(/\/quiz\/quiz-1\/quits$/);
  await expect(page.getByRole("heading", { name: /data structures quiz/i })).toBeVisible();
  await expect(page.getByText("Question 1 text")).toBeVisible();

  expect(postedBody).toMatchObject({ summary });
});

test("quiz attempt shows validation when email is missing", async ({ page }) => {
  await page.goto("/quiz/quiz-1/quits");

  for (let i = 1; i <= 9; i += 1) {
    await page.getByRole("button", { name: "Next" }).click();
  }

  await page.getByRole("button", { name: /submit quiz/i }).click();
  await expect(page.getByText(/please enter your email before submitting\./i)).toBeVisible();
});

test("quiz attempt submits answers and shows result modal", async ({ page }) => {
  let postedAttempt = null;

  await page.route("**/api/quiz/quiz-1/attempt", async (route) => {
    postedAttempt = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          passed: true,
          scorePercentage: 100,
          correctCount: 10,
          totalQuestions: 10,
          attemptNumber: 1,
          userEmail: "student@example.com",
          certificate: { certificateId: "CERT-QUIZ-001" },
          answers: buildQuestions().map((question) => ({
            questionNumber: question.questionNumber,
            questionText: question.questionText,
            selectedAnswer: question.options[0],
            correctAnswer: question.options[0],
            isCorrect: true,
          })),
        },
      }),
    });
  });

  await page.goto("/quiz/quiz-1/quits");

  await page.getByPlaceholder("student@example.com").fill("Student@Example.com");

  for (let i = 1; i <= 10; i += 1) {
    await page.getByRole("button", { name: `Q${i} Option A` }).click();
    if (i < 10) {
      await page.getByRole("button", { name: "Next" }).click();
    }
  }

  await page.getByRole("button", { name: /submit quiz/i }).click();

  await expect(page.getByRole("heading", { name: /quiz result/i })).toBeVisible();
  await expect(page.getByText("Correct Answers: 10 / 10")).toBeVisible();
  await expect(page.getByText("Certificate ID: CERT-QUIZ-001")).toBeVisible();
  await expect(page.getByRole("button", { name: /download certificate pdf/i })).toBeVisible();

  expect(postedAttempt.userEmail).toBe("student@example.com");
  expect(Object.keys(postedAttempt.answers || {})).toHaveLength(10);
});
