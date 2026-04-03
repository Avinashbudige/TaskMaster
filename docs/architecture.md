# Architecture

TaskMaster is organized as a modular monolith with clear domain boundaries:
- auth
- tasks
- teams
- comments
- attachments

Current deployment model:
- API layer (Node or Java)
- PostgreSQL for relational data
- Object storage for attachments
- Optional Redis for queue/cache/session concerns

The structure is prepared for future microservice extraction per module.
