#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { confluenceApi } from '../lib/confluence'
import type { Space } from '../lib/confluence'
import { runMain } from '../lib/is_main'
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
                console.log(JSON.stringify(spaces, null, 2))
            } else {
                for (const space of spaces) {
                    console.log(`${space.key}\t${space.name}`)
                }
            }
        })
    return program
}

export default create

await runMain('git-confluence-space-list', create)
