# Victor Sierra CRM

An internal CRM built for Victor Sierra: Leads, Customers, Contacts, Opportunities (with
multiple configurable pipelines), Tasks with follow-up notifications, admin-defined custom
fields on every record type, and two-way-ish Outlook integration (auto-pulled email, tasks
synced to your calendar). Sign-in is Microsoft Entra ID (Azure AD) SSO — the same login also
grants the Graph API permissions used for email/calendar sync.

## Stack

- Next.js (App Router, TypeScript, Tailwind CSS)
- PostgreSQL + Prisma
- NextAuth (Auth.js) v5 with the Microsoft Entra ID provider
- Microsoft Graph API (`@microsoft/microsoft-graph-client`) for email + calendar sync

The app is host-agnostic: it runs the same way locally, in Docker, on Vercel, or on Azure App
Service / Container Apps.

## 1. Local development setup

### Prerequisites

- Node.js 20+
- A PostgreSQL database (local install, Docker, or a hosted instance)

### Steps

```bash
npm install
cp .env.example .env   # then fill in the values (see below)
npx prisma migrate dev # creates tables
npx prisma db seed     # optional: sample pipelines, custom fields, and demo records
npm run dev
```

Open http://localhost:3000. You'll be redirected to `/login` — signing in requires the Azure
AD app registration described below (there's no separate username/password login; this app
only supports Microsoft sign-in).

## 2. Azure AD (Microsoft Entra ID) app registration

This is required both for **signing in** and for the **Outlook integration** (they're the same
OAuth flow/consent — signing in already grants the mail/calendar permissions).

1. Go to the [Azure Portal](https://portal.azure.com) → **Microsoft Entra ID** → **App
   registrations** → **New registration**.
2. Name it (e.g. "Victor Sierra CRM"), leave account type as your org's default (single
   tenant), and set the **Redirect URI** to:
   - Platform: **Web**
   - `https://<your-deployed-domain>/api/auth/callback/microsoft-entra-id`
   - Also add `http://localhost:3000/api/auth/callback/microsoft-entra-id` for local dev.
3. After creation, note the **Application (client) ID** and **Directory (tenant) ID** from the
   Overview page.
4. Go to **Certificates & secrets** → **New client secret**. Copy the secret **value**
   immediately (it's hidden after you leave the page).
5. Go to **API permissions** → **Add a permission** → **Microsoft Graph** → **Delegated
   permissions**, and add:
   - `User.Read`
   - `Mail.Read`
   - `Mail.Send`
   - `Calendars.ReadWrite`
   - `offline_access` (usually included by default)
6. Click **Grant admin consent for <your org>** so users aren't individually prompted to
   approve each permission (recommended for an internal line-of-business app).
7. Put the three values into your `.env`:
   ```
   AZURE_AD_CLIENT_ID=<Application (client) ID>
   AZURE_AD_CLIENT_SECRET=<the secret value from step 4>
   AZURE_AD_TENANT_ID=<Directory (tenant) ID>
   ```

Only people in your Microsoft 365 tenant can sign in (single-tenant app registration), so no
separate user management is needed — access is controlled the same way the rest of your org's
Microsoft apps are.

## 3. Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | yes | Public base URL of the app, e.g. `https://crm.victor-sierra.com` |
| `NEXTAUTH_SECRET` | yes | Random secret for signing session cookies — generate with `openssl rand -base64 32` |
| `AZURE_AD_CLIENT_ID` | yes | From app registration |
| `AZURE_AD_CLIENT_SECRET` | yes | From app registration |
| `AZURE_AD_TENANT_ID` | yes | From app registration |
| `CRON_SECRET` | recommended | Bearer token that protects `/api/cron/*` endpoints from being called by anyone who finds the URL |

## 4. Background jobs (email sync + task reminders)

Two endpoints need to be hit on a schedule for things to happen automatically without anyone
having the app open:

- `GET /api/cron/sync-outlook` — pulls new email from each connected user's Outlook inbox and
  links it to matching leads/contacts. Suggested: every 5-15 minutes.
- `GET /api/cron/check-tasks` — raises in-app notifications for due/overdue tasks and
  reminders. Suggested: every 5 minutes.

Both accept an `Authorization: Bearer <CRON_SECRET>` header if `CRON_SECRET` is set (do set it
in production). Pick whichever scheduler fits your hosting:

- **Docker / self-hosted**: `docker-compose.yml` includes a `cron` service that does this out
  of the box.
- **Vercel**: add a `vercel.json` with a [Vercel Cron](https://vercel.com/docs/cron-jobs)
  entry pointing at each path.
- **Azure**: an Azure Logic App or Function on a timer trigger that calls the URLs.
- **Anything else**: a plain cron entry running `curl` works fine.

Note: the notification bell also opportunistically checks the current user's own tasks every
time it polls, so task reminders appear for anyone actively using the app even without cron
configured — the cron job matters most for email sync and for reminders reaching people who
aren't currently logged in.

## 5. Customizing the CRM

- **Custom fields**: Settings → Custom fields. Add fields to Leads, Customers, Contacts,
  Opportunities, or Tasks — text, number, date, dropdown, checkbox, email, phone, or URL. They
  show up in the relevant create/edit forms and detail pages immediately.
- **Opportunity pipelines**: Settings → Opportunity pipelines. Create as many opportunity
  types as you need (e.g. "New Business", "Renewal", "Upsell"), each with its own ordered
  stages, win probabilities, and which stage(s) count as won/lost. The Opportunities board
  view switches between pipelines with a tab at the top.

## 6. Deployment

### Docker / docker-compose

```bash
cp .env.example .env   # fill in values
docker compose up --build
```

This starts Postgres, the app, and the cron sidecar. Run migrations once against the compose
Postgres instance the first time:

```bash
docker compose run --rm app npx prisma migrate deploy
```

### Building the image standalone

The app builds with Next.js's `output: "standalone"`, so a plain `Dockerfile` build (no
compose) works too — see `Dockerfile`. Point `DATABASE_URL` at any reachable Postgres instance
(Azure Database for PostgreSQL, RDS, Neon, etc.).

### Vercel

Works as a normal Next.js app. Use a Postgres provider reachable from Vercel (Neon, Supabase,
Azure Database for PostgreSQL with public access, etc.), set the environment variables in
Project Settings, and add Vercel Cron entries for the two `/api/cron/*` routes.

### Azure App Service / Container Apps

Since this is a Microsoft-centric CRM, Azure is a natural fit: deploy the Docker image to
Container Apps or App Service (Linux, Node 20+), point it at Azure Database for PostgreSQL,
and use an Azure Logic App (Recurrence trigger → HTTP action) to hit the cron endpoints.

## 7. Data model notes

- **Leads** convert into a **Contact** (and optionally a new **Customer**/Company and
  **Opportunity**) via the Convert action on a lead's detail page.
- **Tasks** can be linked to a Lead, Contact, Customer, or Opportunity, are assignable to any
  user, and support due dates + separate reminder times.
- **Emails** synced from Outlook are matched to CRM records by the other party's email address
  (against Contact and Lead email fields) and shown in an Emails panel on the matching
  record's detail page.
- Prisma schema lives in `prisma/schema.prisma`; run `npx prisma migrate dev` after changing it.

## 8. Known limitations / good next steps

- Opportunities board view supports moving between stages via a dropdown, not drag-and-drop.
- Email matching links to Contacts/Leads only (not directly to Opportunities/Companies beyond
  the matched contact's own company) — good enough for a timeline, not a full thread view.
- No row-level permissions yet (any signed-in user can see/edit all records) — add if you need
  per-team visibility restrictions.
- Outlook sync is pull/push per action (on task save, on cron tick) rather than real-time
  webhooks — real-time would mean registering Microsoft Graph change notifications, which
  requires a publicly reachable HTTPS webhook endpoint.
