#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { getMyself } from '../lib/jira'
import { runMain } from '../lib/is_main'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('whoami')
        .description('Show the current Jira user')
        .option('-v, --verbose', 'Verbose output')
        .action(async (options) => {
            const myself = await getMyself()
            if (options.verbose) {
                console.log(JSON.stringify(myself, null, 2))
            } else {
                const { displayName, emailAddress, accountId } = myself as any
                console.log({ displayName, emailAddress, accountId })
            }
        })
    return program
}

export default create

await runMain('git-jira-whoami', create)
