#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { runMain } from '../lib/is_main'
import { getGroups } from '../lib/gitlab'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('list')
        .description('List groups for the current user')
        .option("-v, --verbose", "Verbose output")
        .action(async (options) => {
            const groups = await getGroups()
            if (options.verbose)
                console.log(JSON.stringify(groups, null, 2))
            else {
                const filtered = groups.map(g => {
                    const { id, name, full_path } = g
                    return { id, name, full_path }
                })
                console.log(JSON.stringify(filtered, null, 2))
            }
        })
    return program
}

export default create

await runMain('git-lab-group-list', create)
