---
name: git-lab
description: Using git-lab commands to work with GitLab projects, merge requests, and pipelines
---

## Overview

The `git-lab` CLI provides commands for interacting with GitLab via its REST API v4.
Authentication uses git config values (`gitlab.host`, `gitlab.token`).

## Authentication Setup

Required git config values:

```sh
git config --global gitlab.host gitlab.example.com   # defaults to gitlab.com
git config --global gitlab.token glpat-xxxxxxxxxxxx   # required
git config --global user.email you@company.com        # or gitlab.user as fallback
```

The token is sent as a `Private-Token` header.

## Command Tree

```
git-lab
  |-- whoami                    Show current GitLab user
  |-- group
  |   `-- list                  List groups
  |-- merge
  |   |-- active                My open merge requests
  |   |-- todo                  MRs needing my review
  |   `-- train
  |       `-- list              Merge trains for current project
  |-- namespace
  |   `-- list                  List namespaces
  `-- project
      |-- list                  List projects (with optional filter)
      |-- whereami              Identify project from current directory
      |-- mr
      |   `-- list              List MRs for a project/branch
      `-- pipeline
          |-- jobs              List jobs for a pipeline
          |-- latest            Show jobs for the latest pipeline on current branch
          |-- list              List recent pipelines
          `-- log               Download a job's log output
```

Also available at the top level:

```
git-bump                        Bump branch version suffix
```

## Command Reference

### Identity

```sh
git-lab whoami          # Show username
git-lab whoami -v       # Verbose: full user object (id, name, username, email)
```

### Groups

```sh
git-lab group list      # List groups: { id, name, full_path }
git-lab group list -v   # Verbose: full group objects
```

### Namespaces

```sh
git-lab namespace list  # List all namespaces (full objects, no filtering)
```

### Projects

```sh
# List projects you're a member of
git-lab project list
# Output: array of { id, name, path_with_namespace, ssh_url_to_repo }

# Filter by path substring
git-lab project list --match "my-team"
git-lab project list -m infra

git-lab project list -v   # Verbose: full project objects

# Identify current project from git remote
git-lab project whereami
# Output: Remote: git@gitlab.com:org/repo.git
#         { id, name, path_with_namespace, ssh_url_to_repo }
```

### Merge Requests

```sh
# List my open (in-progress) merge requests across all projects
git-lab merge active
# Output: array of { title, web_url, source_branch, target_branch }

git-lab merge active -v   # Verbose: full MergeRequest objects

# List MRs where I'm assigned as reviewer
git-lab merge todo
# Output: array of { title, web_url, source_branch, target_branch }

git-lab merge todo -v     # Verbose: full MergeRequest objects

# List merge trains for the current project (determined from git remote)
git-lab merge train list
# Output: full MergeTrain objects (always verbose)
```

### Branch Version Bumping

```sh
git-bump
```

Increments a version suffix on the current branch name:
- `feature/JIRA-123` -> `feature/JIRA-123.v1`
- `feature/JIRA-123.v1` -> `feature/JIRA-123.v2`
- `feature/JIRA-123-v3` -> `feature/JIRA-123.v4`

Creates and checks out the new branch locally.

### Pipelines

```sh
# List recent pipelines (default: successful, last 7 days)
git-lab project pipeline list
git-lab project pipeline list --status failed --days 3
git-lab project pipeline list -v   # Verbose: full pipeline objects

# Show jobs for the latest pipeline on the current branch
git-lab project pipeline latest
git-lab project pipeline latest -v   # Verbose: full job objects

# List jobs for a specific pipeline
git-lab project pipeline jobs --pipeline 12345
git-lab project pipeline jobs --pipeline 12345 -v

# Download a job's log output (plain text to stdout)
git-lab project pipeline log --job 67890
git-lab project pipeline log --job 67890 --tail 200   # Last 200 lines only
```

All pipeline commands are project-scoped (require being in a git repo with an
`origin` remote pointing to GitLab).

## Workflows

### Finding and Reviewing Merge Requests

```sh
# See what MRs need your review
git-lab merge todo

# See your own open MRs
git-lab merge active
```

Both commands return `web_url` fields you can open in a browser.

### Identifying the Current Project

```sh
git-lab project whereami
```

This resolves the current directory's git remote (`origin`) to a GitLab project.
Useful for confirming which project you're working in before running project-scoped
commands like `merge train list`.

### Checking Merge Train Status

```sh
# Must be in a git repo that maps to a GitLab project
git-lab merge train list
```

This is project-scoped -- it uses `git ls-remote --get-url origin` to determine
which GitLab project to query.

### Debugging CI Pipeline Failures

```sh
# 1. Quick check: see jobs for latest pipeline on current branch
git-lab project pipeline latest

# 2. Or find failed pipelines first, then drill into one
git-lab project pipeline list --status failed --days 3
git-lab project pipeline jobs --pipeline 12345

# 3. Download the log for a failed job
git-lab project pipeline log --job 67890

# 4. Show just the tail of a large log
git-lab project pipeline log --job 67890 --tail 200
```

The `log` command outputs raw plain text to stdout, making it suitable for piping
to other tools or for AI agent consumption when diagnosing failures.

## API Details

### Global Endpoints (paginated)

These use `gitlabApi()` which auto-paginates via `Link` headers (100 per page):

| Command | Endpoint |
|---------|----------|
| `whoami` | `GET /api/v4/user` |
| `group list` | `GET /api/v4/groups` |
| `namespace list` | `GET /api/v4/namespaces` |
| `project list` | `GET /api/v4/projects?membership=true&simple=true&search=...` |
| `merge active` | `GET /api/v4/merge_requests?state=opened&author_id=...` |
| `merge todo` | `GET /api/v4/merge_requests?state=opened&reviewer_id=...` |

### Project-Scoped Endpoints (not paginated)

These use `projectScopedGet()` / `projectScopedGetText()` which resolve the project from the git remote:

| Command | Endpoint |
|---------|----------|
| `merge train list` | `GET /api/v4/projects/{id}/merge_trains` |
| `pipeline list` | `GET /api/v4/projects/{id}/pipelines?status=...&username=...&updated_after=...` |
| `pipeline latest` | `GET /api/v4/projects/{id}/pipelines?ref=...&per_page=1&order_by=id&sort=desc` |
| `pipeline jobs` | `GET /api/v4/projects/{id}/pipelines/{pid}/jobs` |
| `pipeline log` | `GET /api/v4/projects/{id}/jobs/{jid}/trace` (returns plain text) |

## Arbitrary API Access

For GitLab API endpoints not covered by dedicated commands, use `git-api`:

```sh
# GET request (default)
git-api gitlab /user
git-api gitlab /projects/123/merge_requests

# POST, PUT, DELETE
git-api gitlab /projects/123/merge_requests/456/notes -d '{"body":"LGTM"}'
git-api gitlab /projects/123/merge_requests/456/approve -X POST

# Paginated listing
git-api gitlab /projects --paginate

# Verbose: show HTTP status and response headers
git-api gitlab /user -v

# Full URL control (skip /api/v4 prefix)
git-api gitlab /api/v4/version --raw
```

The `git-api` command handles authentication (Private-Token header) and the base URL
(`/api/v4`) automatically. See `git-api -h` for all options.

## Important Notes

- **The dedicated commands are read-only** -- no projects, MRs, or pipelines are
  created or modified. Use `git-api gitlab` for write operations.
- **Most commands support `-v` / `--verbose`** for full API response output.
  Exceptions: `namespace list` and `merge train list` always output full objects.
- **Project-scoped commands** (`merge train list`, `project whereami`) require you
  to be in a git repository with an `origin` remote pointing to GitLab.
- **The `--match` / `-m` filter** on `project list` does server-side search plus
  client-side path substring filtering for accuracy.
- **`gitlab.host` defaults to `gitlab.com`** if not set in git config, unlike
  `jira.host` which is required.
- **Pipeline and job commands** (`pipeline list`, `pipeline latest`, `pipeline jobs`,
  `pipeline log`) are project-scoped and require an `origin` remote pointing to GitLab.
