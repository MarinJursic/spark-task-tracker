# Spark Team Task Tracker

A focused full-stack task tracker for adding, editing, assigning, and completing team work.

![Spark Team Task Tracker desktop view](docs/assets/task-tracker-desktop.png)

## Submission walkthrough

- [Watch the 32-second product preview](docs/assets/spark-task-tracker-demo.mp4), covering add, assign, edit, complete, search, and filtering.
- Open the PowerPoint in `output/presentation/` to play the same walkthrough directly from slide 3.
- Use the prepared [2–5 minute Loom narrative](docs/LOOM_SCRIPT.md) for the requested interview submission video.

## What it does

- Adds tasks with a required title, description, and assignee.
- Edits task details and reassigns ownership.
- Marks tasks complete or incomplete with one action.
- Displays title, status, and assigned team member at a glance.
- Searches titles and descriptions and filters by completion status.
- Persists all changes through a REST API.
- Works across desktop and mobile layouts with keyboard-visible focus states.

The product is deliberately limited to the supplied brief. It does not add deletion, authentication, due dates, or priorities.

## Technology choices

| Layer | Choice | Reason |
| --- | --- | --- |
| API | Django 5.2 LTS + Django REST Framework | Matches Spark's backend stack and provides mature validation, ORM, and testing tools. |
| UI | React 19 + strict TypeScript + Vite | Keeps interaction code typed, component-focused, and quick to review. |
| Data | SQLite by default; PostgreSQL via `DATABASE_URL` | Zero-friction review with a production-relevant upgrade path. |
| Quality | Ruff, ESLint, Vitest, Django test runner, GitHub Actions | Fast feedback across both halves of the application. |

Django 5.2 LTS was selected over the newest feature release because it receives extended support through April 2028. The dependencies are pinned and the frontend lockfile makes installs reproducible.

## Architecture

```mermaid
flowchart LR
  A[React UI] -->|JSON over HTTP| B[Django REST API]
  B --> C[Serializers and validation]
  C --> D[Django ORM]
  D --> E[(SQLite or PostgreSQL)]
```

The boundaries stay small:

- Components render interaction and accessibility semantics.
- `useTaskTracker` owns loading, mutations, and user-facing failures.
- The API service owns transport and response error parsing.
- Serializers own input validation and response shape.
- View sets coordinate the use cases without carrying domain logic.
- Models define the persisted task and team-member concepts.

This applies SOLID and DRY where they reduce coupling, while YAGNI keeps the task within its 48-hour interview scope.

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

The migrations add four example team members and a small demo task set.

### Start the application

Run the API:

```bash
make backend
```

In another terminal, run the UI:

```bash
make frontend
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies API traffic to Django on port 8000.

## Optional PostgreSQL setup

SQLite is the default so a reviewer can run the project immediately. To exercise the PostgreSQL path:

```bash
docker compose up -d database
export DATABASE_URL=postgresql://spark:spark-local-only@localhost:5432/spark_tasks
make migrate
```

The compose credentials are for local development only.

## API contract

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/team-members/` | List assignable example users. |
| `GET` | `/api/tasks/` | List tasks. Accepts `q` and `status=all\|open\|completed`. |
| `POST` | `/api/tasks/` | Add a task. |
| `PATCH` | `/api/tasks/{id}/` | Edit, reassign, or change completion state. |

Task responses use UUID identifiers and UTC ISO 8601 timestamps. `DELETE` is intentionally unavailable because it is outside the supplied requirement.

Example create request:

```json
{
  "title": "Review tutoring resources",
  "description": "Check the new algebra practice set before publishing.",
  "assignee_id": 4,
  "completed": false
}
```

## Quality checks

Run the full local verification suite:

```bash
make check
```

This covers:

- migration drift and Django system checks;
- 12 backend model/API tests, including every required behavior and hardened API boundaries;
- Python lint and formatting checks;
- frontend lint and strict TypeScript compilation;
- 3 component interaction tests;
- a production frontend build.

The same checks run in GitHub Actions for every pull request and push to `main`.

## Quality and standards approach

The implementation uses relevant standards as design inputs, not as a claim of external certification:

- [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html): functional suitability, reliability, usability, security, maintainability, and portability shaped the acceptance and review checklist.
- [ISO 8601-1:2019](https://www.iso.org/standard/70907.html): API timestamps are unambiguous, timezone-aware representations.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): semantic controls, clear labels, visible focus, reduced-motion support, touch-sized targets, and responsive reflow.
- [OWASP API Security](https://owasp.org/API-Security/): allow-listed write fields, server-side validation, bounded inputs, restricted CORS, secure production defaults, and no unrequested authentication surface.

## Deliberate trade-offs

- **SQLite first:** best for reviewer speed; PostgreSQL remains configuration-only rather than a second code path.
- **Hard-coded team members:** explicitly allowed by the challenge and stored through a reversible data migration.
- **No authentication:** adding a pretend login would create security expectations without product requirements.
- **No delete endpoint:** keeps the API faithful to add/edit/assign/complete.
- **Client-side filtering:** appropriate for this deliberately small list; the API also supports bounded search/status parameters for future consumers.
- **No state library:** a small custom hook is enough for the current server-state surface.

## Project structure

```text
backend/
  config/              Django configuration
  tasks/               Models, API, migrations, and tests
frontend/
  src/components/      Focused UI components and tests
  src/hooks/           Server-state orchestration
  src/services/        Typed API boundary
  src/styles/          Small, responsibility-based stylesheets
docs/
  LOOM_SCRIPT.md       Ready-to-record 2-5 minute walkthrough
  assets/              Verified captures and 32-second product preview
output/presentation/   Submission presentation with embedded video
```

For the video submission, use the prepared [Loom walkthrough](docs/LOOM_SCRIPT.md).
