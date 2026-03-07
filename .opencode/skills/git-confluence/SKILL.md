---
name: git-confluence
description: Using git-confluence commands to search, read, and update Confluence pages
---

## Overview

`gitj confluence` interacts with Confluence Cloud via its REST API v2.
Authentication uses git config values with fallback to `jira.*` equivalents:

```sh
git config --global confluence.host yourcompany.atlassian.net  # falls back to jira.host
git config --global confluence.user you@company.com            # falls back to jira.user, then user.email
git config --global confluence.token your-api-token            # falls back to jira.token
```

## Commands

```
gitj confluence whoami              Show current authenticated user
gitj confluence space list          List all spaces
gitj confluence page search <q>     Search pages (fuzzy title, --exact, or --full-text)
gitj confluence page show <id>      Show page metadata (add --body-format for content)
gitj confluence page update <id>    Update page content (from stdin or --file)
```

Use `--help` on any command for options.

## Key Behaviors

- **`--body-format`** accepts `storage` (XHTML) or `atlas_doc_format` (ADF JSON).
  `--body-only` requires `--body-format` to be set.
- **`page update`** always writes in `storage` representation, regardless of how
  the content was read. It auto-fetches the current version and increments it.
- **Page IDs are numeric strings** (e.g., `"36306946"`).
- Page content uses Confluence storage format (XHTML with `ac:*`/`ri:*` namespaced
  elements for macros, links, and images). Reference:
  https://confluence.atlassian.com/doc/confluence-storage-format-790796544.html

## Workflow: Read, Revise, and Update a Page

```sh
# 1. Find the page
gitj confluence page search "My Page Title"

# 2. Read content (outputs raw storage-format XHTML)
gitj confluence page show <id> --body-format storage --body-only > page.html

# 3. Edit page.html as needed (must remain valid storage format)

# 4. Push the update
gitj confluence page update <id> --file page.html --message "Updated content"
```

Content can also be piped via stdin:

```sh
cat page.html | gitj confluence page update <id>
```

## Arbitrary Confluence API Access

For operations not covered by the dedicated commands, use `gitj api confluence`:

```sh
# GET (default) -- path is relative to /wiki/api/v2
gitj api confluence /spaces
gitj api confluence /pages/12345

# POST (auto-promoted when --data is provided)
gitj api confluence /pages -d '{"spaceId":"123","title":"New Page","body":{"representation":"storage","value":"<p>content</p>"},"status":"current"}'

# Paginated listing
gitj api confluence /spaces --paginate

# Skip /wiki/api/v2 prefix for v1 API access
gitj api confluence /wiki/rest/api/content/12345 --raw
```

`gitj api` handles authentication and base URL automatically. It also supports
`-v` (status/headers to stderr), and exits with code 1 on HTTP 4xx/5xx.
Run `gitj api -h` for all options.
