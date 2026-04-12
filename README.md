# Bindo Companion

Board game score tracker companion app -- currently supporting **Skull King**.

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/joaoc-dev/bindo-companion?utm_source=oss&utm_medium=github&utm_campaign=joaoc-dev%2Fbindo-companion&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

[![CI - main](https://img.shields.io/github/actions/workflow/status/joaoc-dev/bindo-companion/ci.yml?branch=main&label=CI%20%7C%20main)](https://github.com/joaoc-dev/bindo-companion/actions/workflows/ci.yml)

## Architecture

```mermaid
graph TB
  subgraph Frontend ["Frontend — React 19 + Vite 8"]
    direction TB
    UI["shadcn/ui + Tailwind CSS v4\nPastel Theme"]
    Router["TanStack Router"]
    Query["TanStack Query"]
    API["@bindo/api-client\n(Orval-generated)"]

    UI --> Router
    Router --> Query
    Query --> API
  end

  subgraph Pages ["Pages"]
    Home["/ Home\nCreate or Join Session"]
    Lobby["/session/:id\nSession Lobby"]
    Match["/session/:id/skull-king/:matchId\nMatch Flow (10 Rounds)"]
    Scores["/…/scoreboard\nScoreboard"]

    Home -->|Create / Join| Lobby
    Lobby -->|Start Match| Match
    Match -->|View Scores| Scores
    Match -->|Round Loop| Match
  end

  subgraph Backend ["Backend — ASP.NET Minimal APIs"]
    Companion["Companion API :5100\nSessions · Players · Matches"]
    SkullKing["Skull King API :5101\nBids · Results · Scoring"]
  end

  subgraph Data ["Data"]
    Postgres[(PostgreSQL)]
    Mongo[(MongoDB)]
  end

  API -->|"/api/*"| Companion
  API -->|"/api/skull-king/*"| SkullKing
  Companion --> Postgres
  SkullKing --> Mongo
```

## Built With

- React 19 + Vite 8 + TypeScript 5.9
- Tailwind CSS v4 + shadcn/ui (base-nova)
- TanStack Router + TanStack Query + TanStack Table
- react-hook-form + zod
- motion (framer-motion)
- .NET C# Minimal APIs (clean architecture, DDD, MediatR + CQRS)
- Orval for typed API client generation
- ESLint (Antfu config) + CSharpier
- Husky + lint-staged pre-commit hooks
- GitHub Actions CI (type-checking, linting, dependency checks)
- CodeRabbit AI code reviews
- Dependabot automated dependency updates

## Getting Started (Development)

```bash
aspire run
```

### PostgreSQL migrations (Companion API)

Start Aspire so the **postgres** container is running. The AppHost maps it to **localhost:5433** (user `postgres` / password `postgres`, database `companion`) so it does not fight with another PostgreSQL on **5432**. `Companion.Presentation` uses the same values in `appsettings.Development.json` for `dotnet ef`, which does not receive Aspire’s injected connection string.

The dashboard connection string is built from **current** parameters. PostgreSQL only applies `POSTGRES_PASSWORD` on **first** database init, so a **stale** named volume can keep an old superuser password while the UI still shows `Password=postgres` (**28P01**). Fix: `docker volume rm bindo-companion-postgres` once, then restart Aspire.

**Postgres shows Unhealthy but logs say “ready to accept connections”:** the icon reflects the **AppHost Npgsql health check** from your machine to the published port, not the container’s stdout. Some setups (notably **Rancher Desktop**) break that probe for session-scoped containers; this repo uses **`WithLifetime(ContainerLifetime.Persistent)`** on Postgres (see [Aspire issue #6818](https://github.com/dotnet/aspire/issues/6818)). If it stays unhealthy, try **Docker Desktop** or **Podman**, or confirm nothing else is listening on **5433** (`docker ps`). Clear AppHost user secrets if parameters were overridden: `dotnet user-secrets clear --project AppHost/AppHost.csproj`.

From the repository root:

```bash
dotnet ef database update --project apps/Server/Companion/Companion.Infrastructure/Companion.Infrastructure.csproj --startup-project apps/Server/Companion/Companion.Presentation/Companion.Presentation.csproj
```

## Notes

`apps/Client/Companion.WebApp/src/components/ui` is reserved for shadcn CLI output; ESLint ignores that folder so upstream styles stay unchanged.


## Adding new Companion PostgreSQL migrations

```bash
dotnet ef migrations add MigrationName --project apps/Server/Companion/Companion.Infrastructure/Companion.Infrastructure.csproj --startup-project apps/Server/Companion/Companion.Presentation/Companion.Presentation.csproj
```
