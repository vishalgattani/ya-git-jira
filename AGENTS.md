# ya-git-jira

CLI tool providing git subcommands for Jira and GitLab integration
(e.g., `git jira start`, `git lab merge active`, `git bump`). Built with TypeScript
on the Bun runtime (NOT Node.js). Uses Commander.js for CLI argument parsing.

## Commands

| Task | Command |
|------|---------|
| Install dependencies | `bun install` |
| Build | `bun run build` or `bun run build.ts` |
| Run all tests | `bun test` |
| Run a single test file | `bun test tests/git.test.ts` |
| Run a single test by name | `bun test --test-name-pattern "pattern"` |
| Type check (no emit) | `bunx tsc --noEmit` |

No linters or formatters are configured. Build output goes to `dist/` (gitignored).

## Commit Messages

Short, lowercase, descriptive phrases without conventional-commit prefixes:
- `improved config`
- `split lib/gitlab.ts into lib/gitlab/*.ts`
- `fix/update git-lab-merge-*`
- Version bumps: `v1.6.0`

## Key Files

| Path | Purpose |
|------|---------|
| `build.ts` | Bun build script (discovers entry points via glob) |
| `index.ts` | Barrel export of all lib modules |
| `lib/spawn.ts` | Process spawning wrapper around Bun.spawn |
| `lib/git.ts` | Git operations (config, branch, remote) |
| `lib/jira.ts` | Jira API client |
| `lib/json.ts` | JSONValue type definition |
| `lib/is_main.ts` | isMain() helper for dual import/run files |
| `lib/package.ts` | package.json reading and version extraction |
| `lib/gitlab/` | GitLab API client (api, config, groups, MRs, pipelines, etc.) |
| `lib/confluence/` | Confluence API client (api, config, types) |
| `bin/gitj.ts` | Root CLI entry point aggregating all subcommands |

## Skills

Load the `code-style` skill before writing or editing TypeScript code.
Load the `architecture` skill when you need to understand CLI design patterns, project structure, or test conventions.
Load the `git-confluence` skill when working with Confluence pages (searching, reading, or updating content).
Load the `git-jira` skill when working with Jira issues or the `git jira` commands.
Load the `git-lab` skill when working with GitLab projects, merge requests, or the `git lab` commands.
