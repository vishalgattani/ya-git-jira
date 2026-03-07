#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { confluenceApiV1 } from '../lib/confluence'
import type { ConfluenceUser } from '../lib/confluence'
import { isMain } from '../lib/is_main'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('whoami')
        .description('Show the current Confluence user')
        .option('-v, --verbose', 'Verbose output')
        .action(async (options) => {
            const myself = await confluenceApiV1('user/current') as ConfluenceUser
            if (options.verbose) {
                console.log(myself)
            } else {
                const { displayName, email, accountId } = myself
                console.log({ displayName, email, accountId })
            }
        })
    return program
}

export default create

if (isMain('git-confluence-whoami')) {
    await create().parseAsync(Bun.argv)
}
