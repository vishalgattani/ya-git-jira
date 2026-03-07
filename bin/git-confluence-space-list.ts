#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { confluenceApi } from '../lib/confluence'
import type { Space } from '../lib/confluence'
import { isMain } from '../lib/is_main'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('list')
        .description('List Confluence spaces')
        .option('-v, --verbose', 'Verbose output')
        .action(async (options) => {
            const spaces = await confluenceApi('spaces') as Array<Space>
            if (options.verbose) {
                console.log(spaces)
            } else {
                for (const space of spaces) {
                    console.log(`${space.key}\t${space.name}`)
                }
            }
        })
    return program
}

export default create

if (isMain('git-confluence-space-list')) {
    await create().parseAsync(Bun.argv)
}
