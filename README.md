# Spark Team Task Tracker

A focused full-stack task tracker for adding, editing, assigning, completing, and deleting team work.
It was built for Spark Tutoring's Full Stack Developer challenge with an emphasis on product
clarity, maintainable boundaries, accessibility, and deliberate scope.

![Spark Team Task Tracker desktop view](docs/assets/task-tracker-desktop.png)

## Reviewer quick path

1. [Watch the 32-second product preview](docs/assets/spark-task-tracker-demo.mp4) for the complete add, assign, edit, complete, search, and filter flow.
2. Review the seven-slide PowerPoint in [`output/presentation/`](output/presentation/); the same product preview is embedded on slide 3.
3. Run `make install`, `make migrate`, and then start the backend and frontend as described below.
4. Run `make check` to execute the same quality gate used by GitHub Actions.
5. Use the prepared [2–5 minute Loom narrative](docs/LOOM_SCRIPT.md) for the requested interview walkthrough.

## Requirements coverage

| Challenge requirement | Implementation |
| --- | --- |
| Add a task | Accessible modal form with required title, description, and assignee fields. |
| Edit a task | The same form is reused with existing values populated. |
| Assign a task | Tasks reference one of four seeded team members. Reassignment is supported. |
| Mark complete | A task can be toggled complete or incomplete without losing its content or owner. |
| Additional requested enhancement: delete | A separately confirmed permanent action removes a task from the API and UI. |
| Show title, status, and team member | Every task card exposes all three at a glance. |
| Persist changes | All writes pass through the Django REST API and Django ORM. |
| Optional product polish | Search, status filters, progress summary, responsive layouts, and clear loading/error states. |

The application deliberately excludes authentication, due dates, priorities, and other
speculative features. This keeps the submission focused while still demonstrating how the code
could evolve if those requirements became real.

## Product behaviour

The primary workflow is intentionally contained in one page:

1. The app loads tasks and assignable team members in parallel.
2. A user creates a task with a clear title, supporting description, and owner.
3. The created task is returned by the API, inserted into local state, and sorted with open work first.
4. Editing uses the same form and can update wording or ownership.
5. Completion is a small `PATCH` request; completed tasks move below open work.
6. Deletion requires a separate confirmation and removes the task only after the API succeeds.
7. Search and status filters update the visible list without losing the canonical task state.

Initial-load failures and action failures are intentionally separate. A failed initial request
shows a retry state, while a failed create, edit, status change, or deletion leaves the current task list
visible and reports the action error in a dismissible notification.

## Technology choices

| Layer | Choice | Why it fits this challenge |
| --- | --- | --- |
| API | Django 5.2 LTS + Django REST Framework | Matches Spark's backend stack and provides mature validation, routing, ORM, migrations, and test tooling. |
| UI | React 19 + strict TypeScript + Vite | Keeps interaction code typed, component-focused, and fast to review. |
| Data | SQLite by default; PostgreSQL via `DATABASE_URL` | Gives reviewers a zero-configuration path while retaining a production-relevant database option. |
| Styling | Responsibility-based CSS with shared design tokens | Keeps the visual system consistent without introducing a UI framework for a small surface. |
| Quality | Ruff, ESLint, Vitest, Django test runner, and GitHub Actions | Provides quick, repeatable feedback across both halves of the application. |

Django 5.2 LTS was selected over a short-lived feature release because its
[extended support runs through April 2028](https://www.djangoproject.com/download/). Python
dependencies are pinned, and the frontend lockfile makes JavaScript installs reproducible.

## Architecture

```mermaid
flowchart LR
  A[React components] --> B[useTaskTracker hook]
  B --> C[Typed API service]
  C -->|JSON over HTTP| D[Django REST view sets]
  D --> E[Serializers and validation]
  E --> F[Django ORM]
  F --> G[(SQLite or PostgreSQL)]
```

The dependency direction is kept simple:

- React components own presentation, interaction, and accessibility semantics.
- `useTaskTracker` owns server-state loading, sorting, mutations, and user-facing failure state.
- The API service owns HTTP transport, request serialization, and response-error translation.
- View sets expose the focused list, create, update, and delete use cases.
- Serializers own the API shape, field validation, trimming, and assignee resolution.
- Models own persisted constraints, relationships, ordering, identifiers, and timestamps.

There is no repository layer or separate domain-service layer because the current use cases do
not contain business rules that justify them. Django's ORM and serializers already provide the
needed abstractions. Adding more layers here would increase navigation cost without improving
change isolation.

### Request and mutation flow

```mermaid
sequenceDiagram
  participant UI as React UI
  participant Hook as useTaskTracker
  participant API as API service
  participant DRF as Django REST API
  participant DB as Database

  UI->>Hook: add/edit/toggle/delete action
  Hook->>API: typed input
  API->>DRF: POST, PATCH, or DELETE
  DRF->>DRF: validate and normalize
  DRF->>DB: persist or remove through ORM
  DB-->>DRF: mutation result
  DRF-->>API: canonical task or 204 response
  API-->>Hook: typed result
  Hook->>Hook: replace, remove, and sort state
  Hook-->>UI: render updated task list
```

The server response is treated as the source of truth after every mutation. This avoids the
complexity and rollback behaviour of optimistic updates for a workflow where writes complete
quickly and concurrent editing is not part of the brief.

## Backend design

### Data model

| Model | Important fields | Design notes |
| --- | --- | --- |
| `TeamMember` | `name`, `role` | Names are unique, results are ordered by name, and initials are derived rather than stored. |
| `Task` | UUID `id`, `title`, `description`, `assignee`, `completed`, timestamps | UUIDs avoid exposing sequential task counts. `PROTECT` prevents an assigned member from being removed accidentally. |

Tasks are ordered by completion state and then most recent update, so open and recently changed
work naturally appears first. `created_at` and `updated_at` are timezone-aware and serialized as
ISO 8601 timestamps.

### Validation and API shape

The task serializer exposes a nested, read-only `assignee` object for display and accepts a
write-only `assignee_id` for mutations. This keeps the response convenient for the UI without
allowing clients to submit arbitrary nested member data.

Validation is enforced at the API boundary:

- title: required, trimmed, maximum 120 characters;
- description: required, trimmed, maximum 1,000 characters;
- assignee: must reference an existing team member;
- search query: trimmed and limited to 100 characters;
- status: allow-listed to `all`, `open`, or `completed`.

### API contract

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/team-members/` | List assignable example users. |
| `GET` | `/api/tasks/` | List tasks; accepts `q` and `status=all\|open\|completed`. |
| `POST` | `/api/tasks/` | Create a task. |
| `PATCH` | `/api/tasks/{id}/` | Edit, reassign, or change completion state. |
| `DELETE` | `/api/tasks/{id}/` | Permanently delete a task after client confirmation. |

Successful deletion returns `204 No Content`. The UI presents a dedicated confirmation dialog,
names the task being removed, and states that the action cannot be undone before issuing the
request.

Example create request:

```json
{
  "title": "Review tutoring resources",
  "description": "Check the new algebra practice set before publishing.",
  "assignee_id": 4,
  "completed": false
}
```

Example response:

```json
{
  "id": "37d5820c-874e-48e5-86fc-bbbcd6841401",
  "title": "Review tutoring resources",
  "description": "Check the new algebra practice set before publishing.",
  "assignee": {
    "id": 4,
    "name": "Noah Williams",
    "role": "Curriculum Lead",
    "initials": "NW"
  },
  "completed": false,
  "created_at": "2026-08-07T08:00:00Z",
  "updated_at": "2026-08-07T08:00:00Z"
}
```

### Configuration and production safety

Local development uses an explicit unsafe fallback key only while `DJANGO_DEBUG=true`. When
debug mode is disabled, startup fails immediately unless `DJANGO_SECRET_KEY` is provided. This
prevents a deployment from silently using a known development secret.

Other defensive defaults include:

- explicit allowed hosts and CORS origins;
- JSON-only API rendering;
- one-megabyte request-body and bounded-field limits;
- MIME sniffing prevention and frame denial;
- secure cookies, HTTPS redirect, and HSTS outside debug mode;
- database connection health checks and reusable connections.

Authentication and authorization are intentionally absent for the challenge. This is a scope
decision, not a production recommendation; enabling real users is the first item in the roadmap.

## Frontend design

### State ownership

State is split by responsibility:

- `App` owns view-only state: search text, status filter, and dialog selection.
- `useTaskTracker` owns remote task/member data and asynchronous request state.
- `TaskFormDialog` owns temporary form input until a mutation succeeds.
- The API module is the only place that knows the base URL or raw `fetch` contract.

The custom hook is intentionally small. React Context, Redux, or a server-state library would be
reasonable if several routes shared this data, but they would be unnecessary machinery for one
focused page.

### Error and request handling

- Initial task/member requests run in parallel.
- The mount request uses `AbortController` so an unmounted component is not updated.
- Loading errors can be retried without refreshing the page.
- Mutation errors do not replace already-loaded content.
- Inputs and actions are disabled during a save to prevent duplicate submissions.
- Successful create/update mutations replace the canonical task returned by the server and
  reapply ordering; successful deletion removes only the matching task.

### Accessibility and responsive behaviour

The interface was reviewed against relevant WCAG 2.2 behaviours:

- native buttons, inputs, selects, headings, regions, and the HTML `dialog` element;
- an accessible name for the modal and explicit field labels/descriptions;
- visible, high-contrast keyboard focus;
- live progress and task-count updates;
- semantic `progressbar` state;
- disabled and busy states during writes;
- touch-sized controls and keyboard-operable actions;
- no horizontal overflow at the 320px reflow boundary;
- long task titles wrap without breaking the card layout.

Desktop, 390px mobile, and the 320px reflow boundary were exercised manually. The final workflow
completed with no browser-console warnings or errors.

### Visual direction

The interface uses Spark-adjacent visual cues—orange, charcoal, white, an orbital spark motif,
strong editorial typography, and generous spacing—while remaining a product UI rather than a
copy of the supplied marketing documents. Shared CSS variables control colour, radii, shadows,
and content width so visual changes stay local.

## Run locally

### Prerequisites

- Python 3.12+
- Node.js 22+
- pnpm 10+

### Install and migrate

```bash
make install
make migrate
```

The migrations create the schema and add four realistic team members plus a small demo task set.
The seed is implemented as a reversible data migration, so every environment reaches the same
reviewable starting point.

### Start the application

Run the API:

```bash
make backend
```

In another terminal, run the UI:

```bash
make frontend
```

Open [http://localhost:5173](http://localhost:5173). During development, Vite proxies `/api`
traffic to Django on port 8000.

### Environment variables

`.env.example` documents the supported variables. Django does not implicitly load this file;
export values through the shell or the target deployment platform.

| Variable | Development default | Production expectation |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | Unsafe local fallback while debug is enabled | Required and supplied by a secret manager. |
| `DJANGO_DEBUG` | `true` | `false`. |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Explicit deployed hostnames. |
| `DATABASE_URL` | Local SQLite database | Managed PostgreSQL connection string. |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Exact frontend origin(s). |
| `VITE_API_BASE_URL` | `/api` | Same-origin path or deployed API URL. |

### Optional PostgreSQL setup

SQLite is the default so a reviewer can run the project immediately. To exercise the PostgreSQL
configuration path:

```bash
docker compose up -d database
export DATABASE_URL=postgresql://spark:spark-local-only@localhost:5432/spark_tasks
make migrate
```

The credentials in `compose.yaml` are local-development values only. The application code does
not branch by database engine; the change is configuration-only through Django's ORM.

## Verification strategy

Run the complete local gate:

```bash
make check
```

| Check | What it protects |
| --- | --- |
| Ruff lint and format | Python consistency, common defects, and review noise. |
| 12 Django model/API tests | Required behaviour, persistence, validation, filters, bounds, and deletion. |
| Migration drift check | Prevents model changes from being committed without a migration. |
| Django deployment check | Verifies secure production configuration with an explicit secret. |
| Negative production-secret check | Proves production startup fails when the secret is missing. |
| ESLint | React/TypeScript correctness and maintainability rules. |
| 3 Vitest interaction tests | Task rendering/actions, filters, accessible form submission, and input normalization. |
| Strict TypeScript and Vite build | Type integrity and production bundling. |

The same backend and frontend checks run independently in GitHub Actions on every pull request
and every push to `main`. Dependency audits were also run for the final submission, with no known
production dependency vulnerabilities reported.

### Manual browser acceptance checklist

- create a task and assign it to a team member;
- edit its content and reassign it;
- mark it complete and incomplete;
- cancel deletion, then confirm deletion and verify the task is removed;
- search by title and description;
- switch between all, open, and completed filters;
- retry an initial-load failure without losing the page shell;
- verify desktop, mobile, modal, keyboard-focus, and 320px reflow behaviour;
- confirm a clean browser console throughout the workflow.

## Engineering principles

The project uses principles as decision tools rather than as labels:

- **Single responsibility:** components, the tracker hook, transport service, serializers, and models each have a clear reason to change.
- **DRY:** create/edit share one form; HTTP error parsing and task mutation handling are centralized.
- **YAGNI:** no speculative authentication UI, due-date system, repository abstraction, state framework, or background infrastructure.
- **Explicit boundaries:** TypeScript interfaces and serializer fields define the client/server contract.
- **Fail fast:** invalid API inputs and unsafe production configuration are rejected at their boundaries.
- **Reversible change:** schema and demo data are managed through migrations, including a reversible seed step.
- **Reviewability:** short responsibility-based files and one-command verification reduce the time needed to understand a change.

This is a practical application of SOLID rather than an attempt to force every principle into a
small codebase. In particular, abstractions are introduced only where there is actual variation
or a demonstrated source of coupling.

## Quality and standards approach

The following standards informed the acceptance checklist; the project does not claim external
certification or formal conformance assessment:

- [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html): functional suitability, reliability, usability, security, maintainability, and portability.
- [ISO 8601-1:2019](https://www.iso.org/standard/70907.html): unambiguous, timezone-aware API timestamps.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): semantics, labels, visible focus, touch targets, and responsive reflow.
- [OWASP API Security](https://owasp.org/API-Security/): allow-listed writes, server-side validation, bounded input, restricted CORS, and secure production defaults.

## Decisions and trade-offs

| Decision | Current benefit | Cost or limitation | Revisit when |
| --- | --- | --- | --- |
| SQLite by default | Fastest reviewer setup. | Not the intended concurrent production database. | Deploying or testing meaningful concurrency. |
| Seeded team members | Meets the brief with deterministic demo data. | Not connected to a real identity directory. | Authentication and organization membership are introduced. |
| No authentication | Avoids a pretend security surface. | API writes are public if deployed as-is. | Before any public or multi-user deployment. |
| Confirmed hard delete | Keeps the requested enhancement explicit and simple. | There is no undo, archive, or audit recovery. | Real users require retention, compliance, or recovery guarantees. |
| Client-side UI filtering | Instant interaction for a tiny list. | Requires all tasks to be loaded. | Task volume requires pagination or server-owned views. |
| API also supports bounded filters | Keeps the endpoint useful to other clients. | Small duplication with UI filtering. | The UI moves to server pagination/filtering. |
| No state library | Minimal concepts and dependencies. | The custom hook would become crowded across many routes. | Several screens share cached server state. |
| Pessimistic writes | UI always renders canonical server data. | A short wait is visible during each save. | Latency makes optimistic updates measurably better. |

## Known limitations

- The API intentionally has no authentication, authorization, team isolation, or rate limiting.
- Team members and example tasks come from a migration rather than an administration workflow.
- Task lists are unpaginated because the challenge dataset is deliberately small.
- Search is simple case-insensitive text matching rather than indexed full-text search.
- Deletion is permanent; there is no archive, undo window, or audit recovery.
- There is no audit history or conflict detection for simultaneous edits.
- `runserver` and Vite's development server are development tools, not a production topology.
- The embedded 32-second preview supplements, but does not replace, the required narrated Loom.

These limitations are explicit so the submission does not present interview-scope decisions as
production completeness.

## Future roadmap

Future work should be driven by validated product needs rather than added pre-emptively. If the
tracker were moving beyond the challenge, the recommended sequence would be:

### 1. Production readiness

1. Add real authentication, authorization, and organization/team data isolation.
2. Move the deployed environment to managed PostgreSQL and add backup/restore verification.
3. Serve both applications behind HTTPS with a production WSGI/ASGI server and explicit static-asset handling.
4. Add structured request logging, error monitoring, health checks, and privacy-safe operational metrics.
5. Add rate limiting and an abuse model appropriate to the authentication design.

This phase comes first because identity, data ownership, recovery, and observability are more
important than adding task fields to a public write API.

### 2. Product capabilities

1. Validate due dates, priority, labels, comments, and notifications with users before selecting the smallest useful set.
2. Replace seeded members with a real team directory and role-management workflow.
3. Evolve permanent deletion into archive/restore when retention, recovery, and audit expectations are defined.
4. Add task history so assignment and completion changes are attributable.
5. Consider saved filters and ownership views when teams manage enough work to need them.

### 3. Scale and collaboration

1. Move filtering and search fully to the API with pagination once list size justifies it.
2. Add database indexes based on measured query plans rather than assumptions.
3. Introduce optimistic concurrency control, for example with versioning or `updated_at`, if simultaneous edits occur.
4. Add real-time updates only if collaborative usage demonstrates a need; polling may remain the simpler choice.
5. Introduce a server-state library and route-level code splitting when the frontend grows beyond one workflow.

### 4. Deeper assurance

1. Add a small end-to-end browser suite for the critical create/edit/assign/complete/delete journey.
2. Add automated accessibility checks, while retaining manual keyboard and screen-reader review.
3. Add contract or schema tests if more clients consume the API.
4. Add performance budgets and load tests after real traffic and service-level objectives exist.
5. Add dependency-update automation with controlled, reviewed upgrades.

## Project structure

```text
backend/
  config/                 Environment-driven Django configuration
  tasks/
    migrations/           Schema and reversible demo-data history
    tests/                Model and API behaviour
    models.py             Persisted task and team-member concepts
    serializers.py        API contract and validation
    views.py              List/create/update/delete coordination
frontend/
  src/
    components/           Focused UI components and interaction tests
    hooks/                Server-state orchestration
    services/             Typed HTTP boundary and error translation
    styles/               Design tokens and responsibility-based CSS
docs/
  LOOM_SCRIPT.md          Ready-to-record 2–5 minute walkthrough
  assets/                 Verified captures and 32-second product preview
output/presentation/      Seven-slide submission deck with embedded video
.github/workflows/ci.yml  Independent backend and frontend quality jobs
compose.yaml              Optional local PostgreSQL service
Makefile                  Reviewer-friendly install, run, and check commands
```

## Submission assets

- [Product preview](docs/assets/spark-task-tracker-demo.mp4)
- [Desktop capture](docs/assets/task-tracker-desktop.png)
- [Mobile capture](docs/assets/task-tracker-mobile.png)
- [Mobile task dialog](docs/assets/task-dialog-mobile.png)
- [Loom walkthrough script](docs/LOOM_SCRIPT.md)
- [PowerPoint walkthrough](output/presentation/Spark-Task-Tracker-Walkthrough.pptx)

For the final submission, record the required narrated Loom, add its share URL to the submission
message, and use the repository plus the PowerPoint as supporting review material.
