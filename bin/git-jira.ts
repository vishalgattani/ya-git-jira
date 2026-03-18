#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { runMain } from '../lib/is_main'
import start from './git-jira-start'
import issue from './git-jira-issue'
import issues from './git-jira-issue-list'
import whoami from './git-jira-whoami'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('jira')
        .description('Commands for working with Jira')
        .addCommand(start())
        .addCommand(issue())
        .addCommand(issues())
        .addCommand(whoami())
        .addHelpText('after', `
Required git config:
  jira.host    your Jira hostname (e.g. yourcompany.atlassian.net)
  jira.token   your Atlassian API token

Optional git config:
  jira.user    your Jira email (falls back to user.email)

Set with: git config --global jira.host <value>`)
    return program
}

export default create

await runMain('git-jira', create)
