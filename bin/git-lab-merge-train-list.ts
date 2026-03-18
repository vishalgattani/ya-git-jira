#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { runMain } from '../lib/is_main'
import { getMergeTrains } from '../lib/gitlab/merge-trains'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('list')
        .description('List merge trains for the current project')
        .action(async () => {
            const trains = await getMergeTrains()
            console.log(JSON.stringify(trains, null, 2))
        })
    return program
}

export default create

await runMain('git-lab-merge-train-list', create)
