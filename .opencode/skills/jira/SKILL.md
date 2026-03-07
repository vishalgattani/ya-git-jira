---
name: jira
description: Using git jira commands to work with Jira issues and branches
---

## Overview

The `git jira` CLI provides commands for interacting with Jira Cloud via its
REST API v2. Authentication uses git config values (`jira.host`, `jira.user`,
`jira.token`).

## Authentication Setup

Required git config values:

```sh
git config --global jira.host yourcompany.atlassian.net
git config --global jira.user you@company.com    # falls back to user.email
git config --global jira.token your-api-token
```

The token is combined with the user email as HTTP Basic auth (`user:token` base64-encoded).

## Command Reference

### Identity

```sh
git jira whoami            # Show current Jira user (displayName, email, accountId)
git jira whoami -v         # Verbose: full API response
```

### Issues

```sh
# List your unresolved issues
git jira issue list
# Output: array of { key, summary } objects

git jira issue list -v     # Verbose: full Issue objects

# Show a single issue
git jira issue show PROJ-123
# Output: { key, summary, status, assignee }

git jira issue show PROJ-123 -v   # Verbose: full Issue object
```

### Starting Work on an Issue

```sh
git jira start PROJ-123
```

This creates a new git branch named after the issue key and summary. The branch
name is derived from the issue key and summary field, with the summary sanitized
for use as a branch name (lowercased, spaces replaced with hyphens, special
characters removed).

**What it does:**
1. Fetches the issue from Jira (`GET /rest/api/2/issue/{key}`)
2. Constructs a branch name from the issue key and summary
3. Creates and checks out the new branch (`git checkout -b <branch>`)

## API Endpoints Used

| Command | Endpoint | Method |
|---------|----------|--------|
| `whoami` | `/rest/api/2/myself` | GET |
| `issue list` | `/rest/api/2/search?jql=...` | GET |
| `issue show` | `/rest/api/2/issue/{key}` | GET |
| `start` | `/rest/api/2/issue/{key}` | GET |

All commands are **read-only** -- no Jira issues are created or modified.

## Workflow: Start Working on a Jira Issue

### Step 1: Find your issues

```sh
git jira issue list
```

This shows your unresolved issues assigned to you.

### Step 2: Pick an issue and start

```sh
git jira start PROJ-123
```

This fetches the issue details and creates a descriptive branch. You're now
on a new branch ready to work.

### Step 3: Bump the branch version (if needed)

```sh
git bump
```

If you need to start fresh on the same issue, `git bump` creates a new branch
with an incremented version suffix (e.g., `PROJ-123-fix-the-bug.v1` ->
`PROJ-123-fix-the-bug.v2`).

## Important Notes

- **Issue keys** follow the pattern `PROJECT-NUMBER` (e.g., `EDS-456`, `DEVOPS-123`).
- **The `issue list` command** uses JQL to find issues assigned to the current user
  that are unresolved.
- **All commands support `-v` / `--verbose`** for full API response output.
- **The `start` command** only creates a local branch -- it does not push to a remote
  or transition the Jira issue status.
