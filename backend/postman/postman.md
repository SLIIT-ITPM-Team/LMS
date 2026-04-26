# LMS Backend Postman Guide

This guide helps you test the full backend using Postman.

## Files

- Collection: `backend/postman/LMS_Backend.postman_collection.json`
- Environment: `backend/postman/LMS_Local.postman_environment.json`

## 1. Start the backend

From project root:

```powershell
cd backend
npm install
npm start
```

Default API base URL in these files is:

`http://localhost:5001`

If your backend runs on a different port, update `baseUrl` in Postman environment.

## 2. Import into Postman

1. Open Postman.
2. Click `Import`.
3. Import both files:
   - `LMS_Backend.postman_collection.json`
   - `LMS_Local.postman_environment.json`
4. Select environment `LMS Local`.

## 3. Authenticate first

Use this request:

- `Auth` -> `POST /api/auth/login`

Default seeded admin credentials (from backend setup):

```json
{
  "email": "admin@gmail.com",
  "password": "Admin@123"
}
```

After successful login, the collection test script stores:

- `token`
- `adminToken` or `studentToken` (based on role)
- `userId`

## 4. Typical testing flow

Recommended order:

1. `Health` -> `GET /api/health/health`
2. `Auth` -> Login
3. `Admin` -> Create department
4. `Admin` -> Create module
5. `Courses` -> Create course
6. `Materials` -> Upload material (form-data)
7. `Community` / `Channels` / `Posts` / `Comments` -> create and query data
8. `Quiz (API)` -> create quiz from summary or PDF
9. `Notifications` -> read and mark as read

## 5. Set ID variables while testing

Many routes use path params like `:id`, `:moduleId`, `:channelId`.

In Postman environment set:

- `departmentId`
- `moduleId`
- `courseId`
- `materialId`
- `quizId`
- `channelId`
- `postId`
- `commentId`
- `notificationId`

You can copy IDs from response JSON and paste into environment values.

## 6. File upload endpoints

For these requests, choose a real local file in Postman form-data:

- `POST /api/materials/upload` -> key: `file`
- `POST /api/quiz/upload` -> key: `pdf`
- `POST /api/quiz/creative-pdf` -> key: `pdf`
- Alias versions under `/quiz/...` are also included.

## 7. Notes

- Collection includes all mounted backend endpoints from `backend/src/server.js`, including `/api/quiz` and `/quiz` alias routes.
- Most endpoints require `Bearer {{token}}`; public endpoints are already set as `No Auth` in the collection.
