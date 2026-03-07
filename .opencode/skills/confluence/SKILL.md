---
name: confluence
description: Using git confluence commands to search, read, and update Confluence pages
---

## Overview

The `git confluence` CLI provides commands for interacting with Confluence Cloud via
its REST API v2. Authentication uses git config values (`confluence.host`,
`confluence.token`, etc.) with fallback to `jira.*` config values.

## Command Reference

### Authentication

```sh
git confluence whoami          # Show current authenticated user
```

### Spaces

```sh
git confluence space list      # List all spaces (key, name)
git confluence space list -v   # Verbose: full API response
```

### Pages

```sh
# Search for pages by title (exact match)
git confluence page search "Page Title"
# Output: id<TAB>title<TAB>url (one per line)

# Show page metadata
git confluence page show <id>
# Output: { id, title, spaceId, url }

# Show page metadata including body content
git confluence page show <id> --body-format storage
# Output: { id, title, spaceId, url, bodyLength }

# Show page with full API response (includes body if --body-format set)
git confluence page show <id> --body-format storage -v

# Output ONLY the body content (for piping)
git confluence page show <id> --body-format storage --body-only

# Update a page (reads new content from stdin)
echo "<p>New content</p>" | git confluence page update <id>

# Update from a file
git confluence page update <id> --file content.html

# Update with a new title and version message
git confluence page update <id> --title "New Title" --message "Updated via CLI"
```

## Workflow: Read, Revise, and Update a Page

### Step 1: Find the page

```sh
git confluence page search "My Page Title"
```

This returns the page ID, title, and URL. Note the page ID for subsequent commands.

### Step 2: Read the page content

```sh
git confluence page show <id> --body-format storage --body-only
```

This outputs the raw Confluence storage format (XHTML-like markup). To save to a file:

```sh
git confluence page show <id> --body-format storage --body-only > page.html
```

### Step 3: Modify the content

Edit the storage-format content as needed. The content must remain valid Confluence
storage format (see format reference below).

### Step 4: Update the page

```sh
git confluence page update <id> --file page.html --message "Updated content"
```

Or pipe content directly:

```sh
cat page.html | git confluence page update <id>
```

The update command automatically:
- Fetches the current page to get the title and version number
- Increments the version number
- PUTs the update to the Confluence API

## Confluence Storage Format

Page content uses Confluence storage format, which is XHTML-like markup. Key elements:

### Common Tags

| Tag | Purpose | Example |
|-----|---------|---------|
| `<p>` | Paragraph | `<p>Text here</p>` |
| `<h1>`..`<h6>` | Headings | `<h2>Section</h2>` |
| `<strong>` | Bold | `<strong>bold</strong>` |
| `<em>` | Italic | `<em>italic</em>` |
| `<a href="...">` | Link | `<a href="https://example.com">link</a>` |
| `<ul>`, `<ol>`, `<li>` | Lists | `<ul><li>item</li></ul>` |
| `<table>`, `<tr>`, `<td>`, `<th>` | Tables | Standard HTML table markup |
| `<br />` | Line break | Self-closing |
| `<hr />` | Horizontal rule | Self-closing |

### Confluence-Specific Macros

Macros use the `<ac:structured-macro>` element with `<ac:parameter>` children:

```xml
<ac:structured-macro ac:name="code">
  <ac:parameter ac:name="language">python</ac:parameter>
  <ac:plain-text-body><![CDATA[print("hello")]]></ac:plain-text-body>
</ac:structured-macro>
```

Common macros: `code`, `info`, `note`, `warning`, `tip`, `expand`, `toc`,
`children`, `include`, `excerpt`.

### Rich Links and Mentions

```xml
<!-- Link to another Confluence page -->
<ac:link><ri:page ri:content-title="Other Page" /></ac:link>

<!-- User mention -->
<ac:link><ri:user ri:account-id="abc123" /></ac:link>
```

### Images and Attachments

```xml
<!-- Inline attached image -->
<ac:image><ri:attachment ri:filename="screenshot.png" /></ac:image>

<!-- External image -->
<ac:image><ri:url ri:value="https://example.com/image.png" /></ac:image>
```

## Important Notes

- **Storage format must be valid**: malformed XHTML will cause the update to fail.
  When editing, preserve the structure of macro elements (`ac:*`, `ri:*` namespaces).
- **Version conflicts**: the update command auto-increments the version number.
  If another user updates the page between your read and write, the update will fail
  with a version conflict. Re-read and retry in that case.
- **The search command does exact title matching**, not full-text search.
  The query is passed as the `title` parameter to the Confluence v2 pages API.
- **All commands support `-v` / `--verbose`** for full API response output.
- **Page IDs are numeric strings** (e.g., `"36306946"`).
