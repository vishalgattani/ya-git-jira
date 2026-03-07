---
name: git-jira
description: Using git-jira commands to work with Jira issues and branches
---

## Overview

`gitj jira` interacts with Jira Cloud via its REST API v3. Authentication uses
git config values:

```sh
git config --global jira.host yourcompany.atlassian.net
git config --global jira.user you@company.com    # falls back to user.email
git config --global jira.token your-api-token
```

## Commands

```
gitj jira whoami              Show current Jira user
gitj jira issue list          List your unresolved issues (shortcut: gitj jira list)
gitj jira issue show <key>    Show a single issue
gitj jira start <key>         Create a branch from an issue key + summary
gitj bump                     Increment the branch version suffix
```

All dedicated commands are **read-only**. Use `--help` on any command for options.

## Workflow: Start Working on a Jira Issue

```sh
gitj jira issue list          # find your unresolved issues
gitj jira start PROJ-123      # creates and checks out a descriptive branch
gitj bump                     # re-branch with incremented suffix if needed
```

The `start` command only creates a local branch -- it does not push or
transition the Jira issue.

## Arbitrary Jira API Access

The dedicated commands are read-only. For write operations (creating issues,
transitions, comments, etc.), use `gitj api jira`:

```sh
# GET (default) -- path is relative to /rest/api/3
gitj api jira /myself
gitj api jira /issue/PROJ-123

# POST (auto-promoted when --data is provided)
gitj api jira /issue -d '{"fields":{"project":{"key":"PROJ"},"summary":"New issue","issuetype":{"name":"Task"}}}'

# Explicit method
gitj api jira /issue/PROJ-123 -X PUT -d '{"fields":{"summary":"Updated title"}}'
gitj api jira /issue/PROJ-123/transitions -d '{"transition":{"id":"31"}}'

# Skip /rest/api/3 prefix for full URL control
gitj api jira /rest/api/2/myself --raw
```

`gitj api` handles authentication and base URL automatically. It also supports
`--paginate`, `-v` (status/headers to stderr), and exits with code 1 on HTTP
4xx/5xx. Run `gitj api -h` for all options.
