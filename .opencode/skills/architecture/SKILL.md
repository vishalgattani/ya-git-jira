---
name: architecture
description: Project architecture, CLI design patterns, and test conventions
---

## Dual-Mode Files

Every `bin/` file works both as an importable module (exporting `create()`) and as a
directly-executable script (via the `isMain()` guard). This enables hierarchical command
composition while allowing each command to be invoked standalone.

## Hierarchical CLI

Commands form a tree: `gitj` -> `lab` -> `merge` -> `active`. Each level is its own
file. Parent commands add children via `.addCommand(child.create())`.

## Eager Config Loading

Config values (git config reads) are initiated at module scope as top-level promises:
```ts
const hostP = getConfig("jira.host")
```
Then awaited when actually needed. This is a performance optimization.

## GitLab API Client

- `lib/gitlab/api.ts` handles pagination by following `Link` headers with `rel="next"`
- `projectScopedGet()` auto-determines the current GitLab project from the git remote URL

## TypeScript Configuration

- `strict: true`, target/module: `esnext`, `moduleResolution: "bundler"`
- `allowImportingTsExtensions: true` -- imports use `.ts` extensions
- `noEmit: true` -- Bun's bundler handles output, not tsc
- `types: ["bun-types"]` -- Bun global APIs (Bun.spawn, Bun.argv, etc.)

## Test Conventions

- Test runner: Bun's built-in (`bun:test`)
- Test files: `tests/*.test.ts`
- Imports: `import { describe, expect, test, beforeEach, afterEach } from 'bun:test'`
- Tests are async with explicit `Promise<void>` return types
- Integration tests spawn real subprocesses via the project's `spawn`/`doCommand` utilities
- Some tests set custom timeouts as a second argument: `test('name', async () => { ... }, 15000)`
- `all-help.test.ts` dynamically generates tests for every `bin/*.ts` script
