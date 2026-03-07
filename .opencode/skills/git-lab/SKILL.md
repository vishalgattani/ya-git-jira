---
name: git-lab
description: Using git-lab commands to work with GitLab projects, merge requests, and pipelines
---

## Overview

`gitj lab` interacts with GitLab via its REST API v4. Authentication uses git
config values:

```sh
git config --global gitlab.host gitlab.example.com   # defaults to gitlab.com
git config --global gitlab.token glpat-xxxxxxxxxxxx   # required
```

The token is sent as a `Private-Token` header. User identity is resolved from
`user.email` (falls back to `gitlab.user`).

## Commands

```
gitj lab whoami                     Show current GitLab user
gitj lab group list                 List groups
gitj lab namespace list             List namespaces
gitj lab project list [--match]     List projects (server + client-side filter)
gitj lab project whereami           Identify project from current git remote
gitj lab project mr list            List MRs for a project/branch (defaults to current)
gitj lab merge active               My open merge requests (across all projects)
gitj lab merge todo                 MRs where I'm assigned as reviewer
gitj lab merge train list           Merge trains for the current project
gitj lab project pipeline list      Recent pipelines (scoped to current user)
gitj lab project pipeline latest    Jobs for latest pipeline on current branch
gitj lab project pipeline jobs      Jobs for a specific pipeline
gitj lab project pipeline log       Download a job's log output (plain text)
gitj bump                           Increment branch version suffix
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
gitj lab project mr list
```

Defaults to the current directory's project and current branch. Use
`-p <path>` and `-b <branch>` to override.

### Debug a CI failure

```sh
gitj lab project pipeline latest              # see jobs for current branch
gitj lab project pipeline log --job <id>      # download the log
gitj lab project pipeline log --job <id> --tail 200   # last 200 lines
```

### Review merge requests

```sh
gitj lab merge todo       # MRs needing my review
gitj lab merge active     # my own open MRs
```

## Arbitrary GitLab API Access

The dedicated commands are read-only. For write operations (approving MRs,
posting comments, triggering pipelines, etc.), use `gitj api gitlab`:

```sh
# GET (default) -- path is relative to /api/v4
gitj api gitlab /user
gitj api gitlab /projects/123/merge_requests

# POST (auto-promoted when --data is provided)
gitj api gitlab /projects/123/merge_requests/456/notes -d '{"body":"LGTM"}'

# Explicit method
gitj api gitlab /projects/123/merge_requests/456/approve -X POST

# Paginated listing
gitj api gitlab /projects --paginate

# Skip /api/v4 prefix for full URL control
gitj api gitlab /api/v4/version --raw
```

`gitj api` handles authentication and base URL automatically. It also supports
`-v` (status/headers to stderr), and exits with code 1 on HTTP 4xx/5xx.
Run `gitj api -h` for all options.
