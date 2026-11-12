# Learnwell

Learnwell is a React/Vite learning marketplace with an Express API. For local development, it uses an ignored JSON file. For deployment, configure `DATABASE_URL` to use PostgreSQL; production refuses to start without it.

## Local development

```sh
npm ci
npm run dev
```

The local API listens on port 3001 and Vite serves the frontend on port 5173. Local data is written to `data/learnwell.json`.

## Render deployment

1. Push this project to a Git provider connected to Render.
2. In Render, choose **New → Blueprint**, select the repository, and review `render.yaml`.
3. Apply the Blueprint. The current configuration uses one free Node web service and a free 1 GB PostgreSQL database in Oregon. No payment method is required for these plans.
4. Wait for the first deploy to pass `/api/health`. Render injects the database's internal connection string, and the app applies migrations during startup.
5. Test registration, login, enrollment, and certificate links over HTTPS.

The free plans are for testing, not production. The web service spins down after 15 minutes without traffic and can take about a minute to start again. Free PostgreSQL expires 30 days after creation; after a 14-day grace period, Render deletes the database and its data. Free instances can also restart, and the database has no backups. Upgrade to paid plans and arrange backups before relying on Learnwell for real users or long-term data.

Do not commit database URLs, passwords, or other credentials. Add secrets in Render's environment settings. The default Blueprint connects over Render's private network and disallows external database connections; use the external database URL only for a trusted migration or administration client, then remove that access.

## Production settings

- `DATABASE_URL` is required in production. PostgreSQL stores users, hashed passwords, sessions, courses, enrollments, and certificates.
- `PG_POOL_MAX` defaults to 10 connections per web instance. Keep the sum below the database connection limit when scaling out.
- `PGSSLMODE=require` enables TLS to PostgreSQL. `COOKIE_SECURE=true` enables secure, HTTP-only session cookies behind Render's TLS proxy.
- `npm run db:migrate` applies versioned schema migrations. Application startup also checks migrations so new instances do not serve traffic before storage is ready.
- `/api/health` performs a database readiness query and is configured as Render's health check.

This deployment is a production-oriented starting point, not a guarantee of capacity for a particular traffic volume. Monitor Render's service/database metrics and logs, configure backups and alerts, test restores, and scale the database and app instances as measured load requires. Learnwell completion certificates are not accredited credentials.
