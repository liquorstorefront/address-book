# Document Metadata

- Document owner: Codex.
- Review status: Revision 3 after independent engineering review.
- Last updated: 2026-07-04.
- Source of truth: repository inspection, not runtime verification.

# Snapshot Scope

This document describes the repository on branch `main` at commit `4c62079`, plus the uncommitted working-tree changes present at inspection time. The working tree already had modified application files in `backend/app/main.py`, `frontend/src/App.jsx`, and `frontend/src/styles.css` before this document was created.

This snapshot is limited to files present in the repository, excluding generated or dependency content such as `frontend/node_modules`. It does not claim to describe deployed infrastructure, production behavior, external services, or manual setup steps that are not represented in the repository.

# Project Overview

## Purpose of the application

This repository contains a minimal personal Address Book web application. The app lets a user create, view, and edit contact records that include company and contact details.

## Current implementation status

The project is implemented as a Docker-based starter application with:

- A React/Vite frontend.
- A FastAPI backend.
- A PostgreSQL database.
- Docker Compose orchestration for all three services.

The current app supports listing contacts, creating contacts, and updating existing contacts. There is no delete workflow, authentication, search, filtering, pagination, migrations system, automated test suite, CI/CD configuration, or production deployment configuration visible in the repository.

# Technology Stack

## Frontend

- React 19.
- Vite 6.
- Plain CSS in `frontend/src/styles.css`.
- Browser `fetch` calls to the backend API.
- API URL read from `import.meta.env.VITE_API_URL`, with a fallback to `http://localhost:8000`.
- No package lockfile is present in the inspected repository.

## Backend

- Python 3.12.
- FastAPI.
- SQLAlchemy 2.
- Pydantic.
- Uvicorn with reload enabled in the Docker command.
- `psycopg2-binary` for PostgreSQL access.
- Dependencies are pinned in `backend/requirements.txt`.

## Database

- PostgreSQL 16 Alpine image.
- SQLAlchemy ORM model for the `contacts` table.
- Database schema is created at backend startup with `Base.metadata.create_all(bind=engine)`.
- No migration tool is present.

## Docker architecture

- `frontend` service builds from `frontend/Dockerfile`, runs Vite, exposes port `5173`, and mounts `./frontend:/app`.
- `backend` service builds from `backend/Dockerfile`, runs Uvicorn, exposes port `8000`, and mounts `./backend:/app`.
- `db` service runs `postgres:16-alpine`, exposes port `5432`, and stores data in the `postgres_data` Docker volume.
- A `frontend_node_modules` Docker volume is mounted at `/app/node_modules`.
- `depends_on` is used for service ordering, but no Docker health checks are configured.

# Repository Structure

- `README.md`: Basic project description and Docker Compose run instructions.
- `docker-compose.yml`: Defines the frontend, backend, database, and persistent volumes.
- `backend/Dockerfile`: Python/FastAPI container definition.
- `backend/requirements.txt`: Backend Python dependencies.
- `backend/app/database.py`: SQLAlchemy engine, session factory, base model, and DB dependency.
- `backend/app/main.py`: FastAPI app, CORS setup, table creation, and API routes.
- `backend/app/models.py`: SQLAlchemy `Contact` model.
- `backend/app/schemas.py`: Pydantic schemas for creating and reading contacts.
- `frontend/Dockerfile`: Node/Vite container definition.
- `frontend/package.json`: Frontend scripts and dependencies.
- `frontend/index.html`: Vite HTML entry point.
- `frontend/src/main.jsx`: React entry point.
- `frontend/src/App.jsx`: Main address book UI and frontend API integration.
- `frontend/src/styles.css`: Application styling.
- `.gitignore`: Ignores local environment files, Python virtual environments, Python cache files, Node modules, frontend build output, Vite cache, pytest cache, and `.DS_Store`.
- `docs/current-state.md`: This current-state document.

# Current Features

- Displays an address book interface with a contact entry form and a contact directory.
- Loads saved contacts from the backend on initial render.
- Shows a saved contact count.
- Creates new contacts.
- Edits existing contacts.
- Updates are full-field replacements from the submitted contact form payload.
- Cancels an edit and returns the form to create mode.
- Shows a basic empty state when no contacts exist.
- Shows a basic error message when loading or saving contacts fails.
- Sorts contacts on the backend by company, last name, then first name.
- Stores contact records in PostgreSQL.

# Backend

The backend is a FastAPI application titled `Address Book API`.

## Configuration

- The backend reads `DATABASE_URL` from the environment.
- Docker Compose sets `DATABASE_URL` to `postgresql://addressbook:addressbook@db:5432/addressbook`.
- CORS allows requests from `http://localhost:5173`.
- The database credentials in `docker-compose.yml` are hardcoded local-development values.
- No `.env` or `.env.example` file is present in the inspected repository. `.env` is listed in `.gitignore`.

## API routes

- `GET /`
  - Returns a JSON status message: `{"message": "FastAPI backend is running in Docker."}`.

- `GET /contacts`
  - Returns a list of contacts.
  - Response model: `list[ContactRead]`.
  - Sort order: company ascending, last name ascending, first name ascending.

- `POST /contacts`
  - Creates a contact.
  - Request model: `ContactCreate`.
  - Response model: `ContactRead`.

- `PUT /contacts/{contact_id}`
  - Updates an existing contact by replacing all fields from `ContactCreate`.
  - Response model: `ContactRead`.
  - Returns `404` with `Contact not found.` if the ID does not exist.
  - Because update uses the full `ContactCreate` schema, omitted nullable fields are stored as `null`.

There are no visible routes for deleting contacts, searching contacts, filtering contacts, health checks beyond `GET /`, authentication, or user management.

## Error handling and logging

- Missing contacts on update are handled with an explicit `404`.
- Request validation failures use FastAPI/Pydantic's default validation behavior.
- Database connection failures and database write errors are not handled with custom application-level error responses in the current code.
- There is no explicit application logging configuration in the backend code. Runtime logs are expected to come from the server/framework defaults.

# Frontend

The frontend is a single React app rendered from `frontend/src/main.jsx` into `#root`.

## UI layout

- The main page uses a two-column layout on wider screens:
  - Left column: contact form.
  - Right column: contact directory.
- The layout collapses to one column below `820px`.

## Contact form

The form includes these fields:

- Company, required.
- First name.
- Last name.
- Title.
- Email.
- Phone.
- Website.
- Store URL.
- Notes.

On submit, the frontend trims each field and sends empty values as `null`. It uses:

- `POST /contacts` when creating a contact.
- `PUT /contacts/{id}` when editing a contact.

## Directory workflow

- Contacts are loaded with `GET /contacts`.
- Each saved contact row displays the company and contact name.
- If first and last name are both missing, the UI displays `No contact name`.
- Optional details display only when values exist.
- Each contact row has an `Edit` button.
- Clicking `Edit` loads that contact into the form and switches the submit button to `Update Contact`.
- `Cancel` exits edit mode and clears the form.

The frontend does not currently provide delete, search, filtering, sorting controls, validation beyond the required company field, link formatting for URLs/emails/phones, or optimistic updates.

If a load or save response is not OK, the frontend displays a generic error message. It does not display backend validation details or field-specific errors.

# Database

The database schema currently consists of one SQLAlchemy model: `Contact`.

## `contacts` table

- `id`: integer primary key, indexed.
- `company`: string up to 255 characters, required, indexed.
- `first_name`: nullable string up to 255 characters.
- `last_name`: nullable string up to 255 characters, indexed.
- `title`: nullable string up to 255 characters.
- `email`: nullable string up to 255 characters.
- `phone`: nullable string up to 100 characters.
- `website`: nullable string up to 500 characters.
- `store_url`: nullable string up to 500 characters.
- `notes`: nullable text.
- `created_at`: timezone-aware datetime with server default `now()`.
- `updated_at`: timezone-aware datetime with server default `now()` and SQLAlchemy `onupdate=func.now()`.

The schema is managed directly by SQLAlchemy table creation at application startup. There are no migrations or seed data in the repository.

There are no unique constraints in the model, so duplicate contact records are possible at the database level.

# Docker

The application is intended to run with:

```bash
docker compose up --build
```

When running through Docker Compose:

- Frontend is available at `http://localhost:5173`.
- Backend is available at `http://localhost:8000`.
- FastAPI interactive docs are available at `http://localhost:8000/docs`.
- PostgreSQL is exposed on host port `5432`.
- Database data persists in the `postgres_data` Docker volume.
- Frontend dependencies persist in the `frontend_node_modules` Docker volume.

Both frontend and backend source directories are mounted into their containers, supporting live development behavior. The backend Uvicorn command includes `--reload`.

The Docker setup is development-oriented:

- The frontend and backend containers use bind mounts.
- The backend runs with Uvicorn reload enabled.
- The Dockerfiles are single-stage builds.
- No non-root container user is configured.
- No resource limits are configured.
- No Docker health checks are configured.

The backend service depends on the database service through Compose `depends_on`, but the current Compose file does not wait for PostgreSQL readiness before starting the backend. There is no application retry loop around initial database connection or schema creation visible in the backend code.

The frontend image installs dependencies during build with `npm install`, then Docker Compose mounts the `frontend_node_modules` named volume at `/app/node_modules`. This keeps dependencies outside the bind-mounted source tree during Compose usage.

# Known Risks

- The Docker setup is development-oriented and is not configured as a production deployment.
- Backend startup depends on PostgreSQL being reachable, but the Compose file does not wait for database readiness and the backend has no visible startup retry loop.
- Database schema creation uses SQLAlchemy `create_all` at application startup. This creates missing tables but does not provide versioned migrations for existing schema changes.
- `PUT /contacts/{contact_id}` performs a full-field replacement, so clients that omit nullable fields can clear existing data.
- There are no unique constraints, so duplicate contact records are possible.
- There is no authentication or contact ownership model, so all API clients with access to the backend can read and modify all contacts.
- The frontend displays generic load/save errors and does not expose backend validation details or field-specific errors.
- There is no automated test suite or CI/CD configuration visible in the repository.

# Known TODOs

No explicit TODO, FIXME, XXX, or HACK comments were found by a repository text search excluding `frontend/node_modules`.

# Document Maintenance

This document should be updated whenever implementation behavior, repository structure, runtime configuration, schema, API routes, or supported user workflows change.

Future updates should keep this file descriptive rather than prescriptive. Proposed architecture, planned features, and recommended fixes should be tracked separately unless they describe code or configuration that already exists.

When updating this document, record the branch, commit, and any relevant uncommitted working-tree context so reviewers can tell what snapshot the document describes.

# Questions

- It is unclear whether the existing modified files in the working tree are intended to be committed or are still in progress.
- It is unclear whether this project is intended to remain a local Docker-only training app or eventually support production deployment.
- It is unclear whether the address book is intended for one user, many users, or shared/team usage; there is no authentication or ownership model in the current code.
- It is unclear whether contacts should be uniquely constrained by company, email, or any other field; the current schema has no uniqueness constraints.
- It is unclear whether database migrations are intentionally omitted because the app is a starter/training project or simply not added yet.
- It is unclear whether a contact row is intended to represent a company, a person at a company, or both; the current schema stores company and person fields in one flat table.
- It is unclear whether the document maintenance guidance above is sufficient for the multi-AI workflow or whether a stricter review/update protocol is expected.
