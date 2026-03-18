#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { runMain } from '../lib/is_main'
import groups from './git-lab-group'
import merges from './git-lab-merge'
import namespaces from './git-lab-namespace'
import projects from './git-lab-project'
import whoami from './git-lab-whoami'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('lab')
        .description('Commands for working with GitLab')
        .addCommand(groups())
        .addCommand(merges())
        .addCommand(namespaces())
        .addCommand(projects())
        .addCommand(whoami())
        .action(() => program.help())
        .addHelpText('after', `
Required git config:
  gitlab.token   your GitLab personal access token

Optional git config:
  gitlab.host    your GitLab hostname (defaults to gitlab.com)
  gitlab.user    your GitLab email (falls back to user.email)

Set with: git config --global gitlab.token <value>`)
    return program
}

export default create

await runMain('git-lab', create)
