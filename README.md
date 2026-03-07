# ya-git-jira

Git extensions for Jira, GitLab, and Confluence. Each command is a standalone
executable that `git` discovers automatically (e.g. `git jira start`, `git lab
merge active`, `git confluence page search`). A unified `gitj` wrapper is also
provided.

## Requirements

[Bun](https://bun.sh) (not Node.js) — or Docker if you prefer not to install Bun.

```
curl -fsSL https://bun.sh/install | bash
```

## Install

```
npm install -g ya-git-jira   # or bun / yarn / pnpm
```

### Docker (alternative)

Build the image once:

```
docker build -t gitj .
```

Then run any command by mounting your git config and current directory:

```
docker run --rm \
  -v "$HOME/.gitconfig:/root/.gitconfig:ro" \
  -v "$(pwd):$(pwd)" -w "$(pwd)" \
  gitj <command> [args...]
```

For convenience, add a shell alias:

```bash
alias gitj='docker run --rm -v "$HOME/.gitconfig:/root/.gitconfig:ro" -v "$(pwd):$(pwd)" -w "$(pwd)" gitj'
```

Then use it exactly like the native install: `gitj jira start BUG-42`.

## Configuration

All configuration is via `git config`. Use `--global` if the same settings apply
across repositories.

### Jira

```
git config jira.host yourcompany.atlassian.net
git config jira.token "<api-token>"
```

Create an API token: <https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/>

### GitLab

```
git config gitlab.host gitlab.com        # default if omitted
git config gitlab.token "<api-token>"
```

Create a personal access token: <https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html#create-a-personal-access-token>

### Confluence

```
git config confluence.host yourcompany.atlassian.net
git config confluence.token "<api-token>"
```

The token is an Atlassian API token (same kind as Jira).

### Email address

Commands fall back to `user.email` from git config. Override per-service if needed:

```
git config jira.user <email>
git config gitlab.user <email>
git config confluence.user <email>
```

## Command hierarchy

```
gitj
    api                 authenticated REST request to any service
    bump                bump the version suffix of the current branch
    confluence
        whoami
        space
            list
        page
            search
            show
            update
    install-skills      install AI agent skills for a coding framework
    jira
        whoami
        start           create a topic branch from a Jira issue
        issue
            list
            show
    lab
        whoami
        group
            list
        merge
            active
            todo
            train
                list
        namespace
            list
        project
            list
            mr
                list
            pipeline
                jobs
                latest
                list
                log
            whereami
```

Every leaf command supports `--help`. Run `gitj --help-all` to print the full
tree with descriptions.

## Noteworthy commands

### git jira start

```
git jira start BUG-42
```

Fetches the issue summary from Jira, converts it to kebab-case, and creates a
branch like `BUG-42-fix-the-thing`.

### git bump

```
git bump
```

Appends or increments a `.vN` suffix on the current branch name:
`BUG-42-fix-the-thing` -> `.v1` -> `.v2` -> ...

### git api

```
git api jira /rest/api/3/myself
git api gitlab /api/v4/user
git api confluence /wiki/api/v2/spaces
```

Make arbitrary authenticated REST calls to any configured service. Useful for
one-off queries and scripting.

### gitj install-skills

```
gitj install-skills opencode       # symlinks to ~/.config/opencode/skills/
gitj install-skills copilot        # symlinks to ~/.copilot/skills/
gitj install-skills claude         # symlinks to .claude/skills/ (project-level)
gitj install-skills opencode --copy   # copy instead of symlink
gitj install-skills opencode --force  # overwrite existing directories
```

Installs AI agent skill files (`git-jira`, `git-lab`, `git-confluence`) so that
coding assistants (OpenCode, GitHub Copilot, Claude Code) know how to use these
tools.

## AI agent skills

The `.opencode/skills/` directory contains concise skill files for AI coding
agents. These tell agents that the tools exist, how auth works, and key workflow
patterns. Install them with `gitj install-skills <framework>`.

## Development

```
bun install          # install dependencies
bun run build        # build to dist/
bun test             # run all tests
bunx tsc --noEmit    # type check
```
