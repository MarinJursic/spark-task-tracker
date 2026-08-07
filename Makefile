.PHONY: install migrate backend frontend test lint check

install:
	python3 -m venv .venv
	.venv/bin/pip install -r backend/requirements.txt
	cd frontend && pnpm install --frozen-lockfile

migrate:
	.venv/bin/python backend/manage.py migrate

backend:
	.venv/bin/python backend/manage.py runserver

frontend:
	cd frontend && pnpm dev

test:
	.venv/bin/python backend/manage.py test tasks
	cd frontend && pnpm test --run

lint:
	.venv/bin/ruff check backend
	.venv/bin/ruff format --check backend
	cd frontend && pnpm lint

check: lint test
	DJANGO_DEBUG=false DJANGO_SECRET_KEY=deployment-check-only-9zW4rT7pQ2nM8xK5cV1bL6sH3jF0dG .venv/bin/python backend/manage.py check --deploy
	cd frontend && pnpm build
