#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { runMain } from '../lib/is_main'
import list from './git-jira-issue-list'
import show from './git-jira-issue-show'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('issue')
        .description('Commands for working with issues')
        .addCommand(list())
        .addCommand(show())
        .action(() => program.help()
        )
    return program
}

export default create

await runMain('git-jira-issue', create)
