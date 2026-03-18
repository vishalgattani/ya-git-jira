#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { runMain } from '../lib/is_main'
import list from './git-lab-project-list'
import mr from './git-lab-project-mr'
import pipeline from './git-lab-project-pipeline'
import whereami from './git-lab-project-whereami'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('project')
        .description('Commands for working with GitLab projects')
        .addCommand(list())
        .addCommand(mr())
        .addCommand(pipeline())
        .addCommand(whereami())
        .action(() => {
            program.help()
        })
    return program
}

export default create

await runMain('git-lab-project', create)
