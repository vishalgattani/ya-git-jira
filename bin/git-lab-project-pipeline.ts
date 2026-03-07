#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { isMain } from '../lib/is_main'
import jobs from './git-lab-project-pipeline-jobs'
import latest from './git-lab-project-pipeline-latest'
import list from './git-lab-project-pipeline-list'
import log from './git-lab-project-pipeline-log'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('pipeline')
        .description('Commands for working with GitLab pipelines')
        .addCommand(jobs())
        .addCommand(latest())
        .addCommand(list())
        .addCommand(log())
        .action(() => program.help())
    return program
}

export default create

if (isMain('git-lab-project-pipeline')) {
    await create().parseAsync(Bun.argv)
}
