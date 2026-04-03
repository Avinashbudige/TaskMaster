# Step 6: Scalability Considerations

## Database
- Use indexes for common task filters:
  - assigned_to
  - team_id
  - status
- Use pagination for list endpoints to control payload size and query cost.

Example:
- GET /tasks?page=1&limit=20

## Horizontal Scaling
- Keep backend stateless with JWT-based authentication.
- Run multiple API instances behind a load balancer.
- If server-side sessions are introduced, store them in Redis.

## File Handling
- Never store binary files in PostgreSQL.
- Store files in object storage (for example S3).
- Use signed URLs so upload/download traffic bypasses API workers.

## Caching
- Cache frequent reads (for example task list queries).
- Invalidate cache on create/update/delete operations.
- For multi-instance deployments, use Redis cache instead of in-memory cache.
