# TaskMaster API Design (REST)

## Conventions
- Base URL: /api/v1
- Auth: Bearer JWT in Authorization header
- Content type: application/json
- Time format: ISO-8601 UTC
- Pagination: page, limit (default limit: 20, max: 100)

## Auth

### POST /auth/register
Creates a new user account.

Request body:
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "StrongPassword123"
}

Success response (201):
{
  "id": "uuid",
  "name": "Alice",
  "email": "alice@example.com",
  "role": "USER",
  "created_at": "2026-04-03T10:10:00Z"
}

Errors:
- 400 invalid payload
- 409 email already exists

### POST /auth/login
Authenticates a user and returns tokens.

Request body:
{
  "email": "alice@example.com",
  "password": "StrongPassword123"
}

Success response (200):
{
  "access_token": "jwt",
  "refresh_token": "jwt",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "USER"
  }
}

Errors:
- 401 invalid credentials

### POST /auth/logout
Invalidates current session/token pair.

Request body:
{
  "refresh_token": "jwt"
}

Success response (204): empty

Errors:
- 401 unauthorized

### GET /users/me
Returns current authenticated user profile.

Success response (200):
{
  "id": "uuid",
  "name": "Alice",
  "email": "alice@example.com",
  "role": "USER",
  "created_at": "2026-04-03T10:10:00Z"
}

Errors:
- 401 unauthorized

### PUT /users/me
Updates current user profile.

Request body (any updatable fields):
{
  "name": "Alice Smith"
}

Success response (200):
{
  "id": "uuid",
  "name": "Alice Smith",
  "email": "alice@example.com",
  "role": "USER",
  "updated_at": "2026-04-03T11:00:00Z"
}

Errors:
- 400 invalid payload
- 401 unauthorized

## Tasks

### POST /tasks
Creates a task.

Request body:
{
  "title": "Fix login bug",
  "description": "Handle token refresh edge case",
  "status": "OPEN",
  "due_date": "2026-04-10T00:00:00Z",
  "priority": "HIGH",
  "assigned_to": "uuid",
  "team_id": "uuid"
}

Success response (201):
{
  "id": "uuid",
  "title": "Fix login bug",
  "status": "OPEN",
  "priority": "HIGH",
  "team_id": "uuid",
  "created_at": "2026-04-03T11:10:00Z"
}

Errors:
- 400 invalid payload
- 403 not permitted for team
- 404 team or assignee not found

### GET /tasks
Returns paginated tasks with filters.

Supported query params:
- status: OPEN | IN_PROGRESS | DONE
- search: text search on title/description
- sort: due_date | created_at | priority
- order: asc | desc
- page: integer
- limit: integer
- team_id: uuid
- assigned_to: uuid

Example:
GET /tasks?status=OPEN&search=bug&sort=due_date&order=asc&page=1&limit=20

Success response (200):
{
  "items": [
    {
      "id": "uuid",
      "title": "Fix login bug",
      "status": "OPEN",
      "priority": "HIGH",
      "due_date": "2026-04-10T00:00:00Z",
      "team_id": "uuid",
      "assigned_to": "uuid"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 124
  }
}

### GET /tasks/:id
Returns a task by id.

Success response (200): task object

Errors:
- 403 forbidden
- 404 not found

### PUT /tasks/:id
Updates a task.

Request body (partial update fields accepted by implementation):
{
  "title": "Fix login bug (token edge)",
  "status": "IN_PROGRESS",
  "priority": "CRITICAL"
}

Success response (200): updated task object

Errors:
- 400 invalid payload
- 403 forbidden
- 404 not found

### DELETE /tasks/:id
Deletes a task.

Success response (204): empty

Errors:
- 403 forbidden
- 404 not found

## Teams

### POST /teams
Creates a team.

Request body:
{
  "name": "Backend Squad"
}

Success response (201):
{
  "id": "uuid",
  "name": "Backend Squad",
  "owner_id": "uuid",
  "created_at": "2026-04-03T12:00:00Z"
}

### GET /teams
Lists teams where current user is a member.

Success response (200):
{
  "items": [
    {
      "id": "uuid",
      "name": "Backend Squad",
      "owner_id": "uuid"
    }
  ]
}

### POST /teams/:id/invite
Invites a user to a team.

Request body:
{
  "email": "bob@example.com",
  "role": "MEMBER"
}

Success response (202):
{
  "message": "Invitation queued"
}

Errors:
- 403 only team admin/owner can invite
- 404 team or user not found
- 409 user already a member

## Comments

### POST /tasks/:id/comments
Creates a comment on a task.

Request body:
{
  "content": "I can take this task"
}

Success response (201):
{
  "id": "uuid",
  "task_id": "uuid",
  "user_id": "uuid",
  "content": "I can take this task",
  "created_at": "2026-04-03T12:20:00Z"
}

### GET /tasks/:id/comments
Lists task comments ordered by created_at ascending.

Success response (200):
{
  "items": [
    {
      "id": "uuid",
      "task_id": "uuid",
      "user_id": "uuid",
      "content": "I can take this task",
      "created_at": "2026-04-03T12:20:00Z"
    }
  ]
}

## Attachments

### POST /tasks/:id/attachments
Starts attachment upload flow (signed URL pattern).

Request body:
{
  "file_name": "screenshot.png",
  "file_type": "image/png",
  "file_size": 248122
}

Success response (201):
{
  "attachment_id": "uuid",
  "upload_url": "https://signed-upload-url",
  "file_url": "https://object-storage/path/file",
  "expires_in": 900
}

Notes:
- Client uploads directly to object storage using upload_url.
- Backend stores metadata and links attachment to task.

## Common Error Shape
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "status must be one of OPEN, IN_PROGRESS, DONE"
  }
}
