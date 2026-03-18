#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { runMain } from '../lib/is_main'
import whoami from './git-confluence-whoami'
import space from './git-confluence-space'
import page from './git-confluence-page'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('confluence')
        .description('Commands for working with Confluence')
        .addCommand(whoami())
        .addCommand(space())
        .addCommand(page())
        .addHelpText('after', `
Required git config:
  confluence.host    your Confluence hostname (or jira.host as fallback)
  confluence.token   your Atlassian API token (or jira.token as fallback)

Optional git config:
  confluence.user    your Confluence email (falls back to jira.user, then user.email)

Set with: git config --global confluence.host <value>`)
    return program
}

export default create

await runMain('git-confluence', create)
