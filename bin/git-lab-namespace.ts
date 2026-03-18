#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { runMain } from '../lib/is_main'
import list from './git-lab-namespace-list'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('namespace')
        .description('Commands for working with GitLab namespaces')
        .addCommand(list())
        .action(() => program.help())
        return program
}

export default create

await runMain('git-lab-namespace', create)
