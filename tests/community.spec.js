import { test, expect } from "@playwright/test";

const mockStudentUser = {
  _id: "student-1",
  name: "Student User",
  email: "student@example.com",
  role: "student",
};

const mockChannels = [
  {
    _id: "ch-1",
    name: "Data Structures",
    description: "Discuss arrays, trees, and graphs.",
    subject: "IT201",
    expert: {
      _id: "exp-1",
      name: "Dr Ada",
      title: "Senior Lecturer",
      email: "ada@example.com",
    },
  },
  {
    _id: "ch-2",
    name: "Algorithms",
    description: "Complexity, recursion, and optimization.",
    subject: "CS301",
    expert: {
      _id: "exp-2",
      name: "Prof Turing",
      title: "Professor",
      email: "turing@example.com",
    },
  },
];

const mockPostsByChannel = {
  "ch-1": [
    {
      _id: "post-1",
      channel: "ch-1",
      title: "Welcome to Data Structures",
      content: "Use this channel for your DS questions.",
      type: "post",
      author: { _id: "exp-1", name: "Dr Ada", email: "ada@example.com" },
      createdAt: "2026-04-25T09:00:00.000Z",
      likes: [],
      commentCount: 0,
    },
    {
      _id: "post-2",
      channel: "ch-1",
      title: "Exam Notice",
      content: "Midterm starts next week.",
      type: "announcement",
      author: { _id: "exp-1", name: "Dr Ada", email: "ada@example.com" },
      createdAt: "2026-04-25T10:00:00.000Z",
      likes: ["student-1"],
      commentCount: 1,
    },
  ],
  "ch-2": [
    {
      _id: "post-3",
      channel: "ch-2",
      title: "Dynamic Programming Tips",
      content: "Focus on overlapping subproblems.",
      type: "post",
      author: { _id: "exp-2", name: "Prof Turing", email: "turing@example.com" },
      createdAt: "2026-04-25T11:00:00.000Z",
      likes: [],
      commentCount: 0,
    },
  ],
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

  await page.route("**/api/community/channels", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: mockChannels,
      }),
    });
  });

  await page.route("**/api/community/channels/*/posts", async (route) => {
    const url = new URL(route.request().url());
    const parts = url.pathname.split("/");
    const channelId = parts[parts.length - 2];
    const data = mockPostsByChannel[channelId] || [];

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data,
      }),
    });
  });

  await page.route("**/api/community/channels/*/discussions", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [],
      }),
    });
  });
});

test("community page loads with channels and default posts", async ({ page }) => {
  await page.goto("/community");

  await expect(page).toHaveURL(/\/community/);
  await expect(
    page.getByRole("heading", { name: "Data Structures", exact: true })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /data structures/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /algorithms/i })).toBeVisible();
  await expect(page.getByText("Welcome to Data Structures")).toBeVisible();
  await expect(page.getByRole("button", { name: /all posts/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /announcements/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /discussions/i })).toBeVisible();
});

test("user can search channels and open another channel", async ({ page }) => {
  await page.goto("/community");

  await page.getByRole("textbox", { name: /search channels/i }).fill("Algorithms");
  await expect(page.getByRole("button", { name: /data structures/i })).toHaveCount(0);

  await page.getByRole("button", { name: /algorithms/i }).click();

  await expect(
    page.getByRole("heading", { name: "Algorithms", exact: true })
  ).toBeVisible();
  await expect(page.getByText("Dynamic Programming Tips")).toBeVisible();
  await expect(page.getByText("Welcome to Data Structures")).toHaveCount(0);
});

test("user can create a new post in community channel", async ({ page }) => {
  let postedBody = null;

  await page.route("**/api/community/posts", async (route) => {
    postedBody = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          _id: "post-4",
          channel: postedBody.channelId,
          title: postedBody.title,
          content: postedBody.content,
          type: postedBody.type,
          author: { _id: "student-1", name: "Student User", email: "student@example.com" },
          createdAt: "2026-04-26T08:00:00.000Z",
          likes: [],
          commentCount: 0,
        },
      }),
    });
  });

  await page.goto("/community");

  await page.getByRole("button", { name: /new post/i }).click();
  await expect(page.getByRole("heading", { name: /create new post/i })).toBeVisible();

  await page.getByPlaceholder("Post title").fill("Need help with stacks");
  await page.getByPlaceholder("Write your post...").fill("Can someone explain stack overflow use cases?");
  await page.getByRole("button", { name: /^post$/i }).click();

  expect(postedBody).toMatchObject({
    channelId: "ch-1",
    title: "Need help with stacks",
    content: "Can someone explain stack overflow use cases?",
    type: "post",
  });

  await expect(page.getByText("Need help with stacks")).toBeVisible();
});
