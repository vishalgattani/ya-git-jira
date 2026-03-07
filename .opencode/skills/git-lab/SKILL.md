---
name: git-lab
description: Using git-lab commands to work with GitLab projects, merge requests, and pipelines
---

## Overview

`git-lab` interacts with GitLab via its REST API v4. Authentication uses git
config values:

```sh
git config --global gitlab.host gitlab.example.com   # defaults to gitlab.com
git config --global gitlab.token glpat-xxxxxxxxxxxx   # required
```

The token is sent as a `Private-Token` header. User identity is resolved from
`user.email` (falls back to `gitlab.user`).

## Commands

```
git-lab whoami                     Show current GitLab user
git-lab group list                 List groups
git-lab namespace list             List namespaces
git-lab project list [--match]     List projects (server + client-side filter)
git-lab project whereami           Identify project from current git remote
git-lab project mr list            List MRs for a project/branch (defaults to current)
git-lab merge active               My open merge requests (across all projects)
git-lab merge todo                 MRs where I'm assigned as reviewer
git-lab merge train list           Merge trains for the current project
git-lab project pipeline list      Recent pipelines (scoped to current user)
git-lab project pipeline latest    Jobs for latest pipeline on current branch
git-lab project pipeline jobs      Jobs for a specific pipeline
git-lab project pipeline log       Download a job's log output (plain text)
git-bump                           Increment branch version suffix
```

All dedicated commands are **read-only**. Use `--help` on any command for
options and defaults.

## Key Behaviors

- **Project-scoped commands** (`project whereami`, `project mr list`,
  `merge train list`, all `pipeline` commands) require being in a git repo
  with an `origin` remote pointing to GitLab.
- **`pipeline list`** filters to the current user's pipelines, not all project
  pipelines.
- **`pipeline log`** outputs raw text to stdout, suitable for piping or agent
  consumption when diagnosing CI failures.

## Workflows

### Find the MR for the current branch

```sh
git-lab project mr list
```

Defaults to the current directory's project and current branch. Use
`-p <path>` and `-b <branch>` to override.

### Debug a CI failure

```sh
git-lab project pipeline latest              # see jobs for current branch
git-lab project pipeline log --job <id>      # download the log
git-lab project pipeline log --job <id> --tail 200   # last 200 lines
```

### Review merge requests

```sh
git-lab merge todo       # MRs needing my review
git-lab merge active     # my own open MRs
```

## Arbitrary GitLab API Access

The dedicated commands are read-only. For write operations (approving MRs,
posting comments, triggering pipelines, etc.), use `git-api gitlab`:

```sh
# GET (default) -- path is relative to /api/v4
git-api gitlab /user
git-api gitlab /projects/123/merge_requests

# POST (auto-promoted when --data is provided)
git-api gitlab /projects/123/merge_requests/456/notes -d '{"body":"LGTM"}'

# Explicit method
git-api gitlab /projects/123/merge_requests/456/approve -X POST

# Paginated listing
git-api gitlab /projects --paginate

# Skip /api/v4 prefix for full URL control
git-api gitlab /api/v4/version --raw
```

`git-api` handles authentication and base URL automatically. It also supports
`-v` (status/headers to stderr), and exits with code 1 on HTTP 4xx/5xx.
Run `git-api -h` for all options.
