---
name: code-style
description: Code style rules for writing and editing TypeScript in this project
---

## File Structure

Every `bin/*.ts` file follows this exact pattern:
1. Shebang: `#!/usr/bin/env bun`
2. Imports
3. Top-level `const version = await getPackageVersion()`
4. `export function create(): Command { ... }` -- factory returning a Commander command
5. `export default create` -- default export of the factory (not the command instance)
6. `if (isMain('filename')) { await create().parseAsync(Bun.argv) }` -- dual-mode guard

Parent commands (routing nodes) compose children via `.addCommand()`.
Leaf commands define `.action(async () => { ... })` with inline logic.

## Imports

- Use `import type { Foo }` for type-only imports
- Relative paths use `.ts` extensions for files: `import { foo } from "../lib/git.ts"`
- Relative paths omit extensions for directories with `index.ts`: `import { bar } from "../lib/gitlab"`
- General ordering (not strictly enforced):
  1. Third-party / built-in (`commander`, `debug`, `node:path`)
  2. Local lib modules (`../lib/git`, `../lib/gitlab`)
  3. Sibling imports (other `bin/` files for subcommand composition)

## Naming Conventions

| Element | Convention | Examples |
|---------|-----------|----------|
| Functions | camelCase | `getConfig`, `createBranch`, `getCurrentBranch` |
| Types/Interfaces | PascalCase | `SpawnResult`, `MergeRequest`, `JiraConfig` |
| Variables/Constants | camelCase | `defaultOptions`, `dlog` |
| Files | kebab-case | `merge-request.ts`, `merge-trains.ts` |
| API response fields | snake_case (matching external APIs) | `path_with_namespace`, `source_branch` |

## Types

- API response types use intersection with `JSONValue`:
  `export type Project = JSONValue & { id: number; name: string; ... }`
- `JSONValue` is defined in `lib/json.ts` as a recursive union type
- API responses are cast with `as Type`: `await response.json() as Issue`
- Function return types are explicitly annotated: `Promise<string>`, `Promise<Array<Project>>`
- Both `Array<T>` and `T[]` appear; either is acceptable
- Use `export type` for API response shapes, `export interface` for configs/options

## Formatting

- **4-space indentation**
- **Single quotes** for strings (not double quotes)
- Semicolons are used inconsistently; both with and without are acceptable
- Opening braces on same line: `function foo(): Type {`
- Commander method chains use 4-space indentation with dot-chaining on new lines

## Error Handling

- **No try/catch blocks** -- errors propagate naturally
- Throw on missing config: `if (!host) throw new Error("jira.host not in git config")`
- CLI-facing errors use `console.error()` + `process.exit(1)`
- Non-fatal warnings use `console.warn()`
- The `spawn` utility warns on no-output commands unless `expectQuiet` is set

## Debug Logging

- Uses the `debug` npm package
- Create logger: `const dlog = debug('gitlab')` or `const dlog = debug('git-lab-project-pipeline-list')`
- Centralized for gitlab module in `lib/gitlab/dlog.ts`
- Enable at runtime: `DEBUG=gitlab bun run bin/git-lab-project.ts`

## Comments

- Minimal comments; code is self-documenting
- Use `//` single-line style when needed
- No JSDoc conventions
