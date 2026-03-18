#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { getMyMergeRequestsInProgress } from "../lib/gitlab"
import { runMain } from '../lib/is_main'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('active')
        .description('List my MRs in progress')
        .option('-v, --verbose', 'Verbose output')
        .action(async (options) => {
            const merges = await getMyMergeRequestsInProgress();
            if (!merges) {
                console.error(`No MRs!`)
                process.exit(1)
            }
            if (options.verbose) {
                console.log(JSON.stringify(merges, null, 2))
                process.exit(0)
            }
            else {
                const filtered = merges.map(m => {
                    const { title, web_url, source_branch, target_branch } = m
                    return { title, web_url, source_branch, target_branch }
                })
                console.log(JSON.stringify(filtered, null, 2))
            }
        })
    return program
}

export default create

await runMain('git-lab-merge-active', create)
