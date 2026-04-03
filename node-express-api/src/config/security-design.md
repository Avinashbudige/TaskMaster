# TaskMaster Security Design (Step 5)

## Objectives
- Protect credentials and sessions.
- Prevent unauthorized access to data.
- Validate all untrusted input.
- Limit abuse and brute force attacks.

## 1) Password Hashing (bcrypt)
- Store only password hashes, never raw passwords.
- Use bcrypt with a cost factor of 12 in production (10 for local dev if needed).
- Re-hash policy: if cost factor increases in the future, re-hash on successful login.

Recommended flow:
1. Register: hash password with bcrypt before insert.
2. Login: compare password with bcrypt.compare.

## 2) JWT Access + Refresh Token
- Access token: short-lived (15 minutes), sent in Authorization: Bearer header.
- Refresh token: longer-lived (7 days), rotated on refresh.
- Sign access and refresh with separate secrets:
  - JWT_ACCESS_SECRET
  - JWT_REFRESH_SECRET

Claims:
- sub: user id
- role: user role
- token_type: access | refresh
- iat, exp

Refresh strategy:
- Store refresh token identifiers (jti) or token hash in DB/Redis for revocation.
- On refresh: invalidate old refresh token and issue a new pair (rotation).
- On logout: revoke refresh token.

## 3) Input Validation (Zod or Joi)
- Validate request body, params, query before controller logic.
- Reject unknown fields for sensitive endpoints when possible.
- Return standardized 400 response for validation errors.

Validation scope:
- Auth: register/login payloads
- Tasks: create/update payloads and filters
- Team invite payloads
- Comments/attachments payloads

## 4) Rate Limiting
- Global limiter for all API routes.
- Stricter limiter for auth endpoints to reduce brute force risk.
- Suggested defaults:
  - Global: 100 requests / 15 minutes / IP
  - Auth: 10 requests / 15 minutes / IP
- In multi-instance deployments, use Redis-backed rate limit store.

## 5) Role-Based Access Control (RBAC)
- Roles: SUPER_ADMIN, ADMIN, USER.
- Enforce role checks at route layer using middleware.
- Team-scoped checks should combine RBAC with resource ownership/membership checks.

Examples:
- Only team owner/admin can invite members.
- Task updates allowed for assignee, creator, or team admin.

## Baseline Security Headers & Hardening
- Use helmet for secure default headers.
- Disable x-powered-by.
- Keep CORS policy explicit by environment.
- Use parameterized SQL queries (already in pg query usage).

## Environment Variables
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- JWT_ACCESS_EXPIRES_IN=15m
- JWT_REFRESH_EXPIRES_IN=7d
- BCRYPT_SALT_ROUNDS=12

## Error Handling
- Return generic auth errors (avoid account enumeration).
- Do not leak stack traces in production responses.
- Log security events: failed logins, token refresh failures, rate-limit hits.
